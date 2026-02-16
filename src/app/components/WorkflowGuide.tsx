import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2 } from "lucide-react";

export function WorkflowGuide() {
  const steps = [
    {
      role: "Manager",
      step: 1,
      title: "Create Match",
      description:
        "Click '+ Create a Match' to fill in all match details including client info, teams, tournament, and other metadata.",
      fields: [
        "Client Name (Organizer)",
        "Client Type (Paid/Unpaid/Demo)",
        "Match Analysis Type",
        "Teams A & B",
        "Game Time",
        "Venue",
        "Tournament Name",
        "Video Type",
        "Age Group",
        "Match Received Date",
      ],
    },
    {
      role: "Analyst",
      step: 2,
      title: "Analyze & Mark for Review",
      description:
        "View available matches in Analyst Dashboard. After completing analysis, click 'Mark for Review' and fill in analysis details.",
      fields: [
        "Live Match (Yes/No)",
        "Analyst Name(s) and ID(s)",
        "Analysis TAT (hours)",
        "Start to End Time",
        "Remarks",
      ],
    },
    {
      role: "Reviewer",
      step: 3,
      title: "Review & Complete",
      description:
        "View matches awaiting review. After QC, click 'Complete' to finalize or send back for rework if errors found.",
      fields: [
        "Reviewed By",
        "QC Error Count",
        "Review TAT (hours)",
        "Reviewer Remarks",
        "Send Back to Analyst (if errors)",
      ],
    },
    {
      role: "Admin/Manager",
      step: 4,
      title: "Monitor & Export",
      description:
        "View all matches in Admin Portal with filters. Export complete data to CSV for external analysis and reporting.",
      fields: [
        "View all match statuses",
        "Filter by status, client type",
        "Search matches",
        "Export to CSV",
        "View detailed match information",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#111b2e] border-border">
        <CardHeader>
          <CardTitle className="text-white">Workflow Guide</CardTitle>
          <p className="text-sm text-[#7a8ba6]">
            How the centralized match management system works
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-[#1e2f4a]" />
              )}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e] text-white font-bold">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#2a3f5f] text-[#7a8ba6]">{step.role}</Badge>
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-sm text-[#7a8ba6]">
                    {step.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {step.fields.map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        className="flex items-start gap-2 text-sm text-[#c0cde0]"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#22c55e] mt-0.5" />
                        <span>{field}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#0d1526] border-border">
        <CardHeader>
          <CardTitle className="text-lg text-white">Key Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Centralized Data Storage</p>
              <p className="text-sm text-[#7a8ba6]">
                All match information from creation to completion stored in one
                place
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Automatic TAT Calculation</p>
              <p className="text-sm text-[#7a8ba6]">
                Total turnaround time automatically calculated (Analysis TAT +
                Review TAT)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Week Tracking</p>
              <p className="text-sm text-[#7a8ba6]">
                Automatically tracks receiving week, analysis week, and review
                week
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Rework Handling</p>
              <p className="text-sm text-[#7a8ba6]">
                Reviewers can send matches back to analysts with tracked rework
                count
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Data Export</p>
              <p className="text-sm text-[#7a8ba6]">
                Export all match data to CSV for external reporting and analysis
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#22c55e] mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-white">Multiple Analysts Support</p>
              <p className="text-sm text-[#7a8ba6]">
                Track multiple analysts working on the same match
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
