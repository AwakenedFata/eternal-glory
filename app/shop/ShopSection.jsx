"use client";

import { useState, useEffect } from "react";

function StoreCard({ store }) {
  return (
    <a
      href={store.storeUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center border border-[#000000] bg-[#ffffff] pt-3.5 sm:pt-4 pb-3.5 sm:pb-4 px-3 sm:px-3.5 text-center transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] w-[200px] sm:w-[215px] md:w-[220px] lg:w-[230px] h-[240px] sm:h-[258px] md:h-[264px] lg:h-[260px] shrink-0"
    >
      {/* Top: Uniform Logo Box occupying ~45% of card height */}
      <div className="flex h-[94px] sm:h-[102px] md:h-[105px] lg:h-[110px] w-full items-center justify-center shrink-0">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="max-h-full max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-105 select-none"
            loading="lazy"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center border border-black bg-black text-white text-xl font-bold font-sans">
            {store.mark || store.name?.slice(0, 2).toUpperCase() || "EG"}
          </div>
        )}
      </div>

      {/* Middle: Store Title (Manrope Medium) & OFFICIAL STORE (Manrope Regular) */}
      <div className="mt-2.5 sm:mt-3 flex flex-col items-center">
        <span className="font-manrope-medium text-[11px] sm:text-xs md:text-[13px] uppercase tracking-[0.22em] text-[#000000] font-medium leading-none">
          {store.name}
        </span>
        <span className="font-manrope-regular mt-1.5 text-[8.5px] sm:text-[9px] uppercase tracking-[0.24em] text-[#000000]/40 font-normal leading-none">
          OFFICIAL STORE
        </span>
      </div>

      {/* Bottom: VISIT STORE → Action link anchored to bottom */}
      <div className="mt-auto">
        <span className="font-manrope-regular inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] text-[#000000] font-normal leading-none group-hover:opacity-75 transition-opacity">
          VISIT STORE <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </a>
  );
}

export default function ShopSection() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStores() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && json.data.length > 0) {
            if (isMounted) {
              setStores(json.data);
              setLoading(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch from /api/stores:", err);
      }

      if (process.env.NEXT_PUBLIC_ADMIN_API_URL) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/stores`);
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data) && json.data.length > 0) {
              if (isMounted) {
                setStores(json.data);
                setLoading(false);
              }
              return;
            }
          }
        } catch (err) {
          console.error("Admin API fetch error:", err);
        }
      }

      if (isMounted) setLoading(false);
    }

    loadStores();
    return () => { isMounted = false; };
  }, []);

  return (
    <section id="shop" className="scroll-mt-24 bg-[#ffffff] text-[#000000] py-20 sm:py-24 md:py-28">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Section Heading matching exact design */}
        <div className="text-center">
          <h2 className="eg-display text-[clamp(2.5rem,8vw,5.5rem)] text-[#000000] leading-[0.92]">
            SHOP ETERNAL GLORY
          </h2>
          <p className="font-manrope-regular mt-6 text-base leading-relaxed text-[#000000]/75 sm:text-lg font-normal">
            Find Eternal Glory through our official stores
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && stores.length === 0 && (
          <div className="mt-14 flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        )}

        {/* Empty State */}
        {!loading && stores.length === 0 && (
          <div className="mt-14 text-center text-sm text-[#000000]/60">
            No active stores available at this moment.
          </div>
        )}

        {/* Desktop View: Exact 3 - 2 Grid matching design screenshot */}
        {stores.length > 0 && (
          <div className="mt-12 sm:mt-14 md:mt-16 hidden md:flex flex-col items-center gap-5 lg:gap-6">
            {/* Row 1: 3 Cards */}
            <div className="flex justify-center items-center gap-5 lg:gap-6">
              {stores.slice(0, 3).map((store) => (
                <StoreCard key={store._id || store.name} store={store} />
              ))}
            </div>

            {/* Row 2: 2 Cards Centered */}
            {stores.length > 3 && (
              <div className="flex justify-center items-center gap-5 lg:gap-6">
                {stores.slice(3, 5).map((store) => (
                  <StoreCard key={store._id || store.name} store={store} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile View: Vertical Stack Centered for Ergonomics and 100% Visibility */}
        {stores.length > 0 && (
          <div className="mt-10 flex flex-col gap-6 md:hidden items-center w-full">
            {stores.map((store) => (
              <StoreCard key={store._id || store.name} store={store} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
