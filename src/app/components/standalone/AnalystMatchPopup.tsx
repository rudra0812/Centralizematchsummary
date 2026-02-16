import { useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface AnalystMatchPopupProps {
  matchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Analyst {
  name: string;
  analyst_id: string;
}

export function AnalystMatchPopup({
  matchId,
  open,
  onOpenChange,
  onSuccess,
}: AnalystMatchPopupProps) {
  const [loading, setLoading] = useState(false);
  const [analysts, setAnalysts] = useState<Analyst[]>([
    { name: "", analyst_id: "" },
  ]);
  const [formData, setFormData] = useState({
    live_match: "",
    remarks: "",
    analysis_tat: "",
    analysis_start_end_time: "",
    analysis_start_time: new Date().toISOString(),
  });

  const addAnalyst = () => {
    setAnalysts([...analysts, { name: "", analyst_id: "" }]);
  };

  const removeAnalyst = (index: number) => {
    if (analysts.length > 1) {
      setAnalysts(analysts.filter((_, i) => i !== index));
    }
  };

  const updateAnalyst = (index: number, field: keyof Analyst, value: string) => {
    const updated = [...analysts];
    updated[index][field] = value;
    setAnalysts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validAnalysts = analysts.filter(
        (a) => a.name.trim() && a.analyst_id.trim()
      );
      if (validAnalysts.length === 0) {
        toast.error("Please add at least one analyst with both name and ID");
        setLoading(false);
        return;
      }

      if (!formData.live_match) {
        toast.error("Please select if this is a live match");
        setLoading(false);
        return;
      }

      const analysisTat = parseFloat(formData.analysis_tat);
      const analysisTime = parseFloat(formData.analysis_start_end_time);

      if (isNaN(analysisTat) || analysisTat <= 0) {
        toast.error("Analysis TAT must be a positive number");
        setLoading(false);
        return;
      }

      if (isNaN(analysisTime) || analysisTime <= 0) {
        toast.error("Analysis Start to End Time must be a positive number");
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
            ...formData,
            analysts: validAnalysts,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success("Match marked for review successfully!");
        onOpenChange(false);
        setAnalysts([{ name: "", analyst_id: "" }]);
        setFormData({
          live_match: "",
          remarks: "",
          analysis_tat: "",
          analysis_start_end_time: "",
          analysis_start_time: new Date().toISOString(),
        });
        onSuccess?.();
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
  const selectClass =
    "w-full h-10 rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] appearance-none cursor-pointer transition-colors";
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
              Mark Match for Review
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
              <label className={labelClass}>Live Match *</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={formData.live_match}
                  onChange={(e) =>
                    setFormData({ ...formData, live_match: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select
                  </option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            {/* Analysts */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-[#374151]">
                  Analysts *
                </label>
                <button
                  type="button"
                  onClick={addAnalyst}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#16a34a] border border-[#16a34a] rounded-md hover:bg-[#f0fdf4] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Analyst
                </button>
              </div>
              <div className="space-y-3">
                {analysts.map((analyst, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start p-3 rounded-md border border-[#e5e7eb] bg-[#f9fafb]"
                  >
                    <div className="flex-1 space-y-2">
                      <input
                        className={inputClass}
                        placeholder="Analyst Name"
                        value={analyst.name}
                        onChange={(e) =>
                          updateAnalyst(index, "name", e.target.value)
                        }
                        required
                      />
                      <input
                        className={inputClass}
                        placeholder="Analyst ID"
                        value={analyst.analyst_id}
                        onChange={(e) =>
                          updateAnalyst(index, "analyst_id", e.target.value)
                        }
                        required
                      />
                    </div>
                    {analysts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAnalyst(index)}
                        className="mt-2 text-[#9ca3af] hover:text-[#ef4444] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Analysis TAT (hours) *</label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={formData.analysis_tat}
                  onChange={(e) =>
                    setFormData({ ...formData, analysis_tat: e.target.value })
                  }
                  placeholder="e.g., 5.5"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Analysis Start to End Time (hours) *
                </label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={formData.analysis_start_end_time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      analysis_start_end_time: e.target.value,
                    })
                  }
                  placeholder="Total time spent"
                  required
                />
                <p className="text-xs text-[#9ca3af] mt-1">
                  Track the total time from start to completion
                </p>
              </div>
            </div>

            <div>
              <label className={labelClass}>Remarks</label>
              <textarea
                className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#1f2937] placeholder-[#9ca3af] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-colors resize-none"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                placeholder="Add any comments for the reviewer..."
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
