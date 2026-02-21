import TournamentDetailPage from "@/pages/TournamentDetail";
import { getServerSupabase } from "@/integrations/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getServerSupabase();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  const { data: registrations } = await supabase
    .from("tournament_registrations")
    .select(
      `
        *,
        profiles:profile_id (username, avatar_url)
      `
    )
    .eq("tournament_id", id)
    .order("points", { ascending: false });

  const { data: rounds } = await supabase
    .from("tournament_rounds")
    .select("*")
    .eq("tournament_id", id)
    .order("round_number", { ascending: true });

  return (
    <TournamentDetailPage
      initialTournament={tournament ?? null}
      initialRegistrations={registrations ?? []}
      initialRounds={rounds ?? []}
    />
  );
}
