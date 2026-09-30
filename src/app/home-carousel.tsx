"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { OPEN_GENRE } from "@/components/page-transitions";
import s from "./home.module.css";

export type CarouselGenre = {
  slug: string;
  name: string;
  description: string | null;
  count: number;
  /** A random published outfit photo, or null if the genre has none yet. */
  portrait: string | null;
};

// Parallax: how far the layers slide (px) per card-step away from the front.
const BG_SHIFT = 190; // background: fast
const PORTRAIT_SHIFT = 34; // portrait: slow
const AUTO_SPEED = 0.0016; // cards per frame when gliding on its own
const STEP_DEG = 34; // angle between neighbouring cards on the arc
const VISIBLE = 2.6; // cards further than this from the front fade out
const IDLE_MS = 3500; // resume gliding this long after the last interaction
const TILT_Y = 16; // max degrees the front card turns toward the cursor, left/right
const TILT_X = 11; // …and up/down
const FLICK_MS = 260; // a released swipe carries on as if dragged this much longer
const FLICK_MAX = 2; // …but by no more than this many cards

/** Ease `amount` (per 60fps frame) at any frame rate. */
function ease(amount: number, dt: number) {
  return 1 - Math.pow(1 - amount, dt / (1000 / 60));
}

/** Signed distance from `pos` to card `i` on a ring of `n`, in (-n/2, n/2]. */
function ringOffset(i: number, pos: number, n: number) {
  let d = (i - pos) % n;
  if (d > n / 2) d -= n;
  if (d <= -n / 2) d += n;
  return d;
}

/**
 * A 3D ring of genre cards that glides left to right on its own. Scroll
 * sideways, drag/swipe, use the arrow keys or click a side card to move it;
 * it settles on the nearest card. Each card has a fast-moving background
 * (the genre's own backdrop) and a slow-moving portrait, for depth.
 */
