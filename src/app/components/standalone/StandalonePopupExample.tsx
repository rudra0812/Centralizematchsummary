import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ManagerMatchPopup } from "./ManagerMatchPopup";
import { AnalystMatchPopup } from "./AnalystMatchPopup";
import { ReviewerMatchPopup } from "./ReviewerMatchPopup";
import { FileText, LineChart, CheckCircle } from "lucide-react";

/**
 * Example component showing how to use the three standalone popups
 * 
 * INTEGRATION GUIDE:
 * 
 * 1. Import the popup you need:
 *    import { ManagerMatchPopup } from "./components/standalone/ManagerMatchPopup";
 *    import { AnalystMatchPopup } from "./components/standalone/AnalystMatchPopup";
 *    import { ReviewerMatchPopup } from "./components/standalone/ReviewerMatchPopup";
 * 
 * 2. Add state to control the popup:
 *    const [openManager, setOpenManager] = useState(false);
 *    const [openAnalyst, setOpenAnalyst] = useState(false);
 *    const [openReviewer, setOpenReviewer] = useState(false);
 * 
 * 3. Add a button to trigger the popup:
 *    <button onClick={() => setOpenManager(true)}>Create Match</button>
 * 
 * 4. Add the popup component:
 *    <ManagerMatchPopup 
 *      open={openManager} 
 *      onOpenChange={setOpenManager}
 *      onSuccess={() => console.log("Match created!")}
 *    />
 * 
 * NOTE: 
 * - ManagerMatchPopup: No matchId needed - creates new matches
 * - AnalystMatchPopup: Requires matchId prop
 * - ReviewerMatchPopup: Requires matchId prop
 */
export function StandalonePopupExample() {
  const [openManager, setOpenManager] = useState(false);
  const [openAnalyst, setOpenAnalyst] = useState(false);
  const [openReviewer, setOpenReviewer] = useState(false);
  
  // For analyst and reviewer popups, you'll need a match ID
  // In your actual app, this would come from your data
  const exampleMatchId = "MATCH-2026-001";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Match Management Popups</h1>
          <p className="text-gray-600">
            Three standalone popups ready to integrate into your existing website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manager Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Manager</CardTitle>
                  <CardDescription>Create Match</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create new matches with client details, teams, venue, tournament info, and more.
              </p>
              <Button 
                className="w-full"
                onClick={() => setOpenManager(true)}
              >
                Open Manager Popup
              </Button>
            </CardContent>
          </Card>

          {/* Analyst Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <LineChart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Analyst</CardTitle>
                  <CardDescription>Submit Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Complete analysis with analyst details, TAT tracking, and remarks for reviewers.
              </p>
              <Button 
                className="w-full"
                onClick={() => setOpenAnalyst(true)}
              >
                Open Analyst Popup
              </Button>
            </CardContent>
          </Card>

          {/* Reviewer Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Reviewer</CardTitle>
                  <CardDescription>Complete Review</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Review analysis with QC checks, error tracking, and option to send back for rework.
              </p>
              <Button 
                className="w-full"
                onClick={() => setOpenReviewer(true)}
              >
                Open Reviewer Popup
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Integration Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Examples</CardTitle>
            <CardDescription>
              Copy these code snippets to integrate into your existing website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">1. Import the component:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`import { ManagerMatchPopup } from "./components/standalone/ManagerMatchPopup";`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">2. Add state to your component:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`const [openManager, setOpenManager] = useState(false);`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">3. Add a trigger button:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`<button onClick={() => setOpenManager(true)}>
  Create New Match
</button>`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">4. Add the popup component:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
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
              <h3 className="font-semibold text-sm">For Analyst and Reviewer popups (requires matchId):</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
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
        }}
      />

      <AnalystMatchPopup 
        matchId={exampleMatchId}
        open={openAnalyst} 
        onOpenChange={setOpenAnalyst}
        onSuccess={() => {
          console.log("Analysis submitted successfully!");
        }}
      />

      <ReviewerMatchPopup 
        matchId={exampleMatchId}
        open={openReviewer} 
        onOpenChange={setOpenReviewer}
        onSuccess={() => {
          console.log("Review completed successfully!");
        }}
      />
    </div>
  );
}
