"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Trophy, Calendar, Users, Clock, ChevronRight, Crown, Zap, Timer, Coins } from "lucide-react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useTournaments } from "@/hooks/useTournament";
import type { TournamentStatus, Tournament } from "@/types/tournament";
import { useAuth } from "@/hooks/useAuth";
import { useAutoStartTournaments } from "@/hooks/useAutoStartTournaments";

const statusColors: Record<TournamentStatus, string> = {
  draft: "bg-gray-500",
  upcoming: "bg-blue-500",
  active: "bg-green-500",
  paused: "bg-yellow-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
};

const TournamentCard = ({ tournament }: { tournament: Tournament }) => {
  const startDate = new Date(tournament.start_date);
  const isUpcoming = tournament.status === 'upcoming';
  const isArena = tournament.tournament_type === 'arena';
  const isPaidEntry = tournament.entry_type === 'paid';
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {isArena ? (
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            ) : (
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            )}
            <CardTitle className="text-sm sm:text-lg truncate">{tournament.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[10px] sm:text-xs capitalize">
              {tournament.tournament_type || 'swiss'}
            </Badge>
            <Badge className={`${statusColors[tournament.status]} text-white text-[10px] sm:text-xs flex-shrink-0`}>
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </Badge>
          </div>
        </div>
        {tournament.description && (
          <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
            {tournament.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{format(startDate, "MMM d, h:mm a")}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{tournament.time_control}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>Max {tournament.max_players}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isArena ? (
              <>
                <Timer className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{tournament.duration_minutes || 60} min</span>
              </>
            ) : (
              <>
                <Crown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{tournament.total_rounds} rounds</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <Badge variant={isPaidEntry ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
            {isPaidEntry ? (
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" />
                {tournament.required_points} pts
              </span>
            ) : 'Free'}
          </Badge>
          <Link href={`/tournaments/${tournament.id}`}>
            <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3">
              {isUpcoming ? 'Join' : 'View'}
              <ChevronRight className="ml-0.5 sm:ml-1 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

const TournamentSkeleton = () => (
  <Card>
    <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
        <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
      </div>
      <Skeleton className="h-4 w-full mt-2" />
    </CardHeader>
    <CardContent className="p-3 sm:p-4 pt-0">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <Skeleton className="h-4 w-24 sm:w-28" />
        <Skeleton className="h-4 w-16 sm:w-20" />
        <Skeleton className="h-4 w-20 sm:w-24" />
        <Skeleton className="h-4 w-14 sm:w-16" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-5 w-12 sm:w-16" />
        <Skeleton className="h-7 sm:h-8 w-16 sm:w-24" />
      </div>
    </CardContent>
  </Card>
);

export default function Tournaments({
  initialTournaments,
}: {
  initialTournaments?: Tournament[];
}) {
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const { user } = useAuth();
  useAutoStartTournaments();
  const statusMap: Record<string, TournamentStatus | TournamentStatus[]> = {
    upcoming: 'upcoming',
    active: 'active',
    completed: 'completed',
    all: ['upcoming', 'active', 'completed', 'paused'],
  };

  const { data: tournaments, isLoading } = useTournaments(statusMap[activeTab], {
    initialData: activeTab === "upcoming" ? initialTournaments : undefined,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Chess Tournaments"
        description="Join competitive chess tournaments, earn points, and win certificates. Swiss and Arena formats available."
      />
      <Navbar />
      
      <main className="container mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-primary" />
              Chess Tournaments
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1">
              Compete in Swiss & Arena formats • Earn certificates
            </p>
          </div>
          {!user && (
            <Link href="/auth">
              <Button size="sm" className="w-full sm:w-auto">Sign in to Join</Button>
            </Link>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-9 sm:h-10">
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm px-1 sm:px-3">Upcoming</TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm px-1 sm:px-3">Active</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm px-1 sm:px-3">Done</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm px-1 sm:px-3">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <TournamentSkeleton key={i} />
                ))}
              </div>
            ) : tournaments && tournaments.length > 0 ? (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            ) : (
              <Card className="p-6 sm:p-12 text-center">
                <Trophy className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">No Tournaments</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  {activeTab === 'upcoming' 
                    ? 'Check back later for upcoming tournaments!'
                    : `No ${activeTab} tournaments available.`}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


