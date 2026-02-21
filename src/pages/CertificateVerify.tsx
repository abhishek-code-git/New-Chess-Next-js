"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CertificateCard from "@/components/CertificateCard";

interface Certificate {
  id: string;
  certificate_id: string;
  player_name: string;
  tournament_name: string;
  rank: number | null;
  certificate_type: string;
  issued_at: string;
}

export default function CertificateVerify() {
  const params = useParams();
  const certificateId = Array.isArray(params?.certificateId)
    ? params.certificateId[0]
    : params?.certificateId;

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: async () => {
      if (!certificateId) return null;
      
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Certificate | null;
    },
    enabled: !!certificateId,
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Certificate Verification" 
        description="Verify tournament certificates"
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/tournaments" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tournaments
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Certificate Verification
            </CardTitle>
            <CardDescription>
              Verify the authenticity of a tournament certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verification Failed</h3>
                <p className="text-muted-foreground">
                  An error occurred while verifying the certificate.
                </p>
              </div>
            ) : certificate ? (
              <div className="space-y-4">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-600">
                    Certificate Verified ✓
                  </h3>
                </div>
                
                <CertificateCard certificate={certificate} />
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Certificate Not Found</h3>
                <p className="text-muted-foreground mb-4">
                  The certificate with ID "{certificateId}" could not be found.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


