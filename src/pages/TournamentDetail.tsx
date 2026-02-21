"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { format } from "date-fns";
import { Trophy, Calendar, Users, Clock, Crown, Award, ArrowLeft, Loader2, Zap, Timer } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  useTournament,
  useTournamentRegistrations,
  useTournamentRounds,
  useTournamentMatches,
  useMyRegistration,
  useMyCurrentMatch,
  usePlayerPoints,
} from "@/hooks/useTournament";
import { useRegisterForTournament } from "@/hooks/useTournamentMutations";
import type { Tournament, TournamentRegistration, TournamentRound } from "@/types/tournament";
import { useAuth } from "@/hooks/useAuth";
import TournamentMatchView from "@/components/TournamentMatchView";
import { ArenaLobby } from "@/components/tournament/ArenaLobby";
import { ArenaMatchView } from "@/components/tournament/ArenaMatchView";
import { TournamentCountdown } from "@/components/tournament/TournamentCountdown";

export default function TournamentDetail({
  initialTournament,
  initialRegistrations,
  initialRounds,
}: {
  initialTournament?: Tournament | null;
  initialRegistrations?: TournamentRegistration[];
  initialRounds?: TournamentRound[];
}) {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { user } = useAuth();
  
  const { data: tournament, isLoading: tournamentLoading } = useTournament(id, {
    initialData: initialTournament ?? null,
  });
  const { data: registrations, isLoading: regsLoading } = useTournamentRegistrations(id, {
    initialData: initialRegistrations ?? [],
  });
  const { data: rounds } = useTournamentRounds(id, {
    initialData: initialRounds ?? [],
  });
  const { data: myRegistration } = useMyRegistration(id);
  const { data: myCurrentMatch, refetch: refetchMatch } = useMyCurrentMatch(id);
  const { data: playerPoints } = usePlayerPoints();
  const registerMutation = useRegisterForTournament();

  // Real-time subscription for tournament updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`tournament-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${id}`,
      }, () => {
        refetchMatch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, refetchMatch]);

  if (tournamentLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 text-center">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tournament Not Found</h1>
          <Link href="/tournaments">
            <Button>Back to Tournaments</Button>
          </Link>
        </main>
      </div>
    );
  }

  const isArena = tournament.tournament_type === 'arena';
  const canRegister = tournament.status === 'upcoming' && user && !myRegistration;
  const isRegistered = !!myRegistration;
  const isActive = tournament.status === 'active';
  const registeredCount = registrations?.length || 0;
  const isFull = registeredCount >= tournament.max_players;
  const isPaidEntry = tournament.entry_type === 'paid';
  const hasEnoughPoints = !isPaidEntry || (playerPoints || 0) >= (tournament.required_points || 0);

  // If arena tournament is active and player is registered, show arena lobby or match
  if (isArena && isActive && myRegistration) {
    if (myCurrentMatch && myCurrentMatch.status !== 'completed') {
      return (
        <div className="min-h-screen bg-background">
          <SEO title={`${tournament.name} - Arena Match`} />
          <Navbar />
          <ArenaMatchView 
            match={myCurrentMatch} 
            tournament={tournament}
            myRegistration={myRegistration}
          />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${tournament.name} - Arena`} />
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Link href="/tournaments" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <Badge className="bg-green-500 text-white">Live Arena</Badge>
          </div>
          
          <ArenaLobby tournament={tournament} />
        </main>
      </div>
    );
  }

  // If player has an active match in Swiss tournament, show match view
  if (!isArena && isActive && myCurrentMatch && myCurrentMatch.status !== 'completed') {
    return (
      <div className="min-h-screen bg-background">
        <SEO title={`${tournament.name} - Playing`} />
        <Navbar />
        <TournamentMatchView 
          match={myCurrentMatch} 
          tournament={tournament}
          myRegistrationId={myRegistration?.id || ''}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={tournament.name} description={tournament.description || undefined} />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Link href="/tournaments" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {isArena ? (
                    <Zap className="h-6 w-6 text-primary" />
                  ) : (
                    <Trophy className="h-6 w-6 text-primary" />
                  )}
                  <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                </div>
                {tournament.description && (
                  <CardDescription className="text-base">
                    {tournament.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="capitalize">
                  {tournament.tournament_type || 'swiss'}
                </Badge>
                <Badge variant={tournament.entry_type === 'free' ? 'secondary' : 'default'}>
                  {tournament.entry_type === 'free' ? 'Free Entry' : `${tournament.required_points} Points`}
                </Badge>
                <Badge className={`${
                  tournament.status === 'upcoming' ? 'bg-blue-500' :
                  tournament.status === 'active' ? 'bg-green-500' :
                  tournament.status === 'completed' ? 'bg-purple-500' :
                  tournament.status === 'paused' ? 'bg-yellow-500' :
                  'bg-gray-500'
                } text-white`}>
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Starts</p>
                  <p className="font-medium">{format(new Date(tournament.start_date), "MMM d, h:mm a")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Control</p>
                  <p className="font-medium">{tournament.time_control}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isArena ? (
                  <Timer className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Crown className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm text-muted-foreground">{isArena ? 'Duration' : 'Rounds'}</p>
                  <p className="font-medium">
                    {isArena ? `${tournament.duration_minutes} min` : tournament.total_rounds}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Players</p>
                  <p className="font-medium">{registeredCount} / {tournament.max_players}</p>
                </div>
              </div>
            </div>

            {tournament.status === 'upcoming' && (
              <TournamentCountdown startDate={tournament.start_date} autoStart={tournament.auto_start} />
            )}

            <div className="flex items-center gap-3 flex-wrap">
              {canRegister && !isFull && hasEnoughPoints && (
                <Button 
                  onClick={() => registerMutation.mutate(tournament.id)}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Now
                  {isPaidEntry && (
                    <span className="ml-2 text-xs opacity-80">
                      ({tournament.required_points} pts)
                    </span>
                  )}
                </Button>
              )}
              {canRegister && !isFull && !hasEnoughPoints && (
                <div className="flex items-center gap-2">
                  <Button disabled>Insufficient Points</Button>
                  <span className="text-sm text-muted-foreground">
                    Need {tournament.required_points} pts (You have {playerPoints || 0})
                  </span>
                </div>
              )}
              {canRegister && isFull && (
                <Button disabled>Tournament Full</Button>
              )}
              {isRegistered && tournament.status === 'upcoming' && (
                <Badge variant="outline" className="py-2 px-4">
                  ✓ Registered (Player #{myRegistration?.player_number})
                </Badge>
              )}
              {isActive && myRegistration && (
                <Badge variant="default" className="py-2 px-4 bg-green-500">
                  🎮 Tournament in Progress{!isArena && ` - Round ${tournament.current_round}`}
                </Badge>
              )}
              {!user && tournament.status === 'upcoming' && (
                <Link href="/auth">
                  <Button>Sign in to Register</Button>
                </Link>
              )}
            </div>

            {/* Rewards Info */}
            {((tournament.win_points_bonus && tournament.win_points_bonus > 0) || tournament.prize_description) && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                  🏆 Rewards
                </h4>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {tournament.win_points_bonus && tournament.win_points_bonus > 0 && (
                    <span>Win: <strong className="text-foreground">+{tournament.win_points_bonus} pts</strong></span>
                  )}
                  {tournament.draw_points_bonus && tournament.draw_points_bonus > 0 && (
                    <span>Draw: <strong className="text-foreground">+{tournament.draw_points_bonus} pts</strong></span>
                  )}
                </div>
                {tournament.prize_description && (
                  <p className="text-sm text-muted-foreground mt-1">{tournament.prize_description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="standings">Standings</TabsTrigger>
            {!isArena && <TabsTrigger value="rounds">Rounds</TabsTrigger>}
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="standings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Tournament Standings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {regsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : registrations && registrations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-center">Games</TableHead>
                        <TableHead className="text-center">W/D/L</TableHead>
                        <TableHead className="text-center">{isArena ? 'Arena Score' : 'Points'}</TableHead>
                        {!isArena && <TableHead className="text-center">Buchholz</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registrations
                        .sort((a, b) => {
                          if (isArena) {
                            return (b.arena_score || 0) - (a.arena_score || 0);
                          }
                          return b.points - a.points || b.buchholz - a.buchholz;
                        })
                        .map((reg, index) => (
                          <TableRow 
                            key={reg.id}
                            className={reg.is_disqualified ? 'opacity-50' : ''}
                          >
                            <TableCell className="font-bold">
                              {index === 0 && tournament.status !== 'upcoming' ? '🥇' : 
                               index === 1 && tournament.status !== 'upcoming' ? '🥈' : 
                               index === 2 && tournament.status !== 'upcoming' ? '🥉' : 
                               index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={reg.profiles?.avatar_url || ''} />
                                  <AvatarFallback>
                                    {reg.profiles?.username?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {reg.profiles?.username || `Player ${reg.player_number}`}
                                </span>
                                {reg.is_disqualified && (
                                  <Badge variant="destructive" className="text-xs">DQ</Badge>
                                )}
                                {isArena && reg.current_streak >= 3 && (
                                  <Badge variant="outline" className="text-xs">🔥{reg.current_streak}</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{reg.games_played}</TableCell>
                            <TableCell className="text-center">
                              {reg.wins}/{reg.draws}/{reg.losses}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {isArena ? reg.arena_score : reg.points}
                            </TableCell>
                            {!isArena && (
                              <TableCell className="text-center text-muted-foreground">
                                {reg.buchholz.toFixed(1)}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No players registered yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {!isArena && (
            <TabsContent value="rounds">
              <Card>
                <CardHeader>
                  <CardTitle>Round Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {rounds && rounds.length > 0 ? (
                    <div className="space-y-4">
                      {rounds.map((round) => (
                        <RoundDetails key={round.id} round={round} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Tournament hasn't started yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Format</h4>
                  <p className="text-muted-foreground">
                    {isArena ? (
                      `Arena tournament lasting ${tournament.duration_minutes} minutes. Play as many games as you can - new opponents are matched automatically after each game ends.`
                    ) : (
                      `Swiss-system tournament with ${tournament.total_rounds} rounds. Players are paired based on their current score.`
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Time Control</h4>
                  <p className="text-muted-foreground">{tournament.time_control}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Scoring</h4>
                  <p className="text-muted-foreground">
                    {isArena ? (
                      `Win = 2 points, Draw = 1 point, Loss = 0 points.${tournament.win_streak_bonus ? ' Bonus point for 3+ win streak!' : ''}`
                    ) : (
                      'Win = 1 point, Draw = 0.5 points, Loss = 0 points. Tie-breaks are determined by Buchholz score.'
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Entry</h4>
                  <p className="text-muted-foreground">
                    {tournament.entry_type === 'free' 
                      ? 'Free entry - any registered user can join'
                      : `Points-based entry - requires ${tournament.required_points} points to join. Points are deducted on registration and refunded if tournament is cancelled.`}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Certificates</h4>
                  <p className="text-muted-foreground">
                    {tournament.certificate_type === 'participation' 
                      ? 'All participants receive a certificate'
                      : tournament.certificate_type === 'winner'
                      ? 'Winner receives a certificate'
                      : `Top ${tournament.certificate_top_n} players receive certificates`}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rewards</h4>
                  <div className="text-muted-foreground space-y-1">
                    <p>Win: <strong>+{tournament.win_points_bonus || 0} bonus points</strong></p>
                    <p>Draw: <strong>+{tournament.draw_points_bonus || 0} bonus points</strong></p>
                    {tournament.prize_description && (
                      <p className="mt-2">{tournament.prize_description}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function RoundDetails({ round }: { round: TournamentRound }) {
  const { data: matches, isLoading } = useTournamentMatches(round.id);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Round {round.round_number}</h4>
        <Badge variant={round.status === 'active' ? 'default' : 'secondary'}>
          {round.status}
        </Badge>
      </div>
      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : matches && matches.length > 0 ? (
        <div className="space-y-2">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between text-sm bg-muted/50 rounded p-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-muted-foreground">Board {match.board_number}</span>
                <span className="font-medium">
                  {match.white_player?.profiles?.username || 'BYE'}
                </span>
              </div>
              <div className="px-4 font-bold">
                {match.result || 'vs'}
              </div>
              <div className="flex items-center gap-2 flex-1 justify-end">
                <span className="font-medium">
                  {match.black_player?.profiles?.username || 'BYE'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-sm">No matches</p>
      )}
    </div>
  );
}


