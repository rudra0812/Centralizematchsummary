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
import { CheckCircle, RefreshCw, Eye } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { ReviewerWorkflowDialog } from "./ReviewerWorkflowDialog";
import { MatchDetailsDialog } from "./MatchDetailsDialog";
import { formatTAT } from "../../lib/constants";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

export function ReviewerDashboard() {
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
      <Card className="bg-[#111b2e] border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Reviewer Dashboard</CardTitle>
          <Button onClick={fetchMatches} variant="outline" size="sm" className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-[#0d1526] border-border">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-[#f59e0b]">{matches.length}</div>
              <p className="text-xs text-[#7a8ba6]">
                Matches Awaiting Review
              </p>
            </CardContent>
          </Card>

          <div className="border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">
                No matches available for review
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6]">Match ID</TableHead>
                    <TableHead className="text-[#7a8ba6]">Tournament</TableHead>
                    <TableHead className="text-[#7a8ba6]">Teams</TableHead>
                    <TableHead className="text-[#7a8ba6]">Score Line</TableHead>
                    <TableHead className="text-[#7a8ba6]">Analysts</TableHead>
                    <TableHead className="text-[#7a8ba6]">Reviewer TAT</TableHead>
                    <TableHead className="text-[#7a8ba6]">Submitted</TableHead>
                    <TableHead className="text-[#7a8ba6]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.match_id} className="border-border hover:bg-[#1a2742]/50">
                      <TableCell className="font-mono text-sm text-[#22c55e]">
                        {match.match_id.slice(0, 12)}...
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.tournament_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.score_line || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.analyst?.analysts
                          ?.map((a: any) => a.name)
                          .join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border text-[#f59e0b] font-mono">
                          {formatTAT(match.reviewer?.reviewer_tat)}
                        </Badge>
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
                            className="gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete
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

      {selectedMatch && (
        <ReviewerWorkflowDialog
          matchId={selectedMatch}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchMatches}
        />
      )}

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
