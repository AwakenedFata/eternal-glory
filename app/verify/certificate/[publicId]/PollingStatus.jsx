"use client";

import { useState, useEffect, useRef } from "react";
import PdfViewer from "./PdfViewer";
import { Download } from "lucide-react";

export default function PollingStatus({ publicId, initialStatus, initialPreviewUrl, initialDownloadUrl }) {
  const [status, setStatus] = useState(initialStatus);
  const [urls, setUrls] = useState({ previewUrl: initialPreviewUrl || null, downloadUrl: initialDownloadUrl || null });
  const [attempts, setAttempts] = useState(0);

  const timeoutRef = useRef(null);

  useEffect(() => {
    if (status !== "PROCESSING") return;

    const poll = async () => {
      try {
        // Use BFF proxy endpoint (server-side auth, no cookie needed)
        const res = await fetch(`/api/verify/certificate/${publicId}/status`);
        
        if (res.ok) {
          const data = await res.json();
          if (data.certificate) {
            setStatus(data.certificate.status);
            if (data.certificate.status === "READY") {
              setUrls({
                previewUrl: data.certificate.previewUrl,
                downloadUrl: data.certificate.downloadUrl
              });
              return;
            }
          }
        } else {
          console.error("[PollingStatus] poll failed:", res.status);
        }
      } catch (err) {
        console.error("Polling error", err);
      }

      setAttempts(a => a + 1);
    };

    // Polling with backoff: 2s, 3s, 4s, 5s, 5s...
    let delay = 5000;
    if (attempts === 0) delay = 2000;
    else if (attempts === 1) delay = 3000;
    else if (attempts === 2) delay = 4000;
    
    // Stop polling after 20 attempts (~1.5 minutes)
    if (attempts < 20) {
      timeoutRef.current = setTimeout(poll, delay);
    } else {
      setStatus("FAILED");
    }

    return () => clearTimeout(timeoutRef.current);
  }, [status, attempts, publicId]);

  if (status === "PROCESSING") {
    return (
      <div className="flex flex-col items-center justify-center p-20 border border-border bg-muted/20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-6 text-lg font-medium text-foreground">Preparing your certificate...</p>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Securing authenticity artifact. This should take a few seconds.
        </p>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex flex-col items-center justify-center p-20 border border-border bg-destructive/10">
        <p className="text-lg font-medium text-destructive">Certificate generation delayed.</p>
        <p className="mt-2 text-sm text-muted-foreground text-center mb-6">
          Your product is verified, but we couldn't prepare the artifact in time.
        </p>
        <button 
          onClick={() => {
            setStatus("PROCESSING");
            setAttempts(0);
          }}
          className="inline-flex h-10 items-center justify-center bg-primary px-6 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85"
        >
          Check Again
        </button>
      </div>
    );
  }

  if (status === "READY" && urls.previewUrl && urls.downloadUrl) {
    return (
      <div className="flex flex-col items-center space-y-8">
        <PdfViewer url={urls.previewUrl} />
        
        <a 
          href={urls.downloadUrl}
          download={`Eternal-Glory-Certificate-${publicId}.pdf`}
          className="inline-flex h-14 w-full max-w-sm items-center justify-center bg-primary px-8 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </a>
      </div>
    );
  }

  return null;
}
