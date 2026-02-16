import { useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ReviewerMatchPopupProps {
  matchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReviewerMatchPopup({
  matchId,
  open,
  onOpenChange,
  onSuccess,
}: ReviewerMatchPopupProps) {
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [formData, setFormData] = useState({
    reviewed_by: "",
    qc_error_count: "",
    review_tat: "",
    reviewer_remarks: "",
    send_back_to_analyst: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.reviewed_by.trim()) {
        toast.error("Please enter your name");
        setLoading(false);
        return;
      }

      const errorCount = parseInt(formData.qc_error_count);
      if (isNaN(errorCount) || errorCount < 0) {
        toast.error("QC Error Count must be a non-negative number");
        setLoading(false);
        return;
      }

      const reviewTat = parseFloat(formData.review_tat);
      if (isNaN(reviewTat) || reviewTat <= 0) {
        toast.error("Review TAT must be a positive number");
        setLoading(false);
        return;
      }

      if (
        hasErrors &&
        formData.send_back_to_analyst &&
        !formData.reviewer_remarks.trim()
      ) {
        toast.error("Please provide remarks when sending back for rework");
        setLoading(false);
        return;
      }
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-968c49f6/matches/${matchId}/reviewer`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ...formData,
            has_errors: hasErrors,
            qc_error_count: parseInt(formData.qc_error_count) || 0,
            review_tat: parseFloat(formData.review_tat) || 0,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        if (hasErrors && formData.send_back_to_analyst) {
          toast.success("Match sent back to analyst for rework");
        } else {
          toast.success("Match review completed successfully!");
        }
        onOpenChange(false);
        setFormData({
          reviewed_by: "",
          qc_error_count: "",
          review_tat: "",
          reviewer_remarks: "",
          send_back_to_analyst: false,
        });
        setHasErrors(false);
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
              Complete Match Review
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
              <label className={labelClass}>Reviewed By (Your Name) *</label>
              <input
                className={inputClass}
                value={formData.reviewed_by}
                onChange={(e) =>
                  setFormData({ ...formData, reviewed_by: e.target.value })
                }
                placeholder="Reviewer name"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>QC Error Count *</label>
                <input
                  className={inputClass}
                  type="number"
                  value={formData.qc_error_count}
                  onChange={(e) =>
                    setFormData({ ...formData, qc_error_count: e.target.value })
                  }
                  placeholder="Number of errors found"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Review TAT (hours) *</label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={formData.review_tat}
                  onChange={(e) =>
                    setFormData({ ...formData, review_tat: e.target.value })
                  }
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Reviewer Remarks</label>
              <textarea
                className="w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#1f2937] placeholder-[#9ca3af] outline-none focus:border-[#16a34a] focus:ring-1 focus:ring-[#16a34a] transition-colors resize-none"
                value={formData.reviewer_remarks}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reviewer_remarks: e.target.value,
                  })
                }
                placeholder="Add comments about the review..."
                rows={3}
              />
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-[#e5e7eb] p-4 bg-[#f9fafb]">
              <div>
                <p className="text-sm font-medium text-[#374151]">
                  Errors Found - Send Back to Analyst
                </p>
                <p className="text-xs text-[#9ca3af] mt-0.5">
                  Enable this if the match needs rework
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={hasErrors && formData.send_back_to_analyst}
                onClick={() => {
                  const newVal = !(
                    hasErrors && formData.send_back_to_analyst
                  );
                  setHasErrors(newVal);
                  setFormData({ ...formData, send_back_to_analyst: newVal });
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  hasErrors && formData.send_back_to_analyst
                    ? "bg-[#16a34a]"
                    : "bg-[#d1d5db]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    hasErrors && formData.send_back_to_analyst
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
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
              {loading
                ? "Submitting..."
                : hasErrors && formData.send_back_to_analyst
                  ? "Send Back for Rework"
                  : "Complete Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
