import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AnalystWorkflowDialogProps {
  matchId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Analyst {
  name: string;
  analyst_id: string;
}

export function AnalystWorkflowDialog({
  matchId,
  open,
  onOpenChange,
  onSuccess,
}: AnalystWorkflowDialogProps) {
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
      // Validate that at least one analyst is filled
      const validAnalysts = analysts.filter(
        (a) => a.name.trim() && a.analyst_id.trim()
      );
      if (validAnalysts.length === 0) {
        toast.error("Please add at least one analyst with both name and ID");
        setLoading(false);
        return;
      }

      // Validate live_match is selected
      if (!formData.live_match) {
        toast.error("Please select if this is a live match");
        setLoading(false);
        return;
      }

      // Validate TAT values are positive
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
        onSuccess();
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
          <DialogTitle>Mark Match for Review</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Match ID: {matchId}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="live_match">Live Match *</Label>
            <Select
              value={formData.live_match}
              onValueChange={(value) =>
                setFormData({ ...formData, live_match: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Analysts *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnalyst}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Analyst
              </Button>
            </div>
            {analysts.map((analyst, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Analyst Name"
                    value={analyst.name}
                    onChange={(e) =>
                      updateAnalyst(index, "name", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Analyst ID"
                    value={analyst.analyst_id}
                    onChange={(e) =>
                      updateAnalyst(index, "analyst_id", e.target.value)
                    }
                    required
                  />
                </div>
                {analysts.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAnalyst(index)}
                    className="mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="analysis_tat">Analysis TAT (hours) *</Label>
            <Input
              id="analysis_tat"
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

          <div className="space-y-2">
            <Label htmlFor="analysis_start_end_time">
              Analysis Start to End Time (hours) *
            </Label>
            <Input
              id="analysis_start_end_time"
              type="number"
              step="0.1"
              value={formData.analysis_start_end_time}
              onChange={(e) =>
                setFormData({ ...formData, analysis_start_end_time: e.target.value })
              }
              placeholder="Total time spent on analysis"
              required
            />
            <p className="text-xs text-muted-foreground">
              Track the total time from start to completion
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              placeholder="Add any comments for the reviewer..."
              rows={3}
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
              {loading ? "Submitting..." : "Mark for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
