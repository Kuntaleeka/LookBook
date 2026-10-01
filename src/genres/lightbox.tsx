"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { LookbookItem } from "@/lib/items";
import { TaggedPhoto, type TaggedPhotoClasses } from "./tagged-photo";

type LightboxItem = {
  imageUrl: string;
  title: string;
  caption: string;
  notes: string | null;
  /** Tagged pieces: shown as pins with lines out to bubbles. */
  items?: LookbookItem[];
  width?: number | null;
  height?: number | null;
  /** Extra photos of the same fit; shown all together when tags are hidden. */
  photos?: { url: string; width: number | null; height: number | null }[];
};

type Shot = { url: string; ratio: number };

/** How many photos go on each row, for a given number of photos. */
function rowsFor<T>(shots: T[]): T[][] {
  const n = shots.length;
  const perRow = n <= 3 ? n : n === 4 ? 2 : 3;
  // put the short row first (5 → 2 + 3, 7 → 1…) so the main photo gets the room
  const first = n % perRow || perRow;
  const rows = [shots.slice(0, first)];
  for (let i = first; i < n; i += perRow) rows.push(shots.slice(i, i + perRow));
  return rows;
}

/**
 * Every photo of the fit at once, uncropped: each row is "justified", so its
 * photos share one height whatever their shapes. Two or three sit side by
 * side; more wrap onto further rows.
 */
