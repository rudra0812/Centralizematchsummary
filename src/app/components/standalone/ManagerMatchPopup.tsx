import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, Download, Info, Upload } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Button } from "../ui/button";

interface ManagerMatchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type TabType = "single" | "csv";

export function ManagerMatchPopup({
  open,
  onOpenChange,
  onSuccess,
}: ManagerMatchPopupProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("single");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  });

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
            venue: formData.match_country,
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
          match_country: "",
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

  const csvColumns = [
    "organizer_name",
    "client_type",
    "match_analysis_type",
    "team_a",
    "team_b",
    "game_time",
    "match_city",
    "tournament_name",
    "match_video_type",
    "match_age_group",
    "match_received_on",
  ];

  const handleDownloadSampleCSV = () => {
    const headers = csvColumns.join(",");
    const sampleRow1 = "Manchester United Academy,Paid,Pro,United U18,City U18,90,Manchester,Premier League Youth,Veo,U18,2026-03-15";
    const sampleRow2 = "Barcelona FC,Paid,B2C,Barca B,Real Madrid B,90,Barcelona,La Liga B,Hudl,U21,2026-03-16";
    const csvContent = `${headers}\n${sampleRow1}\n${sampleRow2}`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_matches.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Sample CSV downloaded!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please upload a CSV file");
        return;
      }
      setCsvFile(file);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());
      
      // Validate headers
      const missingColumns = csvColumns.filter((col) => !headers.includes(col));
      if (missingColumns.length > 0) {
        toast.error(`Missing columns: ${missingColumns.join(", ")}`);
        setLoading(false);
        return;
      }

      const matches = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length !== headers.length) continue;
        
        const match: Record<string, string> = {};
        headers.forEach((header, index) => {
          match[header] = values[index];
        });
        matches.push(match);
      }

      if (matches.length === 0) {
        toast.error("No valid matches found in CSV");
        setLoading(false);
        return;
      }

      // Create matches one by one
      let successCount = 0;
      let failCount = 0;

      for (const match of matches) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                organizer_name: match.organizer_name,
                client_type: match.client_type,
                match_analysis_type: match.match_analysis_type,
                team_a: match.team_a,
                team_b: match.team_b,
                game_time: match.game_time,
                venue: match.match_city,
                tournament_name: match.tournament_name,
                match_video_type: match.match_video_type,
                match_age_group: match.match_age_group,
                match_received_on: match.match_received_on,
              }),
            }
          );

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} match(es)!`);
        onSuccess?.();
      }
      if (failCount > 0) {
        toast.error(`Failed to create ${failCount} match(es)`);
      }

      setCsvFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Failed to process CSV file");
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

        {/* Tabs */}
        <div className="px-6 pb-4">
          <div className="flex rounded-lg bg-[#1e2d3d] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "single"
                  ? "bg-[#0f1923] text-white"
                  : "text-[#8899aa] hover:text-[#c8d6e5]"
              }`}
            >
              Single Match
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("csv")}
              className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "csv"
                  ? "bg-[#22c55e] text-white"
                  : "text-[#8899aa] hover:text-[#c8d6e5]"
              }`}
            >
              Multiple Matches (CSV)
            </button>
          </div>
        </div>

        {/* CSV Upload Tab */}
        {activeTab === "csv" && (
          <div className="px-6 pb-6 space-y-5">
            {/* CSV Format Requirements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#e8eef4]">CSV Format Requirements</h3>
                  <p className="text-xs text-[#5a6f84] mt-0.5">Your CSV file must include the following columns:</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSampleCSV}
                  className="gap-1.5 text-[#22c55e] border-[#22c55e]/30 hover:bg-[#22c55e]/10 hover:text-[#22c55e] bg-transparent"
                >
                  <Download className="h-4 w-4" />
                  Sample CSV
                </Button>
              </div>
              
              <div className="bg-[#1e2d3d] rounded-lg p-3 overflow-x-auto">
                <code className="text-xs text-[#8899aa] whitespace-nowrap">
                  {csvColumns.join(",")}
                </code>
              </div>
            </div>

            {/* Mock Data Example */}
            <div className="bg-[#1a2a3a] border border-[#2a3a4e] rounded-lg p-4">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-[#3b82f6] mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-[#3b82f6]">Mock Data Example (Reference Only)</h4>
                  <p className="text-xs text-[#8899aa] mt-1">
                    Use the sample CSV above as a template. It contains mock data for reference to help you understand the format. Download it, edit with your actual match data, and upload.
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-[#22c55e] font-medium">Example rows:</p>
                    <p className="text-xs text-[#8899aa] font-mono">
                      Manchester United Academy,Paid,Pro,United U18,City U18,90,Manchester,...
                    </p>
                    <p className="text-xs text-[#8899aa] font-mono">
                      Barcelona FC,Paid,B2C,Barca B,Real Madrid B,90,Barcelona,...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className={labelClass}>Upload CSV File *</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload-manager"
                />
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white border-0"
                >
                  Choose File
                </Button>
                <span className="text-sm text-[#8899aa]">
                  {csvFile ? csvFile.name : "No file chosen"}
                </span>
              </div>
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleCSVUpload}
              disabled={loading || !csvFile}
              className="mt-4 w-full h-11 rounded-md bg-[#22c55e] text-white font-medium text-sm hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                "Uploading..."
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload and Create Matches
                </>
              )}
            </button>
          </div>
        )}

        {/* Single Match Form */}
        {activeTab === "single" && (
        <form onSubmit={handleSubmit} className="px-6 pb-6">
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
        )}
      </div>
    </div>
  );
}
