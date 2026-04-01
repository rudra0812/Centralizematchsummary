import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { CheckCircle, RefreshCw, Eye, Clock, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ReviewerWorkflowDialog } from "./ReviewerWorkflowDialog";
import { MatchDetailsDialog } from "./MatchDetailsDialog";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

interface ReviewerPortalProps {
  userName: string;
}

export function ReviewerPortal({ userName }: ReviewerPortalProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsMatch, setDetailsMatch] = useState<Match | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches?status=in_review`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMatches(data.matches);
      } else {
        toast.error("Failed to fetch matches");
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCompleteReview = (matchId: string) => {
    setSelectedMatch(matchId);
    setDialogOpen(true);
  };

  const viewMatchDetails = (match: Match) => {
    setDetailsMatch(match);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviewer Dashboard</h1>
          <p className="text-[#7a8ba6] text-sm">Welcome, {userName} - Review analyses and complete QC checks</p>
        </div>
        <Button
          onClick={fetchMatches}
          variant="outline"
          className="gap-2 border-[#2a3a4e] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-[#111b2e] border-[#1a2742]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#f59e0b]/10 rounded-lg border border-[#f59e0b]/20">
              <Clock className="h-6 w-6 text-[#f59e0b]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#f59e0b]">{matches.length}</div>
              <p className="text-xs text-[#7a8ba6]">Matches Awaiting Review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches Table */}
      <Card className="bg-[#111b2e] border-[#1a2742]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#1a2742] rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#5a6f84]" />
                <p>No matches awaiting review</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1a2742] bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6]">Match ID</TableHead>
                    <TableHead className="text-[#7a8ba6]">Teams</TableHead>
                    <TableHead className="text-[#7a8ba6]">Tournament</TableHead>
                    <TableHead className="text-[#7a8ba6]">Analysts</TableHead>
                    <TableHead className="text-[#7a8ba6]">Analysis TAT</TableHead>
                    <TableHead className="text-[#7a8ba6]">Analyst Remarks</TableHead>
                    <TableHead className="text-[#7a8ba6]">Submitted On</TableHead>
                    <TableHead className="text-[#7a8ba6]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.match_id} className="border-[#1a2742] hover:bg-[#1a2742]/50">
                      <TableCell className="font-mono text-sm text-[#22c55e]">
                        {match.match_id.length > 15 ? match.match_id.slice(0, 15) + "..." : match.match_id}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.tournament_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.analyst?.first_half_analysed_by && match.analyst?.second_half_analysed_by
                          ? `${match.analyst.first_half_analysed_by}, ${match.analyst.second_half_analysed_by}`
                          : match.analyst?.analysts?.map((a: any) => a.name).join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-[#2a3a4e] text-[#7a8ba6]">
                          {match.analyst?.analysis_tat ? `${match.analyst.analysis_tat} mins` : "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#7a8ba6] max-w-[200px] truncate">
                        {match.analyst?.remarks || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#7a8ba6]">
                        {match.analyst?.analysed_on
                          ? new Date(match.analyst.analysed_on).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewMatchDetails(match)}
                            className="text-[#7a8ba6] hover:text-white hover:bg-[#1a2742]"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteReview(match.match_id)}
                            className="gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-white border-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Tips */}
      <Card className="bg-[#111b2e] border-[#1a2742]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Review Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#0d1526] rounded-lg border border-[#1a2742]">
              <h4 className="text-sm font-medium text-white mb-2">Check Analysis Quality</h4>
              <p className="text-xs text-[#7a8ba6]">
                Verify all tactical patterns, player movements, and key events are correctly identified.
              </p>
            </div>
            <div className="p-4 bg-[#0d1526] rounded-lg border border-[#1a2742]">
              <h4 className="text-sm font-medium text-white mb-2">Count QC Errors</h4>
              <p className="text-xs text-[#7a8ba6]">
                Track the total number of errors found and provide specific feedback for corrections.
              </p>
            </div>
            <div className="p-4 bg-[#0d1526] rounded-lg border border-[#1a2742]">
              <h4 className="text-sm font-medium text-white mb-2">Rework Decision</h4>
              <p className="text-xs text-[#7a8ba6]">
                If errors are critical, send back to analyst for rework. Otherwise, approve and complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selectedMatch && (
        <ReviewerWorkflowDialog
          matchId={selectedMatch}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchMatches}
        />
      )}

      {/* Match Details Dialog */}
      {detailsMatch && (
        <MatchDetailsDialog
          match={detailsMatch}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
}
