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

export function MatchDetailsDialog({
  match,
  open,
  onOpenChange,
}: MatchDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b1120] border-border text-[#e8edf4]">
        <DialogHeader>
          <DialogTitle className="text-white">Match Details</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="border-[#22c55e]/30 text-[#22c55e]">{match.match_id}</Badge>
            <Badge className="bg-[#22c55e] text-white border-0">{match.status.replace("_", " ").toUpperCase()}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Manager Details */}
          <Card className="bg-[#111b2e] border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Manager Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Client Name (Organizer)
                </p>
                <p className="text-sm text-[#c0cde0]">{match.manager?.organizer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Client Type
                </p>
                <Badge variant="outline" className="border-border text-[#c0cde0]">{match.manager?.client_type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Match Analysis Type
                </p>
                <p className="text-sm text-[#c0cde0]">{match.manager?.match_analysis_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Teams
                </p>
                <p className="text-sm text-[#c0cde0]">
                  {match.manager?.team_a} vs {match.manager?.team_b}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Game Time
                </p>
                <p className="text-sm text-[#c0cde0]">
                  {match.manager?.game_time
                    ? new Date(match.manager.game_time).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Venue
                </p>
                <p className="text-sm text-[#c0cde0]">{match.manager?.venue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Tournament Name
                </p>
                <p className="text-sm text-[#c0cde0]">{match.manager?.tournament_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Video Type
                </p>
                <p className="text-sm text-[#c0cde0]">{match.manager?.match_video_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Age Group
                </p>
                <p className="text-sm text-[#c0cde0]">{match.manager?.match_age_group}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Match Received On
                </p>
                <p className="text-sm text-[#c0cde0]">
                  {match.manager?.match_received_on
                    ? new Date(match.manager.match_received_on).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[#7a8ba6]">
                  Receiving Week
                </p>
                <p className="text-sm text-[#c0cde0]">Week {match.manager?.receiving_week}</p>
              </div>
            </CardContent>
          </Card>

          {/* Analyst Details */}
          {match.analyst && (
            <Card className="bg-[#111b2e] border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Analyst Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#7a8ba6]">
                      Analysed On
                    </p>
                    <p className="text-sm text-[#c0cde0]">
                      {new Date(match.analyst.analysed_on).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7a8ba6]">
                      Live Match
                    </p>
                    <Badge variant="outline" className="border-border text-[#c0cde0]">{match.analyst.live_match}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7a8ba6]">
                      Analysis TAT
                    </p>
                    <p className="text-sm text-[#c0cde0]">{match.analyst.analysis_tat} hours</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7a8ba6]">
                      Start to End Time
                    </p>
                    <p className="text-sm text-[#c0cde0]">
                      {match.analyst.analysis_start_end_time} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#7a8ba6]">
                      Analysis Week
                    </p>
                    <p className="text-sm text-[#c0cde0]">Week {match.analyst.analysis_week}</p>
                  </div>
                  {match.analyst.rework_count > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[#7a8ba6]">
                        Rework Count
                      </p>
                      <Badge variant="destructive">
                        {match.analyst.rework_count}
                      </Badge>
                    </div>
                  )}
                </div>

                <Separator className="bg-[#1e2f4a]" />

                <div>
                  <p className="text-sm font-medium text-[#7a8ba6] mb-2">
                    Analysts
                  </p>
                  <div className="space-y-2">
                    {match.analyst.analysts?.map((analyst: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge className="bg-[#22c55e] text-white border-0">{analyst.name}</Badge>
                        <span className="text-sm text-[#7a8ba6]">
                          ID: {analyst.analyst_id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {match.analyst.remarks && (
                  <>
                    <Separator className="bg-[#1e2f4a]" />
                    <div>
                      <p className="text-sm font-medium text-[#7a8ba6]">
                        Remarks
                      </p>
                      <p className="text-sm mt-1 text-[#c0cde0]">{match.analyst.remarks}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviewer Details */}
          {match.reviewer && (
            <Card className="bg-[#111b2e] border-border">
              <CardHeader>
                <CardTitle className="text-lg text-white">Reviewer Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-[#7a8ba6]">
                    Reviewed By
                  </p>
                  <p className="text-sm text-[#c0cde0]">{match.reviewer.reviewed_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#7a8ba6]">
                    QC Error Count
                  </p>
                  <Badge
                    variant={
                      match.reviewer.qc_error_count > 0 ? "destructive" : "outline"
                    }
                    className={match.reviewer.qc_error_count > 0 ? "" : "border-border text-[#c0cde0]"}
                  >
                    {match.reviewer.qc_error_count} errors
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#7a8ba6]">
                    Review TAT
                  </p>
                  <p className="text-sm text-[#c0cde0]">{match.reviewer.review_tat} hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#7a8ba6]">
                    Total TAT
                  </p>
                  <p className="text-sm font-bold text-white">
                    {match.reviewer.total_tat} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#7a8ba6]">
                    Review Week
                  </p>
                  <p className="text-sm text-[#c0cde0]">Week {match.reviewer.review_week}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#7a8ba6]">
                    Reviewed On
                  </p>
                  <p className="text-sm text-[#c0cde0]">
                    {new Date(match.reviewer.reviewed_on).toLocaleString()}
                  </p>
                </div>
                {match.reviewer.reviewer_remarks && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-[#7a8ba6]">
                      Reviewer Remarks
                    </p>
                    <p className="text-sm mt-1 text-[#c0cde0]">
                      {match.reviewer.reviewer_remarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card className="bg-[#111b2e] border-border">
            <CardHeader>
              <CardTitle className="text-lg text-white">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#7a8ba6]">Created</span>
                <span className="text-[#c0cde0]">{new Date(match.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#7a8ba6]">Last Updated</span>
                <span className="text-[#c0cde0]">{new Date(match.updated_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
