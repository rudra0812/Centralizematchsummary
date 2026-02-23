import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

interface MatchDetailsDialogProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-[#7a8ba6] uppercase tracking-wide">{label}</p>
      <div className="text-sm text-[#c0cde0]">{value || "-"}</div>
    </div>
  );
}

export function MatchDetailsDialog({
  match,
  open,
  onOpenChange,
}: MatchDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      created: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30",
      in_review: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
      completed: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
      rework: "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30",
    };
    return styles[status] || "border-border text-[#7a8ba6]";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b1120] border-border text-[#e8edf4]">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Match Details</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-[#22c55e]/30 text-[#22c55e] font-mono text-xs">{match.match_id}</Badge>
            <Badge variant="outline" className={getStatusColor(match.status)}>{match.status.replace("_", " ").toUpperCase()}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* MATCH DETAILS Section */}
          <Card className="bg-[#111b2e] border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#22c55e] uppercase tracking-wider">Match Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                <DetailRow label="Client Name" value={match.manager?.organizer_name} />
                <DetailRow label="Client Type" value={
                  match.manager?.client_type ? (
                    <Badge variant="outline" className="border-border text-[#c0cde0]">{match.manager.client_type}</Badge>
                  ) : "-"
                } />
                <DetailRow label="Match Analysis Type" value={match.manager?.match_analysis_type} />
                <DetailRow label="Team A" value={match.manager?.team_a} />
                <DetailRow label="Team B" value={match.manager?.team_b} />
                <DetailRow label="Game Time (mins)" value={match.manager?.game_time} />
                <DetailRow label="Match Country" value={match.manager?.match_country || match.manager?.venue} />
                <DetailRow label="Major Tournament Name" value={match.manager?.tournament_name} />
                <DetailRow label="Match Video Type" value={match.manager?.match_video_type} />
                <DetailRow label="Match Age Group" value={match.manager?.match_age_group} />
                <DetailRow label="Match Received On" value={formatDate(match.manager?.match_received_on)} />
                <DetailRow label="Match Receiving Week" value={match.manager?.receiving_week ? `Week ${match.manager.receiving_week}` : "-"} />
              </div>
            </CardContent>
          </Card>

          {/* ANALYSIS DETAILS Section */}
          <Card className="bg-[#111b2e] border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#3b82f6] uppercase tracking-wider">Analysis Details</CardTitle>
            </CardHeader>
            <CardContent>
              {match.analyst ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailRow label="Match Analysed On" value={formatDate(match.analyst.analysed_on)} />
                    <DetailRow 
                      label="Live Match Analysed By" 
                      value={match.analyst.live_match_analysed_by || match.analyst.live_analysis_by || "-"} 
                    />
                    <DetailRow 
                      label="First Half Analysed By" 
                      value={
                        match.analyst.first_half_analysed_by || 
                        (match.analyst.analysts && match.analyst.analysts.length > 0 ? match.analyst.analysts[0]?.name : "-")
                      } 
                    />
                    <DetailRow 
                      label="Second Half Analysed By" 
                      value={
                        match.analyst.second_half_analysed_by || 
                        (match.analyst.analysts && match.analyst.analysts.length > 1 ? match.analyst.analysts[1]?.name : "-")
                      } 
                    />
                    <DetailRow label="Analysis TAT (mins)" value={match.analyst.analysis_tat} />
                    <DetailRow label="Analysis Start to End Time (mins)" value={match.analyst.analysis_start_end_time} />
                    <DetailRow label="Match Analysis Week" value={match.analyst.analysis_week ? `Week ${match.analyst.analysis_week}` : "-"} />
                    {match.analyst.rework_count > 0 && (
                      <DetailRow label="Rework Count" value={
                        <Badge variant="destructive">{match.analyst.rework_count}</Badge>
                      } />
                    )}
                  </div>

                  {/* Show analysts badges if we're using the array format and names aren't in specific fields */}
                  {match.analyst.analysts && match.analyst.analysts.length > 0 && (
                    <>
                      <Separator className="bg-[#1e2f4a]" />
                      <div>
                        <p className="text-xs font-medium text-[#7a8ba6] uppercase tracking-wide mb-2">Analysts</p>
                        <div className="flex flex-wrap gap-2">
                          {match.analyst.analysts.map((a: any, i: number) => (
                            <Badge key={i} className="bg-[#22c55e] text-white border-0">{a.name}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {match.analyst.remarks && (
                    <>
                      <Separator className="bg-[#1e2f4a]" />
                      <DetailRow label="Analyst Remarks" value={match.analyst.remarks} />
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#5a6f84] italic">No analysis data yet</p>
              )}
            </CardContent>
          </Card>

          {/* REVIEW DETAILS Section */}
          <Card className="bg-[#111b2e] border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#f59e0b] uppercase tracking-wider">Review Details</CardTitle>
            </CardHeader>
            <CardContent>
              {match.reviewer ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <DetailRow label="Match Reviewed By" value={match.reviewer.reviewed_by} />
                    <DetailRow label="Match Reviewed On" value={formatDate(match.reviewer.reviewed_on)} />
                    <DetailRow label="Match QC Error Count" value={
                      <Badge
                        variant={match.reviewer.qc_error_count > 0 ? "destructive" : "outline"}
                        className={match.reviewer.qc_error_count > 0 ? "" : "border-border text-[#c0cde0]"}
                      >
                        {match.reviewer.qc_error_count} errors
                      </Badge>
                    } />
                    <DetailRow label="Match Review TAT (mins)" value={match.reviewer.review_tat} />
                    <DetailRow label="Match Status" value={
                      match.reviewer.match_status ? (
                        <Badge variant="outline" className="border-border text-[#c0cde0]">{match.reviewer.match_status}</Badge>
                      ) : "-"
                    } />
                    <DetailRow label="Match Review Week" value={match.reviewer.review_week ? `Week ${match.reviewer.review_week}` : "-"} />
                    <DetailRow label="Total Start to Completion TAT (hours)" value={
                      match.reviewer.total_start_to_completion_tat
                        ? <span className="font-semibold text-white">{match.reviewer.total_start_to_completion_tat} hrs</span>
                        : "-"
                    } />
                  </div>

                  {match.reviewer.reviewer_remarks && (
                    <>
                      <Separator className="bg-[#1e2f4a]" />
                      <DetailRow label="Reviewer Remarks" value={match.reviewer.reviewer_remarks} />
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[#5a6f84] italic">No review data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-[#111b2e] border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#7a8ba6] uppercase tracking-wider">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Created" value={new Date(match.created_at).toLocaleString()} />
                <DetailRow label="Last Updated" value={new Date(match.updated_at).toLocaleString()} />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
