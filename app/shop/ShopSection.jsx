"use client";

import { useState, useEffect } from "react";

function StoreCard({ store, delayClass = "" }) {
  return (
    <a
      href={store.storeUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-row sm:flex-col items-center border border-[#000000] bg-[#ffffff] p-3.5 sm:pt-3.5 sm:pb-3.5 sm:px-3.5 text-left sm:text-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] active:scale-[0.985] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] w-full max-w-[320px] sm:w-[215px] md:w-[220px] lg:w-[225px] h-[104px] sm:h-[205px] md:h-[210px] lg:h-[210px] shrink-0 eg-reveal ${delayClass}`}
    >
      {/* Logo: Left on mobile with subtle divider, Top on tablet/desktop */}
      <div className="flex h-[76px] w-[76px] sm:h-[92px] md:h-[95px] lg:h-[95px] sm:w-full items-center justify-center shrink-0 border-r border-[#000000]/15 pr-3 sm:border-r-0 sm:pr-0">
        {store.logoUrl ? (
          <img
            src={store.logoUrl}
            alt={store.name}
            className="max-h-full max-w-full sm:max-w-[85%] object-contain transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108 select-none"
            loading="lazy"
          />
        ) : (
          <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center border border-black bg-black text-white text-base sm:text-xl font-bold font-sans">
            {store.mark || store.name?.slice(0, 2).toUpperCase() || "EG"}
          </div>
        )}
      </div>

      {/* Right side on mobile (structured column spanning width), Middle + Bottom on tablet/desktop */}
      <div className="flex flex-col justify-between items-start sm:items-center pl-4 sm:pl-0 min-w-0 flex-1 sm:flex-initial sm:w-full h-[76px] sm:h-auto">
        {/* Store Title & Official Store */}
        <div className="flex flex-col items-start sm:items-center sm:mt-2">
          <span className="font-manrope-medium text-sm sm:text-xs md:text-[13px] uppercase tracking-[0.22em] text-[#000000] font-bold sm:font-medium leading-none">
            {store.name}
          </span>
          <span className="font-manrope-regular mt-1 sm:mt-1.5 text-[9.5px] sm:text-[9px] uppercase tracking-[0.24em] text-[#000000]/50 sm:text-[#000000]/40 font-medium sm:font-normal leading-none">
            OFFICIAL STORE
          </span>
        </div>

        {/* VISIT STORE Action Button: Spans across the right column on mobile, minimal link on tablet/desktop */}
        <div className="w-full sm:w-auto sm:mt-auto sm:pt-4">
          <span className="font-manrope-regular flex w-full sm:inline-flex sm:w-auto items-center justify-between sm:justify-start gap-1.5 border border-[#000000] sm:border-0 px-2.5 sm:px-0 py-1 sm:py-0 text-[9.5px] sm:text-[10px] uppercase tracking-[0.18em] text-[#000000] font-semibold sm:font-normal leading-none transition-colors group-hover:bg-[#000000] sm:group-hover:bg-transparent group-hover:text-[#ffffff] sm:group-hover:text-[#000000] sm:group-hover:opacity-75">
            VISIT STORE <span className="transition-transform duration-200 group-hover:translate-x-0.5 sm:group-hover:translate-x-1">→</span>
          </span>
        </div>
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
        <div className="text-center eg-reveal">
          <h2 className="eg-display text-[clamp(2.5rem,8vw,5.5rem)] text-[#000000] leading-[0.92]">
            SHOP ETERNAL GLORY
          </h2>
          <p className="font-manrope-regular mt-4 sm:mt-5 md:mt-6 text-base leading-relaxed text-[#000000]/75 font-normal md:text-[clamp(1.5rem,3.54vw,2.44rem)] md:whitespace-nowrap md:leading-tight md:tracking-[-0.01em]">
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
              {stores.slice(0, 3).map((store, i) => (
                <StoreCard key={store._id || store.name} store={store} delayClass={i === 0 ? "eg-delay-1" : i === 1 ? "eg-delay-2" : "eg-delay-3"} />
              ))}
            </div>

            {/* Row 2: 2 Cards Centered */}
            {stores.length > 3 && (
              <div className="flex justify-center items-center gap-5 lg:gap-6">
                {stores.slice(3, 5).map((store, i) => (
                  <StoreCard key={store._id || store.name} store={store} delayClass={i === 0 ? "eg-delay-3" : "eg-delay-4"} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile View: Vertical Stack Centered for Ergonomics and 100% Visibility */}
        {stores.length > 0 && (
          <div className="mt-10 flex flex-col gap-3.5 sm:gap-4 md:hidden items-center w-full">
            {stores.map((store, i) => (
              <StoreCard key={store._id || store.name} store={store} delayClass={i < 4 ? `eg-delay-${i + 1}` : ""} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
