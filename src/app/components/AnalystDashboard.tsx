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
import { CheckCircle, RefreshCw } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { AnalystWorkflowDialog } from "./AnalystWorkflowDialog";
import { formatTAT } from "../../lib/constants";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  manager: any;
  analyst: any;
}

export function AnalystDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const getStatusBadge = (status: string) => {
    if (status === "rework") {
      return <Badge variant="outline" className="bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30">REWORK REQUIRED</Badge>;
    }
    return <Badge variant="outline" className="bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30">READY FOR ANALYSIS</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#111b2e] border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Analyst Dashboard</CardTitle>
          <Button onClick={fetchMatches} variant="outline" size="sm" className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#0d1526] border-border">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#22c55e]">{matches.length}</div>
                <p className="text-xs text-[#7a8ba6]">
                  Available for Analysis
                </p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-border">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#ef4444]">
                  {matches.filter((m) => m.status === "rework").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">Rework Required</p>
              </CardContent>
            </Card>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">
                No matches available for analysis
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6]">Match ID</TableHead>
                    <TableHead className="text-[#7a8ba6]">Status</TableHead>
                    <TableHead className="text-[#7a8ba6]">Tournament</TableHead>
                    <TableHead className="text-[#7a8ba6]">Teams</TableHead>
                    <TableHead className="text-[#7a8ba6]">Score Line</TableHead>
                    <TableHead className="text-[#7a8ba6]">Analysis TAT</TableHead>
                    <TableHead className="text-[#7a8ba6]">Received</TableHead>
                    <TableHead className="text-[#7a8ba6]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.match_id} className="border-border hover:bg-[#1a2742]/50">
                      <TableCell className="font-mono text-sm text-[#22c55e]">
                        {match.match_id.slice(0, 12)}...
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.tournament_name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0]">
                        {match.manager?.score_line || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border text-[#7a8ba6] font-mono">
                          {formatTAT(match.analyst?.analysis_tat)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#7a8ba6]">
                        {new Date(match.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleMarkForReview(match.match_id)}
                          className="gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark for Review
                        </Button>
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
        <AnalystWorkflowDialog
          matchId={selectedMatch}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={fetchMatches}
        />
      )}
    </div>
  );
}
