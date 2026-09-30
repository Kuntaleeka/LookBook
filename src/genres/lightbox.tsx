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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const item = index === null ? null : items[index];

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
          item?.items?.length ? "max-w-6xl" : "max-w-5xl"
        } ${classes.dialog}`}
      >
        {item && item.items && item.items.length > 0 ? (
          // Tagged: photo with pins + bubbles across the top, details below.
          <div className="flex flex-col">
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
