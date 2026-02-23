import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import { RefreshCw, Eye, Edit, Save, X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { MatchDetailsDialog } from "./MatchDetailsDialog";
import { MatchStatusLabels, getStatusStyle, CreatorType } from "../../lib/constants";

interface Match {
  match_id: string;
  status: string | number;
  created_at: string;
  updated_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
  creator_type?: string;
}

export function ManagerDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [editData, setEditData] = useState<{
    live_analysis_by?: string;
    first_half_by?: string;
    second_half_by?: string;
  }>({});

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

  const viewMatchDetails = (match: Match) => {
    setSelectedMatch(match);
    setDetailsOpen(true);
  };

  const startEditing = (match: Match) => {
    setEditingMatch(match.match_id);
    setEditData({
      live_analysis_by: match.analyst?.live_analysis_by || "",
      first_half_by: match.analyst?.first_half_analysed_by || "",
      second_half_by: match.analyst?.second_half_analysed_by || "",
    });
  };

  const cancelEditing = () => {
    setEditingMatch(null);
    setEditData({});
  };

  const saveEditing = async (matchId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${matchId}/analyst`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            live_analysis_by: editData.live_analysis_by,
            first_half_analysed_by: editData.first_half_by,
            second_half_analysed_by: editData.second_half_by,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Match updated successfully");
        setEditingMatch(null);
        setEditData({});
        fetchMatches();
      } else {
        toast.error("Failed to update match");
      }
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error("Failed to update match");
    }
  };

  const getStatusBadge = (status: string | number) => {
    const statusNum = typeof status === "string" ? parseInt(status) : status;
    const label = MatchStatusLabels[statusNum] || status;
    const style = getStatusStyle(statusNum);
    
    return (
      <Badge variant="outline" className={style}>
        {label.toUpperCase()}
      </Badge>
    );
  };

  const getCreatorTypeBadge = (creatorType?: string) => {
    if (!creatorType) return <span className="text-sm text-[#7a8ba6]">-</span>;
    
    const colorMap: Record<string, string> = {
      [CreatorType.CLIENT]: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30",
      [CreatorType.BUSINESS_TEAM]: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
      [CreatorType.MANAGER]: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
    };

    return (
      <Badge variant="outline" className={colorMap[creatorType] || "border-border text-[#7a8ba6]"}>
        {creatorType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#111b2e] border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Manager Dashboard - All Views</CardTitle>
          <Button
            onClick={fetchMatches}
            variant="outline"
            size="sm"
            className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#0d1526] border-border">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-white">{matches.length}</div>
                <p className="text-xs text-[#7a8ba6]">Total Matches</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-border">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#60a5fa]">
                  {matches.filter((m) => {
                    const status = typeof m.status === "string" ? parseInt(m.status) : m.status;
                    return status < 7;
                  }).length}
                </div>
                <p className="text-xs text-[#7a8ba6]">In Progress</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-border">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-[#4ade80]">
                  {matches.filter((m) => {
                    const status = typeof m.status === "string" ? parseInt(m.status) : m.status;
                    return status === 7;
                  }).length}
                </div>
                <p className="text-xs text-[#7a8ba6]">Completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="border border-border rounded-lg overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">No matches found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Match ID</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Created By</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Client</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Teams</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Tournament</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Live Analysis By</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">1st Half By</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">2nd Half By</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Reviewer</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => {
                    const isEditing = editingMatch === match.match_id;
                    
                    return (
                      <TableRow key={match.match_id} className="border-border hover:bg-[#1a2742]/50">
                        <TableCell className="font-mono text-xs text-[#22c55e] whitespace-nowrap">
                          {match.match_id.slice(0, 12)}...
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{getStatusBadge(match.status)}</TableCell>
                        <TableCell className="whitespace-nowrap">{getCreatorTypeBadge(match.creator_type)}</TableCell>
                        <TableCell className="text-[#c0cde0] text-sm whitespace-nowrap">
                          {match.manager?.organizer_name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                          {match.manager?.team_a} vs {match.manager?.team_b}
                        </TableCell>
                        <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                          {match.manager?.tournament_name || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {isEditing ? (
                            <Input
                              value={editData.live_analysis_by}
                              onChange={(e) =>
                                setEditData({ ...editData, live_analysis_by: e.target.value })
                              }
                              className="h-8 w-32 text-xs"
                              placeholder="Name (optional)"
                            />
                          ) : (
                            <span className="text-sm text-[#c0cde0]">
                              {match.analyst?.live_analysis_by || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {isEditing ? (
                            <Input
                              value={editData.first_half_by}
                              onChange={(e) =>
                                setEditData({ ...editData, first_half_by: e.target.value })
                              }
                              className="h-8 w-32 text-xs"
                              placeholder="Name"
                            />
                          ) : (
                            <span className="text-sm text-[#c0cde0]">
                              {match.analyst?.first_half_analysed_by || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {isEditing ? (
                            <Input
                              value={editData.second_half_by}
                              onChange={(e) =>
                                setEditData({ ...editData, second_half_by: e.target.value })
                              }
                              className="h-8 w-32 text-xs"
                              placeholder="Name"
                            />
                          ) : (
                            <span className="text-sm text-[#c0cde0]">
                              {match.analyst?.second_half_analysed_by || "-"}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                          {match.reviewer?.reviewed_by || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewMatchDetails(match)}
                              className="text-[#7a8ba6] hover:text-white hover:bg-[#1a2742] h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isEditing ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => saveEditing(match.match_id)}
                                  className="text-[#22c55e] hover:text-white hover:bg-[#22c55e]/20 h-8 w-8 p-0"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={cancelEditing}
                                  className="text-[#ef4444] hover:text-white hover:bg-[#ef4444]/20 h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(match)}
                                className="text-[#7a8ba6] hover:text-white hover:bg-[#1a2742] h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedMatch && (
        <MatchDetailsDialog
          match={selectedMatch}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
}
