import TournamentDetailPage from "@/pages/TournamentDetail";
import { getServerSupabase } from "@/integrations/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getServerSupabase();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select(
      `
        *,
        profiles:profile_id (username, avatar_url)
      `
    )
    .eq("tournament_id", params.id)
    .order("points", { ascending: false });

  const { data: rounds } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("tournament_id", params.id)
    .order("round_number", { ascending: true });

  return (
    <TournamentDetailPage
      initialTournament={tournament ?? null}
      initialRegistrations={registrations ?? []}
      initialRounds={rounds ?? []}
    />
  );
}
