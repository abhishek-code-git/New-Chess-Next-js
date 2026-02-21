import CertificateVerifyPage, {
  type Certificate,
} from "@/pages/CertificateVerify";
import { getServerSupabase } from "@/integrations/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("certificates")
    .select("*")
    .eq("certificate_id", certificateId)
    .maybeSingle();

  return (
    <CertificateVerifyPage
      initialCertificate={(data as Certificate | null) ?? null}
    />
  );
}
