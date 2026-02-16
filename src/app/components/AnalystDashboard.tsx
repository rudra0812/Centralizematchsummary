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
      return <Badge variant="destructive">REWORK REQUIRED</Badge>;
    }
    return <Badge variant="secondary">READY FOR ANALYSIS</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Analyst Dashboard</CardTitle>
          <Button onClick={fetchMatches} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{matches.length}</div>
                <p className="text-xs text-muted-foreground">
                  Available for Analysis
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {matches.filter((m) => m.status === "rework").length}
                </div>
                <p className="text-xs text-muted-foreground">Rework Required</p>
              </CardContent>
            </Card>
          </div>

          <div className="border rounded-lg">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No matches available for analysis
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Tournament</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.match_id}>
                      <TableCell className="font-mono text-sm">
                        {match.match_id}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
                      <TableCell>{match.manager?.organizer_name}</TableCell>
                      <TableCell className="text-sm">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm">
                        {match.manager?.tournament_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(match.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleMarkForReview(match.match_id)}
                          className="gap-2"
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
