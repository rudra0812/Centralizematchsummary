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
import { CheckCircle, RefreshCw, Eye, AlertTriangle, Clock } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { AnalystWorkflowDialog } from "./AnalystWorkflowDialog";
import { MatchDetailsDialog } from "./MatchDetailsDialog";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

interface AnalystPortalProps {
  userName: string;
}

export function AnalystPortal({ userName }: AnalystPortalProps) {
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
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Filter matches that are created or rework (available for analyst)
        const analystMatches = data.matches.filter(
          (m: Match) => m.status === "created" || m.status === "rework"
        );
        setMatches(analystMatches);
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

  const handleMarkForReview = (matchId: string) => {
    setSelectedMatch(matchId);
    setDialogOpen(true);
  };

  const viewMatchDetails = (match: Match) => {
    setDetailsMatch(match);
    setDetailsOpen(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "rework") {
      return (
        <Badge variant="outline" className="bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30 gap-1">
          <AlertTriangle className="h-3 w-3" />
          REWORK REQUIRED
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30">
        READY FOR ANALYSIS
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analyst Dashboard</h1>
          <p className="text-[#7a8ba6] text-sm">Welcome, {userName} - Analyze matches and submit for review</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111b2e] border-[#1a2742]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#3b82f6]/10 rounded-lg border border-[#3b82f6]/20">
                <Clock className="h-6 w-6 text-[#3b82f6]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{matches.length}</div>
                <p className="text-xs text-[#7a8ba6]">Available for Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111b2e] border-[#1a2742]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#22c55e]/10 rounded-lg border border-[#22c55e]/20">
                <CheckCircle className="h-6 w-6 text-[#22c55e]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#22c55e]">
                  {matches.filter((m) => m.status === "created").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">New Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111b2e] border-[#1a2742]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ef4444]/10 rounded-lg border border-[#ef4444]/20">
                <AlertTriangle className="h-6 w-6 text-[#ef4444]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#ef4444]">
                  {matches.filter((m) => m.status === "rework").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">Rework Required</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches Table */}
      <Card className="bg-[#111b2e] border-[#1a2742]">
        <CardHeader>
          <CardTitle className="text-white text-lg">Matches Assigned to You</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#1a2742] rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">No matches available for analysis</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1a2742] bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6]">Match ID</TableHead>
                    <TableHead className="text-[#7a8ba6]">Status</TableHead>
                    <TableHead className="text-[#7a8ba6]">Teams</TableHead>
                    <TableHead className="text-[#7a8ba6]">Tournament</TableHead>
                    <TableHead className="text-[#7a8ba6]">Age Group</TableHead>
                    <TableHead className="text-[#7a8ba6]">Video Type</TableHead>
                    <TableHead className="text-[#7a8ba6]">Received</TableHead>
                    <TableHead className="text-[#7a8ba6]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow
                      key={match.match_id}
                      className={`border-[#1a2742] hover:bg-[#1a2742]/50 ${
                        match.status === "rework" ? "bg-[#ef4444]/5" : ""
                      }`}
                    >
                      <TableCell className="font-mono text-sm text-[#22c55e]">
                        {match.match_id.length > 15 ? match.match_id.slice(0, 15) + "..." : match.match_id}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.tournament_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.match_age_group || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.match_video_type || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#7a8ba6]">
                        {match.manager?.match_received_on
                          ? new Date(match.manager.match_received_on).toLocaleDateString()
                          : new Date(match.created_at).toLocaleDateString()}
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
                            onClick={() => handleMarkForReview(match.match_id)}
                            className={`gap-2 text-white border-0 ${
                              match.status === "rework"
                                ? "bg-[#f59e0b] hover:bg-[#d97706]"
                                : "bg-[#3b82f6] hover:bg-[#2563eb]"
                            }`}
                          >
                            <CheckCircle className="h-4 w-4" />
                            {match.status === "rework" ? "Resubmit" : "Mark for Review"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Rework Instructions */}
          {matches.some((m) => m.status === "rework") && (
            <div className="mt-4 p-4 bg-[#ef4444]/10 border border-[#ef4444]/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#ef4444] mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-[#f87171]">Rework Required</h4>
                  <p className="text-sm text-[#7a8ba6] mt-1">
                    Some matches have been sent back by the reviewer. Please review the feedback and resubmit your analysis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      {selectedMatch && (
        <AnalystWorkflowDialog
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
