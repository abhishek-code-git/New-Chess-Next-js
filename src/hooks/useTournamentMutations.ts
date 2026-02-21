import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { CreateTournamentData, TournamentRegistration, TournamentType } from "@/types/tournament";

export function useRegisterForTournament() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, points')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      // Get tournament to check entry requirements
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('entry_type, required_points, status, max_players')
        .eq('id', tournamentId)
        .single();
      
      if (tournamentError) throw tournamentError;
      
      if (tournament.status !== 'upcoming') {
        throw new Error('Registration is closed');
      }
      
      // Check points balance for paid entry
      if (tournament.entry_type === 'paid' && tournament.required_points > 0) {
        if ((profile.points || 0) < tournament.required_points) {
          throw new Error(`Insufficient points. Required: ${tournament.required_points}, Available: ${profile.points || 0}`);
        }
      }
      
      // Check if tournament is full
      const { count } = await supabase
        .from('tournament_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('tournament_id', tournamentId);
      
      if (count && count >= tournament.max_players) {
        throw new Error('Tournament is full');
      }
      
      // Get next player number
      const { data: nextNumber, error: numberError } = await supabase
        .rpc('get_next_player_number', { p_tournament_id: tournamentId });
      
      if (numberError) throw numberError;
      
      // Register - points deduction handled by trigger
      const { data, error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          profile_id: profile.id,
          player_number: nextNumber,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['my-registration', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['player-points'] });
      toast.success('Successfully registered for tournament!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to register');
    },
  });
}

export function useCreateTournament() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateTournamentData) => {
      if (!user) throw new Error('Must be logged in');
      
      const { data: result, error } = await supabase
        .from('tournaments')
        .insert({
          ...data,
          created_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      toast.success('Tournament created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create tournament');
    },
  });
}

export function useUpdateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateTournamentData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('tournaments')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
      toast.success('Tournament updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tournament');
    },
  });
}

export function usePauseTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'paused' })
        .eq('id', tournamentId);
      
      if (error) throw error;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      toast.success('Tournament paused');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to pause tournament');
    },
  });
}

export function useResumeTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'active' })
        .eq('id', tournamentId);
      
      if (error) throw error;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      toast.success('Tournament resumed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resume tournament');
    },
  });
}

export function useCancelTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      // Call refund function
      await supabase.rpc('refund_points_on_cancellation', { p_tournament_id: tournamentId });
      
      // Update status
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'cancelled' })
        .eq('id', tournamentId);
      
      if (error) throw error;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['player-points'] });
      toast.success('Tournament cancelled. Points refunded.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel tournament');
    },
  });
}

export function useStartTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, tournamentType }: { tournamentId: string; tournamentType: TournamentType }) => {
      // Update tournament status
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ status: 'active', current_round: 1 })
        .eq('id', tournamentId);
      
      if (updateError) throw updateError;

      if (tournamentType === 'arena') {
        // For arena, create a single round to hold all arena matches
        const { error: arenaRoundError } = await supabase
          .from('tournament_rounds')
          .insert({
            tournament_id: tournamentId,
            round_number: 1,
            status: 'active',
            started_at: new Date().toISOString(),
          });
        
        if (arenaRoundError) throw arenaRoundError;
        return { type: 'arena' };
      }
      
      // Swiss: Create first round with pairings
      const { data: round, error: roundError } = await supabase
        .from('tournament_rounds')
        .insert({
          tournament_id: tournamentId,
          round_number: 1,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (roundError) throw roundError;
      
      // Get registrations for pairing
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('id, player_number, points')
        .eq('tournament_id', tournamentId)
        .eq('is_disqualified', false)
        .order('player_number');
      
      if (regError) throw regError;
      
      // Generate Swiss pairings for round 1 (random for first round)
      const shuffled = [...registrations].sort(() => Math.random() - 0.5);
      const matches = [];
      
      for (let i = 0; i < shuffled.length; i += 2) {
        const white = shuffled[i];
        const black = shuffled[i + 1];
        
        matches.push({
          tournament_id: tournamentId,
          round_id: round.id,
          white_player_id: white?.id || null,
          black_player_id: black?.id || null,
          board_number: Math.floor(i / 2) + 1,
          status: black ? 'pending' : 'completed',
          room_code: `T-${tournamentId.slice(0, 8)}-R1-B${Math.floor(i / 2) + 1}`,
          result: !black ? '1-0' : null,
          white_points: !black ? 1 : null,
          black_points: !black ? 0 : null,
        });
      }
      
      if (matches.length > 0) {
        const { error: matchError } = await supabase
          .from('tournament_matches')
          .insert(matches);
        
        if (matchError) throw matchError;
      }
      
      // Update bye player points if applicable
      for (const match of matches) {
        if (match.result === '1-0' && match.white_player_id) {
          await supabase
            .from('tournament_registrations')
            .update({ points: 1, games_played: 1, wins: 1 })
            .eq('id', match.white_player_id);
        }
      }
      
      return { type: 'swiss', round };
    },
    onSuccess: (_, { tournamentId }) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament-rounds', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations', tournamentId] });
      toast.success('Tournament started!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start tournament');
    },
  });
}

