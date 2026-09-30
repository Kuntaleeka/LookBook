"use client";

import { useEffect, useRef } from "react";
import s from "./acubi.module.css";

/*
 * Silver star hair clips scattered down the page (inspo: the star clips in
 * the hair). They drift at their own speed as you scroll, tilt a little,
 * and a glint sweeps across them now and then.
 */

type Clip = { x: number; y: number; size: number; rot: number; speed: number; spin: number };

// x / y in % of the page; speed < 0 drifts up, > 0 lags behind.
const CLIPS: Clip[] = [
  { x: 3, y: 6, size: 54, rot: -18, speed: 0.18, spin: 1 },
  { x: 91, y: 4, size: 38, rot: 14, speed: 0.32, spin: -1 },
  { x: 95, y: 17, size: 26, rot: -30, speed: 0.12, spin: 1 },
  { x: 6, y: 33, size: 30, rot: 24, speed: 0.26, spin: -1 },
  { x: 89, y: 44, size: 48, rot: -6, speed: 0.2, spin: 1 },
  { x: 2, y: 62, size: 42, rot: 10, speed: 0.3, spin: -1 },
  { x: 93, y: 74, size: 32, rot: -22, speed: 0.15, spin: 1 },
  { x: 8, y: 88, size: 36, rot: 30, speed: 0.24, spin: -1 },
];

export function StarClips() {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      CLIPS.forEach((c, i) => {
        const el = refs.current[i];
        if (el) {
          el.style.transform = `translate3d(0, ${(y * c.speed).toFixed(1)}px, 0) rotate(${(c.rot + y * 0.03 * c.spin).toFixed(2)}deg)`;
        }
      });
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
    <div className={s.clips} aria-hidden="true">
      {CLIPS.map((c, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={s.clip}
          style={
            {
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size,
              transform: `rotate(${c.rot}deg)`,
              "--glint-delay": `${(i * 1.3) % 7}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
