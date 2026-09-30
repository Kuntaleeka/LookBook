"use client";

import { useEffect, useRef, useState } from "react";
import type { LookbookItem } from "@/lib/items";
import t from "./tagged-photo.module.css";

export type TaggedPhotoClasses = {
  /** Sets --tp-line / --tp-pin / --tp-pin-ring (and optionally --tp-dash, --tp-line-w). */
  root?: string;
  bubble?: string;
  name?: string;
  link?: string;
  /** When set, each bubble gets a small tag saying where the piece is from. */
  source?: string;
  /** Empty decorative elements added to every bubble (stickers, drips, tails…). */
  extras?: string[];
};

const SOURCE_TAGS = { shop: "shop", instagram: "insta", local: "local", unknown: "???" } as const;

type Placed = { id: string; top: number; line: string };

/**
 * Splits bubbles between the two sides so neither gets crowded: the leftmost
 * half of the pins get bubbles on the left, the rest on the right (a single
 * item just goes on its nearer side). Each side is ordered top to bottom.
 */
function splitSides<T extends { x: number; y: number }>(items: T[]) {
  const byY = (a: T, b: T) => a.y - b.y;
  if (items.length === 1) {
    return items[0].x < 0.5 ? { left: [...items], right: [] } : { left: [], right: [...items] };
  }
  const byX = [...items].sort((a, b) => a.x - b.x);
  const leftCount = Math.ceil(items.length / 2);
  return {
    left: byX.slice(0, leftCount).sort(byY),
    right: byX.slice(leftCount).sort(byY),
  };
}

const GAP = 10; // default min space between stacked bubbles; genres can set --tp-gap

/**
 * A photo with a pin on every tagged item and a line from each pin out to a
 * speech bubble beside the photo, split evenly between the left and right.
 * On narrow screens pins are numbered and the bubbles list underneath instead.
 */
