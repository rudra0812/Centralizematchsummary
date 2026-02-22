import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase, edgeFnBase } from "../lib/supabase";
import { publicAnonKey } from "/utils/supabase/info";

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

// Fetch the app user profile from the Edge Function
async function fetchAppUser(
  authId: string,
  token: string
): Promise<AppUser | null> {
  try {
    const res = await fetch(`${edgeFnBase}/auth/me?auth_id=${authId}`, {
      headers: {
        Authorization: `Bearer ${publicAnonKey}`,
        "x-user-token": token,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.id) return null;
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
        const appUser = await fetchAppUser(
          session.user.id,
          session.access_token
        );
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
        const appUser = await fetchAppUser(
          session.user.id,
          session.access_token
        );
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

    // 2. Create app-level user record via Edge Function
    const res = await fetch(`${edgeFnBase}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        auth_id: data.user.id,
        email,
        name,
        role,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: err.error || "Registration failed" };
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
      const appUser = await fetchAppUser(
        state.session.user.id,
        state.session.access_token
      );
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
