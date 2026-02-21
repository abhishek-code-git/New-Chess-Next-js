"use client";

import React from 'react';
import AdSlot from '@/components/AdSlot';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Crown, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  username: string | null;
  total_games: number;
  wins: number;
  points: number;
  win_rate: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, total_games, wins, points')
        .gt('total_games', 0)
        .order('points', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        win_rate: entry.total_games > 0 
          ? Math.round((entry.wins / entry.total_games) * 100) 
          : 0
      })) as LeaderboardEntry[];
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-300" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-muted-foreground w-6 text-center">{rank}</span>;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-400/10 border-gray-400/30';
    if (rank === 3) return 'bg-amber-600/10 border-amber-600/30';
    return '';
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Chess Leaderboard - Top Players Rankings"
        description="See the top chess players on ChessMaster. Compete, win games, earn points, and climb the rankings to become the best!"
        canonical="https://chessmaster.app/leaderboard"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-slide-up">
            <Trophy className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl mb-2">
              <span className="text-gradient-gold">Leaderboard</span>
            </h1>
            <p className="text-muted-foreground">
              Top players ranked by points
            </p>
          </div>

          {/* Leaderboard */}
          <Card className="glass-card overflow-hidden">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">Games</div>
              <div className="col-span-2 text-center">Win Rate</div>
              <div className="col-span-2 text-right">Points</div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && (!leaderboard || leaderboard.length === 0) && (
              <div className="p-12 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No players on the leaderboard yet.</p>
                <p className="text-sm">Be the first to play and earn points!</p>
              </div>
            )}

            {/* Leaderboard Rows */}
            {leaderboard?.map((entry) => (
              <div 
                key={entry.id}
                className={cn(
                  'grid grid-cols-12 gap-2 p-4 items-center border-b border-border/50 last:border-0 transition-colors hover:bg-muted/30',
                  getRankStyle(entry.rank)
                )}
              >
                <div className="col-span-1 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-5 font-medium truncate">
                  {entry.username || 'Anonymous'}
                </div>
                <div className="col-span-2 text-center text-muted-foreground">
                  {entry.total_games}
                </div>
                <div className="col-span-2 text-center">
                  <span className={cn(
                    'px-2 py-1 rounded text-sm',
                    entry.win_rate >= 60 ? 'bg-green-500/20 text-green-400' :
                    entry.win_rate >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  )}>
                    {entry.win_rate}%
                  </span>
                </div>
                <div className="col-span-2 text-right font-heading text-primary">
                  {entry.points.toLocaleString()}
                </div>
              </div>
            ))}
          </Card>
        </div>
        <AdSlot className="mt-6" />
      </div>
    </div>
  );
};

export default Leaderboard;


