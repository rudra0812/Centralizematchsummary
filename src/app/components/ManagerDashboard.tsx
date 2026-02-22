import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Eye,
  Search,
  ClipboardList,
  LayoutDashboard,
  Download,
  Users,
  Database,
  X,
} from "lucide-react";
import { edgeFnBase } from "../../lib/supabase";
import { publicAnonKey, projectId } from "/utils/supabase/info";
import { MatchDetailsDialog } from "./MatchDetailsDialog";

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

interface BusinessRequest {
  id: string;
  request_id: string;
  prospect_name: string;
  num_matches: number;
  country: string;
  source: string;
  poc: string;
  video_links: string[];
  lineup_info: string;
  notes: string;
  status: string;
  created_at: string;
  users?: { name: string; email: string };
}

interface AnalystUser {
  id: string;
  name: string;
  email: string;
}

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Manager Dashboard
        </h1>
        <p className="text-sm text-[#7a8ba6] mt-1">
          Create matches, view business requests, and assign analysts
        </p>
      </div>

      <Tabs defaultValue="matches">
        <TabsList className="bg-[#111b2e] border border-[#1e293b] rounded-xl p-1 h-auto">
          <TabsTrigger
            value="matches"
            className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white text-[#7a8ba6] rounded-lg py-2 px-4 text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" />
            All Matches
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white text-[#7a8ba6] rounded-lg py-2 px-4 text-sm font-medium"
          >
            <ClipboardList className="h-4 w-4" />
            Business Requests
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white text-[#7a8ba6] rounded-lg py-2 px-4 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Create Match
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches">
          <ManagerMatchesPanel />
        </TabsContent>
        <TabsContent value="requests">
          <BusinessRequestsPanel />
        </TabsContent>
        <TabsContent value="create">
          <CreateMatchPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================
// MANAGER MATCHES PANEL
// ============================
function ManagerMatchesPanel() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches?${params}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await res.json();
      if (data.success) {
        let filtered = data.matches;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (m: Match) =>
              m.match_id.toLowerCase().includes(s) ||
              m.manager?.organizer_name?.toLowerCase().includes(s) ||
              m.manager?.team_a?.toLowerCase().includes(s) ||
              m.manager?.team_b?.toLowerCase().includes(s)
          );
        }
        setMatches(filtered);
      }
    } catch {
      toast.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [filters.status]);

  const handleExport = async () => {
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/export/csv`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `matches-export-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Export downloaded!");
      }
    } catch {
      toast.error("Export failed");
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
        className={styles[status] || "border-[#1e293b] text-[#7a8ba6]"}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="bg-[#111b2e] border-[#1e293b]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">All Matches</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={fetchMatches}
              variant="outline"
              size="sm"
              className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              size="sm"
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
            <Input
              placeholder="Search matches..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="pl-9 bg-[#0b1120] border-[#1e293b] text-[#e8edf4] placeholder:text-[#4a5a76] h-9 text-sm"
            />
          </div>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, status: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="bg-[#0b1120] border-[#1e293b] text-[#c0cde0] h-9 text-sm">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#111b2e] border-[#1e293b]">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rework">Rework</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: matches.length, color: "text-white" },
            {
              label: "Created",
              value: matches.filter((m) => m.status === "created").length,
              color: "text-[#60a5fa]",
            },
            {
              label: "In Review",
              value: matches.filter((m) => m.status === "in_review").length,
              color: "text-[#fbbf24]",
            },
            {
              label: "Completed",
              value: matches.filter((m) => m.status === "completed").length,
              color: "text-[#4ade80]",
            },
          ].map((stat) => (
            <Card key={stat.label} className="bg-[#0d1526] border-[#1e293b]">
              <CardContent className="py-3 px-4">
                <div className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-[#7a8ba6]">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <div className="border border-[#1e293b] rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-[#7a8ba6]">Loading...</div>
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-[#7a8ba6]">
              No matches found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e293b] bg-[#0d1526] hover:bg-[#0d1526]">
                  <TableHead className="text-[#7a8ba6] text-xs whitespace-nowrap">
                    Match ID
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Client
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Teams
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Type
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Analyst
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow
                    key={match.match_id}
                    className="border-[#1e293b] hover:bg-[#1a2742]/50"
                  >
                    <TableCell className="font-mono text-xs text-[#22c55e] whitespace-nowrap">
                      {match.match_id.length > 18
                        ? match.match_id.slice(0, 18) + "..."
                        : match.match_id}
                    </TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {match.manager?.organizer_name || "-"}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm whitespace-nowrap">
                      {match.manager?.team_a} vs {match.manager?.team_b}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-[#1e293b] text-[#7a8ba6] text-xs"
                      >
                        {match.manager?.client_type || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {match.analyst?.first_half_analysed_by ||
                        match.analyst?.analysts
                          ?.map((a: any) => a.name)
                          .join(", ") ||
                        "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedMatch(match);
                          setDetailsOpen(true);
                        }}
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

      {selectedMatch && (
        <MatchDetailsDialog
          match={selectedMatch}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </Card>
  );
}

// ============================
// BUSINESS REQUESTS PANEL
// ============================
function BusinessRequestsPanel() {
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${edgeFnBase}/business-requests`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch {
      toast.error("Failed to fetch business requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
      in_progress: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30",
      completed: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
    };
    return (
      <Badge
        variant="outline"
        className={styles[status] || "border-[#1e293b] text-[#7a8ba6]"}
      >
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="bg-[#111b2e] border-[#1e293b]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Business Requests
          </CardTitle>
          <Button
            onClick={fetchRequests}
            variant="outline"
            size="sm"
            className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border border-[#1e293b] rounded-lg overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-[#7a8ba6]">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-[#7a8ba6]">
              No business requests yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e293b] bg-[#0d1526] hover:bg-[#0d1526]">
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Request ID
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Submitted By
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Prospect
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Matches
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Country
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Created
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow
                    key={req.id}
                    className="border-[#1e293b] hover:bg-[#1a2742]/50"
                  >
                    <TableCell className="font-mono text-xs text-[#22c55e]">
                      {req.request_id}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {req.users?.name || "-"}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {req.prospect_name}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {req.num_matches}
                    </TableCell>
                    <TableCell className="text-[#7a8ba6] text-sm">
                      {req.country || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell className="text-[#7a8ba6] text-xs">
                      {new Date(req.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================
// CREATE MATCH PANEL
// ============================
function CreateMatchPanel() {
  const [loading, setLoading] = useState(false);
  const [analysts, setAnalysts] = useState<AnalystUser[]>([]);
  const [formData, setFormData] = useState({
    organizer_name: "",
    client_type: "",
    match_analysis_type: "",
    team_a: "",
    team_b: "",
    game_time: "",
    match_country: "",
    tournament_name: "",
    match_video_type: "",
    match_age_group: "",
    match_received_on: new Date().toISOString().split("T")[0],
    assigned_analyst_id: "",
    lineup_url: "",
    video_url: "",
  });

  // Fetch available analysts
  useEffect(() => {
    const fetchAnalysts = async () => {
      try {
        const res = await fetch(`${edgeFnBase}/users/by-role/analyst`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        const data = await res.json();
        if (data.success) {
          setAnalysts(data.users || []);
        }
      } catch {
        // silently fail
      }
    };
    fetchAnalysts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.organizer_name.trim()) {
        toast.error("Client name is required");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            venue: formData.match_country,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(`Match created: ${data.match.match_id}`);
        setFormData({
          organizer_name: "",
          client_type: "",
          match_analysis_type: "",
          team_a: "",
          team_b: "",
          game_time: "",
          match_country: "",
          tournament_name: "",
          match_video_type: "",
          match_age_group: "",
          match_received_on: new Date().toISOString().split("T")[0],
          assigned_analyst_id: "",
          lineup_url: "",
          video_url: "",
        });
      } else {
        toast.error("Failed to create match: " + data.error);
      }
    } catch {
      toast.error("Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-10 rounded-md border border-[#1e293b] bg-[#0b1120] px-3 py-2 text-sm text-[#c8d6e5] placeholder-[#4a5a76] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors";
  const selectClass =
    "w-full h-10 rounded-md border border-[#1e293b] bg-[#0b1120] px-3 py-2 text-sm text-[#c8d6e5] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] appearance-none cursor-pointer transition-colors";
  const labelClass = "block text-sm font-medium text-[#94a3b8] mb-1.5";

  return (
    <Card className="bg-[#111b2e] border-[#1e293b]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Match Details */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5a6f84] mb-3">
              Match Details
            </h3>
            <div className="h-px bg-[#1e293b] mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelClass}>Client Name *</label>
                <input
                  className={inputClass}
                  value={formData.organizer_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organizer_name: e.target.value,
                    })
                  }
                  placeholder="Enter client name"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Client Type *</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={formData.client_type}
                    onChange={(e) =>
                      setFormData({ ...formData, client_type: e.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="Demo">Demo</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <label className={labelClass}>Match Analysis Type *</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={formData.match_analysis_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        match_analysis_type: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select analysis type
                    </option>
                    <option value="Basic">Basic</option>
                    <option value="B2C">B2C</option>
                    <option value="Live">Live</option>
                    <option value="Pro">Pro</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <label className={labelClass}>Match Age Group *</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={formData.match_age_group}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        match_age_group: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select age group
                    </option>
                    {[
                      "U12",
                      "U13",
                      "U14",
                      "U15",
                      "U16",
                      "U17",
                      "U18",
                      "U19",
                      "U21",
                      "Pro",
                    ].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <label className={labelClass}>Team A *</label>
                <input
                  className={inputClass}
                  value={formData.team_a}
                  onChange={(e) =>
                    setFormData({ ...formData, team_a: e.target.value })
                  }
                  placeholder="Enter Team A"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Team B *</label>
                <input
                  className={inputClass}
                  value={formData.team_b}
                  onChange={(e) =>
                    setFormData({ ...formData, team_b: e.target.value })
                  }
                  placeholder="Enter Team B"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Game Time (mins) *</label>
                <input
                  className={inputClass}
                  type="number"
                  step="1"
                  min="1"
                  value={formData.game_time}
                  onChange={(e) =>
                    setFormData({ ...formData, game_time: e.target.value })
                  }
                  placeholder="e.g., 90"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Match Country *</label>
                <input
                  className={inputClass}
                  value={formData.match_country}
                  onChange={(e) =>
                    setFormData({ ...formData, match_country: e.target.value })
                  }
                  placeholder="Enter country"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Tournament Name *</label>
                <input
                  className={inputClass}
                  value={formData.tournament_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tournament_name: e.target.value,
                    })
                  }
                  placeholder="Enter tournament name"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Match Video Type *</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={formData.match_video_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        match_video_type: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="" disabled>
                      Select video type
                    </option>
                    <option value="Veo">Veo</option>
                    <option value="Pixelot">Pixelot</option>
                    <option value="Hudl">Hudl</option>
                    <option value="Broadcasting">Broadcasting</option>
                    <option value="Other">Other</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <label className={labelClass}>Match Received On *</label>
                <input
                  className={`${inputClass} [color-scheme:dark]`}
                  type="date"
                  value={formData.match_received_on}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      match_received_on: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Assignment & Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5a6f84] mb-3">
              Assignment & Links
            </h3>
            <div className="h-px bg-[#1e293b] mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <label className={labelClass}>Assign Analyst</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={formData.assigned_analyst_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_analyst_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Unassigned</option>
                    {analysts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <label className={labelClass}>Lineup URL</label>
                <input
                  className={inputClass}
                  value={formData.lineup_url}
                  onChange={(e) =>
                    setFormData({ ...formData, lineup_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Video URL</label>
                <input
                  className={inputClass}
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating..." : "Create Match"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
