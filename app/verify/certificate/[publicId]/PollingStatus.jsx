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
              return; // Stop polling
            }
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }

      setAttempts(a => a + 1);
    };

    // FAST POLLING: 1s continuously for snappy UX
    let delay = 1000;
    
    // Stop polling after 30 attempts (30 seconds)
    if (attempts < 30) {
      timeoutRef.current = setTimeout(poll, delay);
    } else {
      setStatus("FAILED");
    }

    return () => clearTimeout(timeoutRef.current);
  }, [status, attempts, publicId]);

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

  // ALways show PdfViewer, even if URL is null (it will show its internal loading state)
  // This removes the "double loading screen" issue!
  return (
    <div className="flex flex-col items-center space-y-8">
      <PdfViewer url={urls.previewUrl} />
      
      {status === "READY" && urls.downloadUrl && (
        <a 
          href={urls.downloadUrl}
          download={`Eternal-Glory-Certificate-${publicId}.pdf`}
          className="inline-flex h-14 w-full max-w-sm items-center justify-center bg-primary px-8 text-xs font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-opacity hover:opacity-85"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Certificate
        </a>
      )}
    </div>
  );
}
