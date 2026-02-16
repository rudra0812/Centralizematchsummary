import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { CreateMatchForm } from "./components/CreateMatchForm";
import { AdminPortal } from "./components/AdminPortal";
import { AnalystDashboard } from "./components/AnalystDashboard";
import { ReviewerDashboard } from "./components/ReviewerDashboard";
import { WorkflowGuide } from "./components/WorkflowGuide";
import { Toaster } from "./components/ui/sonner";
import { ClipboardList, UserCheck, Shield, LayoutDashboard, BookOpen, Package } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { ManagerMatchPopup } from "./components/standalone/ManagerMatchPopup";
import { AnalystMatchPopup } from "./components/standalone/AnalystMatchPopup";
import { ReviewerMatchPopup } from "./components/standalone/ReviewerMatchPopup";
import { FileText, LineChart, CheckCircle, Database } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [openManager, setOpenManager] = useState(false);
  const [openAnalyst, setOpenAnalyst] = useState(false);
  const [openReviewer, setOpenReviewer] = useState(false);
  
  const exampleMatchId = "MATCH-2026-001";

  const handleMatchCreated = () => {
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
              client_type: "paid",
              match_analysis_type: "Tactical Analysis",
              team_a: "Manchester United",
              team_b: "Liverpool FC",
              game_time: "2026-02-15T15:00:00",
              venue: "Old Trafford, England",
              tournament_name: "Premier League",
              match_video_type: "YouTube",
              match_age_group: "Professional",
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
              live_match: "No",
              analysts: [
                { name: "John Smith", analyst_id: "A001" },
                { name: "Sarah Johnson", analyst_id: "A002" },
              ],
              analysis_tat: "6.5",
              analysis_start_end_time: "8.0",
              remarks: "Great match, clear tactical patterns identified. Both teams showed excellent defensive organization.",
              analysis_start_time: new Date().toISOString(),
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
              review_tat: "1.5",
              reviewer_remarks: "Excellent analysis. All tactical patterns correctly identified. No errors found.",
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
              client_type: "paid",
              match_analysis_type: "Performance Analysis",
              team_a: "Barcelona",
              team_b: "Real Madrid",
              game_time: "2026-02-14T20:00:00",
              venue: "Camp Nou, Spain",
              tournament_name: "La Liga",
              match_video_type: "DAZN",
              match_age_group: "Professional",
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
              live_match: "Yes",
              analysts: [{ name: "David Martinez", analyst_id: "A003" }],
              analysis_tat: "5.0",
              analysis_start_end_time: "6.5",
              remarks: "Live match analysis completed. High-intensity gameplay with multiple tactical adjustments.",
              analysis_start_time: new Date().toISOString(),
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
              client_type: "paid",
              match_analysis_type: "Technical Analysis",
              team_a: "Bayern Munich",
              team_b: "Borussia Dortmund",
              game_time: "2026-02-13T18:30:00",
              venue: "Allianz Arena, Germany",
              tournament_name: "Bundesliga",
              match_video_type: "ESPN+",
              match_age_group: "Professional",
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
              live_match: "No",
              analysts: [{ name: "Emma Wilson", analyst_id: "A004" }],
              analysis_tat: "7.0",
              analysis_start_end_time: "8.5",
              remarks: "Detailed technical analysis completed.",
              analysis_start_time: new Date().toISOString(),
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
              review_tat: "2.0",
              reviewer_remarks: "Found 3 errors in tactical pattern identification. Please review sections 2, 4, and 7.",
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
              client_type: "unpaid",
              match_analysis_type: "Youth Development Analysis",
              team_a: "Juventus U19",
              team_b: "AC Milan U19",
              game_time: "2026-02-16T14:00:00",
              venue: "Turin, Italy",
              tournament_name: "Primavera League",
              match_video_type: "Vimeo",
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
              client_type: "demo",
              match_analysis_type: "Basic Tactical Review",
              team_a: "PSG U17",
              team_b: "Lyon U17",
              game_time: "2026-02-12T16:00:00",
              venue: "Paris, France",
              tournament_name: "Youth Championship",
              match_video_type: "YouTube",
              match_age_group: "U17",
              match_received_on: "2026-02-08",
            }),
          }
        );

        handleMatchCreated();
      })(),
      {
        loading: "Creating 5 demo matches with different statuses...",
        success: "Demo data created successfully! Check the Admin Portal.",
        error: "Failed to create demo data",
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-border bg-[#0d1526]">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-[#22c55e] flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">StepOut Match Manager</h1>
                  <p className="text-xs text-[#7a8ba6]">
                    Centralized workflow tracking for match analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={createDemoData} variant="outline" className="gap-2 border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent text-sm h-9">
                <Database className="h-4 w-4" />
                Demo Data
              </Button>
              <CreateMatchForm onMatchCreated={handleMatchCreated} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="standalone" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-[#111b2e] border border-border rounded-xl p-1 h-auto">
            <TabsTrigger value="standalone" className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white data-[state=active]:border-transparent text-[#7a8ba6] rounded-lg py-2.5 text-sm font-medium">
              <Package className="h-4 w-4" />
              Standalone Popups
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white data-[state=active]:border-transparent text-[#7a8ba6] rounded-lg py-2.5 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Guide
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white data-[state=active]:border-transparent text-[#7a8ba6] rounded-lg py-2.5 text-sm font-medium">
              <LayoutDashboard className="h-4 w-4" />
              Admin Portal
            </TabsTrigger>
            <TabsTrigger value="manager" className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white data-[state=active]:border-transparent text-[#7a8ba6] rounded-lg py-2.5 text-sm font-medium">
              <ClipboardList className="h-4 w-4" />
              Manager View
            </TabsTrigger>
            <TabsTrigger value="analyst" className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white data-[state=active]:border-transparent text-[#7a8ba6] rounded-lg py-2.5 text-sm font-medium">
              <UserCheck className="h-4 w-4" />
              Analyst
            </TabsTrigger>
            <TabsTrigger value="reviewer" className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white data-[state=active]:border-transparent text-[#7a8ba6] rounded-lg py-2.5 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Reviewer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standalone">
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">Match Management Popups</h1>
                <p className="text-[#7a8ba6] text-sm">
                  Three standalone popups ready to integrate into your existing website
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Manager Card */}
                <Card className="bg-[#111b2e] border-border hover:border-[#22c55e]/40 transition-colors flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#22c55e]/10 rounded-lg border border-[#22c55e]/20 shrink-0">
                        <FileText className="h-6 w-6 text-[#22c55e]" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-base">Manager</CardTitle>
                        <CardDescription className="text-[#7a8ba6] text-sm">Create Match</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    <p className="text-sm text-[#7a8ba6] flex-1">
                      Create new matches with client details, teams, venue, tournament info, and more.
                    </p>
                    <Button 
                      className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
                      onClick={() => setOpenManager(true)}
                    >
                      Open Manager Popup
                    </Button>
                  </CardContent>
                </Card>

                {/* Analyst Card */}
                <Card className="bg-[#111b2e] border-border hover:border-[#3b82f6]/40 transition-colors flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#3b82f6]/10 rounded-lg border border-[#3b82f6]/20 shrink-0">
                        <LineChart className="h-6 w-6 text-[#3b82f6]" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-base">Analyst</CardTitle>
                        <CardDescription className="text-[#7a8ba6] text-sm">Submit Analysis</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    <p className="text-sm text-[#7a8ba6] flex-1">
                      Complete analysis with analyst details, TAT tracking, and remarks for reviewers.
                    </p>
                    <Button 
                      className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0"
                      onClick={() => setOpenAnalyst(true)}
                    >
                      Open Analyst Popup
                    </Button>
                  </CardContent>
                </Card>

                {/* Reviewer Card */}
                <Card className="bg-[#111b2e] border-border hover:border-[#f59e0b]/40 transition-colors flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/20 shrink-0">
                        <CheckCircle className="h-6 w-6 text-[#f59e0b]" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-base">Reviewer</CardTitle>
                        <CardDescription className="text-[#7a8ba6] text-sm">Complete Review</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    <p className="text-sm text-[#7a8ba6] flex-1">
                      Review analysis with QC checks, error tracking, and option to send back for rework.
                    </p>
                    <Button 
                      className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-white border-0"
                      onClick={() => setOpenReviewer(true)}
                    >
                      Open Reviewer Popup
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Integration Code Examples */}
              <Card className="bg-[#111b2e] border-border">
                <CardHeader>
                  <CardTitle className="text-white">Integration Examples</CardTitle>
                  <CardDescription className="text-[#7a8ba6]">
                    Copy these code snippets to integrate into your existing website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-[#c0cde0]">1. Import the component:</h3>
                    <pre className="bg-[#0b1120] border border-border p-4 rounded-lg text-xs overflow-x-auto text-[#22c55e]">
{`import { ManagerMatchPopup } from "./components/standalone/ManagerMatchPopup";`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-[#c0cde0]">2. Add state to your component:</h3>
                    <pre className="bg-[#0b1120] border border-border p-4 rounded-lg text-xs overflow-x-auto text-[#22c55e]">
{`const [openManager, setOpenManager] = useState(false);`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-[#c0cde0]">3. Add a trigger button:</h3>
                    <pre className="bg-[#0b1120] border border-border p-4 rounded-lg text-xs overflow-x-auto text-[#22c55e]">
{`<button onClick={() => setOpenManager(true)}>
  Create New Match
</button>`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-[#c0cde0]">4. Add the popup component:</h3>
                    <pre className="bg-[#0b1120] border border-border p-4 rounded-lg text-xs overflow-x-auto text-[#22c55e]">
{`<ManagerMatchPopup 
  open={openManager} 
  onOpenChange={setOpenManager}
  onSuccess={() => {
    console.log("Match created!");
    // Refresh your data here
  }}
/>`}
                    </pre>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-[#c0cde0]">For Analyst and Reviewer popups (requires matchId):</h3>
                    <pre className="bg-[#0b1120] border border-border p-4 rounded-lg text-xs overflow-x-auto text-[#22c55e]">
{`<AnalystMatchPopup 
  matchId="MATCH-2026-001"
  open={openAnalyst} 
  onOpenChange={setOpenAnalyst}
  onSuccess={() => console.log("Analysis submitted!")}
/>

<ReviewerMatchPopup 
  matchId="MATCH-2026-001"
  open={openReviewer} 
  onOpenChange={setOpenReviewer}
  onSuccess={() => console.log("Review completed!")}
/>`}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Popup Components */}
            <ManagerMatchPopup 
              open={openManager} 
              onOpenChange={setOpenManager}
              onSuccess={() => {
                console.log("Match created successfully!");
                handleMatchCreated();
              }}
            />

            <AnalystMatchPopup 
              matchId={exampleMatchId}
              open={openAnalyst} 
              onOpenChange={setOpenAnalyst}
              onSuccess={() => {
                console.log("Analysis submitted successfully!");
                handleMatchCreated();
              }}
            />

            <ReviewerMatchPopup 
              matchId={exampleMatchId}
              open={openReviewer} 
              onOpenChange={setOpenReviewer}
              onSuccess={() => {
                console.log("Review completed successfully!");
                handleMatchCreated();
              }}
            />
          </TabsContent>

          <TabsContent value="guide">
            <WorkflowGuide />
          </TabsContent>

          <TabsContent value="admin" key={`admin-${refreshKey}`}>
            <AdminPortal />
          </TabsContent>

          <TabsContent value="manager" key={`manager-${refreshKey}`}>
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-[#111b2e] p-6">
                <h2 className="text-2xl font-bold mb-2 text-white">Manager Dashboard</h2>
                <p className="text-[#7a8ba6] mb-6 text-sm">
                  Create new matches using the "Demo Data" button above.
                  All created matches will appear in the Admin Portal.
                </p>
                <AdminPortal />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyst" key={`analyst-${refreshKey}`}>
            <AnalystDashboard />
          </TabsContent>

          <TabsContent value="reviewer" key={`reviewer-${refreshKey}`}>
            <ReviewerDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 bg-[#0d1526]">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-[#22c55e] flex items-center justify-center">
                <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              </div>
              <span className="text-sm font-medium text-[#c0cde0]">StepOut Match Manager</span>
            </div>
            <p className="text-xs text-[#7a8ba6]">
              All match data is stored and tracked in real-time
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
