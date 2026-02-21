import TournamentsPage from "@/pages/Tournaments";
import { getServerSupabase } from "@/integrations/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("tournaments")
    .select("*")
    .eq("status", "upcoming")
    .order("start_date", { ascending: true });

  return <TournamentsPage initialTournaments={data ?? []} />;
}
