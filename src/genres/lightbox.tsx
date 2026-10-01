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
};

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

// The viewer's choice to see photos with or without the tagged-item pins,
// remembered in this browser between visits.
const TAGS_KEY = "fashionops:show-tags";
function readShowTags() {
  try {
    return typeof window === "undefined" || window.localStorage.getItem(TAGS_KEY) !== "0";
  } catch {
    return true;
  }
}
function writeShowTags(show: boolean) {
  try {
    window.localStorage.setItem(TAGS_KEY, show ? "1" : "0");
  } catch {
    // private mode or blocked storage: the choice just won't be remembered
  }
}

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
  const [showTags, setShowTags] = useState(readShowTags);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const item = index === null ? null : items[index];
  const tagCount = item?.items?.length ?? 0;

  // Switching views: the current one fades out, the layout swaps while it is
  // invisible, then the new one eases in (see .lb-swap in globals.css).
  const [swapping, setSwapping] = useState(false);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (swapTimer.current && clearTimeout(swapTimer.current)), []);

  function toggleTags() {
    if (swapping) return;
    const flip = () =>
      setShowTags((show) => {
        writeShowTags(!show);
        return !show;
      });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return flip();
    setSwapping(true);
    swapTimer.current = setTimeout(() => {
      flip();
      setSwapping(false);
    }, 270);
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

  return (
    <OpenContext.Provider value={setIndex}>
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
          tagCount > 0 && showTags ? "max-w-6xl" : "max-w-5xl"
        } ${classes.dialog}`}
      >
        {item && item.items && tagCount > 0 && showTags ? (
          // Tagged: photo with pins + bubbles across the top, details below.
          <div key="tagged" className={`lb-swap flex flex-col ${swapping ? "lb-swap-out" : ""}`}>
            <div className={classes.image}>
              <TaggedPhoto
                key={item.imageUrl}
                src={item.imageUrl}
                alt={item.title}
                width={item.width}
                height={item.height}
                items={item.items}
                classes={classes.tags}
              />
            </div>
            <div className="flex flex-col gap-3 p-6 md:flex-row md:items-end md:justify-between md:gap-8 md:px-8">
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
          <div
            key="plain"
            className={`lb-swap grid gap-0 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] ${swapping ? "lb-swap-out" : ""}`}
          >
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
