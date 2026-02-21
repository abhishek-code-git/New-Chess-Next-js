-- Drop the SECURITY DEFINER view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  username,
  avatar_url,
  total_games,
  wins,
  losses,
  draws,
  points,
  CASE WHEN total_games > 0 THEN ROUND((wins::DECIMAL / total_games) * 100, 1) ELSE 0 END as win_rate,
  RANK() OVER (ORDER BY points DESC) as rank
FROM public.profiles
WHERE total_games > 0
ORDER BY points DESC;