export function useAdvanceRound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, currentRound }: { tournamentId: string; currentRound: number }) => {
      const { data: tournament, error: tournError } = await supabase
        .from('tournaments')
        .select('total_rounds')
        .eq('id', tournamentId)
        .single();
      
      if (tournError) throw tournError;
      
      const nextRound = currentRound + 1;
      
      if (nextRound > tournament.total_rounds) {
        await supabase
          .from('tournaments')
          .update({ status: 'completed' })
          .eq('id', tournamentId);
        
        return { completed: true };
      }
      
      // Complete current round
      const { data: currentRoundData } = await supabase
        .from('tournament_rounds')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('round_number', currentRound)
        .single();
      
      if (currentRoundData) {
        await supabase
          .from('tournament_rounds')
          .update({ status: 'completed', ended_at: new Date().toISOString() })
          .eq('id', currentRoundData.id);
      }
      
      await supabase
        .from('tournaments')
        .update({ current_round: nextRound })
        .eq('id', tournamentId);
      
      const { data: newRound, error: roundError } = await supabase
        .from('tournament_rounds')
        .insert({
          tournament_id: tournamentId,
          round_number: nextRound,
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (roundError) throw roundError;
      
      // Get standings for Swiss pairing
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('id, player_number, points, wins, games_played')
        .eq('tournament_id', tournamentId)
        .eq('is_disqualified', false)
        .order('points', { ascending: false });
      
      if (regError) throw regError;
      
      // Get previous matches to avoid repeat pairings
      const { data: previousMatches } = await supabase
        .from('tournament_matches')
        .select('white_player_id, black_player_id')
        .eq('tournament_id', tournamentId);
      
      const previousPairings = new Set(
        (previousMatches || []).map(m => 
          [m.white_player_id, m.black_player_id].sort().join('-')
        )
      );
      
      // Swiss pairing
      const paired = new Set<string>();
      const matches = [];
      let boardNumber = 1;
      
      for (let i = 0; i < registrations.length; i++) {
        const player = registrations[i];
        if (paired.has(player.id)) continue;
        
        let opponent = null;
        for (let j = i + 1; j < registrations.length; j++) {
          const candidate = registrations[j];
          if (paired.has(candidate.id)) continue;
          
          const pairingKey = [player.id, candidate.id].sort().join('-');
          if (!previousPairings.has(pairingKey)) {
            opponent = candidate;
            break;
          }
        }
        
        if (!opponent) {
          for (let j = i + 1; j < registrations.length; j++) {
            const candidate = registrations[j];
            if (!paired.has(candidate.id)) {
              opponent = candidate;
              break;
            }
          }
        }
        
        paired.add(player.id);
        
        if (opponent) {
          paired.add(opponent.id);
          
          const whitePlayer = nextRound % 2 === 0 ? opponent : player;
          const blackPlayer = nextRound % 2 === 0 ? player : opponent;
          
          matches.push({
            tournament_id: tournamentId,
            round_id: newRound.id,
            white_player_id: whitePlayer.id,
            black_player_id: blackPlayer.id,
            board_number: boardNumber++,
            status: 'pending',
            room_code: `T-${tournamentId.slice(0, 8)}-R${nextRound}-B${boardNumber - 1}`,
          });
        } else {
          // Bye
          matches.push({
            tournament_id: tournamentId,
            round_id: newRound.id,
            white_player_id: player.id,
            black_player_id: null,
            board_number: boardNumber++,
            status: 'completed',
            room_code: `T-${tournamentId.slice(0, 8)}-R${nextRound}-B${boardNumber - 1}`,
            result: '1-0',
            white_points: 1,
            black_points: 0,
          });
          
          await supabase
            .from('tournament_registrations')
            .update({
              points: (player.points || 0) + 1,
              games_played: (player.games_played || 0) + 1,
              wins: (player.wins || 0) + 1,
            })
            .eq('id', player.id);
        }
      }
      
      if (matches.length > 0) {
        const { error: matchError } = await supabase
          .from('tournament_matches')
          .insert(matches);
        
        if (matchError) throw matchError;
      }
      
      return { completed: false, round: newRound };
    },
    onSuccess: (result, { tournamentId }) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament-rounds', tournamentId] });
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations', tournamentId] });
      
      if (result.completed) {
        toast.success('Tournament completed!');
      } else {
        toast.success(`Round ${result.round?.round_number} started!`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to advance round');
    },
  });
}

