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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviewer Dashboard</CardTitle>
          <Button onClick={fetchMatches} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">
                Matches Awaiting Review
              </p>
            </CardContent>
          </Card>

          <div className="border rounded-lg">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No matches available for review
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Teams</TableHead>
                    <TableHead>Analysts</TableHead>
                    <TableHead>Analysis TAT</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.match_id}>
                      <TableCell className="font-mono text-sm">
                        {match.match_id}
                      </TableCell>
                      <TableCell>{match.manager?.organizer_name}</TableCell>
                      <TableCell className="text-sm">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm">
                        {match.analyst?.analysts
                          ?.map((a: any) => a.name)
                          .join(", ")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {match.analyst?.analysis_tat} hrs
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
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
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteReview(match.match_id)}
                            className="gap-2"
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
