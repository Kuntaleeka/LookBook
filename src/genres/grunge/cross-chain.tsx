"use client";

import { useEffect, useId, useRef } from "react";
import s from "./grunge.module.css";

/*
 * One silver chain slung across the hero, behind the text, with small gothic
 * crosses hanging off it at uneven spacing. Scrolling makes the crosses swing
 * and the chain dip slightly; both settle back.
 *
 * Geometry is in a 1200×320 viewBox. On narrow screens the sides are cropped
 * (not squashed), so links and crosses keep their shape.
 */

// ─── Chain curve: an off-centre sag, lower on the right ─────────────────────
const P0 = { x: -30, y: 16 };
const CTRL = { x: 560, y: 185 };
const P2 = { x: 1230, y: 44 };

function pointAt(t: number) {
  const u = 1 - t;
  return {
    x: u * u * P0.x + 2 * u * t * CTRL.x + t * t * P2.x,
    y: u * u * P0.y + 2 * u * t * CTRL.y + t * t * P2.y,
  };
}
function angleAt(t: number) {
  const u = 1 - t;
  const dx = 2 * u * (CTRL.x - P0.x) + 2 * t * (P2.x - CTRL.x);
  const dy = 2 * u * (CTRL.y - P0.y) + 2 * t * (P2.y - CTRL.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** Evenly spaced links along the curve (by arc length). */
function buildLinks(spacing: number) {
  const links: { x: number; y: number; a: number }[] = [];
  let prev = pointAt(0);
  let travelled = spacing;
  for (let i = 1; i <= 4000; i++) {
    const t = i / 4000;
    const p = pointAt(t);
    travelled += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
    if (travelled >= spacing) {
      links.push({ x: +p.x.toFixed(1), y: +p.y.toFixed(1), a: +angleAt(t).toFixed(1) });
      travelled = 0;
    }
  }
  return links;
}
const LINKS = buildLinks(6.5);

// ─── Cross shape (spiky gothic, from one arm profile) ──────────────────────
const C = { x: 60, y: 66 };
const ARMS: { u: [number, number]; length: number }[] = [
  { u: [0, -1], length: 42 },
  { u: [1, 0], length: 56 },
  { u: [0, 1], length: 110 },
  { u: [-1, 0], length: 56 },
];
function crossPath(k = 1, shrink = 0) {
  const pts: string[] = [];
  for (const { u, length: L0 } of ARMS) {
    const L = L0 - shrink;
    const p: [number, number] = [-u[1], u[0]];
    const prof: [number, number][] = [
      [7, 7 * k], [L - 24, 7.5 * k], [L - 22, 12 * k], [L - 19, 19 * k],
      [L - 16, 12 * k], [L - 12, 15 * k], [L - 9, 5 * k], [L, 0],
    ];
    const at = (d: number, w: number) =>
      `${(C.x + u[0] * d + p[0] * w).toFixed(1)},${(C.y + u[1] * d + p[1] * w).toFixed(1)}`;
    for (const [d, w] of prof) pts.push(at(d, -w));
    for (const [d, w] of [...prof].reverse().slice(1)) pts.push(at(d, w));
  }
  return `M${pts.join("L")}Z`;
}
const OUTLINE = crossPath();
const ENGRAVING = crossPath(0.45, 7);

// ─── Where the crosses hang: deliberately uneven ───────────────────────────
type Charm = { t: number; drop: number; w: number; gem?: boolean; dir: 1 | -1 };
const CHARMS: Charm[] = [
  { t: 0.035, drop: 18, w: 24, dir: 1 },
  { t: 0.09, drop: 62, w: 30, dir: -1 },
  { t: 0.13, drop: 30, w: 40, gem: true, dir: 1 },
  { t: 0.17, drop: 96, w: 22, dir: -1 },
  { t: 0.21, drop: 14, w: 26, dir: 1 },
  { t: 0.33, drop: 48, w: 34, dir: -1 },
  { t: 0.4, drop: 80, w: 24, dir: 1 },
  { t: 0.445, drop: 22, w: 42, dir: -1 },
  { t: 0.52, drop: 108, w: 28, gem: true, dir: 1 },
  { t: 0.56, drop: 40, w: 22, dir: -1 },
  { t: 0.68, drop: 70, w: 36, dir: 1 },
  { t: 0.72, drop: 16, w: 24, gem: true, dir: -1 },
  { t: 0.79, drop: 52, w: 30, dir: 1 },
  { t: 0.86, drop: 90, w: 22, dir: -1 },
  { t: 0.94, drop: 26, w: 32, dir: 1 },
];
const ANCHORS = CHARMS.map((c) => pointAt(c.t));

export function CrossChain() {
  const id = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const charmRefs = useRef<(SVGGElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const state = CHARMS.map((c, i) => {
      const period = 1 + c.drop / 60;
      return { angle: 0, spin: 0, k: (2 * Math.PI / period) ** 2, period, phase: i * 1.3 };
    });
    let dip = 0;
    let dipV = 0;
    let lastScroll = window.scrollY;
    let lastTime = performance.now();
    let frame = 0;
    let visible = true;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;

      // The chain dips against the scroll direction, then springs back.
      dipV -= delta * 0.9;
      dipV += (-70 * dip - 11 * dipV) * dt;
      dip = Math.max(-10, Math.min(10, dip + dipV * dt));
      svg.style.transform = `translate3d(0, ${dip.toFixed(2)}px, 0)`;

      CHARMS.forEach((c, i) => {
        const st = state[i];
        st.spin += delta * 0.0075 * c.dir;
        st.spin += (-st.k * st.angle - 0.9 * st.spin) * dt;
        st.angle = Math.max(-0.9, Math.min(0.9, st.angle + st.spin * dt));
        const sway = 0.09 * Math.sin((now / 1000) * (2 * Math.PI / st.period) + st.phase);
        const deg = ((st.angle + sway) * 180) / Math.PI;
        charmRefs.current[i]?.setAttribute(
          "transform",
          `rotate(${deg.toFixed(2)} ${ANCHORS[i].x.toFixed(1)} ${ANCHORS[i].y.toFixed(1)})`,
        );
      });

      if (visible) frame = requestAnimationFrame(tick);
    };

    // Only animate while the chain is on screen.
    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible) {
        lastTime = performance.now();
        lastScroll = window.scrollY;
        frame = requestAnimationFrame(tick);
      }
    });
    io.observe(svg);
    frame = requestAnimationFrame(tick);

    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className={s.chainLayer}
      viewBox="0 0 1200 320"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7f7f7" />
          <stop offset=".25" stopColor="#8d8d8f" />
          <stop offset=".45" stopColor="#ececec" />
          <stop offset=".65" stopColor="#4b4b4e" />
          <stop offset="1" stopColor="#c9c9cc" />
        </linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f2" />
          <stop offset=".5" stopColor="#8a8a8d" />
          <stop offset="1" stopColor="#d6d6d8" />
        </linearGradient>
        <radialGradient id={`${id}g`} cx=".35" cy=".35" r=".7">
          <stop offset="0" stopColor="#e0485a" />
          <stop offset=".45" stopColor="#7a0f14" />
          <stop offset="1" stopColor="#2a0306" />
        </radialGradient>
      </defs>

      {/* main chain: face-on and side-on links alternate */}
      <g>
        {LINKS.map((l, i) =>
          i % 2 === 0 ? (
            <ellipse
              key={i}
              cx={l.x}
              cy={l.y}
              rx="4.3"
              ry="2.5"
              transform={`rotate(${l.a} ${l.x} ${l.y})`}
              fill="none"
              stroke={`url(#${id}l)`}
              strokeWidth="1.5"
            />
          ) : (
            <rect
              key={i}
              x={l.x - 3.4}
              y={l.y - 0.8}
              width="6.8"
              height="1.6"
              rx=".8"
              transform={`rotate(${l.a} ${l.x} ${l.y})`}
              fill={`url(#${id}l)`}
            />
          ),
        )}
      </g>

      {CHARMS.map((c, i) => {
        const a = ANCHORS[i];
        const scale = c.w / 120;
        const drop = Array.from({ length: Math.max(1, Math.round(c.drop / 4)) }, (_, k) => k * 4);
        return (
          <g
            key={i}
            ref={(el) => {
              charmRefs.current[i] = el;
            }}
          >
            {/* drop chain */}
            {drop.map((dy, k) =>
              k % 2 === 0 ? (
                <ellipse key={k} cx={a.x} cy={a.y + dy + 2} rx="1.3" ry="2.1" fill="none" stroke={`url(#${id}l)`} strokeWidth="1" />
              ) : (
                <rect key={k} x={a.x - 0.5} y={a.y + dy} width="1" height="4" fill={`url(#${id}l)`} />
              ),
            )}
            <g transform={`translate(${(a.x - 60 * scale).toFixed(1)} ${(a.y + c.drop - 4 * scale).toFixed(1)}) scale(${scale.toFixed(3)})`}>
              <circle cx="60" cy="12" r="7" fill="none" stroke={`url(#${id}s)`} strokeWidth="3.4" />
              <rect x="55.5" y="17" width="9" height="10" rx="2" fill={`url(#${id}s)`} />
              <path d={OUTLINE} fill={`url(#${id}s)`} stroke="#121212" strokeWidth="1.6" strokeLinejoin="round" />
              <path d={ENGRAVING} fill="none" stroke="#1a1a1a" strokeOpacity=".55" strokeWidth="1.2" />
              <circle cx={C.x} cy={C.y} r="9.5" fill={`url(#${id}s)`} stroke="#121212" strokeWidth="1.2" />
              {c.gem && <circle cx={C.x} cy={C.y} r="6" fill={`url(#${id}g)`} />}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
