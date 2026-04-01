import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { ClipboardList, UserCheck, Shield, LogIn, Zap } from "lucide-react";

export type UserRole = "manager" | "analyst" | "reviewer";

interface LoginPageProps {
  onLogin: (role: UserRole, name: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: "manager" as UserRole,
      title: "Manager",
      description: "Create matches, view dashboard, export CSV",
      icon: ClipboardList,
      color: "#22c55e",
      features: [
        "Create single/bulk matches",
        "View all matches dashboard",
        "Assign analysts & reviewers",
        "Export data to CSV",
      ],
    },
    {
      id: "analyst" as UserRole,
      title: "Analyst",
      description: "Analyze matches and submit analysis details",
      icon: UserCheck,
      color: "#3b82f6",
      features: [
        "View assigned matches",
        "Submit analysis details",
        "Track analysis TAT",
        "Add analyst remarks",
      ],
    },
    {
      id: "reviewer" as UserRole,
      title: "Reviewer",
      description: "Review analysis and complete QC checks",
      icon: Shield,
      color: "#f59e0b",
      features: [
        "Review submitted analyses",
        "Track QC errors",
        "Send back for rework",
        "Complete match review",
      ],
    },
  ];

  const handleLogin = () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    // Simulate login
    setTimeout(() => {
      toast.success(`Welcome, ${name}!`);
      onLogin(selectedRole, name.trim());
      setLoading(false);
    }, 500);
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
        <div className="w-full max-w-4xl space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-[#7a8ba6]">Select your role to access the Match Manager portal</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <Card
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`cursor-pointer transition-all bg-[#111b2e] border-2 hover:border-[${role.color}]/50 ${
                    isSelected
                      ? `border-[${role.color}] ring-1 ring-[${role.color}]/30`
                      : "border-[#1a2742]"
                  }`}
                  style={{
                    borderColor: isSelected ? role.color : undefined,
                    boxShadow: isSelected ? `0 0 20px ${role.color}20` : undefined,
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: `${role.color}15`, border: `1px solid ${role.color}30` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: role.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{role.title}</CardTitle>
                        <CardDescription className="text-[#7a8ba6] text-sm">{role.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-1.5">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-[#8899aa]">
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Login Form */}
          <Card className="bg-[#111b2e] border-[#1a2742] max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-lg">Enter Your Details</CardTitle>
              <CardDescription className="text-[#7a8ba6]">
                {selectedRole
                  ? `Logging in as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                  : "Select a role above to continue"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#c0cde0]">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0b1120] border-[#2a3a4e] text-[#e8edf4] placeholder:text-[#4a5a76]"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button
                onClick={handleLogin}
                disabled={!selectedRole || !name.trim() || loading}
                className="w-full gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardContent>
          </Card>
        </div>
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
