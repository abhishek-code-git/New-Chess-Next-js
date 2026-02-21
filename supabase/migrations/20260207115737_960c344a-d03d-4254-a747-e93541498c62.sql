
-- Add reward/prize columns to tournaments
ALTER TABLE public.tournaments 
ADD COLUMN IF NOT EXISTS win_points_bonus integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS draw_points_bonus integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS prize_description text DEFAULT NULL;
