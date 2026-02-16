import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface AnalystWorkflowDialogProps {
  matchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AnalystWorkflowDialog({
  matchId,
  open,
  onOpenChange,
  onSuccess,
}: AnalystWorkflowDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    analysed_on: new Date().toISOString().split("T")[0],
    live_match_analysed_by: "",
    first_half_analysed_by: "",
    second_half_analysed_by: "",
    remarks: "",
    analysis_tat: "",
    analysis_start_end_time: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.analysed_on) {
        toast.error("Please enter the analysis date");
        setLoading(false);
        return;
      }

      const analysisTat = parseFloat(formData.analysis_tat);
      const analysisTime = parseFloat(formData.analysis_start_end_time);

      if (isNaN(analysisTat) || analysisTat <= 0) {
        toast.error("Analysis TAT must be a positive number (in minutes)");
        setLoading(false);
        return;
      }

      if (isNaN(analysisTime) || analysisTime <= 0) {
        toast.error("Analysis Start to End Time must be a positive number (in minutes)");
        setLoading(false);
        return;
      }

      // Build analysts array from the individual fields
      const analysts = [];
      if (formData.live_match_analysed_by.trim()) {
        analysts.push({ name: formData.live_match_analysed_by.trim(), role: "live_match" });
      }
      if (formData.first_half_analysed_by.trim()) {
        analysts.push({ name: formData.first_half_analysed_by.trim(), role: "first_half" });
      }
      if (formData.second_half_analysed_by.trim()) {
        analysts.push({ name: formData.second_half_analysed_by.trim(), role: "second_half" });
      }

      if (analysts.length === 0) {
        toast.error("Please enter at least one analyst name");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${matchId}/analyst`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            analysed_on: formData.analysed_on,
            live_match_analysed_by: formData.live_match_analysed_by,
            first_half_analysed_by: formData.first_half_analysed_by,
            second_half_analysed_by: formData.second_half_analysed_by,
            remarks: formData.remarks,
            analysis_tat: formData.analysis_tat,
            analysis_start_end_time: formData.analysis_start_end_time,
            analysts,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Analysis submitted successfully!");
        onOpenChange(false);
        onSuccess();
        setFormData({
          analysed_on: new Date().toISOString().split("T")[0],
          live_match_analysed_by: "",
          first_half_analysed_by: "",
          second_half_analysed_by: "",
          remarks: "",
          analysis_tat: "",
          analysis_start_end_time: "",
        });
      } else {
        toast.error("Failed to update match: " + data.error);
      }
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error("Failed to update match");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const inputClass =
    "w-full h-10 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#1f2937] placeholder-[#9ca3af] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-colors";
  const labelClass = "block text-sm font-medium text-[#374151] mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white border border-[#e5e7eb] shadow-xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">
              Submit Analysis Details
            </h2>
            <p className="text-sm text-[#6b7280] mt-0.5">
              Match ID: {matchId}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-[#9ca3af] hover:text-[#374151] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-px bg-[#e5e7eb] mx-6 my-3" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Match Analysed On (Date) *</label>
              <input
                className={inputClass}
                type="date"
                value={formData.analysed_on}
                onChange={(e) =>
                  setFormData({ ...formData, analysed_on: e.target.value })
                }
                required
              />
            </div>

            {/* Analyst Assignment */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Live Match Analysed By</label>
                <input
                  className={inputClass}
                  value={formData.live_match_analysed_by}
                  onChange={(e) =>
                    setFormData({ ...formData, live_match_analysed_by: e.target.value })
                  }
                  placeholder="Analyst name (if live match)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Half Analysed By *</label>
                  <input
                    className={inputClass}
                    value={formData.first_half_analysed_by}
                    onChange={(e) =>
                      setFormData({ ...formData, first_half_analysed_by: e.target.value })
                    }
                    placeholder="Analyst name"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Second Half Analysed By *</label>
                  <input
                    className={inputClass}
                    value={formData.second_half_analysed_by}
                    onChange={(e) =>
                      setFormData({ ...formData, second_half_analysed_by: e.target.value })
                    }
                    placeholder="Analyst name"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-[#e5e7eb]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Analysis TAT (mins) *</label>
                <input
                  className={inputClass}
                  type="number"
                  step="1"
                  min="1"
                  value={formData.analysis_tat}
                  onChange={(e) =>
                    setFormData({ ...formData, analysis_tat: e.target.value })
                  }
                  placeholder="e.g., 120"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Analysis Start to End Time (mins) *
                </label>
                <input
                  className={inputClass}
                  type="number"
                  step="1"
                  min="1"
                  value={formData.analysis_start_end_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      analysis_start_end_time: e.target.value,
                    })
                  }
                  placeholder="Total time from start to end"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Analyst Remarks on the Game or Match Video</label>
              <textarea
                className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#1f2937] placeholder-[#9ca3af] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-colors resize-none"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Add any comments about the game or match video..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-5 mt-5 border-t border-[#e5e7eb]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 px-5 rounded-md border border-[#d1d5db] text-sm font-medium text-[#374151] bg-white hover:bg-[#f9fafb] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-5 rounded-md bg-[#16a34a] text-white text-sm font-medium hover:bg-[#15803d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Mark for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
