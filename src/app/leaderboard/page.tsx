import LeaderboardPage, { type LeaderboardEntry } from "@/pages/Leaderboard";
import { getServerSupabase } from "@/integrations/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, total_games, wins, points")
    .gt("total_games", 0)
    .order("points", { ascending: false })
    .limit(50);

  const initialLeaderboard: LeaderboardEntry[] = !error && data
    ? data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
        win_rate:
          entry.total_games > 0
            ? Math.round((entry.wins / entry.total_games) * 100)
            : 0,
      }))
    : [];

  return <LeaderboardPage initialLeaderboard={initialLeaderboard} />;
}
