import { useState, useEffect, useCallback } from "react";
import { Chess, type Move } from "chess.js";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tournament, TournamentMatch, TournamentRegistration } from "@/types/tournament";

interface UseTournamentMatchOptions {
  match: TournamentMatch;
  tournament: Tournament;
  myRegistrationId: string;
  scoringMode: 'swiss' | 'arena';
}

export function useTournamentMatch({ match, tournament, myRegistrationId, scoringMode }: UseTournamentMatchOptions) {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<string | null>(match.result);
  const [showGameOver, setShowGameOver] = useState(false);
  const [bonusPointsAwarded, setBonusPointsAwarded] = useState(0);
  const queryClient = useQueryClient();

  const isWhite = match.white_player_id === myRegistrationId;
  const playerColor: 'w' | 'b' = isWhite ? 'w' : 'b';
  const opponentName = isWhite
    ? match.black_player?.profiles?.username || 'Opponent'
    : match.white_player?.profiles?.username || 'Opponent';

  // Load game state from PGN
  useEffect(() => {
    if (match.pgn) {
      const newGame = new Chess();
      try {
        newGame.loadPgn(match.pgn);
        setGame(newGame);
        setMoveHistory(newGame.history());
      } catch (e) {
        console.error('Failed to load PGN:', e);
      }
    }
  }, [match.pgn]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`match-${match.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournament_matches',
        filter: `id=eq.${match.id}`,
      }, (payload) => {
        const updated = payload.new as TournamentMatch;
        if (updated.pgn) {
          const newGame = new Chess();
          try {
            newGame.loadPgn(updated.pgn);
            setGame(newGame);
            setMoveHistory(newGame.history());

            // Notify about check
            if (newGame.inCheck() && !newGame.isCheckmate()) {
              toast.warning('Check! ♚');
            }
          } catch (e) {
            console.error('Failed to load updated PGN:', e);
          }
        }
        if (updated.result && !gameResult) {
          setGameResult(updated.result);
          handleGameOverNotification(updated.result);
          setShowGameOver(true);
          queryClient.invalidateQueries({ queryKey: ['my-current-match'] });
          queryClient.invalidateQueries({ queryKey: ['tournament-registrations'] });
          queryClient.invalidateQueries({ queryKey: ['arena-leaderboard'] });
          if (scoringMode === 'swiss') {
            checkAutoAdvanceRound();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, queryClient, scoringMode, gameResult]);

  // Polling fallback for opponent moves
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('tournament_matches')
        .select('pgn, result, status')
        .eq('id', match.id)
        .single();

      if (data?.pgn && data.pgn !== game.pgn()) {
        const newGame = new Chess();
        try {
          newGame.loadPgn(data.pgn);
          setGame(newGame);
          setMoveHistory(newGame.history());
        } catch (e) {
          console.error('Polling: Failed to load PGN:', e);
        }
      }
      if (data?.result && !gameResult) {
        setGameResult(data.result);
        handleGameOverNotification(data.result);
        setShowGameOver(true);
        queryClient.invalidateQueries({ queryKey: ['my-current-match'] });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [match.id, game, queryClient, gameResult]);

  const handleGameOverNotification = (result: string) => {
    const isPlayerWhite = isWhite;
    if (result === '1-0') {
      toast[isPlayerWhite ? 'success' : 'error'](
        isPlayerWhite ? '🎉 You won the game!' : `${opponentName} wins!`,
        { duration: 5000 }
      );
    } else if (result === '0-1') {
      toast[!isPlayerWhite ? 'success' : 'error'](
        !isPlayerWhite ? '🎉 You won the game!' : `${opponentName} wins!`,
        { duration: 5000 }
      );
    } else {
      toast.info('Game ended in a draw', { duration: 5000 });
    }
  };

  const getPoints = (result: string) => {
    if (scoringMode === 'arena') {
      if (result === '1-0') return { white: 2, black: 0 };
      if (result === '0-1') return { white: 0, black: 2 };
      return { white: 1, black: 1 };
    }
    if (result === '1-0') return { white: 1, black: 0 };
    if (result === '0-1') return { white: 0, black: 1 };
    return { white: 0.5, black: 0.5 };
  };

  const handleMove = useCallback(async (_move: Move) => {
    const updatedGame = new Chess(game.fen());
    updatedGame.loadPgn(game.pgn());
    setGame(updatedGame);
    setMoveHistory(updatedGame.history());

    // Notify check
    if (updatedGame.inCheck() && !updatedGame.isCheckmate()) {
      toast.warning('Check! ♚');
    }

    const pgn = updatedGame.pgn();
    let result: string | null = null;
    let whitePoints: number | null = null;
    let blackPoints: number | null = null;
    let status = 'in_progress';

    if (updatedGame.isGameOver()) {
      status = 'completed';
      if (updatedGame.isCheckmate()) {
        result = updatedGame.turn() === 'w' ? '0-1' : '1-0';
        toast.success('Checkmate! 👑', { duration: 3000 });
      } else {
        result = '1/2-1/2';
      }
      const points = getPoints(result);
      whitePoints = points.white;
      blackPoints = points.black;
    }

    const { error } = await supabase
      .from('tournament_matches')
      .update({
        pgn,
        result,
        white_points: whitePoints,
        black_points: blackPoints,
        status,
        started_at: match.started_at || new Date().toISOString(),
        ended_at: result ? new Date().toISOString() : null,
      })
      .eq('id', match.id);

    if (error) {
      toast.error('Failed to save move');
      return;
    }

    if (result) {
      setGameResult(result);
      await updatePlayerStats(result);
      const bonus = await awardBonusPoints(result);
      setBonusPointsAwarded(bonus);
      setShowGameOver(true);
      handleGameOverNotification(result);
      if (scoringMode === 'swiss') {
        await checkAutoAdvanceRound();
      }
    }
  }, [game, match, tournament, scoringMode]);

  const updatePlayerStats = async (result: string) => {
    const whiteWon = result === '1-0';
    const blackWon = result === '0-1';
    const isDraw = result === '1/2-1/2';

    if (match.white_player_id) {
      const whiteReg = match.white_player as TournamentRegistration | undefined;
      const updateData: Partial<TournamentRegistration> = {
        points: (whiteReg?.points || 0) + (whiteWon ? 1 : isDraw ? 0.5 : 0),
        games_played: (whiteReg?.games_played || 0) + 1,
        wins: (whiteReg?.wins || 0) + (whiteWon ? 1 : 0),
        draws: (whiteReg?.draws || 0) + (isDraw ? 1 : 0),
        losses: (whiteReg?.losses || 0) + (blackWon ? 1 : 0),
      };

      if (scoringMode === 'arena') {
        const newStreak = whiteWon ? (whiteReg?.current_streak || 0) + 1 : 0;
        const streakBonus = tournament.win_streak_bonus && newStreak >= 3 ? 1 : 0;
        updateData.arena_score = (whiteReg?.arena_score || 0) + (whiteWon ? 2 + streakBonus : isDraw ? 1 : 0);
        updateData.current_streak = newStreak;
        updateData.last_game_at = new Date().toISOString();
      }

      await supabase
        .from('tournament_registrations')
        .update(updateData)
        .eq('id', match.white_player_id);
    }

    if (match.black_player_id) {
      const blackReg = match.black_player as TournamentRegistration | undefined;
      const updateData: Partial<TournamentRegistration> = {
        points: (blackReg?.points || 0) + (blackWon ? 1 : isDraw ? 0.5 : 0),
        games_played: (blackReg?.games_played || 0) + 1,
        wins: (blackReg?.wins || 0) + (blackWon ? 1 : 0),
        draws: (blackReg?.draws || 0) + (isDraw ? 1 : 0),
        losses: (blackReg?.losses || 0) + (whiteWon ? 1 : 0),
      };

      if (scoringMode === 'arena') {
        const newStreak = blackWon ? (blackReg?.current_streak || 0) + 1 : 0;
        const streakBonus = tournament.win_streak_bonus && newStreak >= 3 ? 1 : 0;
        updateData.arena_score = (blackReg?.arena_score || 0) + (blackWon ? 2 + streakBonus : isDraw ? 1 : 0);
        updateData.current_streak = newStreak;
        updateData.last_game_at = new Date().toISOString();
      }

      await supabase
        .from('tournament_registrations')
        .update(updateData)
        .eq('id', match.black_player_id);
    }
  };

  const awardBonusPoints = async (result: string): Promise<number> => {
    const winBonus = tournament.win_points_bonus || 0;
    const drawBonus = tournament.draw_points_bonus || 0;
    if (winBonus === 0 && drawBonus === 0) return 0;

    const whiteWon = result === '1-0';
    const blackWon = result === '0-1';
    const isDraw = result === '1/2-1/2';

    let myBonus = 0;

    const getProfileUserId = async (registrationId: string | null) => {
      if (!registrationId) return null;
      const { data } = await supabase
        .from('tournament_registrations')
        .select('user_id')
        .eq('id', registrationId)
        .single();
      return data?.user_id || null;
    };

    const awardToPlayer = async (regId: string | null, bonus: number) => {
      const userId = await getProfileUserId(regId);
      if (userId) {
        const { data: profile } = await supabase.from('profiles').select('points').eq('user_id', userId).single();
        await supabase.from('profiles').update({ points: (profile?.points || 0) + bonus }).eq('user_id', userId);
        
        // Track bonus for current player
        const myUserId = await getProfileUserId(myRegistrationId);
        if (userId === myUserId) myBonus = bonus;
      }
    };

    if (whiteWon && winBonus > 0) await awardToPlayer(match.white_player_id, winBonus);
    if (blackWon && winBonus > 0) await awardToPlayer(match.black_player_id, winBonus);
    if (isDraw && drawBonus > 0) {
      await awardToPlayer(match.white_player_id, drawBonus);
      await awardToPlayer(match.black_player_id, drawBonus);
    }

    return myBonus;
  };

  const checkAutoAdvanceRound = async () => {
    const { data: pendingMatches } = await supabase
      .from('tournament_matches')
      .select('id')
      .eq('tournament_id', tournament.id)
      .in('status', ['pending', 'in_progress'])
      .limit(1);

    if (pendingMatches && pendingMatches.length === 0) {
      const currentRound = tournament.current_round || 1;
      if (currentRound >= tournament.total_rounds) {
        await supabase
          .from('tournaments')
          .update({ status: 'completed' })
          .eq('id', tournament.id);
        
        await autoGenerateCertificates();
        
        queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] });
        toast.success('🏆 Tournament completed! Certificates generated!', { duration: 8000 });
      } else {
        toast.info(`Round ${currentRound} complete! Waiting for next round...`, { duration: 5000 });
      }
    }
  };

  const autoGenerateCertificates = async () => {
    try {
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('tournament_id', tournament.id)
        .limit(1);
      
      if (existing && existing.length > 0) return;

      const isArena = tournament.tournament_type === 'arena';
      const orderBy = isArena ? 'arena_score' : 'points';

      const { data: standings } = await supabase
        .from('tournament_registrations')
        .select('*, profiles:profile_id (username)')
        .eq('tournament_id', tournament.id)
        .eq('is_disqualified', false)
        .order(orderBy, { ascending: false })
        .order('buchholz', { ascending: false });

      if (!standings || standings.length === 0) return;

      const certificates = [];
      const topN = tournament.certificate_top_n || 3;

      for (let i = 0; i < standings.length; i++) {
        const player = standings[i];
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
            certificate_id: `CERT-${tournament.id.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${rank}`,
            tournament_id: tournament.id,
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
        await supabase.from('certificates').insert(certificates);
      }
    } catch (e) {
      console.error('Failed to auto-generate certificates:', e);
    }
  };

  const handleResign = async () => {
    const result = isWhite ? '0-1' : '1-0';
    const points = getPoints(result);

    await supabase
      .from('tournament_matches')
      .update({
        result,
        white_points: points.white,
        black_points: points.black,
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', match.id);

    await updatePlayerStats(result);
    const bonus = await awardBonusPoints(result);
    setBonusPointsAwarded(bonus);
    setGameResult(result);
    setShowGameOver(true);
    toast.info('You resigned the game');
    queryClient.invalidateQueries({ queryKey: ['my-current-match'] });

    if (scoringMode === 'swiss') {
      await checkAutoAdvanceRound();
    }
  };

  const dismissGameOver = useCallback(() => {
    setShowGameOver(false);
    queryClient.invalidateQueries({ queryKey: ['my-current-match'] });
  }, [queryClient]);

  const isMyTurn = game.turn() === playerColor;

  return {
    game,
    moveHistory,
    isWhite,
    playerColor,
    opponentName,
    isMyTurn,
    handleMove,
    handleResign,
    gameResult,
    showGameOver,
    dismissGameOver,
    bonusPointsAwarded,
  };
}
