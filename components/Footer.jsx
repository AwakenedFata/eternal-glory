"use client";

import { useState, useEffect } from "react";
import { socialMedias } from "@/lib/navAndLink";

export default function Footer() {
  const [activeSocials, setActiveSocials] = useState(socialMedias);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/socials`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          const dbSocials = data.data;
          const merged = socialMedias.map(staticSocial => {
            const dbSocial = dbSocials.find(db => db.platform.toLowerCase() === staticSocial.name.toLowerCase());
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
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <img src="/assets/whitelogo.png" alt="Eternal Glory" className="h-10 sm:h-12 w-auto" />
            <p className="mt-3 text-sm text-white/70">Faith worn daily.</p>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {activeSocials.map((social) => (
              <a
                key={social.name}
                href={social.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                title={social.name}
                className="flex h-11 w-11 items-center justify-center border border-white/30 text-white transition-colors hover:border-white hover:bg-white hover:text-black"
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

        <div className="mt-12 flex flex-col gap-4 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/60">
            © 2026 Eternal Glory. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/60 hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-xs text-white/60 hover:text-white">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}