"use client";

import { useEffect, useRef } from "react";
import { Glasses } from "./props";

/**
 * The glasses slip down and tilt as you scroll, like she's peering at you
 * over the top of them. Drives a --slip variable (0…1); the CSS does the rest.
 */
export function ScrollGlasses({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const slip = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      el.style.setProperty("--slip", slip.toFixed(3));
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
      <Glasses />
    </div>
  );
}
