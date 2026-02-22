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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import {
  Users,
  LayoutDashboard,
  Search,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Shield,
  Briefcase,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import { edgeFnBase } from "../../lib/supabase";
import { publicAnonKey, projectId } from "/utils/supabase/info";
import { MatchDetailsDialog } from "./MatchDetailsDialog";

interface AppUser {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Match {
  match_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  manager: any;
  analyst: any;
  reviewer: any;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#7a8ba6] mt-1">
          Manage users, view all matches, and monitor system activity
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#111b2e] border border-[#1e293b] rounded-xl p-1 h-auto">
          <TabsTrigger
            value="users"
            className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white text-[#7a8ba6] rounded-lg py-2 px-4 text-sm font-medium"
          >
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white text-[#7a8ba6] rounded-lg py-2 px-4 text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" />
            All Matches
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="gap-2 data-[state=active]:bg-[#22c55e] data-[state=active]:text-white text-[#7a8ba6] rounded-lg py-2 px-4 text-sm font-medium"
          >
            <BarChart3 className="h-4 w-4" />
            Summary Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>
        <TabsContent value="matches">
          <MatchesOverviewPanel />
        </TabsContent>
        <TabsContent value="stats">
          <SummaryStatsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ======================
// USER MANAGEMENT PANEL
// ======================
function UserManagementPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${edgeFnBase}/admin/users`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (
    userId: string,
    updates: { status?: string; role?: string }
  ) => {
    try {
      const res = await fetch(`${edgeFnBase}/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User updated successfully");
        fetchUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const pendingCount = users.filter((u) => u.status === "pending").length;

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending:
        "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
      approved:
        "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
      disabled:
        "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30",
    };
    return (
      <Badge variant="outline" className={styles[status] || "border-border text-[#7a8ba6]"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30",
      business: "bg-[#8b5cf6]/15 text-[#a78bfa] border-[#8b5cf6]/30",
      manager: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
      analyst: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30",
      reviewer: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
    };
    return (
      <Badge variant="outline" className={styles[role] || "border-border text-[#7a8ba6]"}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card className="bg-[#111b2e] border-[#1e293b]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            {pendingCount > 0 && (
              <p className="text-sm text-[#fbbf24] mt-1">
                {pendingCount} user(s) pending approval
              </p>
            )}
          </div>
          <Button
            onClick={fetchUsers}
            variant="outline"
            size="sm"
            className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-[#0b1120] border-[#1e293b] text-[#e8edf4] placeholder:text-[#4a5a76] h-9 text-sm"
            />
          </div>
          <Select
            value={roleFilter || "all"}
            onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="bg-[#0b1120] border-[#1e293b] text-[#c0cde0] h-9 text-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-[#111b2e] border-[#1e293b]">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="bg-[#0b1120] border-[#1e293b] text-[#c0cde0] h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#111b2e] border-[#1e293b]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: users.length, color: "text-white" },
            {
              label: "Pending",
              value: users.filter((u) => u.status === "pending").length,
              color: "text-[#fbbf24]",
            },
            {
              label: "Approved",
              value: users.filter((u) => u.status === "approved").length,
              color: "text-[#4ade80]",
            },
            {
              label: "Disabled",
              value: users.filter((u) => u.status === "disabled").length,
              color: "text-[#f87171]",
            },
            {
              label: "Admins",
              value: users.filter((u) => u.role === "admin").length,
              color: "text-[#f87171]",
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
            <div className="p-8 text-center text-[#7a8ba6]">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-[#7a8ba6]">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#1e293b] bg-[#0d1526] hover:bg-[#0d1526]">
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Name
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Email
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Role
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Status
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Joined
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-[#1e293b] hover:bg-[#1a2742]/50"
                  >
                    <TableCell className="text-[#c0cde0] text-sm font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-[#7a8ba6] text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-[#7a8ba6] text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {user.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[#4ade80] hover:text-[#22c55e] hover:bg-[#22c55e]/10"
                              onClick={() =>
                                updateUser(user.id, { status: "approved" })
                              }
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[#f87171] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                              onClick={() =>
                                updateUser(user.id, { status: "disabled" })
                              }
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[#f87171] hover:text-[#ef4444] hover:bg-[#ef4444]/10"
                            onClick={() =>
                              updateUser(user.id, { status: "disabled" })
                            }
                            title="Disable"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                        {user.status === "disabled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[#4ade80] hover:text-[#22c55e] hover:bg-[#22c55e]/10"
                            onClick={() =>
                              updateUser(user.id, { status: "approved" })
                            }
                            title="Re-enable"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Role change dropdown */}
                        <Select
                          value={user.role}
                          onValueChange={(newRole) =>
                            updateUser(user.id, { role: newRole })
                          }
                        >
                          <SelectTrigger className="h-7 w-24 bg-transparent border-[#1e293b] text-[#7a8ba6] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111b2e] border-[#1e293b]">
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="analyst">Analyst</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                          </SelectContent>
                        </Select>
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
  );
}

// ========================
// MATCHES OVERVIEW PANEL
// ========================
function MatchesOverviewPanel() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    client_type: "",
    search: "",
  });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.client_type)
        params.append("client_type", filters.client_type);

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
  }, [filters.status, filters.client_type]);

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
          <CardTitle className="text-white flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            All Matches (Read-Only)
          </CardTitle>
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
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7a8ba6]" />
            <Input
              placeholder="Search..."
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
          <Select
            value={filters.client_type || "all"}
            onValueChange={(v) =>
              setFilters({ ...filters, client_type: v === "all" ? "" : v })
            }
          >
            <SelectTrigger className="bg-[#0b1120] border-[#1e293b] text-[#c0cde0] h-9 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-[#111b2e] border-[#1e293b]">
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Demo">Demo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats row */}
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
                    Analyst
                  </TableHead>
                  <TableHead className="text-[#7a8ba6] text-xs">
                    Reviewer
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
                      {match.match_id.length > 20
                        ? match.match_id.slice(0, 20) + "..."
                        : match.match_id}
                    </TableCell>
                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {match.manager?.organizer_name || "-"}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm whitespace-nowrap">
                      {match.manager?.team_a} vs {match.manager?.team_b}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {match.analyst?.first_half_analysed_by ||
                        match.analyst?.analysts
                          ?.map((a: any) => a.name)
                          .join(", ") ||
                        "-"}
                    </TableCell>
                    <TableCell className="text-[#c0cde0] text-sm">
                      {match.reviewer?.reviewed_by || "-"}
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

// ========================
// SUMMARY STATS PANEL
// ========================
function SummaryStatsPanel() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, matchesRes] = await Promise.all([
          fetch(`${edgeFnBase}/admin/users`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }),
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
            { headers: { Authorization: `Bearer ${publicAnonKey}` } }
          ),
        ]);
        const [usersData, matchesData] = await Promise.all([
          usersRes.json(),
          matchesRes.json(),
        ]);
        if (usersData.success) setUsers(usersData.users || []);
        if (matchesData.success) setMatches(matchesData.matches || []);
      } catch {
        toast.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center text-[#7a8ba6]">Loading stats...</div>
    );
  }

  const byRole = (role: string) => users.filter((u) => u.role === role).length;
  const byStatus = (status: string) =>
    matches.filter((m) => m.status === status).length;

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <Card className="bg-[#111b2e] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Users className="h-5 w-5" /> User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Users", value: users.length, color: "text-white" },
              {
                label: "Pending",
                value: users.filter((u) => u.status === "pending").length,
                color: "text-[#fbbf24]",
              },
              { label: "Admins", value: byRole("admin"), color: "text-[#f87171]" },
              { label: "Business", value: byRole("business"), color: "text-[#a78bfa]" },
              { label: "Managers", value: byRole("manager"), color: "text-[#4ade80]" },
              {
                label: "Analysts",
                value: byRole("analyst"),
                color: "text-[#60a5fa]",
              },
            ].map((s) => (
              <div key={s.label} className="bg-[#0d1526] border border-[#1e293b] rounded-lg p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <p className="text-xs text-[#7a8ba6]">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Stats */}
      <Card className="bg-[#111b2e] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> Match Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Total Matches", value: matches.length, color: "text-white" },
              { label: "Created", value: byStatus("created"), color: "text-[#60a5fa]" },
              { label: "In Review", value: byStatus("in_review"), color: "text-[#fbbf24]" },
              { label: "Completed", value: byStatus("completed"), color: "text-[#4ade80]" },
              { label: "Rework", value: byStatus("rework"), color: "text-[#f87171]" },
            ].map((s) => (
              <div key={s.label} className="bg-[#0d1526] border border-[#1e293b] rounded-lg p-4">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <p className="text-xs text-[#7a8ba6]">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