export function TaggedPhoto({
  src,
  alt,
  width,
  height,
  items,
  classes = {},
}: {
  src: string;
  alt: string;
  /** Stored photo size, so the layout knows the shape before it loads. */
  width?: number | null;
  height?: number | null;
  items: LookbookItem[];
  classes?: TaggedPhotoClasses;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const bubbleRefs = useRef(new Map<string, HTMLElement>());
  const [placed, setPlaced] = useState<Placed[]>([]);
  // Extra room at the bottom when a side's bubbles run past the photo.
  const [overflow, setOverflow] = useState(0);
  const [active, setActive] = useState<string | null>(null);

  const numbered = items.map((item, i) => ({ ...item, n: i + 1 }));
  const { left, right } = splitSides(numbered);

  useEffect(() => {
    const sides = splitSides(items);
    let frame = 0;

    const measure = () => {
      const root = rootRef.current;
      const img = imgRef.current;
      if (!root || !img || !img.complete || !img.naturalWidth) return;
      if (!window.matchMedia("(min-width: 900px)").matches) {
        setPlaced([]);
        setOverflow(0);
        return;
      }

      const gap = parseFloat(getComputedStyle(root).getPropertyValue("--tp-gap")) || GAP;
      const rootBox = root.getBoundingClientRect();
      const imgBox = img.getBoundingClientRect();
      const imgLeft = imgBox.left - rootBox.left;
      const imgTop = imgBox.top - rootBox.top;
      const next: Placed[] = [];
      let overrun = 0;

      for (const side of ["left", "right"] as const) {
        let floor = 0; // bubbles stack downward and never overlap
        for (const item of sides[side]) {
          const el = bubbleRefs.current.get(item.id);
          const col = el?.parentElement;
          if (!el || !col) continue;
          const h = el.offsetHeight;
          const colBox = col.getBoundingClientRect();
          const pinX = imgLeft + item.x * imgBox.width;
          const pinY = imgTop + item.y * imgBox.height;
          // Line up with the pin where possible, keep inside the photo's height
          // if it fits, but always below the previous bubble.
          const wanted = pinY - (colBox.top - rootBox.top) - h / 2;
          const top = Math.max(floor, Math.min(Math.max(0, colBox.height - h), wanted));
          floor = top + h + gap;
          overrun = Math.max(overrun, top + h - colBox.height);

          const anchorX = side === "left" ? colBox.right - rootBox.left : colBox.left - rootBox.left;
          const anchorY = colBox.top - rootBox.top + top + h / 2;
          // Out of the pin sideways past the photo's edge, then across to the bubble.
          const elbowX = side === "left" ? imgLeft - 14 : imgLeft + imgBox.width + 14;
          next.push({
            id: item.id,
            top,
            line: `M${pinX.toFixed(1)} ${pinY.toFixed(1)} L${elbowX.toFixed(1)} ${pinY.toFixed(1)} L${anchorX.toFixed(1)} ${anchorY.toFixed(1)}`,
          });
        }
      }
      setPlaced(next);
      setOverflow(Math.ceil(Math.max(0, overrun)));
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    if (rootRef.current) ro.observe(rootRef.current);
    const img = imgRef.current;
    img?.addEventListener("load", schedule);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      img?.removeEventListener("load", schedule);
    };
  }, [src, items]);

  const topOf = (id: string) => placed.find((p) => p.id === id)?.top;

  const bubble = (item: (typeof numbered)[number], measured = true) => {
    const top = measured ? topOf(item.id) : undefined;
    return (
      <div
        key={item.id}
        ref={
          measured
            ? (el) => {
                if (el) bubbleRefs.current.set(item.id, el);
                else bubbleRefs.current.delete(item.id);
              }
            : undefined
        }
        className={`${t.bubble} ${classes.bubble ?? t.defaultBubble} ${active === item.id ? t.bubbleActive : ""}`}
        style={top !== undefined ? { top } : undefined}
        onMouseEnter={() => setActive(item.id)}
        onMouseLeave={() => setActive(null)}
        onFocus={() => setActive(item.id)}
        onBlur={() => setActive(null)}
      >
        <span className={t.num} aria-hidden="true">
          {item.n}
        </span>
        {classes.extras?.map((cls) => <span key={cls} className={cls} aria-hidden="true" />)}
        {classes.source && <span className={classes.source}>{SOURCE_TAGS[item.source]}</span>}
        <span className={`${t.name} ${classes.name ?? ""}`}>{item.name}</span>
        {item.href ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${t.link} ${classes.link ?? ""}`}
          >
            {!classes.source && (item.source === "instagram" ? "IG " : item.source === "local" ? "📍 " : "")}
            {item.linkLabel} ↗
          </a>
        ) : (
          <span className={t.unknown}>source unknown</span>
        )}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`${t.root} ${classes.root ?? ""} ${placed.length ? t.laidOut : ""}`}
      style={overflow ? { marginBottom: overflow } : undefined}
    >
      <div className={`${t.col} ${t.colLeft}`}>{left.map((i) => bubble(i))}</div>

      <div
        className={t.photo}
        style={
          {
            aspectRatio: `${width ?? 900} / ${height ?? 1200}`,
            "--ratio": (width ?? 900) / (height ?? 1200),
          } as React.CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- already sized on upload */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width ?? 900}
          height={height ?? 1200}
          className={t.img}
        />
        {numbered.map((item) => (
          <span
            key={item.id}
            className={`${t.pin} ${active === item.id ? t.pinActive : ""}`}
            style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
            aria-hidden="true"
          >
            <span className={t.pinNum}>{item.n}</span>
          </span>
        ))}
      </div>

      <div className={`${t.col} ${t.colRight}`}>{right.map((i) => bubble(i))}</div>

      {/* narrow screens: one list in pin-number order */}
      <div className={`${t.col} ${t.list}`}>{numbered.map((i) => bubble(i, false))}</div>

      {placed.length > 0 && (
        <svg className={t.lines} aria-hidden="true">
          {placed.map((p) => (
            <path key={p.id} d={p.line} className={active === p.id ? t.lineActive : undefined} />
          ))}
        </svg>
      )}
    </div>
  );
}
