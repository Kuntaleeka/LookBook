/*
 * Coquette props, drawn in SVG: a pink satin bow, a pearl strand with a gold
 * heart, and glitter sparkles.
 */
import { jitter } from "../utils";

/** A pink satin bow with light running across the loops. */
export function SatinBow({ className, id }: { className?: string; id: string }) {
  return (
    <svg viewBox="0 0 64 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-loop`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe1e6" />
          <stop offset="0.45" stopColor="#efb3c0" />
          <stop offset="1" stopColor="#d98d9f" />
        </linearGradient>
        <linearGradient id={`${id}-tail`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9a3b3" />
          <stop offset="0.5" stopColor="#f8d3db" />
          <stop offset="1" stopColor="#d58799" />
        </linearGradient>
      </defs>
      {/* tails */}
      <path d="M29 21 C25 30 21 38 16 46 L22 44 L25 47.5 C28 39 30 30 31.5 22Z" fill={`url(#${id}-tail)`} />
      <path d="M35 21 C39 30 43 38 48 46 L42 44 L39 47.5 C36 39 34 30 32.5 22Z" fill={`url(#${id}-tail)`} />
      {/* loops */}
      <path d="M31 18C24 7 11 1 5 4S1 22 10 24c7 1.6 15-2 21-5Z" fill={`url(#${id}-loop)`} />
      <path d="M33 18c7-11 20-17 26-14s4 18-5 20c-7 1.6-15-2-21-5Z" fill={`url(#${id}-loop)`} />
      {/* inner folds and satin sheen */}
      <path d="M29 18C22 13 14 11 9 13" fill="none" stroke="#c97a8e" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M35 18c7-5 15-7 20-5" fill="none" stroke="#c97a8e" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M26 13C20 8 13 5.5 8.5 6.5" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M38 13c6-5 13-7.5 17.5-6.5" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round" />
      {/* knot */}
      <ellipse cx="32" cy="19" rx="4.8" ry="5.6" fill="#e7a2b2" />
      <path d="M30 15.5c1.4-.8 3-.8 4.2 0" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * A strand of pearls draped in a soft curve, ending in a little gold heart.
 * Pearls are placed along a cubic curve so they sit evenly.
 */
export function Pearls({ className, id }: { className?: string; id: string }) {
  // curve from top-left, sagging down and round to the bottom-right
  const p0 = [8, 10], p1 = [70, 230], p2 = [230, 40], p3 = [300, 250];
  const at = (t: number) => {
    const u = 1 - t;
    const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    return [0, 1].map((d) => k[0] * p0[d] + k[1] * p1[d] + k[2] * p2[d] + k[3] * p3[d]);
  };
  // even spacing by arc length
  const samples = Array.from({ length: 401 }, (_, i) => at(i / 400));
  const lengths = [0];
  for (let i = 1; i < samples.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(samples[i][0] - samples[i - 1][0], samples[i][1] - samples[i - 1][1]));
  }
  const total = lengths[lengths.length - 1];
  const gap = 9.6;
  const pearls: number[][] = [];
  for (let d = 0, j = 0; d <= total; d += gap) {
    while (lengths[j] < d) j++;
    pearls.push(samples[j].map((v) => Math.round(v * 10) / 10));
  }
  const end = pearls[pearls.length - 1];

  return (
    <svg viewBox="0 0 320 290" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-pearl`} cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.45" stopColor="#f7f1ea" />
          <stop offset="1" stopColor="#d8cabd" />
        </radialGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e3a6" />
          <stop offset="0.5" stopColor="#c99a44" />
          <stop offset="1" stopColor="#f0d58d" />
        </linearGradient>
      </defs>
      {pearls.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.4" fill={`url(#${id}-pearl)`} stroke="#cdbfb2" strokeWidth=".4" />
      ))}
      {/* the heart pendant on a little gold loop */}
      <circle cx={end[0]} cy={end[1] + 7} r="2.6" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.6" />
      <path
        transform={`translate(${end[0] - 10} ${end[1] + 9})`}
        d="M10 18 C3 12 0 8.5 0 5.2 C0 2.2 2.3 0 5 0 C7 0 8.8 1.2 10 3 C11.2 1.2 13 0 15 0 C17.7 0 20 2.2 20 5.2 C20 8.5 17 12 10 18Z"
        fill={`url(#${id}-gold)`}
        stroke="#b88a3a"
        strokeWidth=".6"
      />
    </svg>
  );
}

/** Four-point glints scattered over an area, twinkling on their own clocks. */
export function Sparkles({ className, sparkClass, count = 18, seed = 1 }: { className?: string; sparkClass?: string; count?: number; seed?: number }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const n = i + seed * 31;
        const size = 8 + Math.abs(jitter(n + 3)) * 16;
        return (
          <svg
            key={i}
            viewBox="0 0 20 20"
            className={sparkClass}
            style={{
              left: `${(50 + jitter(n) * 48).toFixed(1)}%`,
              top: `${(50 + jitter(n + 1) * 46).toFixed(1)}%`,
              width: `${size.toFixed(1)}px`,
              animationDelay: `${(Math.abs(jitter(n + 2)) * 4).toFixed(2)}s`,
              animationDuration: `${(2.4 + Math.abs(jitter(n + 4)) * 2.6).toFixed(2)}s`,
            }}
          >
            <path d="M10 0 C10.8 7 13 9.2 20 10 C13 10.8 10.8 13 10 20 C9.2 13 7 10.8 0 10 C7 9.2 9.2 7 10 0Z" fill="#fff" />
          </svg>
        );
      })}
    </div>
  );
}
