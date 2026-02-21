import CertificateVerifyPage, {
  type Certificate,
} from "@/pages/CertificateVerify";
import { getServerSupabase } from "@/integrations/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: { certificateId: string };
}) {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_id", params.certificateId)
    .maybeSingle();

  return (
    <CertificateVerifyPage
      initialCertificate={(data as Certificate | null) ?? null}
    />
  );
}