function PhotoSet({ shots, alt }: { shots: Shot[]; alt: string }) {
  const rows = rowsFor(shots);
  let n = 0;
  return (
    <div className="lb-set flex flex-col items-center gap-2 p-3 md:gap-3 md:p-5">
      {rows.map((row, r) => {
        const total = row.reduce((sum, s) => sum + s.ratio, 0);
        return (
          <div
            key={r}
            className="flex w-full justify-center gap-2 md:gap-3"
            // never taller than the screen allows: cap the row's width by its shape
            style={{ maxWidth: `calc(${total.toFixed(4)} * ${rows.length > 1 ? "48dvh" : "70dvh"})` }}
          >
            {row.map((shot) => {
              const i = n++;
              return (
                <div
                  key={shot.url}
                  className="lb-shot min-w-0 overflow-hidden"
                  style={{ flex: `${shot.ratio.toFixed(4)} 1 0%`, aspectRatio: shot.ratio.toFixed(4), animationDelay: `${i * 70}ms` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- already sized on upload */}
                  <img
                    src={shot.url}
                    alt={i === 0 ? alt : `${alt}, photo ${i + 1} of ${shots.length}`}
                    className="block h-full w-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Class names a genre passes in to style the lightbox in its own voice. */
export type LightboxClasses = {
  dialog: string;
  image: string;
  title: string;
  caption: string;
  notes: string;
  button: string;
  /** Pins, lines and bubbles for tagged items. */
  tags?: TaggedPhotoClasses;
};

const OpenContext = createContext<(index: number) => void>(() => {});

/** Opens the lightbox at an index, from anywhere inside <Lightbox>. */
export function useOpenOutfit() {
  return useContext(OpenContext);
}

export function Lightbox({
  items,
  classes,
  closeLabel = "Close",
  children,
}: {
  items: LightboxItem[];
  classes: LightboxClasses;
  closeLabel?: string;
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  // Tags always start shown; hiding them lasts until the pop-up is closed.
  const [showTags, setShowTags] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const item = index === null ? null : items[index];
  const tagCount = item?.items?.length ?? 0;

  // Hiding tags on a fit with several photos: the tags fade off the main photo
  // first, then the full set of photos takes its place (and the reverse).
  const [setOpen, setSetOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const shots: Shot[] = item
    ? [{ url: item.imageUrl, width: item.width ?? null, height: item.height ?? null }, ...(item.photos ?? [])].map(
        (p) => ({ url: p.url, ratio: p.width && p.height ? p.width / p.height : 0.75 }),
      )
    : [];
  const hasSet = shots.length > 1;
  // untagged fits with several photos always show the set
  const showSet = hasSet && (tagCount === 0 || setOpen);

  function toggleTags() {
    if (timer.current) clearTimeout(timer.current);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (showTags) {
      setShowTags(false);
      timer.current = setTimeout(() => setSetOpen(true), still ? 0 : 560);
    } else {
      setSetOpen(false);
      // let the tagged photo mount with its tags still faded, then fade them in
      timer.current = setTimeout(() => setShowTags(true), still ? 0 : 60);
    }
  }
  // shown only on photos that have tagged items
  const tagsButton =
    tagCount > 0 ? (
      <button type="button" onClick={toggleTags} aria-pressed={showTags} className={classes.button}>
        {showTags ? "Hide tags" : `Show tags (${tagCount})`}
      </button>
    ) : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  /** Opens a look, with its tags showing. */
  const open = useCallback((i: number) => {
    if (timer.current) clearTimeout(timer.current);
    setShowTags(true);
    setSetOpen(false);
    setIndex(i);
  }, []);

  return (
    <OpenContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIndex(null); // click on backdrop
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        aria-label={item?.title}
        className={`m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] overflow-auto p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm ${
          tagCount > 0 || hasSet ? "max-w-6xl" : "max-w-5xl"
        } ${classes.dialog}`}
      >
        {item && (tagCount > 0 || hasSet) ? (
          // Tagged: photo with pins + bubbles across the top, details below.
          // "Hide tags" fades the pins and bubbles away and leaves the photo put.
          <div className="flex flex-col bg-inherit">
            <div className={classes.image}>
              {showSet ? (
                <PhotoSet key={item.imageUrl} shots={shots} alt={item.title} />
              ) : (
                <TaggedPhoto
                  key={item.imageUrl}
                  src={item.imageUrl}
                  alt={item.title}
                  width={item.width}
                  height={item.height}
                  items={item.items ?? []}
                  classes={classes.tags}
                  tagsHidden={!showTags}
                />
              )}
            </div>
            {/* the title and buttons stay pinned to the bottom of the pop-up while
                the photo, tags or photo set scroll behind them */}
            <div className="sticky bottom-0 z-10 flex flex-col gap-3 bg-inherit p-6 shadow-[0_-12px_24px_-16px_rgba(0,0,0,0.45)] md:flex-row md:items-end md:justify-between md:gap-8 md:px-8">
              <div className="flex flex-col gap-2">
                <p className={classes.caption}>{item.caption}</p>
                <h2 className={classes.title}>{item.title}</h2>
                {item.notes && <p className={`whitespace-pre-line ${classes.notes}`}>{item.notes}</p>}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 pt-2">
                {tagsButton}
                {items.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} className={classes.button}>
                      ← Prev
                    </button>
                    <button type="button" onClick={() => step(1)} className={classes.button}>
                      Next →
                    </button>
                  </>
                )}
                <button type="button" onClick={() => setIndex(null)} className={classes.button}>
                  {closeLabel}
                </button>
              </div>
            </div>
          </div>
        ) : item ? (
          <div className="grid gap-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- already sized on upload */}
            <img
              src={item.imageUrl}
              alt={item.title}
              className={`block max-h-[70dvh] w-full object-contain md:max-h-[88dvh] ${classes.image}`}
            />
            <div className="flex flex-col gap-4 p-6 md:p-8">
              <p className={classes.caption}>{item.caption}</p>
              <h2 className={classes.title}>{item.title}</h2>
              {item.notes && <p className={`whitespace-pre-line ${classes.notes}`}>{item.notes}</p>}
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {tagsButton}
                {items.length > 1 && (
                  <>
                    <button type="button" onClick={() => step(-1)} className={classes.button}>
                      ← Prev
                    </button>
                    <button type="button" onClick={() => step(1)} className={classes.button}>
                      Next →
                    </button>
                  </>
                )}
                <button type="button" onClick={() => setIndex(null)} className={`ml-auto ${classes.button}`}>
                  {closeLabel}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </OpenContext.Provider>
  );
}

/** Wrap an outfit in the grid so clicking it opens the lightbox at `index`. */
export function OpenOutfit({
  index,
  label,
  className,
  style,
  children,
}: {
  index: number;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const open = useContext(OpenContext);
  return (
    <button type="button" onClick={() => open(index)} aria-label={label} className={className} style={style}>
      {children}
    </button>
  );
}
