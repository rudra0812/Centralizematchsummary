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

  // On mount: check existing session
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const appUser = await fetchAppUser(session.user.id);
        setState({
          session,
          supabaseUser: session.user,
          appUser,
          loading: false,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const appUser = await fetchAppUser(session.user.id);
        setState({
          session,
          supabaseUser: session.user,
          appUser,
          loading: false,
        });
      } else {
        setState({
          session: null,
          supabaseUser: null,
          appUser: null,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: AppUser["role"]
  ) => {
    // 1. Create Supabase Auth user
    const { data, error } = await supabase.auth.signUp({ email, password });
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
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
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
