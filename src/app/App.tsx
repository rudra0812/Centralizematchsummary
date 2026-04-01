import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { LoginPage, UserRole } from "./components/LoginPage";
import { ManagerPortal } from "./components/ManagerPortal";
import { AnalystPortal } from "./components/AnalystPortal";
import { ReviewerPortal } from "./components/ReviewerPortal";
import { Button } from "./components/ui/button";
import { LogOut, Zap, Database, ClipboardList, UserCheck, Shield } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface User {
  role: UserRole;
  name: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogin = (role: UserRole, name: string) => {
    setUser({ role, name });
  };

  const handleLogout = () => {
    setUser(null);
    toast.success("Logged out successfully");
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const createDemoData = async () => {
    toast.promise(
      (async () => {
        // Demo Match 1: Completed Match
        const match1Response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              organizer_name: "Manchester United FC",
              client_type: "Paid",
              match_analysis_type: "Pro",
              team_a: "Manchester United",
              team_b: "Liverpool FC",
              game_time: "90",
              venue: "Old Trafford, England",
              tournament_name: "Premier League",
              match_video_type: "Veo",
              match_age_group: "Senior",
              match_received_on: "2026-02-10",
            }),
          }
        );
        const match1Data = await match1Response.json();
        
        if (!match1Data.success) {
          throw new Error("Failed to create first demo match");
        }
        
        const match1Id = match1Data.match.match_id;

        // Add analyst data to match 1
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${match1Id}/analyst`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              live_match_analysed_by: "",
              first_half_analysed_by: "John Smith",
              second_half_analysed_by: "Sarah Johnson",
              analysis_tat: "120",
              analysis_start_end_time: "150",
              remarks: "Great match, clear tactical patterns identified.",
              analysed_on: new Date().toISOString(),
            }),
          }
        );

        // Add reviewer data to match 1
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${match1Id}/reviewer`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              reviewed_by: "Michael Chen",
              qc_error_count: "0",
              review_tat: "45",
              reviewer_remarks: "Excellent analysis. No errors found.",
              has_errors: false,
              send_back_to_analyst: false,
            }),
          }
        );

        // Demo Match 2: In Review
        const match2Response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              organizer_name: "Barcelona FC",
              client_type: "Paid",
              match_analysis_type: "Live",
              team_a: "Barcelona",
              team_b: "Real Madrid",
              game_time: "90",
              venue: "Camp Nou, Spain",
              tournament_name: "La Liga",
              match_video_type: "Hudl",
              match_age_group: "Senior",
              match_received_on: "2026-02-11",
            }),
          }
        );
        const match2Data = await match2Response.json();
        const match2Id = match2Data.match.match_id;

        // Add analyst data to match 2
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${match2Id}/analyst`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              live_match_analysed_by: "David Martinez",
              first_half_analysed_by: "David Martinez",
              second_half_analysed_by: "David Martinez",
              analysis_tat: "90",
              analysis_start_end_time: "100",
              remarks: "Live match analysis completed.",
              analysed_on: new Date().toISOString(),
            }),
          }
        );

        // Demo Match 3: Rework (sent back to analyst)
        const match3Response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              organizer_name: "Bayern Munich",
              client_type: "Paid",
              match_analysis_type: "Pro",
              team_a: "Bayern Munich",
              team_b: "Borussia Dortmund",
              game_time: "90",
              venue: "Allianz Arena, Germany",
              tournament_name: "Bundesliga",
              match_video_type: "Broadcasting",
              match_age_group: "Senior",
              match_received_on: "2026-02-09",
            }),
          }
        );
        const match3Data = await match3Response.json();
        const match3Id = match3Data.match.match_id;

        // Add analyst data to match 3
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${match3Id}/analyst`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              live_match_analysed_by: "",
              first_half_analysed_by: "Emma Wilson",
              second_half_analysed_by: "Emma Wilson",
              analysis_tat: "130",
              analysis_start_end_time: "160",
              remarks: "Detailed technical analysis completed.",
              analysed_on: new Date().toISOString(),
            }),
          }
        );

        // Add reviewer data to match 3 (with errors - send back)
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${match3Id}/reviewer`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              reviewed_by: "Lisa Anderson",
              qc_error_count: "3",
              review_tat: "60",
              reviewer_remarks: "Found 3 errors. Please review sections 2, 4, and 7.",
              has_errors: true,
              send_back_to_analyst: true,
            }),
          }
        );

        // Demo Match 4: Created (just created, no analysis yet)
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              organizer_name: "Juventus FC",
              client_type: "Unpaid",
              match_analysis_type: "Basic",
              team_a: "Juventus U19",
              team_b: "AC Milan U19",
              game_time: "80",
              venue: "Turin, Italy",
              tournament_name: "Primavera League",
              match_video_type: "Pixelot",
              match_age_group: "U19",
              match_received_on: "2026-02-12",
            }),
          }
        );

        // Demo Match 5: Demo type client
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              organizer_name: "PSG Academy",
              client_type: "Demo",
              match_analysis_type: "B2C",
              team_a: "PSG U17",
              team_b: "Lyon U17",
              game_time: "70",
              venue: "Paris, France",
              tournament_name: "Youth Championship",
              match_video_type: "Veo",
              match_age_group: "U17",
              match_received_on: "2026-02-08",
            }),
          }
        );

        handleRefresh();
      })(),
      {
        loading: "Creating 5 demo matches with different statuses...",
        success: "Demo data created successfully!",
        error: "Failed to create demo data",
      }
    );
  };

  // Show login page if not logged in
  if (!user) {
    return (
      <>
        <Toaster />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  // Get role-specific styling
  const getRoleColor = () => {
    switch (user.role) {
      case "manager":
        return "#22c55e";
      case "analyst":
        return "#3b82f6";
      case "reviewer":
        return "#f59e0b";
      default:
        return "#22c55e";
    }
  };

  const getRoleIcon = () => {
    switch (user.role) {
      case "manager":
        return <ClipboardList className="h-4 w-4" />;
      case "analyst":
        return <UserCheck className="h-4 w-4" />;
      case "reviewer":
        return <Shield className="h-4 w-4" />;
      default:
        return <ClipboardList className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-foreground">
      <Toaster />

      {/* Header */}
      <header className="border-b border-[#1a2742] bg-[#0d1526]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#22c55e] flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">StepOut Match Manager</h1>
                <p className="text-xs text-[#7a8ba6]">Centralized workflow tracking for match analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Badge */}
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: `${getRoleColor()}15`,
                  border: `1px solid ${getRoleColor()}30`,
                  color: getRoleColor(),
                }}
              >
                {getRoleIcon()}
                <span className="capitalize">{user.role}</span>
              </div>

              {/* User Name */}
              <div className="text-sm text-[#c0cde0]">
                Welcome, <span className="font-medium text-white">{user.name}</span>
              </div>

              {/* Demo Data Button (Manager only) */}
              {user.role === "manager" && (
                <Button
                  onClick={createDemoData}
                  variant="outline"
                  className="gap-2 border-[#2a3a4e] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent text-sm h-9"
                >
                  <Database className="h-4 w-4" />
                  Demo Data
                </Button>
              )}

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="gap-2 border-[#2a3a4e] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent text-sm h-9"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8" key={refreshKey}>
        {user.role === "manager" && <ManagerPortal userName={user.name} onRefresh={handleRefresh} />}
        {user.role === "analyst" && <AnalystPortal userName={user.name} />}
        {user.role === "reviewer" && <ReviewerPortal userName={user.name} />}
      </main>
    </div>
  );
}
