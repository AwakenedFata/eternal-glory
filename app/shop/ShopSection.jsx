"use client";

import { useState, useEffect } from "react";

function StoreCard({ store }) {
  return (
    <a
      href={store.storeUrl}
      className="group flex min-w-0 flex-col justify-between border border-black/20 p-7 transition-colors hover:border-black sm:p-8"
    >
      <span className="eg-display flex h-28 items-center justify-center bg-black text-3xl text-white sm:h-36 sm:text-4xl">
        {store.mark}
      </span>
      <span className="mt-8 block">
        <span className="block text-lg font-semibold uppercase tracking-[0.12em] text-black">
          {store.name}
        </span>
        <span className="mt-2 block text-[0.6875rem] uppercase tracking-[0.32em] text-black/60">
          Official store
        </span>
      </span>
      <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.22em] text-black">
        Visit store →
      </span>
    </a>
  );
}

export default function ShopSection() {
  const [shopStores, setShopStores] = useState([
    { name: "Shopee", mark: "SP", storeUrl: "#" },
    { name: "Tokopedia", mark: "TP", storeUrl: "#" },
  ]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL}/stores`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setShopStores(data.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section
      id="shop"
      className="scroll-mt-20 bg-white text-black"
    >
      <div className="mx-auto max-w-[1440px] py-20 sm:py-28 md:py-40">
        <div className="px-5 sm:px-8">
          <h2 className="eg-display text-[clamp(2.25rem,8vw,4.5rem)]">Shop Eternal Glory</h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-black/70 sm:text-lg">
            Find Eternal Glory through our official stores.
          </p>
        </div>

        {/* Horizontal scroll row: swipe/drag sideways to see all 6 stores */}
        <div className="mt-12 flex snap-x snap-mandatory gap-4 sm:gap-5 lg:gap-6 overflow-x-auto pb-6 px-5 sm:px-8 scroll-pl-5 sm:scroll-pl-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden after:shrink-0 after:w-1">
          {shopStores.map((store) => (
            <div key={store.name} className="w-[76%] shrink-0 snap-start sm:w-[44%] lg:w-[30%]">
              <StoreCard store={store} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

