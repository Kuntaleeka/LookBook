"use client";

import { useEffect, useRef } from "react";

type Flake = { x: number; y: number; r: number; speed: number; sway: number; phase: number };

/**
 * Snow falling across the whole page, slanting in the wind like a night
 * snowfall under a streetlight. Bigger, nearer flakes fall faster and streak.
 * Drawn on one fixed canvas; pauses when the tab is hidden.
 */
export function Snowfall({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let flakes: Flake[] = [];
    const spawn = (anywhere: boolean): Flake => {
      const r = 0.5 + Math.random() ** 2.2 * 2.6;
      return {
        x: Math.random() * (w + 200) - 100,
        y: anywhere ? Math.random() * h : -10 - Math.random() * 40,
        r,
        speed: 0.6 + r * 0.75 + Math.random() * 0.5,
        sway: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
      };
    };
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(170, Math.round((w * h) / (phone ? 11000 : 8500)));
      flakes = Array.from({ length: count }, () => spawn(true));
    };

    // Phones: redrawing the whole screen while it is also scrolling makes the
    // page stutter, so the snow holds still for a moment whenever you scroll.
    const phone = window.matchMedia("(max-width: 639px)").matches;
    let scrolledAt = -Infinity;
    const onScroll = () => {
      scrolledAt = performance.now();
    };

    let frame = 0;
    let last = performance.now();
    let t = 0;
    const draw = (now: number) => {
      if (phone && now - scrolledAt < 180) {
        last = now;
        frame = requestAnimationFrame(draw);
        return;
      }
      const dt = Math.min(50, now - last) / 16.67;
      last = now;
      t += dt;
      // the wind gusts slowly back and forth
      const wind = 0.9 + Math.sin(t * 0.004) * 0.7;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      for (const f of flakes) {
        f.y += f.speed * dt;
        f.x += (wind * f.r * 0.45 + Math.sin(t * 0.02 + f.phase) * f.sway * 0.3) * dt;
        if (f.y > h + 20 || f.x > w + 100) Object.assign(f, spawn(false));
        const alpha = 0.35 + f.r * 0.2;
        if (f.r > 1.6) {
          // near flakes streak a little, like the photo
          const len = f.speed * 2.6;
          ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.8).toFixed(2)})`;
          ctx.lineWidth = f.r * 0.9;
          ctx.beginPath();
          ctx.moveTo(f.x - wind * len * 0.35, f.y - len);
          ctx.lineTo(f.x, f.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (!reduced) frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reduced) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    if (phone) window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
