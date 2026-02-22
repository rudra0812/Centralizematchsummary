import { useState } from "react";
import { useAuth, type AppUser } from "../../contexts/AuthContext";
import {
  Shield,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Briefcase,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const ROLE_OPTIONS: { value: AppUser["role"]; label: string; desc: string }[] = [
  { value: "business", label: "Business", desc: "Submit match requests, track progress" },
  { value: "manager", label: "Manager", desc: "Create matches, assign analysts" },
  { value: "analyst", label: "Analyst", desc: "Work on assigned matches" },
  { value: "reviewer", label: "Reviewer", desc: "Review completed analyses" },
];

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppUser["role"]>("business");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      const result = await signIn(email, password);
      if (result.error) setError(result.error);
    } else {
      if (!name.trim()) {
        setError("Name is required");
        setLoading(false);
        return;
      }
      const result = await signUp(email, password, name, role);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(
          "Account created successfully! If you are the first user, you have been auto-promoted to admin. Otherwise, an admin will review your account."
        );
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#1a2332] border border-[#1e3a5f] flex items-center justify-center">
            <Shield className="w-7 h-7 text-[#3b82f6]" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Match Management
            </h1>
            <p className="text-sm text-[#64748b] mt-1">
              Centralized Match Summary System
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-[#0a0e1a] rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-[#1e293b] text-white shadow-sm"
                  : "text-[#64748b] hover:text-[#94a3b8]"
              }`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-[#1e293b] text-white shadow-sm"
                  : "text-[#64748b] hover:text-[#94a3b8]"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Register
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-2 bg-[#1c1017] border border-[#5c2020] rounded-lg p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-[#f87171] mt-0.5 shrink-0" />
              <p className="text-sm text-[#f87171]">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-[#0f1d15] border border-[#1a5c32] rounded-lg p-3 mb-4">
              <CheckCircle className="w-4 h-4 text-[#4ade80] mt-0.5 shrink-0" />
              <p className="text-sm text-[#4ade80]">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-[#374151] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-[#374151] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "Enter your password" : "Min 6 characters"}
                  minLength={6}
                  className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-[#374151] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
                  required
                />
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as AppUser["role"])
                    }
                    className="w-full bg-[#0a0e1a] border border-[#1e293b] rounded-lg py-2.5 pl-10 pr-10 text-white text-sm appearance-none focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} - {r.desc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569] pointer-events-none" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === "login" ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {mode === "register" && (
            <p className="text-xs text-[#475569] text-center mt-4">
              Your account will be reviewed by an admin before activation.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
