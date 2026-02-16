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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Match Details</DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline">{match.match_id}</Badge>
            <Badge>{match.status.replace("_", " ").toUpperCase()}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Manager Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manager Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Client Name (Organizer)
                </p>
                <p className="text-sm">{match.manager?.organizer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Client Type
                </p>
                <Badge variant="outline">{match.manager?.client_type}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Match Analysis Type
                </p>
                <p className="text-sm">{match.manager?.match_analysis_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teams
                </p>
                <p className="text-sm">
                  {match.manager?.team_a} vs {match.manager?.team_b}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Game Time
                </p>
                <p className="text-sm">
                  {match.manager?.game_time
                    ? new Date(match.manager.game_time).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Venue
                </p>
                <p className="text-sm">{match.manager?.venue}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tournament Name
                </p>
                <p className="text-sm">{match.manager?.tournament_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Video Type
                </p>
                <p className="text-sm">{match.manager?.match_video_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Age Group
                </p>
                <p className="text-sm">{match.manager?.match_age_group}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Match Received On
                </p>
                <p className="text-sm">
                  {match.manager?.match_received_on
                    ? new Date(match.manager.match_received_on).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receiving Week
                </p>
                <p className="text-sm">Week {match.manager?.receiving_week}</p>
              </div>
            </CardContent>
          </Card>

          {/* Analyst Details */}
          {match.analyst && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analyst Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Analysed On
                    </p>
                    <p className="text-sm">
                      {new Date(match.analyst.analysed_on).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Live Match
                    </p>
                    <Badge variant="outline">{match.analyst.live_match}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Analysis TAT
                    </p>
                    <p className="text-sm">{match.analyst.analysis_tat} hours</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Start to End Time
                    </p>
                    <p className="text-sm">
                      {match.analyst.analysis_start_end_time} hours
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Analysis Week
                    </p>
                    <p className="text-sm">Week {match.analyst.analysis_week}</p>
                  </div>
                  {match.analyst.rework_count > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Rework Count
                      </p>
                      <Badge variant="destructive">
                        {match.analyst.rework_count}
                      </Badge>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Analysts
                  </p>
                  <div className="space-y-2">
                    {match.analyst.analysts?.map((analyst: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge>{analyst.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ID: {analyst.analyst_id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {match.analyst.remarks && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Remarks
                      </p>
                      <p className="text-sm mt-1">{match.analyst.remarks}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviewer Details */}
          {match.reviewer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reviewer Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reviewed By
                  </p>
                  <p className="text-sm">{match.reviewer.reviewed_by}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    QC Error Count
                  </p>
                  <Badge
                    variant={
                      match.reviewer.qc_error_count > 0 ? "destructive" : "outline"
                    }
                  >
                    {match.reviewer.qc_error_count} errors
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Review TAT
                  </p>
                  <p className="text-sm">{match.reviewer.review_tat} hours</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total TAT
                  </p>
                  <p className="text-sm font-bold">
                    {match.reviewer.total_tat} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Review Week
                  </p>
                  <p className="text-sm">Week {match.reviewer.review_week}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reviewed On
                  </p>
                  <p className="text-sm">
                    {new Date(match.reviewer.reviewed_on).toLocaleString()}
                  </p>
                </div>
                {match.reviewer.reviewer_remarks && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Reviewer Remarks
                    </p>
                    <p className="text-sm mt-1">
                      {match.reviewer.reviewer_remarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(match.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(match.updated_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
