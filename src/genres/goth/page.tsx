/* eslint-disable @next/next/no-img-element -- local mood photos and uploads, already sized */
import Link from "next/link";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { lookTitle, toRoman } from "../utils";
import { ScrollDepth } from "./scroll-depth";
import s from "./goth.module.css";

// Mood photos in /public/genres/goth, all free under the Unsplash License
// (see CREDITS.md there). Swap a file, keeping its name, to change it.
const PHOTOS = {
  angel: "/genres/goth/angel-fog.jpg",
  window: "/genres/goth/rose-window.jpg",
  cat: "/genres/goth/cat.jpg",
  skull: "/genres/goth/skull-roses.jpg",
  pendant: "/genres/goth/heart-pendant.jpg",
  candles: "/genres/goth/candles.jpg",
};

// Candle flames in candles.jpg, as % of the photo: [left, top, size]
const FLAMES: [number, number, number][] = [
  [50.4, 36.4, 5], [37.1, 46.6, 5], [65.9, 45.8, 5], [40.2, 55, 3],
];

export function GothPage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "Look"),
    caption: `— ${toRoman(i + 1)} —`,
    notes: o.notes,
    items: o.items,
    width: o.width,
    height: o.height,
  }));

  return (
    <ScrollDepth className={s.root}>
      {/* the foggy cemetery angel, behind everything */}
      <div className={s.backdrop} style={{ backgroundImage: `url(${PHOTOS.angel})` }} aria-hidden="true" />
      <div className={s.fog} aria-hidden="true" />
      <div className={`${s.fog} ${s.fogSlow}`} aria-hidden="true" />

      <nav className={s.topbar}>
        <Link href="/" className={s.back}>
          ‹ return to all aesthetics
        </Link>
      </nav>

      <header className={s.hero}>
        {/* the cat in the rose window, staring down at the skull */}
        <div className={s.scene} aria-hidden="true">
          <div className={s.windowGlow} />
          {/* rose window tinted blood red, with the cat blended in front */}
          <div className={s.roseWindow}>
            <img src={PHOTOS.window} alt="" className={s.windowGlass} />
            <span className={s.windowTint} />
            <span className={s.windowBacklight} />
            <span className={s.sill} />
            <span className={s.cat}>
              <img src={PHOTOS.cat} alt="" />
            </span>
          </div>
          <img src={PHOTOS.skull} alt="" className={s.skull} />
        </div>

        <div className={s.heroText}>
          <p className={s.kicker}>memento mori · {toRoman(Math.max(outfits.length, 1))}</p>
          <h1 className={s.title}>{category.name}</h1>
          {category.description && <p className={s.lede}>{category.description}</p>}
          {category.keywords.length > 0 && (
            <ul className={s.keywords} aria-label="Signature pieces">
              {category.keywords.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          )}
          <img src={PHOTOS.pendant} alt="" className={s.pendant} aria-hidden="true" />
          {/* cuts the white studio background out of the pendant photo */}
          <svg width="0" height="0" className="absolute" aria-hidden="true">
            <filter id="gothKeyWhite" colorInterpolationFilters="sRGB">
              <feColorMatrix
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -2.4 -2.4 -2.4 0 5.6"
              />
            </filter>
          </svg>
        </div>
      </header>

      <main className={s.gallery}>
        {/* candlelit table, with the flames flickering */}
        <div className={s.candleBand} aria-hidden="true">
          <div className={s.candlePhoto}>
            <img src={PHOTOS.candles} alt="" />
            {FLAMES.map(([x, y, size], i) => (
              <span
                key={i}
                className={s.flicker}
                style={{ left: `${x}%`, top: `${y}%`, width: `${size}%`, animationDelay: `${(i * 0.37) % 1.6}s` }}
              />
            ))}
          </div>
        </div>
        <h2 className={s.sectionTitle}>The Collection</h2>

        {outfits.length === 0 ? (
          <p className={s.empty}>
            <strong>Nothing stirs</strong>
            The crypt is empty, for now. Return after dark.
          </p>
        ) : (
          <Lightbox
            items={items}
            closeLabel="close"
            classes={{
              dialog: s.lbDialog,
              image: s.lbImage,
              title: s.lbTitle,
              caption: s.lbCaption,
              notes: s.lbNotes,
              button: s.lbButton,
              tags: {
                root: s.tagsRoot,
                bubble: s.tagBubble,
                name: s.tagName,
                link: s.tagLink,
                source: s.tagSource,
              },
            }}
          >
            <div className={s.grid}>
              {outfits.map((o, i) => (
                <OpenOutfit key={o.id} index={i} label={`Open ${items[i].title}`} className={s.window}>
                  <span className={s.arch}>
                    <img src={o.imageUrl} alt={items[i].title} loading={i < 3 ? "eager" : "lazy"} />
                  </span>
                  <span className={s.numeral}>{items[i].caption}</span>
                  <span className={s.lookTitle}>{items[i].title}</span>
                </OpenOutfit>
              ))}
            </div>
          </Lightbox>
        )}
      </main>

      <footer className={s.footer}>
        <p>memento mori</p>
      </footer>
    </ScrollDepth>
  );
}
