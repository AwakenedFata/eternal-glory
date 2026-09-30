import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PollingStatus from "./PollingStatus";

export const metadata = {
  referrer: 'no-referrer',
};

async function getCertificate(publicId) {
  try {
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL;
    const secret = process.env.INTERNAL_SERVICE_SECRET;
    
    if (!adminApiUrl || !secret) {
      console.error("[CertPage] Missing ADMIN_API_URL or INTERNAL_SERVICE_SECRET");
      return null;
    }

    const res = await fetch(`${adminApiUrl}/certificates/${publicId}`, {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${secret}`
      },
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      if (res.status === 403) return { error: "FORBIDDEN" };
      throw new Error("Failed to fetch certificate: " + res.status);
    }
    
    return await res.json();
  } catch (err) {
    console.error("[CertPage] getCertificate error:", err);
    return null;
  }
}

export default async function CertificatePage({ params }) {
  const { publicId } = await params;

  const data = await getCertificate(publicId);

  if (data?.error === "FORBIDDEN") {
    return (
      <main className="min-h-screen bg-background pb-20 pt-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Link 
            href="/#verify" 
            className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Verification
          </Link>
          <div className="flex flex-col items-center justify-center p-20 border border-border bg-destructive/10">
            <p className="text-lg font-bold text-destructive uppercase tracking-widest">Access Denied</p>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              This certificate has already been claimed by another device or your browser session has expired.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data || !data.certificate) {
    notFound();
  }

  const { status, previewUrl, downloadUrl } = data.certificate;

  return (
    <main className="min-h-screen bg-background pb-20 pt-32">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        
        <Link 
          href="/#verify" 
          className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Verification
        </Link>
        
        <div className="mb-10 text-center">
          <h1 className="eg-display text-4xl sm:text-5xl">Certificate of Authenticity</h1>
          <p className="mt-4 text-muted-foreground uppercase tracking-widest text-sm">
            Eternal Glory
          </p>
        </div>

        {status === "REVOKED" ? (
          <div className="flex flex-col items-center justify-center p-20 border border-border bg-destructive/10">
            <p className="text-lg font-bold text-destructive uppercase tracking-widest">Certificate Revoked</p>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              This certificate is no longer valid or has been revoked by Eternal Glory.
            </p>
          </div>
        ) : (
          <PollingStatus publicId={publicId} initialStatus={status} initialPreviewUrl={previewUrl} initialDownloadUrl={downloadUrl} />
        )}
      </div>
    </main>
  );
}
