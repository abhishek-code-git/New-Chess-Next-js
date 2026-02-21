
-- Fix search_path for functions
CREATE OR REPLACE FUNCTION public.get_next_player_number(p_tournament_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(MAX(player_number), 0) + 1
  FROM public.tournament_registrations
  WHERE tournament_id = p_tournament_id
$$;

CREATE OR REPLACE FUNCTION public.generate_certificate_id()
RETURNS TEXT
LANGUAGE sql
SET search_path = public
AS $$
  SELECT 'CERT-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))
$$;