export function useDisqualifyPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, reason }: { registrationId: string; reason: string }) => {
      const { error } = await supabase
        .from('tournament_registrations')
        .update({ 
          is_disqualified: true,
          disqualification_reason: reason,
        })
        .eq('id', registrationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
      toast.success('Player disqualified');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to disqualify player');
    },
  });
}

export function useForfeitMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, forfeitPlayerId, reason }: { matchId: string; forfeitPlayerId: string; reason: string }) => {
      // Get match details
      const { data: match, error: matchError } = await supabase
        .from('tournament_matches')
        .select('white_player_id, black_player_id')
        .eq('id', matchId)
        .single();
      
      if (matchError) throw matchError;
      
      const isWhiteForfeit = match.white_player_id === forfeitPlayerId;
      const result = isWhiteForfeit ? '0-1' : '1-0';
      
      const { error } = await supabase
        .from('tournament_matches')
        .update({
          status: 'completed',
          result,
          white_points: isWhiteForfeit ? 0 : 1,
          black_points: isWhiteForfeit ? 1 : 0,
          forfeit_by: forfeitPlayerId,
          forfeit_reason: reason,
          ended_at: new Date().toISOString(),
        })
        .eq('id', matchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament-matches'] });
      queryClient.invalidateQueries({ queryKey: ['my-current-match'] });
      toast.success('Match forfeited');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to forfeit match');
    },
  });
}

export function useGenerateCertificates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { data: tournament, error: tournError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (tournError) throw tournError;
      
      const isArena = tournament.tournament_type === 'arena';
      const orderBy = isArena ? 'arena_score' : 'points';
      
      const { data: standings, error: standError } = await supabase
        .from('tournament_registrations')
        .select(`
          *,
          profiles:profile_id (username)
        `)
        .eq('tournament_id', tournamentId)
        .eq('is_disqualified', false)
        .order(orderBy, { ascending: false })
        .order('buchholz', { ascending: false });
      
      if (standError) throw standError;
      
      const certificates = [];
      const topN = tournament.certificate_top_n || 3;
      
      for (let i = 0; i < standings.length; i++) {
        const player = standings[i] as TournamentRegistration & {
          profiles?: { username: string | null };
        };
        const rank = i + 1;
        
        let shouldGenerate = false;
        let certType: 'participation' | 'winner' | 'top_n' = 'participation';
        
        if (tournament.certificate_type === 'winner' && rank === 1) {
          shouldGenerate = true;
          certType = 'winner';
        } else if (tournament.certificate_type === 'top_n' && rank <= topN) {
          shouldGenerate = true;
          certType = rank === 1 ? 'winner' : 'top_n';
        } else if (tournament.certificate_type === 'participation') {
          shouldGenerate = true;
          certType = rank === 1 ? 'winner' : 'participation';
        }
        
        if (shouldGenerate) {
          certificates.push({
            certificate_id: `CERT-${tournamentId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${rank}`,
            tournament_id: tournamentId,
            user_id: player.user_id,
            profile_id: player.profile_id,
            player_name: player.profiles?.username || 'Unknown Player',
            tournament_name: tournament.name,
            rank,
            certificate_type: certType,
          });
        }
      }
      
      if (certificates.length > 0) {
        const { error: certError } = await supabase
          .from('certificates')
          .insert(certificates);
        
        if (certError) throw certError;
      }
      
      return certificates.length;
    },
    onSuccess: (count, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['certificates', tournamentId] });
      toast.success(`Generated ${count} certificates!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to generate certificates');
    },
  });
}

export function useRequestArenaMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      // Get my registration
      const { data: myReg, error: regError } = await supabase
        .from('tournament_registrations')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .single();
      
      if (regError) throw regError;
      
      // Find available opponent using the database function
      const { data: opponentId, error: findError } = await supabase
        .rpc('find_arena_opponent', {
          p_tournament_id: tournamentId,
          p_player_registration_id: myReg.id,
        });
      
      if (findError) throw findError;
      
      if (!opponentId) {
        throw new Error('No opponents available. Please wait...');
      }
      
      // Get the arena round (created when tournament starts)
      const { data: arenaRound, error: roundError } = await supabase
        .from('tournament_rounds')
        .select('id')
        .eq('tournament_id', tournamentId)
        .eq('round_number', 1)
        .single();
      
      if (roundError) throw new Error('Arena round not found. Tournament may not have started properly.');
      
      // Create match
      const { data: match, error: matchError } = await supabase
        .from('tournament_matches')
        .insert({
          tournament_id: tournamentId,
          round_id: arenaRound.id,
          white_player_id: myReg.id,
          black_player_id: opponentId,
          board_number: Date.now() % 100000,
          status: 'pending',
          room_code: `ARENA-${tournamentId.slice(0, 8)}-${Date.now()}`,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (matchError) throw matchError;
      
      return match;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ['my-current-match', tournamentId] });
      toast.success('Match found!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
