import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// App-level user type that includes role & approval status
export interface AppUser {
  id: string; // users table PK
  authId: string; // Supabase Auth uid
  email: string;
  name: string;
  role: "admin" | "business" | "manager" | "analyst" | "reviewer";
  status: "pending" | "approved" | "disabled";
}

interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (
    email: string,
    password: string,
    name: string,
    role: AppUser["role"]
  ) => Promise<{ error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// Fetch app user profile directly from Supabase (no Edge Function needed)
async function fetchAppUser(authId: string): Promise<AppUser | null> {
  try {
    console.log("[v0] fetchAppUser called with authId:", authId);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    console.log("[v0] fetchAppUser result:", { data, error });
    if (error || !data) return null;

    return {
      id: data.id,
      authId: data.auth_id,
      email: data.email,
      name: data.name,
      role: data.role,
      status: data.status,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    supabaseUser: null,
    appUser: null,
    loading: true,
  });

  // On mount: check existing session with timeout protection
  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        console.log("[v0] Checking existing session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("[v0] getSession result:", { session: !!session, error });

        if (!mounted) return;

        if (error) {
          console.log("[v0] Session error, clearing state:", error.message);
          // Clear any stale tokens from old project
          await supabase.auth.signOut().catch(() => {});
          setState({ session: null, supabaseUser: null, appUser: null, loading: false });
          return;
        }

        if (session?.user) {
          console.log("[v0] Session found for user:", session.user.email);
          const appUser = await fetchAppUser(session.user.id);
          if (mounted) {
            setState({ session, supabaseUser: session.user, appUser, loading: false });
          }
        } else {
          console.log("[v0] No session found, showing login");
          if (mounted) {
            setState((s) => ({ ...s, loading: false }));
          }
        }
      } catch (e) {
        console.error("[v0] Session init failed:", e);
        if (mounted) {
          setState({ session: null, supabaseUser: null, appUser: null, loading: false });
        }
      }
    };

    // Timeout: if session check takes > 5s, stop loading and show login
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log("[v0] Session check timed out, showing login");
        setState((s) => {
          if (s.loading) {
            return { session: null, supabaseUser: null, appUser: null, loading: false };
          }
          return s;
        });
      }
    }, 5000);

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state change:", event, session?.user?.email);
      if (session?.user) {
        const appUser = await fetchAppUser(session.user.id);
        if (mounted) {
          setState({ session, supabaseUser: session.user, appUser, loading: false });
        }
      } else {
        if (mounted) {
          setState({ session: null, supabaseUser: null, appUser: null, loading: false });
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: AppUser["role"]
  ) => {
    try {
    // 1. Create Supabase Auth user
    console.log("[v0] signUp called for:", email);
    const { data, error } = await Promise.race([
      supabase.auth.signUp({ email, password }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Sign up timed out. Check your connection and try again.")), 10000)
      ),
    ]);
    if (error) return { error: error.message };
    if (!data.user) return { error: "Sign up failed" };

    // 2. Check if any approved admin exists
    const { data: existingAdmins } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .eq("status", "approved")
      .limit(1);

    const isFirstAdmin = !existingAdmins || existingAdmins.length === 0;
    const finalRole = isFirstAdmin ? "admin" : role;
    const finalStatus = isFirstAdmin ? "approved" : "pending";

    // 3. Insert user row directly into users table
    console.log("[v0] Inserting user:", { auth_id: data.user.id, email, name, role: finalRole, status: finalStatus });
    const { data: insertData, error: insertError } = await supabase.from("users").insert({
      auth_id: data.user.id,
      email,
      name,
      role: finalRole,
      status: finalStatus,
    }).select().single();

    console.log("[v0] Insert result:", { insertData, insertError });
    if (insertError) {
      return { error: insertError.message };
    }

    // 4. Refresh the app user after insert
    const appUser = await fetchAppUser(data.user.id);
    if (appUser) {
      const { data: sessionData } = await supabase.auth.getSession();
      setState({
        session: sessionData.session,
        supabaseUser: data.user,
        appUser,
        loading: false,
      });
    }

    return {};
    } catch (e: any) {
      console.error("[v0] signUp error:", e);
      return { error: e.message || "Sign up failed" };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[v0] signIn called for:", email);
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Sign in timed out. Check your connection and try again.")), 10000)
        ),
      ]);
      console.log("[v0] signIn result:", { error: result.error?.message });
      if (result.error) return { error: result.error.message };
      return {};
    } catch (e: any) {
      console.error("[v0] signIn error:", e);
      return { error: e.message || "Sign in failed" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      session: null,
      supabaseUser: null,
      appUser: null,
      loading: false,
    });
  };

  const refreshAppUser = async () => {
    if (state.session?.user) {
      const appUser = await fetchAppUser(state.session.user.id);
      setState((s) => ({ ...s, appUser }));
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...state, signUp, signIn, signOut, refreshAppUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
