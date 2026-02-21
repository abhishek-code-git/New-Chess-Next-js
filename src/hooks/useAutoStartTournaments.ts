import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Checks every 30s for tournaments that should auto-start.
 * A tournament auto-starts if: status=upcoming, auto_start=true, start_date <= now, and has >= 2 players.
 */
export function useAutoStartTournaments() {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const checkAutoStart = async () => {
      try {
        // Find tournaments that should auto-start
        const { data: tournaments, error } = await supabase
          .from('tournaments')
          .select('id, tournament_type')
          .eq('status', 'upcoming')
          .eq('auto_start', true)
          .lte('start_date', new Date().toISOString());

        if (error || !tournaments || tournaments.length === 0) return;

        for (const t of tournaments) {
          // Check player count
          const { count } = await supabase
            .from('tournament_registrations')
            .select('id', { count: 'exact', head: true })
            .eq('tournament_id', t.id);

          if (!count || count < 2) continue;

          // Auto-start: update status
          const { error: updateError } = await supabase
            .from('tournaments')
            .update({ status: 'active', current_round: 1 })
            .eq('id', t.id)
            .eq('status', 'upcoming'); // prevent race condition

          if (updateError) continue;

          // Create first round
          if (t.tournament_type === 'arena') {
            await supabase.from('tournament_rounds').insert({
              tournament_id: t.id,
              round_number: 1,
              status: 'active',
              started_at: new Date().toISOString(),
            });
          } else {
            // Swiss: create round + pairings
            const { data: round } = await supabase
              .from('tournament_rounds')
              .insert({
                tournament_id: t.id,
                round_number: 1,
                status: 'active',
                started_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (round) {
              const { data: regs } = await supabase
                .from('tournament_registrations')
                .select('id, player_number')
                .eq('tournament_id', t.id)
                .eq('is_disqualified', false)
                .order('player_number');

              if (regs) {
                const shuffled = [...regs].sort(() => Math.random() - 0.5);
                const matches = [];
                for (let i = 0; i < shuffled.length; i += 2) {
                  const white = shuffled[i];
                  const black = shuffled[i + 1];
                  matches.push({
                    tournament_id: t.id,
                    round_id: round.id,
                    white_player_id: white?.id || null,
                    black_player_id: black?.id || null,
                    board_number: Math.floor(i / 2) + 1,
                    status: black ? 'pending' : 'completed',
                    room_code: `T-${t.id.slice(0, 8)}-R1-B${Math.floor(i / 2) + 1}`,
                    result: !black ? '1-0' : null,
                    white_points: !black ? 1 : null,
                    black_points: !black ? 0 : null,
                  });
                }
                if (matches.length > 0) {
                  await supabase.from('tournament_matches').insert(matches);
                }
              }
            }
          }

          queryClient.invalidateQueries({ queryKey: ['tournaments'] });
          queryClient.invalidateQueries({ queryKey: ['tournament', t.id] });
        }
      } catch {
        // Silently fail - will retry next interval
      }
    };

    checkAutoStart();
    intervalRef.current = setInterval(checkAutoStart, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [queryClient]);
}
