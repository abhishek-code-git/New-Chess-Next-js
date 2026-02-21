-- Add tournament_type enum
CREATE TYPE public.tournament_type AS ENUM ('swiss', 'arena');

-- Add new columns to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN tournament_type tournament_type NOT NULL DEFAULT 'swiss',
ADD COLUMN duration_minutes integer DEFAULT NULL,
ADD COLUMN required_points integer DEFAULT 0,
ADD COLUMN win_streak_bonus boolean DEFAULT false,
ADD COLUMN auto_start boolean DEFAULT false,
ADD COLUMN registration_deadline timestamp with time zone DEFAULT NULL;

-- Add arena-specific fields to tournament_registrations
ALTER TABLE public.tournament_registrations
ADD COLUMN arena_score integer DEFAULT 0,
ADD COLUMN current_streak integer DEFAULT 0,
ADD COLUMN last_game_at timestamp with time zone DEFAULT NULL;

-- Add forfeit tracking to tournament_matches
ALTER TABLE public.tournament_matches
ADD COLUMN forfeit_by uuid DEFAULT NULL,
ADD COLUMN forfeit_reason text DEFAULT NULL,
ADD COLUMN time_limit_seconds integer DEFAULT NULL;

-- Create function to handle points deduction on tournament registration
CREATE OR REPLACE FUNCTION public.deduct_points_on_registration()
RETURNS TRIGGER AS $$
DECLARE
  tournament_entry_type entry_type;
  required_pts integer;
  user_profile_id uuid;
  current_points integer;
BEGIN
  -- Get tournament details
  SELECT entry_type, required_points INTO tournament_entry_type, required_pts
  FROM public.tournaments WHERE id = NEW.tournament_id;
  
  -- If paid entry (points-based), deduct points
  IF tournament_entry_type = 'paid' AND required_pts > 0 THEN
    -- Get user's profile and current points
    SELECT id, points INTO user_profile_id, current_points
    FROM public.profiles WHERE user_id = NEW.user_id;
    
    -- Check if user has enough points
    IF current_points < required_pts THEN
      RAISE EXCEPTION 'Insufficient points. Required: %, Available: %', required_pts, current_points;
    END IF;
    
    -- Deduct points
    UPDATE public.profiles 
    SET points = points - required_pts
    WHERE id = user_profile_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for points deduction
DROP TRIGGER IF EXISTS trigger_deduct_points_on_registration ON public.tournament_registrations;
CREATE TRIGGER trigger_deduct_points_on_registration
  BEFORE INSERT ON public.tournament_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.deduct_points_on_registration();

-- Create function to refund points on tournament cancellation
CREATE OR REPLACE FUNCTION public.refund_points_on_cancellation(p_tournament_id uuid)
RETURNS void AS $$
DECLARE
  tournament_entry_type entry_type;
  required_pts integer;
  reg RECORD;
BEGIN
  -- Get tournament details
  SELECT entry_type, required_points INTO tournament_entry_type, required_pts
  FROM public.tournaments WHERE id = p_tournament_id;
  
  -- If paid entry, refund points to all registrants
  IF tournament_entry_type = 'paid' AND required_pts > 0 THEN
    FOR reg IN SELECT user_id FROM public.tournament_registrations WHERE tournament_id = p_tournament_id LOOP
      UPDATE public.profiles 
      SET points = points + required_pts
      WHERE user_id = reg.user_id;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function for auto-forfeit check
CREATE OR REPLACE FUNCTION public.check_match_forfeit(p_match_id uuid, p_timeout_seconds integer DEFAULT 300)
RETURNS void AS $$
DECLARE
  match_record RECORD;
  forfeit_player_id uuid;
BEGIN
  SELECT * INTO match_record FROM public.tournament_matches WHERE id = p_match_id;
  
  -- If match started but no moves made within timeout
  IF match_record.status = 'pending' AND match_record.started_at IS NOT NULL THEN
    IF EXTRACT(EPOCH FROM (NOW() - match_record.started_at)) > p_timeout_seconds THEN
      -- First player to move loses by forfeit (white should move first)
      IF match_record.pgn IS NULL OR match_record.pgn = '' THEN
        forfeit_player_id := match_record.white_player_id;
        
        UPDATE public.tournament_matches
        SET status = 'completed',
            result = '0-1',
            white_points = 0,
            black_points = 1,
            forfeit_by = forfeit_player_id,
            forfeit_reason = 'timeout',
            ended_at = NOW()
        WHERE id = p_match_id;
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function for arena pairing (find available opponent)
CREATE OR REPLACE FUNCTION public.find_arena_opponent(
  p_tournament_id uuid,
  p_player_registration_id uuid
)
RETURNS uuid AS $$
DECLARE
  opponent_id uuid;
BEGIN
  -- Find an available player who:
  -- 1. Is not the current player
  -- 2. Is not currently in an active match
  -- 3. Hasn't played against this player recently (last 3 games)
  SELECT tr.id INTO opponent_id
  FROM public.tournament_registrations tr
  WHERE tr.tournament_id = p_tournament_id
    AND tr.id != p_player_registration_id
    AND tr.is_disqualified = false
    AND NOT EXISTS (
      SELECT 1 FROM public.tournament_matches tm
      WHERE tm.tournament_id = p_tournament_id
        AND tm.status IN ('pending', 'in_progress')
        AND (tm.white_player_id = tr.id OR tm.black_player_id = tr.id)
    )
  ORDER BY tr.last_game_at ASC NULLS FIRST, RANDOM()
  LIMIT 1;
  
  RETURN opponent_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;