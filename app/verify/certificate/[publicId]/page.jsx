import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";

export const metadata = {
  referrer: 'no-referrer',
};

async function getCertificate(publicId, token) {
  try {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/certificates/${publicId}`, {
      cache: "no-store",
      headers,
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      if (res.status === 403) return { error: "FORBIDDEN" };
      throw new Error("Failed to fetch certificate");
    }
    
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function CertificatePage({ params }) {
  const { publicId } = await params;
  
  const cookieStore = await cookies();
  const claimsCookie = cookieStore.get("eg_claims")?.value;
  let token = null;
  
  if (claimsCookie) {
    try {
      const claims = JSON.parse(claimsCookie);
      for (const key in claims) {
        if (claims[key].publicId === publicId) {
          token = claims[key].token;
          // Note: for older cookies where token was stored directly as a string, this might fail,
          // but we just reset the cookie structure so it's fine for new claims.
          if (typeof claims[key] === 'string') {
            token = claims[key]; // Fallback for transition
          }
          break;
        }
      }
    } catch (e) {
      console.error("Failed to parse claims cookie");
    }
  }

  const data = await getCertificate(publicId, token);

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

  const { status, downloadUrl, previewUrl } = data.certificate;

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

        {status === "PROCESSING" && (
          <div className="flex flex-col items-center justify-center p-20 border border-border bg-muted/20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-6 text-lg font-medium text-foreground">Generating your certificate...</p>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Please wait a moment. This page will not auto-refresh, please refresh manually.
            </p>
          </div>
        )}

        {status === "FAILED" && (
          <div className="flex flex-col items-center justify-center p-20 border border-border bg-destructive/10">
            <p className="text-lg font-medium text-destructive">Certificate generation failed.</p>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Your product is verified, but we couldn't generate the PDF. Please contact support.
            </p>
          </div>
        )}

        {status === "REVOKED" && (
          <div className="flex flex-col items-center justify-center p-20 border border-border bg-destructive/10">
            <p className="text-lg font-bold text-destructive uppercase tracking-widest">Certificate Revoked</p>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              This certificate is no longer valid or has been revoked by Eternal Glory.
            </p>
          </div>
        )}

        {status === "READY" && previewUrl && downloadUrl && (
          <div className="flex flex-col items-center space-y-8">
            {/* PDF Preview */}
            <div className="w-full aspect-[1.414/1] bg-muted border border-border shadow-2xl relative overflow-hidden flex items-center justify-center">
              <object 
                data={previewUrl} 
                type="application/pdf" 
                className="w-full h-full absolute inset-0 z-10"
              >
                <div className="p-8 text-center flex flex-col items-center">
                  <p className="text-muted-foreground mb-4">Your browser does not support inline PDFs.</p>
                </div>
              </object>
            </div>
            
            {/* Download Action */}
            <a 
              href={downloadUrl}
              download={`Eternal-Glory-Certificate-${publicId}.pdf`}
              className="inline-flex h-14 w-full max-w-sm items-center justify-center bg-primary px-8 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
