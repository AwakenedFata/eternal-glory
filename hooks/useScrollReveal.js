"use client";

import { useEffect } from "react";

/**
 * Apple-style IntersectionObserver hook for silky smooth scroll reveals.
 * Automatically observes elements with the .eg-reveal class (including dynamically
 * loaded elements via MutationObserver) and activates them with .eg-reveal-visible.
 */
export function useScrollReveal(dependencies = []) {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("eg-reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    const observeAll = () => {
      const elements = document.querySelectorAll(".eg-reveal:not(.eg-reveal-visible)");
      elements.forEach((el) => {
        // If element is already within viewport on load/scroll and is rendered (offsetParent !== null)
        const rect = el.getBoundingClientRect();
        if (el.offsetParent !== null && rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("eg-reveal-visible");
        } else {
          observer.observe(el);
        }
      });
    };

    // Initial observe
    observeAll();
    const timer = setTimeout(observeAll, 120);

    // Watch for dynamically rendered elements (e.g. stores loaded from API)
    let mutationObserver = null;
    if ("MutationObserver" in window) {
      mutationObserver = new MutationObserver(() => {
        observeAll();
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    // Re-check on window resize (e.g. mobile <-> desktop breakpoint changes)
    window.addEventListener("resize", observeAll, { passive: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("resize", observeAll);
    };
  }, dependencies);
}
