
-- Allow players to update own registration stats (for arena score, points, etc.)
CREATE POLICY "Players can update own registration stats"
ON public.tournament_registrations
FOR UPDATE
USING (auth.uid() = user_id);
