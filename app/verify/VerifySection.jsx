"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import hangTagImage from "@/public/assets/hangtag.jpg";

export default function VerifySection() {
  const router = useRouter();
  const [serial, setSerial] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState("IDLE");
  const [notice, setNotice] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  const handleOtpChange = (index, value) => {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!sanitized && value !== "") return;

    const newSerial = [...serial];
    newSerial[index] = sanitized.slice(-1);
    setSerial(newSerial);

    if (sanitized && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !serial[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
        const newSerial = [...serial];
        newSerial[index - 1] = "";
        setSerial(newSerial);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    if (!pasted) return;

    const newSerial = [...serial];
    for (let i = 0; i < 6; i++) {
      newSerial[i] = pasted[i] || "";
    }
    setSerial(newSerial);

    const targetIndex = Math.min(pasted.length, 5);
    const targetInput = document.getElementById(`otp-${targetIndex}`);
    if (targetInput) targetInput.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = serial.join("");
    if (code.length !== 6) {
      setNotice("Please enter a complete 6-character serial code.");
      return;
    }

    setStatus("LOADING");
    setNotice(null);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serial: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("ERROR");
        setNotice(data.error || "Verification failed. Please check your serial code.");
        return;
      }

      const st = data.status || (data.data && data.data.status);
      setStatus(st);

      if (data.certificate?.publicId) {
        router.push(`/verify/certificate/${data.certificate.publicId}`);
        return;
      }

      if (st === "VERIFIED" || st === "ALREADY_VERIFIED") {
        setNotice(data.message || "Your product is authentic!");
        if (data.certificate) {
          setCertificateData(data.certificate);
        }
      } else if (st === "CERTIFICATE_PROCESSING") {
        setNotice("Your product is authentic! Preparing your certificate...");
        if (data.certificate) {
          setCertificateData(data.certificate);
        }
      } else {
        setNotice(data.message || "Your product is authentic!");
      }
    } catch (err) {
      setStatus("ERROR");
      setNotice("Network error. Please try again.");
    }
  };

  const isLoading = status === "LOADING";
  const hasCertificate = certificateData?.publicId && status !== "CERTIFICATE_PROCESSING";

  return (
    <section id="verify" className="scroll-mt-20 bg-[#f4f4f5] text-[#000000]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 md:py-36">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 lg:gap-24 items-center">
          {/* Left Column: Center aligned on mobile, left aligned on desktop */}
          <div className="min-w-0 flex flex-col items-center text-center md:items-start md:text-left eg-reveal">
            <h2 className="eg-display text-[clamp(4rem,8.5vw,5.75rem)] md:text-[clamp(2rem,6vw,4.75rem)] text-[#000000] leading-[0.92] md:leading-[0.95]">
              VERIFY
              <br />
              YOUR PIECE
            </h2>
            <p className="mt-8 max-w-md text-base leading-relaxed text-[#000000]/75 sm:text-lg font-normal eg-reveal eg-delay-2">
              Enter the 6-digit serial number found on your{" "}
              <br className="sm:hidden" />
              Eternal Glory hang tag to verify your product.
            </p>

            <form onSubmit={handleVerify} className="mt-8 w-full flex flex-col items-center md:items-start">
              <label className="block text-xs font-semibold uppercase tracking-[0.22em] text-[#000000]/70">
                SERIAL NUMBER
              </label>

              <div className="mt-3 flex gap-2 sm:gap-3 justify-center md:justify-start" onPaste={handlePaste}>
                {serial.map((char, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={char}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="h-12 w-11 sm:h-14 sm:w-13 border border-[#000000]/30 bg-[#ffffff] text-center text-lg sm:text-xl font-bold uppercase text-[#000000] transition-all duration-200 ease-out hover:border-[#000000] focus:border-[#000000] focus:ring-2 focus:ring-[#000000]/15 focus:scale-[1.06] focus:shadow-[0_6px_16px_rgba(0,0,0,0.08)] active:scale-95 outline-none"
                  />
                ))}
              </div>

              {!hasCertificate && (
                <button
                  type="submit"
                  disabled={isLoading || serial.join("").length !== 6}
                  className="mt-6 inline-flex h-14 w-full max-w-md items-center justify-center bg-[#000000] px-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffffff] eg-btn-spring hover:shadow-[0_12px_24px_rgba(0,0,0,0.18)] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isLoading ? "VERIFYING..." : "VERIFY PRODUCT"}
                </button>
              )}

              {hasCertificate && (
                <Link
                  href={`/verify/certificate/${certificateData.publicId}`}
                  className="mt-6 inline-flex h-14 w-full max-w-md items-center justify-center bg-[#000000] px-8 text-xs font-semibold uppercase tracking-[0.22em] text-[#ffffff] transition-all duration-300 hover:opacity-85 hover:scale-[1.02] active:scale-[0.98]"
                >
                  VIEW CERTIFICATE
                </Link>
              )}

              {notice && (
                <p className={`mt-4 text-sm font-medium ${(status === 'VERIFIED' || status === 'ALREADY_VERIFIED' || status === 'CERTIFICATE_PROCESSING' || status === 'ALREADY_CLAIMED') ? 'text-green-600' : 'text-red-600'
                  }`} role="status">
                  {status === "CERTIFICATE_PROCESSING" ? "Your product is verified as authentic. Your certificate is being prepared..." : notice}
                </p>
              )}

              <p className="mt-6 max-w-md text-sm leading-relaxed text-[#000000]/60 font-normal">
                Your serial number can be found on the hang tag attached to your product.
              </p>
            </form>
          </div>

          {/* Right Column: Hang Tag Image */}
          <div className="min-w-0 flex flex-col items-center">
            <img
              src={hangTagImage.src}
              alt="Eternal Glory hang tag showing the serial number"
              width={1200}
              height={1200}
              loading="lazy"
              className="h-auto w-full max-w-md object-cover grayscale transition-transform duration-500 hover:scale-[1.01]"
            />
            <p className="mt-5 text-center text-xs uppercase tracking-[0.18em] text-[#000000]/60 font-normal">
              Find the serial number on your hang tag.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
