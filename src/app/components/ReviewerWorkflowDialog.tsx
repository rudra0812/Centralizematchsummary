import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { Switch } from "./ui/switch";

interface ReviewerWorkflowDialogProps {
  matchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ReviewerWorkflowDialog({
  matchId,
  open,
  onOpenChange,
  onSuccess,
}: ReviewerWorkflowDialogProps) {
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
      // Validate reviewed_by is filled
      if (!formData.reviewed_by.trim()) {
        toast.error("Please enter your name");
        setLoading(false);
        return;
      }

      // Validate QC error count
      const errorCount = parseInt(formData.qc_error_count);
      if (isNaN(errorCount) || errorCount < 0) {
        toast.error("QC Error Count must be a non-negative number");
        setLoading(false);
        return;
      }

      // Validate Review TAT
      const reviewTat = parseFloat(formData.review_tat);
      if (isNaN(reviewTat) || reviewTat <= 0) {
        toast.error("Review TAT must be a positive number");
        setLoading(false);
        return;
      }

      // If errors found and send back is toggled, require remarks
      if (hasErrors && formData.send_back_to_analyst && !formData.reviewer_remarks.trim()) {
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
        onSuccess();
        // Reset form
        setFormData({
          reviewed_by: "",
          qc_error_count: "",
          review_tat: "",
          reviewer_remarks: "",
          send_back_to_analyst: false,
        });
        setHasErrors(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Match Review</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Match ID: {matchId}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewed_by">Reviewed By (Your Name) *</Label>
            <Input
              id="reviewed_by"
              value={formData.reviewed_by}
              onChange={(e) =>
                setFormData({ ...formData, reviewed_by: e.target.value })
              }
              placeholder="Reviewer name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qc_error_count">QC Error Count *</Label>
            <Input
              id="qc_error_count"
              type="number"
              value={formData.qc_error_count}
              onChange={(e) =>
                setFormData({ ...formData, qc_error_count: e.target.value })
              }
              placeholder="Number of errors found"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review_tat">Review TAT (hours) *</Label>
            <Input
              id="review_tat"
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

          <div className="space-y-2">
            <Label htmlFor="reviewer_remarks">Reviewer Remarks</Label>
            <Textarea
              id="reviewer_remarks"
              value={formData.reviewer_remarks}
              onChange={(e) =>
                setFormData({ ...formData, reviewer_remarks: e.target.value })
              }
              placeholder="Add comments about the review..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Errors Found - Send Back to Analyst</Label>
              <p className="text-sm text-muted-foreground">
                Enable this if the match needs rework
              </p>
            </div>
            <Switch
              checked={hasErrors && formData.send_back_to_analyst}
              onCheckedChange={(checked) => {
                setHasErrors(checked);
                setFormData({ ...formData, send_back_to_analyst: checked });
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Submitting..."
                : hasErrors && formData.send_back_to_analyst
                ? "Send Back for Rework"
                : "Complete Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
