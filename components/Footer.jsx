"use client";

import { useState, useEffect } from "react";
import { socialMedias } from "@/lib/navAndLink";

export default function Footer() {
  const [activeSocials, setActiveSocials] = useState(socialMedias);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADMIN_API_URL) return;
    fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/socials`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          const dbSocials = data.data;
          const merged = socialMedias.map((staticSocial) => {
            const dbSocial = dbSocials.find(
              (db) => db.platform.toLowerCase() === staticSocial.name.toLowerCase()
            );
            if (dbSocial) {
              return { ...staticSocial, url: dbSocial.url, sortOrder: dbSocial.sortOrder };
            }
            return { ...staticSocial, url: "#", sortOrder: 99 };
          }).sort((a, b) => a.sortOrder - b.sortOrder);
          setActiveSocials(merged);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-[#000000] text-[#ffffff]">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-center">
          {/* Logo enlarged to match reference image */}
          <div className="flex flex-col items-center md:items-start">
            <img
              src="/assets/whitelogo.png"
              alt="Eternal Glory"
              className="h-14 sm:h-16 md:h-20 w-auto"
            />
          </div>

          {/* Social Media Icons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {activeSocials.map((social) => (
              <a
                key={social.name}
                href={social.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="flex h-11 w-11 items-center justify-center border border-[#ffffff]/25 text-[#ffffff] transition-all duration-300 hover:border-[#ffffff] hover:bg-[#ffffff] hover:text-[#000000] hover:scale-105"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-[18px] w-[18px]"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Bar Divider and Copyright */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-[#ffffff]/15 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-[#ffffff]/60 font-manrope-regular">
            © 2026 Eternal Glory. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#ffffff]/60 hover:text-[#ffffff] transition-colors font-manrope-regular">
              Privacy
            </a>
            <a href="#" className="text-xs text-[#ffffff]/60 hover:text-[#ffffff] transition-colors font-manrope-regular">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
