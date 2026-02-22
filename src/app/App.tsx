import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { BusinessDashboard } from "./components/BusinessDashboard";
import { ManagerDashboard } from "./components/ManagerDashboard";
import { AnalystDashboard } from "./components/AnalystDashboard";
import { ReviewerDashboard } from "./components/ReviewerDashboard";
import { Toaster } from "./components/ui/sonner";
import {
  LogOut,
  User,
  Bell,
  Loader2,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { edgeFnBase } from "../lib/supabase";
import { publicAnonKey } from "/utils/supabase/info";

export default function App() {
  const { session, appUser, loading, signOut, refreshAppUser } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recovering, setRecovering] = useState(false);

  // Fetch notifications for the current user
  const fetchNotifications = async () => {
    if (!appUser) return;
    try {
      const res = await fetch(`${edgeFnBase}/notifications/${appUser.id}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail
    }
  };

  const markNotificationRead = async (notifId: string) => {
    try {
      await fetch(`${edgeFnBase}/notifications/${notifId}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  // Loading state -- will auto-timeout after 5 seconds
  if (loading) {
    console.log("[v0] App is in loading state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
          <p className="text-[#7a8ba6] text-sm">Connecting to server...</p>
          <p className="text-[#475569] text-xs mt-2">This should take a few seconds</p>
        </div>
      </div>
    );
  }

  // Not logged in -> show login page
  if (!session) {
    return (
      <>
        <Toaster />
        <LoginPage />
      </>
    );
  }

  // Logged in but no app user profile found -- offer to create the profile row
  if (!appUser) {
    const handleRecoverAccount = async () => {
      if (!session?.user) return;
      setRecovering(true);
      try {
        // Check if any approved admin exists
        const { data: existingAdmins } = await (await import("../lib/supabase")).supabase
          .from("users")
          .select("id")
          .eq("role", "admin")
          .eq("status", "approved")
          .limit(1);

        const isFirstAdmin = !existingAdmins || existingAdmins.length === 0;

        const { error } = await (await import("../lib/supabase")).supabase
          .from("users")
          .insert({
            auth_id: session.user.id,
            email: session.user.email,
            name: session.user.email?.split("@")[0] || "User",
            role: isFirstAdmin ? "admin" : "business",
            status: isFirstAdmin ? "approved" : "pending",
          });

        if (error && error.code === "23505") {
          // Duplicate -- row already exists, just refresh
        } else if (error) {
          console.error("Recovery error:", error);
        }

        await refreshAppUser();
      } catch (e) {
        console.error("Recovery failed:", e);
      }
      setRecovering(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Toaster />
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
          <ShieldAlert className="h-12 w-12 text-[#f59e0b]" />
          <h2 className="text-xl font-bold text-white">Account Not Found</h2>
          <p className="text-[#7a8ba6] text-sm">
            Your authentication exists but no user profile was found. Click below to
            create your profile. If you are the first user, you will be made admin automatically.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <Button
              onClick={handleRecoverAccount}
              disabled={recovering}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            >
              {recovering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Profile...
                </>
              ) : (
                "Create My Profile"
              )}
            </Button>
            <Button
              onClick={signOut}
              variant="outline"
              className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User exists but is pending approval
  if (appUser.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Toaster />
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
          <Clock className="h-12 w-12 text-[#f59e0b]" />
          <h2 className="text-xl font-bold text-white">Pending Approval</h2>
          <p className="text-[#7a8ba6] text-sm">
            Your account is pending admin approval. You will be able to access
            the system once an administrator approves your registration.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className="bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30"
            >
              {appUser.role.toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className="bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30"
            >
              PENDING
            </Badge>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="mt-4 border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // User is disabled
  if (appUser.status === "disabled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <Toaster />
        <div className="flex flex-col items-center gap-4 text-center max-w-md p-6">
          <ShieldAlert className="h-12 w-12 text-[#ef4444]" />
          <h2 className="text-xl font-bold text-white">Account Disabled</h2>
          <p className="text-[#7a8ba6] text-sm">
            Your account has been disabled by an administrator. Please contact
            your admin for more information.
          </p>
          <Button
            onClick={signOut}
            variant="outline"
            className="mt-4 border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Approved user -> route to correct dashboard by role
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleDashboard = () => {
    switch (appUser.role) {
      case "admin":
        return <AdminDashboard />;
      case "business":
        return <BusinessDashboard />;
      case "manager":
        return <ManagerDashboard />;
      case "analyst":
        return <AnalystDashboard />;
      case "reviewer":
        return <ReviewerDashboard />;
      default:
        return (
          <div className="text-center py-20 text-[#7a8ba6]">
            Unknown role: {appUser.role}
          </div>
        );
    }
  };

  const getRoleLabel = () => {
    const labels: Record<string, { label: string; color: string }> = {
      admin: { label: "Admin", color: "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30" },
      business: { label: "Business", color: "bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30" },
      manager: { label: "Manager", color: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30" },
      analyst: { label: "Analyst", color: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30" },
      reviewer: { label: "Reviewer", color: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30" },
    };
    return labels[appUser.role] || { label: appUser.role, color: "border-border text-[#7a8ba6]" };
  };

  const roleInfo = getRoleLabel();

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-foreground">
      <Toaster />

      {/* Header */}
      <header className="border-b border-[#1e293b] bg-[#0d1526] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#22c55e] flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  StepOut Match Manager
                </h1>
                <p className="text-xs text-[#7a8ba6]">
                  Centralized Match Summary System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#7a8ba6] hover:text-white hover:bg-[#1a2742] h-9 w-9"
                  onClick={() => {
                    fetchNotifications();
                    setShowNotifications(!showNotifications);
                  }}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div className="absolute right-0 top-11 z-50 w-80 bg-[#111827] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-[#1e293b]">
                        <h3 className="text-sm font-semibold text-white">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-[#64748b] text-center">
                            No notifications
                          </p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 border-b border-[#1e293b] cursor-pointer hover:bg-[#1a2742] ${
                                n.read ? "opacity-60" : ""
                              }`}
                              onClick={() => markNotificationRead(n.id)}
                            >
                              <p className="text-sm text-[#c0cde0]">
                                {n.message}
                              </p>
                              <p className="text-xs text-[#64748b] mt-1">
                                {new Date(n.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* User info + role badge */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-[#c0cde0]">
                    {appUser.name}
                  </span>
                  <span className="text-xs text-[#64748b]">
                    {appUser.email}
                  </span>
                </div>
                <Badge variant="outline" className={roleInfo.color}>
                  {roleInfo.label}
                </Badge>
              </div>

              {/* Sign out */}
              <Button
                variant="ghost"
                size="icon"
                className="text-[#7a8ba6] hover:text-white hover:bg-[#1a2742] h-9 w-9"
                onClick={signOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">{getRoleDashboard()}</main>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] mt-12 bg-[#0d1526]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#22c55e] flex items-center justify-center">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#c0cde0]">
                StepOut Match Manager
              </span>
            </div>
            <p className="text-xs text-[#7a8ba6]">
              Logged in as {appUser.name} ({appUser.role})
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
