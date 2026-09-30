"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import hangTagImage from "@/public/assets/hangtag.jpg";

// STATES: IDLE, VERIFYING, INVALID, VERIFIED, ALREADY_VERIFIED, CERTIFICATE_PROCESSING, ERROR

export default function VerifySection() {
  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState("IDLE");
  const [notice, setNotice] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    let interval;
    if (status === "CERTIFICATE_PROCESSING" && certificateData?.publicId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/verify/certificate/${certificateData.publicId}/status`);
          if (res.ok) {
            const data = await res.json();
            if (data?.certificate?.status === "READY") {
              setStatus("VERIFIED");
              setCertificateData(prev => ({
                ...prev,
                status: "READY",
                previewUrl: data.certificate.previewUrl,
                downloadUrl: data.certificate.downloadUrl
              }));
              clearInterval(interval);
            } else if (data?.certificate?.status === "FAILED") {
               setStatus("ERROR");
               setNotice("Failed to generate certificate. Please contact support.");
               clearInterval(interval);
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, certificateData?.publicId]);


  const handleVerify = async (e) => {
    e.preventDefault();
    if (serial.length !== 6) {
      setNotice("Please enter all 6 digits.");
      setStatus("INVALID");
      return;
    }

    setStatus("VERIFYING");
    setNotice(null);
    setCertificateData(null);

    try {
      const res = await fetch(`/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: serial })
      });
      const data = await res.json();

      if (data.result === "VERIFIED") {
        setNotice(data.message);
        if (data.certificate?.status === "PROCESSING") {
          setStatus("CERTIFICATE_PROCESSING");
        } else {
          setStatus("VERIFIED");
        }
        setCertificateData(data.certificate);
      } else if (data.result === "ALREADY_VERIFIED") {
        if (data.certificateAccess) {
          setNotice(data.message);
          setStatus("ALREADY_VERIFIED");
          setCertificateData(data.certificate);
        } else {
          setNotice("This product is authentic, but the certificate has already been claimed.");
          setStatus("ALREADY_CLAIMED");
        }
      } else if (data.result === "RATE_LIMITED") {
        setNotice(data.message);
        setStatus("ERROR");
      } else {
        setNotice(data.details || data.error || data.message || "Serial number not found.");
        setStatus("INVALID");
      }
      
    } catch (err) {
      console.error(err);
      setNotice("An error occurred. Please try again later.");
      setStatus("ERROR");
    }
  };

  const handleSerialChange = (e) => {
    setSerial(e.target.value.replace(/\D/g, "").slice(0, 6));
    if (status !== "IDLE") {
      setStatus("IDLE");
      setNotice(null);
      setCertificateData(null);
    }
  };

  const isLoading = status === "VERIFYING";
  const hasCertificate = certificateData?.publicId && (status === "VERIFIED" || status === "ALREADY_VERIFIED");

  return (
    <section id="verify" className="scroll-mt-20 bg-gray-100">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 md:py-40">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16 lg:gap-24">
          <div className="min-w-0">
            <h2 className="eg-display text-[clamp(2.25rem,8vw,4.5rem)] text-black">Verify your piece</h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-black/60 sm:text-lg">
              Enter the 6-digit serial number found on your Eternal Glory hang tag to verify your
              product.
            </p>

            <form className="mt-12" onSubmit={handleVerify}>
              <label htmlFor="serial" className="eg-eyebrow block text-black/70">
                Serial number
              </label>
              <input
                id="serial"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000000"
                maxLength={6}
                value={serial}
                onChange={handleSerialChange}
                disabled={isLoading}
                className="mt-4 h-16 w-full max-w-md border border-black/20 bg-white px-5 text-2xl tracking-[0.5em] text-black outline-none transition-colors placeholder:text-black/30 focus:border-black sm:h-20 sm:text-3xl disabled:opacity-50"
              />
              
              {!hasCertificate && status !== "CERTIFICATE_PROCESSING" && (
                <button
                  type="submit"
                  disabled={isLoading || serial.length !== 6}
                  className="mt-5 inline-flex h-14 w-full max-w-md items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify product"}
                </button>
              )}

              {hasCertificate && (
                <Link
                  href={`/verify/certificate/${certificateData.publicId}`}
                  className="mt-5 inline-flex h-14 w-full max-w-md items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-85"
                >
                  VIEW CERTIFICATE
                </Link>
              )}

              {status === "CERTIFICATE_PROCESSING" && (
                <div className="mt-5 inline-flex h-14 w-full max-w-md items-center justify-center bg-black/10 px-8 text-xs font-semibold uppercase tracking-[0.22em] text-black opacity-70">
                  Preparing Certificate...
                </div>
              )}

              {notice && (
                <p className={`mt-4 text-sm font-medium ${
                  (status === 'VERIFIED' || status === 'ALREADY_VERIFIED' || status === 'CERTIFICATE_PROCESSING' || status === 'ALREADY_CLAIMED') ? 'text-green-600' : 'text-red-600'
                }`} role="status">
                  {status === "CERTIFICATE_PROCESSING" ? "Your product is verified as authentic. Your certificate is being prepared..." : notice}
                </p>
              )}
              <p className="mt-6 max-w-md text-sm leading-relaxed text-black/60">
                Your serial number can be found on the hang tag attached to your product.
              </p>
            </form>
          </div>

          <div className="min-w-0">
            <img
              src={hangTagImage.src}
              alt="Eternal Glory hang tag showing the serial number"
              width={1200}
              height={1200}
              loading="lazy"
              className="h-auto w-full object-cover grayscale"
            />
            <p className="mt-5 text-center text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Find the serial number on your hang tag.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
