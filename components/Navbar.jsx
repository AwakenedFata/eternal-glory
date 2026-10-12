"use client";

import { navMenu } from "@/lib/navAndLink";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const sections = navMenu.map((item) =>
      document.getElementById(item.href.slice(1)),
    ).filter((el) => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#000000] text-[#ffffff] transition-colors duration-200">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-8 md:py-5">
        <a href="#home" className="flex items-center" onClick={() => setOpen(false)}>
          <img
            src="/assets/whitelogo.png"
            alt="Eternal Glory"
            className="h-9 sm:h-10 md:h-11 w-auto transition-transform duration-300 hover:scale-105"
          />
        </a>

        <nav className="hidden shrink-0 items-center gap-8 md:flex lg:gap-12">
          {navMenu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setActive(item.href)}
              aria-current={active === item.href ? "true" : undefined}
              className={`relative pb-1 text-xs uppercase tracking-[0.22em] font-normal transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#ffffff] after:transition-all after:duration-300 ${
                active === item.href
                  ? "font-semibold text-[#ffffff] after:w-full"
                  : "text-[#ffffff]/70 after:w-0 hover:text-[#ffffff] hover:after:w-full"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 shrink-0 items-center justify-center md:hidden"
        >
          <span className="relative block h-3 w-6">
            <span
              className={`absolute left-0 block h-[1.5px] w-6 bg-[#ffffff] transition-transform duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-[1.5px] w-6 bg-[#ffffff] transition-transform duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav className="border-t border-[#ffffff]/15 bg-[#000000] px-5 py-4 md:hidden text-center">
          {navMenu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => {
                setActive(item.href);
                setOpen(false);
              }}
              className={`block py-3 text-sm uppercase tracking-[0.22em] transition-colors ${
                active === item.href
                  ? "font-semibold text-[#ffffff] underline decoration-[1.5px] underline-offset-4"
                  : "font-normal text-[#ffffff]/70 hover:text-[#ffffff]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
