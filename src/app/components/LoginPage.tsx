import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { LogIn, Zap, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import { createClient } from "../../lib/supabase/client";

const supabase = createClient();

export type UserRole = "manager" | "analyst" | "reviewer" | "admin";

interface LoginPageProps {
  onLogin: (role: UserRole, email: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      if (isSignUp) {
        // Sign up
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        toast.success("Account created! Awaiting admin role assignment.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsSignUp(false);
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        // Store session
        localStorage.setItem("auth_token", data.session?.access_token || "");

        // Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("email", email)
          .single();

        if (roleError && roleError.code !== "PGRST116") {
          console.error("Role fetch error:", roleError);
        }

        const userRole = roleData?.role || "pending";
        const isActive = roleData?.is_active || false;

        if (!isActive && userRole !== "admin") {
          toast.warning("Your account is pending admin approval. Please check back later.");
          setLoading(false);
          return;
        }

        toast.success(`Welcome, ${email}!`);
        onLogin(userRole as UserRole, email);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d19] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a2742] bg-[#0d1526]">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#22c55e] flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">StepOut Match Manager</h1>
              <p className="text-xs text-[#7a8ba6]">Centralized workflow tracking for match analysis</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="bg-[#111b2e] border-[#1a2742] w-full max-w-md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-white">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-[#7a8ba6] mt-2">
              {isSignUp
                ? "Sign up to get started with Match Manager"
                : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#c0cde0]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="bg-[#0b1120] border-[#2a3a4e] text-[#e8edf4] placeholder:text-[#4a5a76] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#c0cde0]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="bg-[#0b1120] border-[#2a3a4e] text-[#e8edf4] placeholder:text-[#4a5a76] pl-10"
                  />
                </div>
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#c0cde0]">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      className="bg-[#0b1120] border-[#2a3a4e] text-[#e8edf4] placeholder:text-[#4a5a76] pl-10"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white disabled:opacity-50 mt-6"
              >
                {isSignUp ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    {loading ? "Creating account..." : "Create Account"}
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    {loading ? "Signing in..." : "Sign In"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#7a8ba6] text-sm">
                {isSignUp ? "Already have an account?" : "Don&apos;t have an account?"}
                {" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-[#2a3a4e]">
              <p className="text-xs text-[#5a6f84] text-center">
                After sign up, an administrator will assign your role. Please wait for confirmation.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a2742] py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-[#5a6f84]">StepOut Match Manager - Single Source of Truth for Match Operations</p>
        </div>
      </footer>
    </div>
  );
}
