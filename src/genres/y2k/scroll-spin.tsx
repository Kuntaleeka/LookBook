"use client";

import { useEffect, useRef } from "react";

/**
 * Publishes how far the page has scrolled as --scroll (in px) on every
 * [data-spin] element inside it, so they can turn with it (the CD spins as
 * you scroll).
 */
export function ScrollSpin({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-spin]");
    let frame = 0;
    const update = () => {
      frame = 0;
      // set on the spinning things themselves, not the whole page, so the
      // browser only restyles them (keeps phone scrolling smooth)
      for (const target of targets) target.style.setProperty("--scroll", window.scrollY.toFixed(0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