export function HomeCarousel({ genres }: { genres: CarouselGenre[] }) {
  const n = genres.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const motion = useRef({
    pos: 0,
    target: 0,
    lastInput: -Infinity,
    hover: false,
    dragX: null as number | null,
    dragged: false,
    // swipe speed in cards per ms (smoothed), for flicks
    velocity: 0,
    lastMove: 0,
    cardW: 280,
    // cursor position over the front card, -1…1 (0 = centre), and the eased tilt
    aimX: 0,
    aimY: 0,
    tiltX: 0,
    tiltY: 0,
  });
  const [active, setActive] = useState(0);

  const nudge = useCallback((steps: number) => {
    const m = motion.current;
    m.target = Math.round(m.target) + steps;
    m.lastInput = performance.now();
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const m = motion.current;
      m.target = m.pos + ringOffset(i, m.pos, n);
      m.lastInput = performance.now();
    },
    [n],
  );

  useEffect(() => {
    if (!n) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const m = motion.current;
    let frame = 0;
    let shown = -1;
    let last = performance.now();

    // Measure the card width only when it changes; reading it every frame
    // would force a layout per frame (the main source of jank on phones).
    const measure = () => (m.cardW = cardRefs.current[0]?.offsetWidth || m.cardW);
    measure();
    const resize = new ResizeObserver(measure);
    if (cardRefs.current[0]) resize.observe(cardRefs.current[0]);

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const idle = now - m.lastInput > IDLE_MS && !m.hover && m.dragX === null;
      // Glide left to right: the ring turns so cards travel rightward.
      if (idle && !reduced) m.target -= AUTO_SPEED * (dt / (1000 / 60));
      else if (m.dragX === null && now - m.lastInput > 450) m.target += (Math.round(m.target) - m.target) * ease(0.12, dt);

      // While a finger is down the ring follows it 1:1; otherwise it eases.
      if (reduced || m.dragX !== null) m.pos = m.target;
      else m.pos += (m.target - m.pos) * ease(0.085, dt);
      // Ease the front card's tilt toward the cursor (back to flat when it leaves).
      const aimX = reduced ? 0 : m.aimX;
      const aimY = reduced ? 0 : m.aimY;
      m.tiltX += (aimY * -TILT_X - m.tiltX) * ease(0.1, dt);
      m.tiltY += (aimX * TILT_Y - m.tiltY) * ease(0.1, dt);

      const stage = stageRef.current;
      const cardW = m.cardW;
      const step = STEP_DEG;
      // A wide, shallow arc: neighbours sit side by side with a small gap.
      const radius = (cardW * 1.12) / (2 * Math.tan((step * Math.PI) / 360));
      if (stage) stage.style.setProperty("--radius", `${radius}px`);

      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = ringOffset(i, m.pos, n);
        const dist = Math.abs(d);
        // The front card leans toward the cursor; side cards turn a touch
        // further on their own, so their layers show depth.
        const focus = Math.max(0, 1 - dist);
        const leanY = m.tiltY * focus - d * 6;
        const leanX = m.tiltX * focus;
        el.style.transform =
          `translate(-50%, -50%) rotateY(${(d * step).toFixed(2)}deg) translateZ(${radius.toFixed(0)}px) ` +
          `rotateX(${leanX.toFixed(2)}deg) rotateY(${leanY.toFixed(2)}deg)`;
        // glare position follows the lean
        el.style.setProperty("--glare-x", `${(50 + leanY * 3).toFixed(1)}%`);
        el.style.setProperty("--glare-y", `${(40 - leanX * 3).toFixed(1)}%`);
        el.style.setProperty("--bg-x", `${(-d * BG_SHIFT).toFixed(1)}px`);
        el.style.setProperty("--portrait-x", `${(-d * PORTRAIT_SHIFT).toFixed(1)}px`);
        el.style.setProperty("--dim", Math.min(0.8, dist * 0.3).toFixed(3));
        el.style.opacity = dist > VISIBLE ? "0" : dist > VISIBLE - 0.6 ? ((VISIBLE - dist) / 0.6).toFixed(3) : "1";
        el.style.pointerEvents = dist > VISIBLE - 0.3 ? "none" : "";
        el.style.zIndex = String(100 - Math.round(dist * 10));
      });

      const front = ((Math.round(m.pos) % n) + n) % n;
      if (front !== shown) {
        shown = front;
        setActive(front);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [n]);

  // Sideways scrolling (trackpad, shift+wheel, or a plain wheel over the ring).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      e.preventDefault();
      const m = motion.current;
      m.target += delta / 420;
      m.lastInput = performance.now();
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  if (!n) {
    return <p className={s.emptyRing}>No aesthetics to show yet.</p>;
  }

  const current = genres[active];

  return (
    <section className={s.carousel} aria-roledescription="carousel" aria-label="Aesthetics">
      <div
        ref={stageRef}
        className={s.stage}
        tabIndex={0}
        aria-label="Use the left and right arrow keys to browse"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") nudge(1);
          if (e.key === "ArrowLeft") nudge(-1);
        }}
        onPointerEnter={(e) => (motion.current.hover = e.pointerType === "mouse")}
        onPointerLeave={() => {
          const m = motion.current;
          m.hover = false;
          m.aimX = 0;
          m.aimY = 0;
        }}
        onPointerDown={(e) => {
          const m = motion.current;
          m.dragX = e.clientX;
          m.dragged = false;
          m.velocity = 0;
          m.lastMove = performance.now();
          m.target = m.pos; // catch the ring where it is
          m.lastInput = m.lastMove;
        }}
        onPointerMove={(e) => {
          const m = motion.current;
          // Aim the front card's tilt at the cursor (mouse only: on touch it
          // would just jolt the card under your finger).
          if (e.pointerType === "mouse") {
            const front = cardRefs.current[active]?.getBoundingClientRect();
            if (front) {
              m.aimX = Math.max(-1, Math.min(1, ((e.clientX - front.left) / front.width) * 2 - 1));
              m.aimY = Math.max(-1, Math.min(1, ((e.clientY - front.top) / front.height) * 2 - 1));
            }
          }
          if (m.dragX === null) return;
          const now = performance.now();
          const dx = e.clientX - m.dragX;
          if (Math.abs(dx) > 6) m.dragged = true;
          m.dragX = e.clientX;
          const moved = -dx / (m.cardW * 1.1);
          m.target += moved;
          const dt = Math.max(1, now - m.lastMove);
          m.velocity = m.velocity * 0.6 + (moved / dt) * 0.4;
          m.lastMove = now;
          m.lastInput = now;
        }}
        onPointerUp={() => {
          const m = motion.current;
          m.dragX = null;
          const now = performance.now();
          // A flick carries on to a further card; a slow release settles on the nearest.
          const fresh = now - m.lastMove < 80 ? m.velocity : 0;
          const carry = Math.max(-FLICK_MAX, Math.min(FLICK_MAX, fresh * FLICK_MS));
          m.target = Math.round(m.target + carry);
          m.lastInput = now;
        }}
        onPointerCancel={() => {
          const m = motion.current;
          m.dragX = null;
          m.target = Math.round(m.target);
        }}
      >
        <div className={s.ring}>
          {genres.map((g, i) => (
            <Link
              key={g.slug}
              href={`/${g.slug}`}
              transitionTypes={OPEN_GENRE}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className={`${s.card} ${s[`g_${g.slug.replace(/-/g, "_")}`] ?? s.g_default}`}
              aria-label={`${g.name}${i === active ? "" : " (bring to front)"}`}
              aria-current={i === active ? "true" : undefined}
              draggable={false}
              onClick={(e) => {
                // A drag isn't a click; a side card comes to the front first.
                if (motion.current.dragged || i !== active) {
                  e.preventDefault();
                  if (!motion.current.dragged) goTo(i);
                }
              }}
            >
              {/* back layer: the genre's backdrop, set behind the card face */}
              <span className={s.bgPlane} aria-hidden="true">
                <span className={s.bg}>
                  <span className={s.bgWord}>
                    {g.name} {g.name} {g.name}
                  </span>
                </span>
              </span>
              <span className={s.portraitFrame}>
                {g.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element -- already sized on upload
                  <img src={g.portrait} alt="" className={s.portrait} draggable={false} />
                ) : (
                  <span className={s.soon}>coming soon</span>
                )}
                <span className={s.glare} aria-hidden="true" />
              </span>
              <span className={s.cardName}>{g.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className={s.controls}>
        <button type="button" onClick={() => nudge(-1)} className={s.arrow} aria-label="Previous aesthetic">
          ‹
        </button>
        <div className={s.dots} role="tablist" aria-label="Choose an aesthetic">
          {genres.map((g, i) => (
            <button
              key={g.slug}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={g.name}
              className={`${s.dot} ${i === active ? s.dotActive : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" onClick={() => nudge(1)} className={s.arrow} aria-label="Next aesthetic">
          ›
        </button>
      </div>

      <div className={s.details} aria-live="polite">
        <h2 className={s.detailsName}>{current.name}</h2>
        {current.description && <p className={s.detailsText}>{current.description}</p>}
        <p className={s.detailsMeta}>
          {current.count ? `${current.count} ${current.count === 1 ? "look" : "looks"}` : "coming soon"}
        </p>
        <Link href={`/${current.slug}`} className={s.enter} transitionTypes={OPEN_GENRE}>
          Enter {current.name} →
        </Link>
      </div>
    </section>
  );
}
