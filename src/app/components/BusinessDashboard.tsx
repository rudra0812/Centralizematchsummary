import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
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
import {
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  X,
  Trash2,
  ExternalLink,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { edgeFnBase } from "../../lib/supabase";
import { publicAnonKey, projectId } from "/utils/supabase/info";

interface BusinessRequest {
  id: string;
  request_id: string;
  created_by: string;
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
  updated_at: string;
}

export function BusinessDashboard() {
  const { appUser } = useAuth();
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<BusinessRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<BusinessRequest | null>(null);

  const fetchRequests = async () => {
    if (!appUser) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${edgeFnBase}/business-requests?created_by=${appUser.id}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } }
      );
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [appUser]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30",
      in_progress: "bg-[#3b82f6]/15 text-[#60a5fa] border-[#3b82f6]/30",
      completed: "bg-[#22c55e]/15 text-[#4ade80] border-[#22c55e]/30",
    };
    return (
      <Badge variant="outline" className={styles[status] || "border-[#1e293b] text-[#7a8ba6]"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Business Dashboard
          </h1>
          <p className="text-sm text-[#7a8ba6] mt-1">
            Submit match requests and track their progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchRequests}
            variant="outline"
            size="sm"
            className="border-[#2a3f5f] text-[#c0cde0] hover:bg-[#1a2742] hover:text-white bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setEditingRequest(null);
              setShowForm(true);
            }}
            size="sm"
            className="bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: requests.length, color: "text-white" },
          {
            label: "Pending",
            value: requests.filter((r) => r.status === "pending").length,
            color: "text-[#fbbf24]",
          },
          {
            label: "In Progress",
            value: requests.filter((r) => r.status === "in_progress").length,
            color: "text-[#60a5fa]",
          },
          {
            label: "Completed",
            value: requests.filter((r) => r.status === "completed").length,
            color: "text-[#4ade80]",
          },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#111b2e] border-[#1e293b]">
            <CardContent className="py-4 px-4">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-[#7a8ba6]">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Requests table */}
      <Card className="bg-[#111b2e] border-[#1e293b]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            My Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-[#1e293b] rounded-lg overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-[#7a8ba6]">Loading...</div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-[#7a8ba6]">
                No requests yet. Click "New Request" to submit one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-[#1e293b] bg-[#0d1526] hover:bg-[#0d1526]">
                    <TableHead className="text-[#7a8ba6] text-xs">Request ID</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs">Prospect</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs">Matches</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs">Country</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs">Status</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs">Created</TableHead>
                    <TableHead className="text-[#7a8ba6] text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id} className="border-[#1e293b] hover:bg-[#1a2742]/50">
                      <TableCell className="font-mono text-xs text-[#22c55e]">
                        {req.request_id}
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
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-[#7a8ba6] hover:text-white hover:bg-[#1a2742]"
                            onClick={() => setSelectedRequest(req)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-[#60a5fa] hover:text-[#3b82f6] hover:bg-[#3b82f6]/10"
                            onClick={() => {
                              setEditingRequest(req);
                              setShowForm(true);
                            }}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
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

      {/* Request Form Modal */}
      {showForm && (
        <BusinessRequestForm
          existingRequest={editingRequest}
          onClose={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingRequest(null);
            fetchRequests();
          }}
        />
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

// ============================
// BUSINESS REQUEST FORM
// ============================
function BusinessRequestForm({
  existingRequest,
  onClose,
  onSuccess,
}: {
  existingRequest: BusinessRequest | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prospect_name: existingRequest?.prospect_name || "",
    num_matches: existingRequest?.num_matches || 1,
    country: existingRequest?.country || "",
    source: existingRequest?.source || "",
    poc: existingRequest?.poc || "",
    video_links: existingRequest?.video_links || [""],
    lineup_info: existingRequest?.lineup_info || "",
    notes: existingRequest?.notes || "",
  });

  const addVideoLink = () => {
    setFormData({ ...formData, video_links: [...formData.video_links, ""] });
  };

  const removeVideoLink = (index: number) => {
    const links = formData.video_links.filter((_, i) => i !== index);
    setFormData({ ...formData, video_links: links.length ? links : [""] });
  };

  const updateVideoLink = (index: number, value: string) => {
    const links = [...formData.video_links];
    links[index] = value;
    setFormData({ ...formData, video_links: links });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser) return;

    if (!formData.prospect_name.trim()) {
      toast.error("Prospect name is required");
      return;
    }

    setLoading(true);
    try {
      const videoLinks = formData.video_links.filter((l) => l.trim());
      const body = {
        ...formData,
        video_links: videoLinks,
        created_by: appUser.id,
      };

      if (existingRequest) {
        // Update existing
        const res = await fetch(
          `${edgeFnBase}/business-requests/${existingRequest.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(body),
          }
        );
        const data = await res.json();
        if (data.success) {
          toast.success("Request updated successfully");
          onSuccess();
        } else {
          toast.error("Failed to update request");
        }
      } else {
        // Create new
        const res = await fetch(`${edgeFnBase}/business-requests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Request created: ${data.request.request_id}`);
          onSuccess();
        } else {
          toast.error("Failed to create request");
        }
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-10 rounded-md border border-[#1e293b] bg-[#0b1120] px-3 py-2 text-sm text-[#c8d6e5] placeholder-[#4a5a76] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors";
  const labelClass = "block text-sm font-medium text-[#94a3b8] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#111827] border border-[#1e293b] shadow-2xl mx-4">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-white">
            {existingRequest ? "Edit Request" : "New Match Request"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#5a6f84] hover:text-[#c8d6e5] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {existingRequest && (
          <div className="px-6 pb-2">
            <p className="text-xs text-[#64748b]">
              Request ID:{" "}
              <span className="font-mono text-[#22c55e]">
                {existingRequest.request_id}
              </span>{" "}
              (immutable)
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prospect Name *</label>
              <input
                className={inputClass}
                value={formData.prospect_name}
                onChange={(e) =>
                  setFormData({ ...formData, prospect_name: e.target.value })
                }
                placeholder="Company or team name"
                required
              />
            </div>
            <div>
              <label className={labelClass}>No. of Matches *</label>
              <input
                className={inputClass}
                type="number"
                min={1}
                value={formData.num_matches}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    num_matches: parseInt(e.target.value) || 1,
                  })
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input
                className={inputClass}
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="e.g., England"
              />
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <input
                className={inputClass}
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="e.g., Referral, Website"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Point of Contact (POC)</label>
              <input
                className={inputClass}
                value={formData.poc}
                onChange={(e) =>
                  setFormData({ ...formData, poc: e.target.value })
                }
                placeholder="Name or email of POC"
              />
            </div>
          </div>

          {/* Video Links */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#94a3b8]">
                Video Links
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-[#60a5fa] hover:text-[#3b82f6] hover:bg-[#3b82f6]/10"
                onClick={addVideoLink}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Link
              </Button>
            </div>
            <div className="space-y-2">
              {formData.video_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={link}
                    onChange={(e) => updateVideoLink(index, e.target.value)}
                    placeholder="https://..."
                  />
                  {formData.video_links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-[#f87171] hover:text-[#ef4444] hover:bg-[#ef4444]/10 shrink-0"
                      onClick={() => removeVideoLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Lineup Info */}
          <div>
            <label className={labelClass}>Lineup Information</label>
            <Textarea
              value={formData.lineup_info}
              onChange={(e) =>
                setFormData({ ...formData, lineup_info: e.target.value })
              }
              placeholder="Any lineup or team formation details..."
              className="bg-[#0b1120] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#4a5a76] min-h-[80px]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or instructions..."
              className="bg-[#0b1120] border-[#1e293b] text-[#c8d6e5] placeholder:text-[#4a5a76] min-h-[80px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-md bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Submitting..."
              : existingRequest
              ? "Update Request"
              : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================
// REQUEST DETAIL MODAL
// ============================
function RequestDetailModal({
  request,
  onClose,
}: {
  request: BusinessRequest;
  onClose: () => void;
}) {
  // Phase tracker
  const phases = [
    { key: "pending", label: "Pending" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
  ];

  const currentPhaseIndex = phases.findIndex((p) => p.key === request.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#111827] border border-[#1e293b] shadow-2xl mx-4">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Request Details
            </h2>
            <p className="text-xs font-mono text-[#22c55e]">
              {request.request_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5a6f84] hover:text-[#c8d6e5] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Phase Tracker */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            {phases.map((phase, index) => {
              const isActive = index <= currentPhaseIndex;
              const isCurrent = index === currentPhaseIndex;
              return (
                <div key={phase.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? "bg-[#22c55e] text-white"
                          : "bg-[#1e293b] text-[#64748b]"
                      } ${isCurrent ? "ring-2 ring-[#22c55e]/50" : ""}`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`text-xs mt-1 ${
                        isActive ? "text-[#4ade80]" : "text-[#64748b]"
                      }`}
                    >
                      {phase.label}
                    </span>
                  </div>
                  {index < phases.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 ${
                        index < currentPhaseIndex
                          ? "bg-[#22c55e]"
                          : "bg-[#1e293b]"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Info */}
        <div className="px-6 pb-6 space-y-3">
          {[
            { label: "Prospect Name", value: request.prospect_name },
            { label: "No. of Matches", value: String(request.num_matches) },
            { label: "Country", value: request.country || "-" },
            { label: "Source", value: request.source || "-" },
            { label: "Point of Contact", value: request.poc || "-" },
            { label: "Lineup Info", value: request.lineup_info || "-" },
            { label: "Notes", value: request.notes || "-" },
            {
              label: "Created",
              value: new Date(request.created_at).toLocaleString(),
            },
          ].map((item) => (
            <div key={item.label} className="flex justify-between">
              <span className="text-sm text-[#64748b]">{item.label}</span>
              <span className="text-sm text-[#c0cde0] text-right max-w-[60%]">
                {item.value}
              </span>
            </div>
          ))}

          {/* Video Links */}
          {request.video_links && request.video_links.length > 0 && (
            <div>
              <span className="text-sm text-[#64748b]">Video Links</span>
              <div className="mt-1 space-y-1">
                {request.video_links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-[#60a5fa] hover:text-[#3b82f6] break-all"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
