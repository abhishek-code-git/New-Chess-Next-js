"use client";

import { useState, useEffect } from "react";
import { Trophy, Play, Timer, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Tournament } from "@/types/tournament";
import { useArenaLeaderboard, useMyRegistration, useMyCurrentMatch } from "@/hooks/useTournamentQueries";
import { useRequestArenaMatch } from "@/hooks/useTournamentMutations";

interface ArenaLobbyProps {
  tournament: Tournament;
}

export function ArenaLobby({ tournament }: ArenaLobbyProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isArenaEnded, setIsArenaEnded] = useState(false);
  
  const { data: leaderboard, refetch: refetchLeaderboard } = useArenaLeaderboard(tournament.id);
  const { data: myRegistration } = useMyRegistration(tournament.id);
  const { data: myCurrentMatch } = useMyCurrentMatch(tournament.id);
  const requestMatchMutation = useRequestArenaMatch();

  // Calculate remaining time
  useEffect(() => {
    if (!tournament.duration_minutes) return;
    
    const startTime = new Date(tournament.start_date).getTime();
    const endTime = startTime + tournament.duration_minutes * 60 * 1000;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setIsArenaEnded(true);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [tournament.start_date, tournament.duration_minutes]);

  // Real-time leaderboard subscription
  useEffect(() => {
    const channel = supabase
      .channel(`arena-${tournament.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tournament_registrations',
        filter: `tournament_id=eq.${tournament.id}`,
      }, () => {
        refetchLeaderboard();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournament.id, refetchLeaderboard]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = timeRemaining !== null && tournament.duration_minutes 
    ? ((tournament.duration_minutes * 60 * 1000 - timeRemaining) / (tournament.duration_minutes * 60 * 1000)) * 100
    : 0;

  const canRequestMatch = myRegistration && !myCurrentMatch && !isArenaEnded;

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-medium">Time Remaining</span>
            </div>
            <Badge variant={isArenaEnded ? 'destructive' : 'default'} className="text-lg px-4 py-1">
              {isArenaEnded ? 'Tournament Ended' : timeRemaining !== null ? formatTime(timeRemaining) : '--:--'}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Action Card */}
      {myRegistration && (
        <Card>
          <CardContent className="p-6 text-center">
            {myCurrentMatch ? (
              <div className="space-y-2">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  🎮 In Game
                </Badge>
                <p className="text-muted-foreground">Your match is in progress</p>
              </div>
            ) : isArenaEnded ? (
              <div className="space-y-2">
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
                <h3 className="text-xl font-bold">Arena Complete!</h3>
                <p className="text-muted-foreground">Check your final ranking below</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Zap className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold">Ready for Battle?</h3>
                <Button 
                  size="lg" 
                  onClick={() => requestMatchMutation.mutate(tournament.id)}
                  disabled={requestMatchMutation.isPending || !canRequestMatch}
                >
                  {requestMatchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Play className="mr-2 h-4 w-4" />
                  Find Opponent
                </Button>
                <p className="text-sm text-muted-foreground">
                  Play as many games as you can. Win = 2 pts, Draw = 1 pt
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* My Stats */}
      {myRegistration && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{myRegistration.arena_score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{myRegistration.wins}</div>
                <div className="text-xs text-muted-foreground">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{myRegistration.draws}</div>
                <div className="text-xs text-muted-foreground">Draws</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{myRegistration.losses}</div>
                <div className="text-xs text-muted-foreground">Losses</div>
              </div>
            </div>
            {myRegistration.current_streak > 0 && (
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="text-sm">
                  🔥 {myRegistration.current_streak} Win Streak!
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Leaderboard */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Live Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard && leaderboard.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Games</TableHead>
                  <TableHead className="text-center">W/D/L</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((player, index) => (
                  <TableRow 
                    key={player.id}
                    className={player.id === myRegistration?.id ? 'bg-primary/5' : ''}
                  >
                    <TableCell className="font-bold">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={player.profiles?.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {player.profiles?.username?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">
                          {player.profiles?.username || `Player ${player.player_number}`}
                        </span>
                        {player.current_streak >= 3 && (
                          <Badge variant="outline" className="text-xs">🔥{player.current_streak}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{player.games_played}</TableCell>
                    <TableCell className="text-center text-sm">
                      {player.wins}/{player.draws}/{player.losses}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {player.arena_score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No players yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


