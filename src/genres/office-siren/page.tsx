import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle } from "../utils";
import { Kiss } from "./props";
import { ScrollGlasses } from "./scroll-glasses";
import s from "./office-siren.module.css";

const filed = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "2-digit" });

// The ticker always trades these; the genre's own keywords join them.
const STOCKS = ["red lip", "kitten heels", "pinstripe", "bayonetta glasses", "pencil skirt", "silver watch", "espresso martini", "sheer tights"];

// The palette from the moodboard: grey, white, steel blue, lipstick red.
const PALETTE = [
  { name: "charcoal", hex: "#8b8b8d" },
  { name: "copy paper", hex: "#ececea" },
  { name: "steel", hex: "#c3cfdc" },
  { name: "lipstick", hex: "#c8141c" },
];

export function OfficeSirenPage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "look"),
    caption: `no. ${String(i + 1).padStart(2, "0")} · filed ${filed.format(new Date(o.createdAt))}`,
    notes: o.notes,
    items: o.items,
    photos: o.photos,
    width: o.width,
    height: o.height,
  }));

  const stocks = [...new Set([...category.keywords.map((k) => k.toLowerCase()), ...STOCKS])].map((name, i) => ({
    name,
    change: (1 + Math.abs(jitter(i + 3)) * 8).toFixed(1),
  }));

  return (
    <div className={s.root}>
      {/* ── the Siren Times ticker ── */}
      <div className={s.tickerBar}>
        <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
          ← directory
        </Link>
        <div className={s.ticker} aria-hidden="true">
          <div className={s.tickerTrack}>
            {[0, 1].map((copy) => (
              <span key={copy} className={s.tickerSet}>
                {stocks.map((st) => (
                  <span key={st.name} className={s.stock}>
                    {st.name} <b>▲ {st.change}%</b>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── the moodboard spread ── */}
      <header className={s.spread}>
        <div className={s.headBlock}>
          <h1 className={s.headline}>
            <span className={s.headlinePre}>fashion in the 90&apos;s:</span> {category.name.toLowerCase()}
          </h1>
          <p className={s.standfirst}>
            {category.description ||
              "she's the office siren. she wears bold lips and nails, chunky statement jewelry but simple outfits."}
          </p>
          <p className={s.byline}>@fashionops on file</p>
          <Kiss id="os-kiss-hero" className={s.heroKiss} />
        </div>

        <aside className={s.paletteCard} aria-label="Colour palette and patterns">
          <ul className={s.swatches}>
            {PALETTE.map((p) => (
              <li key={p.hex} style={{ background: p.hex }}>
                <span>
                  {p.name} {p.hex}
                </span>
              </li>
            ))}
          </ul>
          <h2 className={s.label}>colour palette and patterns</h2>
          <div className={s.patterns}>
            <span className={s.patPinstripe}>pinstripe</span>
            <span className={s.patCheck}>checkered</span>
          </div>
        </aside>

        <ScrollGlasses className={s.glasses} />
      </header>

      {/* ── the outfits, laid out like cut-outs on the page ── */}
      <main className={s.gallery}>
        <div className={s.galleryHead}>
          <h2 className={s.sectionTitle}>main outfits</h2>
          {outfits.length > 0 && (
            <p className={s.galleryNote}>
              {outfits.length} {outfits.length === 1 ? "look" : "looks"} on file. click one for the details: what
              she&apos;s wearing and where it&apos;s from.
            </p>
          )}
        </div>

        {outfits.length === 0 ? (
          <p className={s.empty}>
            <strong>pending approval.</strong>
            new looks are in review. check back after the meeting.
          </p>
        ) : (
          <Lightbox
            items={items}
            closeLabel="close ×"
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
                extras: [s.tagHeel],
              },
            }}
          >
            <div className={s.grid}>
              {outfits.map((o, i) => (
                <OpenOutfit key={o.id} index={i} label={`Open ${items[i].title}`} className={s.look}>
                  <span className={s.cutout} style={{ aspectRatio: `${o.width ?? 3} / ${o.height ?? 4}` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                    <img src={o.imageUrl} alt={items[i].title} loading={i < 4 ? "eager" : "lazy"} />
                  </span>
                  <span className={s.lookTitle}>{items[i].title.toLowerCase()}</span>
                  <span className={s.lookMeta}>{items[i].caption}</span>
                </OpenOutfit>
              ))}
            </div>
          </Lightbox>
        )}
      </main>

      <footer className={s.footer}>
        <Kiss id="os-kiss-foot" className={s.footKiss} />
        <p className={s.signoff}>after-work espresso martinis, 6pm. don&apos;t be late.</p>
        <Link href="/" className={s.footBack} transitionTypes={NAV_BACK}>
          ← back to all aesthetics
        </Link>
      </footer>
    </div>
  );
}
