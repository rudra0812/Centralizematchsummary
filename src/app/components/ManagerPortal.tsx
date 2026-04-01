import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { Download, Search, RefreshCw, Eye, Plus, Calendar } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { MatchDetailsDialog } from "./MatchDetailsDialog";
import { CreateMatchForm } from "./CreateMatchForm";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

interface ManagerPortalProps {
  userName: string;
  onRefresh?: () => void;
}

export function ManagerPortal({ userName, onRefresh }: ManagerPortalProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    client_type: "",
    search: "",
    date_from: "",
    date_to: "",
  });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.client_type) params.append("client_type", filters.client_type);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches?${params}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        let filteredMatches = data.matches;

        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredMatches = filteredMatches.filter(
            (match: Match) =>
              match.match_id.toLowerCase().includes(searchLower) ||
              match.manager?.organizer_name?.toLowerCase().includes(searchLower) ||
              match.manager?.team_a?.toLowerCase().includes(searchLower) ||
              match.manager?.team_b?.toLowerCase().includes(searchLower)
          );
        }

        // Apply date range filter
        if (filters.date_from) {
          filteredMatches = filteredMatches.filter(
            (match: Match) =>
              new Date(match.manager?.match_received_on || match.created_at) >=
              new Date(filters.date_from)
          );
        }
        if (filters.date_to) {
          filteredMatches = filteredMatches.filter(
            (match: Match) =>
              new Date(match.manager?.match_received_on || match.created_at) <=
              new Date(filters.date_to)
          );
        }

        setMatches(filteredMatches);
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
  }, [filters.status, filters.client_type]);

  const handleMatchCreated = () => {
    fetchMatches();
    onRefresh?.();
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/export/csv`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `matches-export-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Export downloaded successfully!");
      } else {
        toast.error("Failed to export matches");
      }
    } catch (error) {
      console.error("Error exporting matches:", error);
      toast.error("Failed to export matches");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      created: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30",
      in_review: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
      completed: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
      rework: "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30",
    };
    return (
      <Badge
        variant="outline"
        className={styles[status] || "border-border text-[#7a8ba6]"}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const viewMatchDetails = (match: Match) => {
    setSelectedMatch(match);
    setDetailsOpen(true);
  };

  // Calculate Total TAT
  const calculateTotalTAT = (match: Match) => {
    const analysisTAT = parseFloat(match.analyst?.analysis_tat) || 0;
    const reviewTAT = parseFloat(match.reviewer?.review_tat) || 0;
    return analysisTAT + reviewTAT;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
          <p className="text-[#7a8ba6] text-sm">Welcome, {userName} - View and manage all matches</p>
        </div>
        <CreateMatchForm onMatchCreated={handleMatchCreated} />
      </div>

      <Card className="bg-[#111b2e] border-[#1a2742]">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg">Match Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-[#c0cde0] text-xs">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
                <Input
                  id="search"
                  placeholder="Match ID, Teams, Client..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-9 bg-[#0b1120] border-[#2a3a4e] text-[#e8edf4] placeholder:text-[#4a5a76] h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-[#c0cde0] text-xs">
                Status
              </Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === "all" ? "" : value })
                }
              >
                <SelectTrigger className="bg-[#0b1120] border-[#2a3a4e] text-[#c0cde0] h-9 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#111b2e] border-[#2a3a4e]">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="created">Created</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rework">Rework</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_type" className="text-[#c0cde0] text-xs">
                Client Type
              </Label>
              <Select
                value={filters.client_type || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    client_type: value === "all" ? "" : value,
                  })
                }
              >
                <SelectTrigger className="bg-[#0b1120] border-[#2a3a4e] text-[#c0cde0] h-9 text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent className="bg-[#111b2e] border-[#2a3a4e]">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_from" className="text-[#c0cde0] text-xs">
                Date From
              </Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
                className="bg-[#0b1120] border-[#2a3a4e] text-[#c0cde0] h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_to" className="text-[#c0cde0] text-xs">
                Date To
              </Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
                className="bg-[#0b1120] border-[#2a3a4e] text-[#c0cde0] h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#c0cde0] text-xs invisible">Actions</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setFilters({
                      status: "",
                      client_type: "",
                      search: "",
                      date_from: "",
                      date_to: "",
                    });
                  }}
                  variant="outline"
                  size="icon"
                  className="border-[#2a3a4e] text-[#7a8ba6] hover:bg-[#1a2742] hover:text-white bg-transparent h-9 w-9 shrink-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  onClick={fetchMatches}
                  variant="outline"
                  size="icon"
                  className="border-[#2a3a4e] text-[#7a8ba6] hover:bg-[#1a2742] hover:text-white bg-transparent h-9 w-9 shrink-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleExport}
                  className="flex-1 gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white border-0 h-9 text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="bg-[#0d1526] border-[#1a2742]">
              <CardContent className="py-4 px-4">
                <div className="text-2xl font-bold text-white">{matches.length}</div>
                <p className="text-xs text-[#7a8ba6]">Total Matches</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-[#1a2742]">
              <CardContent className="py-4 px-4">
                <div className="text-2xl font-bold text-[#60a5fa]">
                  {matches.filter((m) => m.status === "created").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">Created</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-[#1a2742]">
              <CardContent className="py-4 px-4">
                <div className="text-2xl font-bold text-[#fbbf24]">
                  {matches.filter((m) => m.status === "in_review").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">In Review</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-[#1a2742]">
              <CardContent className="py-4 px-4">
                <div className="text-2xl font-bold text-[#4ade80]">
                  {matches.filter((m) => m.status === "completed").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0d1526] border-[#1a2742]">
              <CardContent className="py-4 px-4">
                <div className="text-2xl font-bold text-[#f87171]">
                  {matches.filter((m) => m.status === "rework").length}
                </div>
                <p className="text-xs text-[#7a8ba6]">Rework</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <div className="border border-[#1a2742] rounded-lg overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">No matches found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1a2742] bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Match ID</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Status</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Client Name</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Client Type</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Analysis Type</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Teams</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Age Group</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">City</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">1st Half By</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">2nd Half By</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Reviewer</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Analysis TAT</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Review TAT</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Total TAT</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">QC Errors</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matches.map((match) => (
                    <TableRow key={match.match_id} className="border-[#1a2742] hover:bg-[#1a2742]/50">
                      <TableCell className="font-mono text-xs text-[#22c55e] whitespace-nowrap">
                        {match.match_id.length > 15 ? match.match_id.slice(0, 15) + "..." : match.match_id}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{getStatusBadge(match.status)}</TableCell>
                      <TableCell className="text-[#c0cde0] text-sm whitespace-nowrap">
                        {match.manager?.organizer_name || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline" className="border-[#2a3a4e] text-[#7a8ba6] text-xs">
                          {match.manager?.client_type || "-"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.manager?.match_analysis_type || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.manager?.team_a} vs {match.manager?.team_b}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.manager?.match_age_group || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.manager?.venue || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.analyst?.first_half_analysed_by ||
                          match.analyst?.analysts?.map((a: any) => a.name).join(", ") ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.analyst?.second_half_analysed_by || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.reviewer?.reviewed_by || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.analyst?.analysis_tat ? `${match.analyst.analysis_tat} mins` : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-[#c0cde0] whitespace-nowrap">
                        {match.reviewer?.review_tat ? `${match.reviewer.review_tat} mins` : "-"}
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">
                        <span className="text-[#22c55e]">
                          {calculateTotalTAT(match) > 0 ? `${calculateTotalTAT(match)} mins` : "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {match.reviewer?.qc_error_count !== undefined ? (
                          <Badge
                            variant="outline"
                            className={
                              parseInt(match.reviewer.qc_error_count) > 0
                                ? "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30"
                                : "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30"
                            }
                          >
                            {match.reviewer.qc_error_count}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewMatchDetails(match)}
                          className="text-[#7a8ba6] hover:text-white hover:bg-[#1a2742] h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
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
        <MatchDetailsDialog
          match={selectedMatch}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
}
