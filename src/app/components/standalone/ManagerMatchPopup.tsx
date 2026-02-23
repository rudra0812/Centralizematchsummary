import { useState } from "react";
import { toast } from "sonner";
import { X, Upload, Download, Edit2, Trash2, Plus } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";

interface ManagerMatchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CSVRow {
  organizer_name: string;
  client_type: string;
  match_analysis_type: string;
  team_a: string;
  team_b: string;
  game_time: string;
  match_city: string;
  tournament_name: string;
  match_video_type: string;
  match_age_group: string;
  match_received_on: string;
}

export function ManagerMatchPopup({
  open,
  onOpenChange,
  onSuccess,
}: ManagerMatchPopupProps) {
  const [loading, setLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    organizer_name: "",
    client_type: "",
    match_analysis_type: "",
    team_a: "",
    team_b: "",
    game_time: "",
    match_city: "",
    tournament_name: "",
    match_video_type: "",
    match_age_group: "",
    match_received_on: new Date().toISOString().split("T")[0],
  });

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length < 2) {
        toast.error("CSV file is empty or invalid");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim());
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        rows.push(row);
      }

      setCsvData(rows);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handleDownloadCsv = () => {
    if (csvData.length === 0) return;

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers.map((header) => row[header as keyof CSVRow]).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `edited_matches_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully");
  };

  const handleDeleteRow = (index: number) => {
    setCsvData(csvData.filter((_, i) => i !== index));
    toast.success("Row deleted");
  };

  const handleUpdateRow = (index: number, field: keyof CSVRow, value: string) => {
    const newData = [...csvData];
    newData[index] = { ...newData[index], [field]: value };
    setCsvData(newData);
  };

  const handleCsvUpload = async () => {
    if (csvData.length === 0) {
      toast.error("No data to upload");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ matches: csvData.map(row => ({ ...row, venue: row.match_city })) }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`${csvData.length} matches created successfully!`);
        onOpenChange(false);
        setCsvFile(null);
        setCsvData([]);
        setShowPreview(false);
        onSuccess?.();
      } else {
        toast.error("Failed to create matches: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Failed to upload CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.client_type) {
        toast.error("Please select a client type");
        setLoading(false);
        return;
      }

      if (!formData.match_video_type) {
        toast.error("Please select a match video type");
        setLoading(false);
        return;
      }

      if (!formData.match_age_group) {
        toast.error("Please select a match age group");
        setLoading(false);
        return;
      }

      if (!formData.match_analysis_type) {
        toast.error("Please select a match analysis type");
        setLoading(false);
        return;
      }

      const gameTimeNum = parseFloat(formData.game_time);
      if (isNaN(gameTimeNum) || gameTimeNum <= 0) {
        toast.error("Please enter a valid game time in minutes");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            venue: formData.match_city,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`Match created successfully! ID: ${data.match.match_id}`);
        onOpenChange(false);
        setFormData({
          organizer_name: "",
          client_type: "",
          match_analysis_type: "",
          team_a: "",
          team_b: "",
          game_time: "",
          match_city: "",
          tournament_name: "",
          match_video_type: "",
          match_age_group: "",
          match_received_on: new Date().toISOString().split("T")[0],
        });
        onSuccess?.();
      } else {
        toast.error("Failed to create match: " + data.error);
      }
    } catch (error) {
      console.error("Error creating match:", error);
      toast.error("Failed to create match");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full h-10 rounded-md border border-[#2a3a4e] bg-[#1e2d3d] px-3 py-2 text-sm text-[#c8d6e5] placeholder-[#5a6f84] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-colors";
  const selectClass =
    "w-full h-10 rounded-md border border-[#2a3a4e] bg-[#1e2d3d] px-3 py-2 text-sm text-[#c8d6e5] outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] appearance-none cursor-pointer transition-colors";
  const labelClass = "block text-sm font-medium text-[#8899aa] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[#0f1923] border border-[#1e2d3d] shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold text-[#e8eef4]">Create Match</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-[#5a6f84] hover:text-[#c8d6e5] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs for Single/Multiple */}
        <Tabs defaultValue="single" className="px-6">
          <TabsList className="grid w-full grid-cols-2 bg-[#1e2d3d] mb-4">
            <TabsTrigger
              value="single"
              className="data-[state=active]:bg-[#22c55e] data-[state=active]:text-white"
            >
              Single Match
            </TabsTrigger>
            <TabsTrigger
              value="multiple"
              className="data-[state=active]:bg-[#22c55e] data-[state=active]:text-white"
            >
              Multiple Matches (CSV)
            </TabsTrigger>
          </TabsList>

          {/* Single Match Form */}
          <TabsContent value="single">
            <form onSubmit={handleSubmit} className="pb-6">
          {/* Section: Match Details */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5a6f84] mb-3">Match Details</h3>
            <div className="h-px bg-[#1e2d3d] mb-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <label className={labelClass}>Client Name *</label>
              <input
                className={inputClass}
                value={formData.organizer_name}
                onChange={(e) =>
                  setFormData({ ...formData, organizer_name: e.target.value })
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
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Match Analysis Type *</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={formData.match_analysis_type}
                  onChange={(e) =>
                    setFormData({ ...formData, match_analysis_type: e.target.value })
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
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Match Age Group *</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={formData.match_age_group}
                  onChange={(e) =>
                    setFormData({ ...formData, match_age_group: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select age group
                  </option>
                  <option value="U12">U12</option>
                  <option value="U13">U13</option>
                  <option value="U14">U14</option>
                  <option value="U15">U15</option>
                  <option value="U16">U16</option>
                  <option value="U17">U17</option>
                  <option value="U18">U18</option>
                  <option value="U19">U19</option>
                  <option value="U21">U21</option>
                  <option value="Pro">Pro</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
              <label className={labelClass}>Match City *</label>
              <input
                className={inputClass}
                value={formData.match_city}
                onChange={(e) =>
                  setFormData({ ...formData, match_city: e.target.value })
                }
                placeholder="Enter city"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Major Tournament Name *</label>
              <input
                className={inputClass}
                value={formData.tournament_name}
                onChange={(e) =>
                  setFormData({ ...formData, tournament_name: e.target.value })
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
                    setFormData({ ...formData, match_video_type: e.target.value })
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
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Match Received On *</label>
              <input
                className={`${inputClass} [color-scheme:dark]`}
                type="date"
                value={formData.match_received_on}
                onChange={(e) =>
                  setFormData({ ...formData, match_received_on: e.target.value })
                }
                required
              />
            </div>
          </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full h-11 rounded-md bg-[#2563eb] text-white font-medium text-sm hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Match"}
              </button>
            </form>
          </TabsContent>

          {/* Multiple Matches CSV Upload */}
          <TabsContent value="multiple">
            <div className="pb-6 space-y-4">
              {!showPreview ? (
                <>
                  <div className="bg-[#1e2d3d] border border-[#2a3a4e] rounded-lg p-4">
                    <h3 className="text-sm font-medium text-[#c8d6e5] mb-2">
                      CSV Format Requirements
                    </h3>
                    <p className="text-xs text-[#7a8ba6] mb-3">
                      Your CSV file must include the following columns:
                    </p>
                    <code className="block text-xs text-[#22c55e] bg-[#0f1923] p-3 rounded border border-[#2a3a4e] overflow-x-auto">
                      organizer_name,client_type,match_analysis_type,team_a,team_b,game_time,match_city,tournament_name,match_video_type,match_age_group,match_received_on
                    </code>
                  </div>

                  <div>
                    <label className={labelClass}>Upload CSV File *</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileSelect}
                        className="w-full h-11 rounded-md border border-[#2a3a4e] bg-[#1e2d3d] px-3 py-2 text-sm text-[#c8d6e5] file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#22c55e] file:text-white hover:file:bg-[#16a34a] file:cursor-pointer"
                      />
                    </div>
                    {csvFile && !showPreview && (
                      <p className="text-xs text-[#22c55e] mt-2">
                        <Upload className="h-3 w-3 inline mr-1" />
                        Selected: {csvFile.name}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-[#c8d6e5]">
                      CSV Preview ({csvData.length} rows)
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadCsv}
                        className="gap-2 border-[#2a3a4e] text-[#c8d6e5] hover:bg-[#1e2d3d]"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowPreview(false);
                          setCsvFile(null);
                          setCsvData([]);
                        }}
                        className="gap-2 border-[#2a3a4e] text-[#c8d6e5] hover:bg-[#1e2d3d]"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <div className="border border-[#2a3a4e] rounded-lg max-h-96 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-[#1e2d3d] sticky top-0">
                        <tr>
                          <th className="text-left p-2 text-[#7a8ba6]">#</th>
                          <th className="text-left p-2 text-[#7a8ba6]">Client</th>
                          <th className="text-left p-2 text-[#7a8ba6]">Team A</th>
                          <th className="text-left p-2 text-[#7a8ba6]">Team B</th>
                          <th className="text-left p-2 text-[#7a8ba6]">City</th>
                          <th className="text-left p-2 text-[#7a8ba6]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvData.map((row, index) => (
                          <tr
                            key={index}
                            className="border-t border-[#2a3a4e] hover:bg-[#1e2d3d]"
                          >
                            <td className="p-2 text-[#7a8ba6]">{index + 1}</td>
                            <td className="p-2">
                              {editingIndex === index ? (
                                <input
                                  className="w-full bg-[#0f1923] border border-[#2a3a4e] rounded px-2 py-1 text-[#c8d6e5]"
                                  value={row.organizer_name}
                                  onChange={(e) =>
                                    handleUpdateRow(
                                      index,
                                      "organizer_name",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <span className="text-[#c8d6e5]">
                                  {row.organizer_name}
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              {editingIndex === index ? (
                                <input
                                  className="w-full bg-[#0f1923] border border-[#2a3a4e] rounded px-2 py-1 text-[#c8d6e5]"
                                  value={row.team_a}
                                  onChange={(e) =>
                                    handleUpdateRow(index, "team_a", e.target.value)
                                  }
                                />
                              ) : (
                                <span className="text-[#c8d6e5]">{row.team_a}</span>
                              )}
                            </td>
                            <td className="p-2">
                              {editingIndex === index ? (
                                <input
                                  className="w-full bg-[#0f1923] border border-[#2a3a4e] rounded px-2 py-1 text-[#c8d6e5]"
                                  value={row.team_b}
                                  onChange={(e) =>
                                    handleUpdateRow(index, "team_b", e.target.value)
                                  }
                                />
                              ) : (
                                <span className="text-[#c8d6e5]">{row.team_b}</span>
                              )}
                            </td>
                            <td className="p-2">
                              {editingIndex === index ? (
                                <input
                                  className="w-full bg-[#0f1923] border border-[#2a3a4e] rounded px-2 py-1 text-[#c8d6e5]"
                                  value={row.match_city}
                                  onChange={(e) =>
                                    handleUpdateRow(
                                      index,
                                      "match_city",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                <span className="text-[#c8d6e5]">
                                  {row.match_city}
                                </span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                {editingIndex === index ? (
                                  <button
                                    type="button"
                                    onClick={() => setEditingIndex(null)}
                                    className="p-1 text-[#22c55e] hover:bg-[#0f1923] rounded"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setEditingIndex(index)}
                                    className="p-1 text-[#3b82f6] hover:bg-[#0f1923] rounded"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(index)}
                                  className="p-1 text-[#ef4444] hover:bg-[#0f1923] rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button
                    type="button"
                    onClick={handleCsvUpload}
                    disabled={loading || csvData.length === 0}
                    className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] text-white"
                  >
                    {loading
                      ? "Uploading..."
                      : `Upload and Create ${csvData.length} Matches`}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
