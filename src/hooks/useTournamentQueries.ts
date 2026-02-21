import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { 
  Tournament, 
  TournamentRegistration, 
  TournamentRound, 
  TournamentMatch,
  TournamentStatus 
} from "@/types/tournament";

export function useTournaments(status?: TournamentStatus | TournamentStatus[]) {
  return useQuery({
    queryKey: ['tournaments', status],
    queryFn: async () => {
      let query = supabase
        .from('tournaments')
        .select('*')
        .order('start_date', { ascending: true });
      
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Tournament[];
    },
  });
}

export function useTournament(id: string | undefined) {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data as Tournament | null;
    },
    enabled: !!id,
  });
}

export function useTournamentRegistrations(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-registrations', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          *,
          profiles:profile_id (username, avatar_url)
        `)
        .eq('tournament_id', tournamentId)
        .order('points', { ascending: false });
      if (error) throw error;
      return data as TournamentRegistration[];
    },
    enabled: !!tournamentId,
  });
}

export function useTournamentRounds(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-rounds', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      const { data, error } = await supabase
        .from('tournament_rounds')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true });
      if (error) throw error;
      return data as TournamentRound[];
    },
    enabled: !!tournamentId,
  });
}

export function useTournamentMatches(roundId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-matches', roundId],
    queryFn: async () => {
      if (!roundId) return [];
      const { data, error } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          white_player:tournament_registrations!white_player_id (
            id, player_number, points, arena_score,
            profiles:profile_id (username, avatar_url)
          ),
          black_player:tournament_registrations!black_player_id (
            id, player_number, points, arena_score,
            profiles:profile_id (username, avatar_url)
          )
        `)
        .eq('round_id', roundId)
        .order('board_number', { ascending: true });
      if (error) throw error;
      return data as TournamentMatch[];
    },
    enabled: !!roundId,
  });
}

export function useMyRegistration(tournamentId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-registration', tournamentId, user?.id],
    queryFn: async () => {
      if (!tournamentId || !user) return null;
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as TournamentRegistration | null;
    },
    enabled: !!tournamentId && !!user,
  });
}

export function useMyCurrentMatch(tournamentId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-current-match', tournamentId, user?.id],
    queryFn: async () => {
      if (!tournamentId || !user) return null;
      
      // Get my registration
      const { data: registration } = await supabase
        .from('tournament_registrations')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!registration) return null;
      
      // Get current pending/active match
      const { data: match, error } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          white_player:tournament_registrations!white_player_id (
            id, player_number, points, arena_score,
            profiles:profile_id (username, avatar_url)
          ),
          black_player:tournament_registrations!black_player_id (
            id, player_number, points, arena_score,
            profiles:profile_id (username, avatar_url)
          )
        `)
        .eq('tournament_id', tournamentId)
        .or(`white_player_id.eq.${registration.id},black_player_id.eq.${registration.id}`)
        .in('status', ['pending', 'in_progress'])
        .maybeSingle();
      
      if (error) return null;
      return match as TournamentMatch | null;
    },
    enabled: !!tournamentId && !!user,
    refetchInterval: 5000,
  });
}

export function useIsAdmin() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });
}

export function useArenaLeaderboard(tournamentId: string | undefined) {
  return useQuery({
    queryKey: ['arena-leaderboard', tournamentId],
    queryFn: async () => {
      if (!tournamentId) return [];
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select(`
          *,
          profiles:profile_id (username, avatar_url)
        `)
        .eq('tournament_id', tournamentId)
        .eq('is_disqualified', false)
        .order('arena_score', { ascending: false });
      if (error) throw error;
      return data as TournamentRegistration[];
    },
    enabled: !!tournamentId,
    refetchInterval: 3000,
  });
}

export function usePlayerPoints() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['player-points', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.id)
        .single();
      if (error) return 0;
      return data?.points || 0;
    },
    enabled: !!user,
  });
}
