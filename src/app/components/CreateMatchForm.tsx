import { useState } from "react";
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
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface CreateMatchFormProps {
  onMatchCreated: () => void;
}

export function CreateMatchForm({ onMatchCreated }: CreateMatchFormProps) {
  const [open, setOpen] = useState(false);
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
    match_received_on: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all required select fields are chosen
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

      // Validate game time is not in the past (optional)
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
        setOpen(false);
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
          match_received_on: new Date().toISOString().split('T')[0],
        });
        onMatchCreated();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create a Match
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Match</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer_name">Client Name (Organizer) *</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) =>
                  setFormData({ ...formData, organizer_name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_type">Client Type *</Label>
              <Select
                value={formData.client_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, client_type: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="match_analysis_type">Match Analysis Type *</Label>
              <Input
                id="match_analysis_type"
                value={formData.match_analysis_type}
                onChange={(e) =>
                  setFormData({ ...formData, match_analysis_type: e.target.value })
                }
                placeholder="e.g., Tactical, Performance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_a">Team A *</Label>
              <Input
                id="team_a"
                value={formData.team_a}
                onChange={(e) =>
                  setFormData({ ...formData, team_a: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_b">Team B *</Label>
              <Input
                id="team_b"
                value={formData.team_b}
                onChange={(e) =>
                  setFormData({ ...formData, team_b: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="game_time">Game Time *</Label>
              <Input
                id="game_time"
                type="datetime-local"
                value={formData.game_time}
                onChange={(e) =>
                  setFormData({ ...formData, game_time: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Match Country (Venue) *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tournament_name">Tournament Name *</Label>
              <Input
                id="tournament_name"
                value={formData.tournament_name}
                onChange={(e) =>
                  setFormData({ ...formData, tournament_name: e.target.value })
                }
                placeholder="Select existing or type new"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="match_video_type">Match Video Type *</Label>
              <Select
                value={formData.match_video_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, match_video_type: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                  <SelectItem value="Vimeo">Vimeo</SelectItem>
                  <SelectItem value="Twitch">Twitch</SelectItem>
                  <SelectItem value="ESPN+">ESPN+</SelectItem>
                  <SelectItem value="DAZN">DAZN</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="NA">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="match_age_group">Match Age Group *</Label>
              <Select
                value={formData.match_age_group}
                onValueChange={(value) =>
                  setFormData({ ...formData, match_age_group: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U13">U13</SelectItem>
                  <SelectItem value="U15">U15</SelectItem>
                  <SelectItem value="U17">U17</SelectItem>
                  <SelectItem value="U19">U19</SelectItem>
                  <SelectItem value="U21">U21</SelectItem>
                  <SelectItem value="Senior">Senior</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="match_received_on">Match Received On *</Label>
              <Input
                id="match_received_on"
                type="date"
                value={formData.match_received_on}
                onChange={(e) =>
                  setFormData({ ...formData, match_received_on: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Match"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
