"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  Trophy, Plus, Settings, Play, Pause, 
  Award, Loader2, XCircle, RefreshCw 
} from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  useTournaments, 
  useTournamentRegistrations, 
  useIsAdmin, 
} from "@/hooks/useTournament";
import type { Tournament } from "@/types/tournament";
import { 
  useCreateTournament, 
  useUpdateTournament, 
  useStartTournament,
  useAdvanceRound,
  useDisqualifyPlayer,
  useGenerateCertificates,
  usePauseTournament,
  useResumeTournament,
  useCancelTournament,
} from "@/hooks/useTournamentMutations";
import { CreateTournamentForm } from "@/components/tournament/CreateTournamentForm";
import { useAuth } from "@/hooks/useAuth";

export default function AdminTournaments() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: tournaments, isLoading } = useTournaments();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();
  const startMutation = useStartTournament();
  const advanceMutation = useAdvanceRound();
  const certificatesMutation = useGenerateCertificates();
  const pauseMutation = usePauseTournament();
  const resumeMutation = useResumeTournament();
  const cancelMutation = useCancelTournament();

  useEffect(() => {
    if (!adminLoading && (!user || !isAdmin)) {
      router.replace("/tournaments");
    }
  }, [adminLoading, user, isAdmin, router]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Tournament Administration" />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Tournament Admin
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage chess tournaments
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Tournament
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <CreateTournamentForm 
                onSubmit={async (data) => {
                  await createMutation.mutateAsync(data);
                  setCreateOpen(false);
                }} 
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tournaments</TabsTrigger>
            <TabsTrigger value="manage">Manage Active</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Tournaments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : tournaments && tournaments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Players</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tournaments.map((t) => (
                        <TournamentRow 
                          key={t.id} 
                          tournament={t}
                          onSelect={() => setSelectedTournament(t)}
                          onStart={() => startMutation.mutate({ 
                            tournamentId: t.id, 
                            tournamentType: t.tournament_type || 'swiss' 
                          })}
                          onAdvance={() => advanceMutation.mutate({ 
                            tournamentId: t.id, 
                            currentRound: t.current_round || 0 
                          })}
                          onGenerateCerts={() => certificatesMutation.mutate(t.id)}
                          onPublish={() => updateMutation.mutate({ id: t.id, status: 'upcoming' })}
                          onPause={() => pauseMutation.mutate(t.id)}
                          onResume={() => resumeMutation.mutate(t.id)}
                          onCancel={() => cancelMutation.mutate(t.id)}
                          isStarting={startMutation.isPending}
                          isAdvancing={advanceMutation.isPending}
                        />
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No tournaments created yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            {selectedTournament ? (
              <TournamentManagement 
                tournament={selectedTournament}
                onBack={() => setSelectedTournament(null)}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Select a tournament from the list to manage it
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function TournamentRow({ 
  tournament, 
  onSelect,
  onStart,
  onAdvance,
  onGenerateCerts,
  onPublish,
  onPause,
  onResume,
  onCancel,
  isStarting,
  isAdvancing,
}: { 
  tournament: Tournament;
  onSelect: () => void;
  onStart: () => void;
  onAdvance: () => void;
  onGenerateCerts: () => void;
  onPublish: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  isStarting: boolean;
  isAdvancing: boolean;
}) {
  const { data: registrations } = useTournamentRegistrations(tournament.id);
  const playerCount = registrations?.length || 0;
  const isArena = tournament.tournament_type === 'arena';

  return (
    <TableRow>
      <TableCell className="font-medium">{tournament.name}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {tournament.tournament_type || 'swiss'}
        </Badge>
      </TableCell>
      <TableCell>{format(new Date(tournament.start_date), "MMM d, yyyy h:mm a")}</TableCell>
      <TableCell>{playerCount} / {tournament.max_players}</TableCell>
      <TableCell>
        <Badge variant={
          tournament.status === 'active' ? 'default' :
          tournament.status === 'paused' ? 'secondary' :
          tournament.status === 'completed' ? 'secondary' :
          'outline'
        }>
          {tournament.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 flex-wrap">
          {tournament.status === 'draft' && (
            <Button size="sm" variant="outline" onClick={onPublish}>
              Publish
            </Button>
          )}
          {tournament.status === 'upcoming' && playerCount >= 2 && (
            <Button size="sm" onClick={onStart} disabled={isStarting}>
              {isStarting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              <Play className="mr-1 h-3 w-3" />
              Start
            </Button>
          )}
          {tournament.status === 'active' && !isArena && (
            <Button size="sm" onClick={onAdvance} disabled={isAdvancing}>
              {isAdvancing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Next Round
            </Button>
          )}
          {tournament.status === 'active' && (
            <Button size="sm" variant="secondary" onClick={onPause}>
              <Pause className="mr-1 h-3 w-3" />
              Pause
            </Button>
          )}
          {tournament.status === 'paused' && (
            <Button size="sm" variant="secondary" onClick={onResume}>
              <RefreshCw className="mr-1 h-3 w-3" />
              Resume
            </Button>
          )}
          {tournament.status === 'completed' && (
            <Button size="sm" variant="outline" onClick={onGenerateCerts}>
              <Award className="mr-1 h-3 w-3" />
              Certificates
            </Button>
          )}
          {['draft', 'upcoming', 'paused'].includes(tournament.status) && (
            <Button size="sm" variant="destructive" onClick={onCancel}>
              <XCircle className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onSelect}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TournamentManagement({ 
  tournament, 
  onBack 
}: { 
  tournament: Tournament;
  onBack: () => void;
}) {
  const { data: registrations } = useTournamentRegistrations(tournament.id);
  const disqualifyMutation = useDisqualifyPlayer();
  const [dqPlayer, setDqPlayer] = useState<string | null>(null);
  const [dqReason, setDqReason] = useState('');

  const handleDisqualify = async () => {
    if (!dqPlayer || !dqReason) return;
    await disqualifyMutation.mutateAsync({ registrationId: dqPlayer, reason: dqReason });
    setDqPlayer(null);
    setDqReason('');
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}>
        ← Back to list
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {tournament.name} - Player Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {tournament.tournament_type || 'swiss'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Entry:</span>
                <Badge variant={tournament.entry_type === 'free' ? 'secondary' : 'default'} className="ml-2">
                  {tournament.entry_type === 'free' ? 'Free' : `${tournament.required_points} pts`}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <Badge className="ml-2">{tournament.status}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Round:</span>
                <span className="ml-2 font-medium">
                  {tournament.current_round || 0} / {tournament.total_rounds}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Auto-Start:</span>
                <Badge variant={tournament.auto_start ? 'default' : 'secondary'} className="ml-2">
                  {tournament.auto_start ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Win Reward:</span>
                <span className="ml-2 font-medium">
                  +{tournament.win_points_bonus || 0} pts
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Draw Reward:</span>
                <span className="ml-2 font-medium">
                  +{tournament.draw_points_bonus || 0} pts
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Certificate:</span>
                <span className="ml-2 font-medium capitalize">
                  {tournament.certificate_type}
                </span>
              </div>
            </div>
            {tournament.prize_description && (
              <div className="mt-3 p-2 bg-amber-500/10 rounded text-sm">
                <span className="text-muted-foreground">Prize: </span>
                <span>{tournament.prize_description}</span>
              </div>
            )}
          </div>

          {registrations && registrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Arena Score</TableHead>
                  <TableHead>Games</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell>{reg.player_number}</TableCell>
                    <TableCell>{reg.profiles?.username || 'Unknown'}</TableCell>
                    <TableCell>{reg.points}</TableCell>
                    <TableCell>{reg.arena_score}</TableCell>
                    <TableCell>{reg.games_played}</TableCell>
                    <TableCell>
                      {reg.is_disqualified ? (
                        <Badge variant="destructive">DQ: {reg.disqualification_reason}</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!reg.is_disqualified && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => setDqPlayer(reg.id)}
                            >
                              Disqualify
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Disqualify Player</DialogTitle>
                              <DialogDescription>
                                Provide a reason for disqualification
                              </DialogDescription>
                            </DialogHeader>
                            <Input
                              placeholder="Reason (e.g., No-show, Cheating)"
                              value={dqReason}
                              onChange={(e) => setDqReason(e.target.value)}
                            />
                            <DialogFooter>
                              <Button 
                                variant="destructive" 
                                onClick={handleDisqualify}
                                disabled={!dqReason}
                              >
                                Confirm Disqualification
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No players registered
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


