"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Coins,
  Crown,
  Swords,
  Wallet,
  Award,
  Download
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface UserCertificate {
  id: string;
  certificate_id: string;
  tournament_name: string;
  rank: number | null;
  certificate_type: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  const { data: myCertificates } = useQuery({
    queryKey: ['my-certificates', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('issued_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const winRate = profile.total_games > 0 
    ? ((profile.wins / profile.total_games) * 100).toFixed(1)
    : '0';

  const stats = [
    { icon: Swords, label: 'Games Played', value: profile.total_games, color: 'text-blue-400' },
    { icon: Trophy, label: 'Wins', value: profile.wins, color: 'text-green-400' },
    { icon: Target, label: 'Losses', value: profile.losses, color: 'text-red-400' },
    { icon: TrendingUp, label: 'Win Rate', value: `${winRate}%`, color: 'text-purple-400' },
  ];

  const getRankLabel = (rank: number | null, type: string) => {
    if (type === 'winner' || rank === 1) return '🥇 1st';
    if (rank === 2) return '🥈 2nd';
    if (rank === 3) return '🥉 3rd';
    if (type === 'participation') return '📜';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Dashboard - Your Chess Statistics & Earnings"
        description="View your chess game statistics, points earned, wallet balance, and quick play options."
        canonical="https://chessmaster.app/dashboard"
      />
      <Navbar />
      <div className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Welcome Card */}
          <Card className="glass-card p-4 sm:p-6 md:p-8 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-primary-foreground" />
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h1 className="font-heading text-xl sm:text-2xl md:text-3xl mb-1">
                  Welcome, <span className="text-gradient-gold truncate">{profile.username || 'Player'}</span>
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Ready to dominate the board?
                </p>
              </div>
              <Button 
                onClick={() => router.push('/play/computer')}
                className="gold-gradient text-primary-foreground w-full sm:w-auto"
              >
                <Swords className="mr-2 h-4 w-4" />
                Play Now
              </Button>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ icon: Icon, label, value, color }) => (
              <Card key={label} className="glass-card p-3 sm:p-4 text-center">
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1.5 sm:mb-2 ${color}`} />
                <div className="font-heading text-xl sm:text-2xl">{value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">{label}</div>
              </Card>
            ))}
          </div>

          {/* Points & Wallet Section */}
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                <div>
                  <h2 className="font-heading text-lg sm:text-xl">Points</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Earn 1000 points = ₹10
                  </p>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-heading text-gradient-gold mb-3 sm:mb-4">
                {profile.points}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 sm:h-3 mb-2">
                <div 
                  className="gold-gradient h-2.5 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(profile.points % 1000) / 10}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {1000 - (profile.points % 1000)} points to next ₹10
              </p>
            </Card>

            <Card className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-green-400 flex-shrink-0" />
                <div>
                  <h2 className="font-heading text-lg sm:text-xl">Wallet</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Your earnings
                  </p>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-heading text-green-400 mb-3 sm:mb-4">
                ₹{Number(profile.wallet_balance).toFixed(2)}
              </div>
              <Button 
                variant="outline" 
                className="w-full h-10 sm:h-auto"
                onClick={() => router.push('/wallet')}
              >
                Manage Wallet
              </Button>
            </Card>
          </div>

          {/* My Certificates */}
          {myCertificates && myCertificates.length > 0 && (
            <Card className="glass-card p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="font-heading text-lg sm:text-xl">My Certificates</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myCertificates.map((cert: UserCertificate) => (
                  <Link 
                    key={cert.id} 
                    href={`/verify/${cert.certificate_id}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="text-2xl">{getRankLabel(cert.rank, cert.certificate_type).split(' ')[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{cert.tournament_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRankLabel(cert.rank, cert.certificate_type)}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      <Download className="h-3 w-3 mr-1" />
                      View
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="glass-card p-4 sm:p-6">
            <h2 className="font-heading text-lg sm:text-xl mb-3 sm:mb-4">Quick Play</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2"
                onClick={() => router.push('/play/computer')}
              >
                <Crown className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">vs Computer</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2"
                onClick={() => router.push('/play/local')}
              >
                <Swords className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Local Game</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 p-2"
                onClick={() => router.push('/leaderboard')}
              >
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm">Leaderboard</span>
              </Button>
            </div>
          </Card>

          {/* Ad slot - between content for time-spent monetization */}
          <div id="ad-slot-sidebar" className="hidden md:flex justify-center items-center min-h-[250px]" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


