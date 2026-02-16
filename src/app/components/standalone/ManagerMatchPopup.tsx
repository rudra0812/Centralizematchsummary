import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ManagerMatchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ManagerMatchPopup({
  open,
  onOpenChange,
  onSuccess,
}: ManagerMatchPopupProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizer_name: "",
    client_type: "",
    match_analysis_type: "",
    team_a: "",
    team_b: "",
    game_time: "",
    venue: "",
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

      const gameTime = new Date(formData.game_time);
      if (isNaN(gameTime.getTime())) {
        toast.error("Please enter a valid game time");
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
          body: JSON.stringify(formData),
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
          venue: "",
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <label className={labelClass}>Client Name (Organizer)</label>
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
              <label className={labelClass}>Client Type</label>
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
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="demo">Demo</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Team A</label>
              <input
                className={inputClass}
                value={formData.team_a}
                onChange={(e) =>
                  setFormData({ ...formData, team_a: e.target.value })
                }
                placeholder="Select Team A"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Team B</label>
              <input
                className={inputClass}
                value={formData.team_b}
                onChange={(e) =>
                  setFormData({ ...formData, team_b: e.target.value })
                }
                placeholder="Select Team B"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>Tournament Name</label>
              <input
                className={inputClass}
                value={formData.tournament_name}
                onChange={(e) =>
                  setFormData({ ...formData, tournament_name: e.target.value })
                }
                placeholder="Select Tournament"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Match Analysis Type</label>
              <input
                className={inputClass}
                value={formData.match_analysis_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    match_analysis_type: e.target.value,
                  })
                }
                placeholder="e.g., Tactical, Performance"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Match Age Group</label>
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
                  <option value="U13">U13</option>
                  <option value="U15">U15</option>
                  <option value="U17">U17</option>
                  <option value="U19">U19</option>
                  <option value="U21">U21</option>
                  <option value="Senior">Senior</option>
                  <option value="Professional">Professional</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Match Country (Venue)</label>
              <input
                className={inputClass}
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="Select venue"
                required
              />
            </div>

            <div>
              <label className={labelClass}>Match Video Type</label>
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
                  <option value="YouTube">YouTube</option>
                  <option value="Vimeo">Vimeo</option>
                  <option value="Twitch">Twitch</option>
                  <option value="ESPN+">{"ESPN+"}</option>
                  <option value="DAZN">DAZN</option>
                  <option value="Other">Other</option>
                  <option value="NA">{"N/A"}</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6f84]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div>
              <label className={labelClass}>Game Time</label>
              <input
                className={`${inputClass} [color-scheme:dark]`}
                type="datetime-local"
                value={formData.game_time}
                onChange={(e) =>
                  setFormData({ ...formData, game_time: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className={labelClass}>Match Received On</label>
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
      </div>
    </div>
  );
}
