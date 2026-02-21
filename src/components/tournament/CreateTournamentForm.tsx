"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { CreateTournamentData, TournamentType, EntryType, CertificateType, TournamentStatus } from "@/types/tournament";

interface CreateTournamentFormProps {
  onSubmit: (data: CreateTournamentData) => void;
  isLoading: boolean;
}

export function CreateTournamentForm({ onSubmit, isLoading }: CreateTournamentFormProps) {
  const [formData, setFormData] = useState<CreateTournamentData>({
    name: '',
    description: '',
    start_date: '',
    tournament_type: 'swiss',
    total_rounds: 5,
    duration_minutes: 60,
    time_control: '10+0',
    max_players: 32,
    entry_type: 'free',
    entry_fee: 0,
    required_points: 0,
    win_streak_bonus: false,
    auto_start: false,
    certificate_type: 'participation',
    certificate_top_n: 3,
    status: 'draft',
    win_points_bonus: 10,
    draw_points_bonus: 5,
    prize_description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert local datetime-local value to proper ISO string with timezone
    const localDate = new Date(formData.start_date);
    onSubmit({ ...formData, start_date: localDate.toISOString() });
  };

  const isArena = formData.tournament_type === 'arena';
  const isPaidEntry = formData.entry_type === 'paid';

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Create Tournament</DialogTitle>
        <DialogDescription>
          Set up a new chess tournament
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Tournament Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Tournament Type</Label>
            <Select
              value={formData.tournament_type}
              onValueChange={(v: TournamentType) => setFormData({ ...formData, tournament_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="swiss">Swiss System</SelectItem>
                <SelectItem value="arena">Arena</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date & Time</Label>
            <Input
              id="start_date"
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isArena ? (
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={480}
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="total_rounds">Number of Rounds</Label>
              <Input
                id="total_rounds"
                type="number"
                min={1}
                max={15}
                value={formData.total_rounds}
                onChange={(e) => setFormData({ ...formData, total_rounds: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="time_control">Time Control</Label>
            <Select
              value={formData.time_control}
              onValueChange={(v) => setFormData({ ...formData, time_control: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1+0">Bullet 1+0</SelectItem>
                <SelectItem value="2+1">Bullet 2+1</SelectItem>
                <SelectItem value="3+0">Blitz 3+0</SelectItem>
                <SelectItem value="5+0">Blitz 5+0</SelectItem>
                <SelectItem value="5+3">Blitz 5+3</SelectItem>
                <SelectItem value="10+0">Rapid 10+0</SelectItem>
                <SelectItem value="10+5">Rapid 10+5</SelectItem>
                <SelectItem value="15+10">Rapid 15+10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="max_players">Max Players</Label>
          <Input
            id="max_players"
            type="number"
            min={4}
            max={256}
            value={formData.max_players}
            onChange={(e) => setFormData({ ...formData, max_players: parseInt(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Entry Type</Label>
            <Select
              value={formData.entry_type}
              onValueChange={(v: EntryType) => setFormData({ ...formData, entry_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Entry</SelectItem>
                <SelectItem value="paid">Points-Based Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isPaidEntry && (
            <div className="grid gap-2">
              <Label htmlFor="required_points">Required Points</Label>
              <Input
                id="required_points"
                type="number"
                min={1}
                value={formData.required_points}
                onChange={(e) => setFormData({ ...formData, required_points: parseInt(e.target.value) })}
              />
            </div>
          )}
        </div>

        {isArena && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Win Streak Bonus</Label>
              <p className="text-xs text-muted-foreground">Extra points for consecutive wins</p>
            </div>
            <Switch
              checked={formData.win_streak_bonus}
              onCheckedChange={(v) => setFormData({ ...formData, win_streak_bonus: v })}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto Start</Label>
            <p className="text-xs text-muted-foreground">Start automatically at scheduled time</p>
          </div>
          <Switch
            checked={formData.auto_start}
            onCheckedChange={(v) => setFormData({ ...formData, auto_start: v })}
          />
        </div>

        <div className="border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold mb-3">🏆 Win Rewards</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="win_points_bonus">Points for Win</Label>
              <Input
                id="win_points_bonus"
                type="number"
                min={0}
                value={formData.win_points_bonus}
                onChange={(e) => setFormData({ ...formData, win_points_bonus: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="draw_points_bonus">Points for Draw</Label>
              <Input
                id="draw_points_bonus"
                type="number"
                min={0}
                value={formData.draw_points_bonus}
                onChange={(e) => setFormData({ ...formData, draw_points_bonus: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="grid gap-2 mt-3">
            <Label htmlFor="prize_description">Prize Description (optional)</Label>
            <Textarea
              id="prize_description"
              placeholder="e.g. Winner gets 100 bonus points + Gold Certificate"
              value={formData.prize_description || ''}
              onChange={(e) => setFormData({ ...formData, prize_description: e.target.value })}
            />
          </div>
        </div>

        <div className="border-t pt-4 mt-2">
          <h4 className="text-sm font-semibold mb-3">📜 Certificates</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Certificate Type</Label>
              <Select
                value={formData.certificate_type}
                onValueChange={(v: CertificateType) => 
                  setFormData({ ...formData, certificate_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">All Participants</SelectItem>
                  <SelectItem value="winner">Winner Only</SelectItem>
                  <SelectItem value="top_n">Top N Players</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.certificate_type === 'top_n' && (
              <div className="grid gap-2">
                <Label htmlFor="certificate_top_n">Top N</Label>
                <Input
                  id="certificate_top_n"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.certificate_top_n}
                  onChange={(e) => setFormData({ ...formData, certificate_top_n: parseInt(e.target.value) })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Initial Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v: TournamentStatus) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft (Hidden)</SelectItem>
              <SelectItem value="upcoming">Upcoming (Public)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isLoading || !formData.name || !formData.start_date}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Tournament
        </Button>
      </DialogFooter>
    </form>
  );
}


