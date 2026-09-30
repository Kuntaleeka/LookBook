import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle, pad3 } from "../utils";
import { CrossChain } from "./cross-chain";
import s from "./grunge.module.css";

// Cut-out letter styles; the dark red one is kept rare on purpose.
const CUTOUTS = [s.c0, s.c1, s.c0, s.c2, s.c1, s.c4, s.c0, s.c3];

function Cutouts({ text, seed = 0 }: { text: string; seed?: number }) {
  return (
    <span className={s.word}>
      {[...text].map((ch, i) => (
        <span
          key={i}
          className={`${s.ch} ${CUTOUTS[Math.floor(Math.abs(jitter(seed + i * 3 + 1)) * CUTOUTS.length)]}`}
          style={
            {
              "--r": `${(jitter(seed + i + 50) * 6).toFixed(1)}deg`,
              "--y": `${(jitter(seed + i + 90) * 0.07).toFixed(3)}em`,
            } as React.CSSProperties
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

function RansomLines({ lines, label }: { lines: string[][]; label: string }) {
  return (
    <p className={s.ransom} aria-label={label}>
      {lines.map((words, li) => (
        <span key={li} className={s.ransomLine} aria-hidden="true">
          {words.map((w, wi) => (
            <Cutouts key={wi} text={w} seed={li * 40 + wi * 13} />
          ))}
        </span>
      ))}
    </p>
  );
}

const DRIPS = [
  { left: "14%", w: 3, l: 34, d: 0.4 },
  { left: "43%", w: 2, l: 58, d: 0.1 },
  { left: "71%", w: 4, l: 44, d: 0.8 },
];

function Drips({ drips = DRIPS }: { drips?: typeof DRIPS }) {
  return (
    <>
      {drips.map((d, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={s.drip}
          style={
            {
              left: d.left,
              "--dw": `${d.w}px`,
              "--dl": `${d.l}px`,
              "--dd": `${d.d}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </>
  );
}

// Liner notes: one line per day of the week (Sunday first), so the page
// changes daily on a seven-day rotation. Original lines, not song lyrics.
const LINER_NOTES = [
  "Nobody irons flannel. That's the whole point.",
  "Thrifted it for three bucks. Wore it till it fell apart. Still wearing it.",
  "The holes in your jeans are just places the world got in.",
  "Loud guitars, quiet mornings, same shirt as yesterday.",
  "Too tired to try hard. Too cool to care that you noticed.",
  "Scuffed boots have better stories than clean ones.",
  "If it smells a little like a basement show, it's broken in.",
];
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function LinerNotes() {
  const day = new Date().getDay();
  return (
    <figure className={s.lede}>
      <figcaption className={s.ledeLabel}>liner notes · {DAYS[day]}</figcaption>
      <blockquote className={s.quote}>&ldquo;{LINER_NOTES[day]}&rdquo;</blockquote>
    </figure>
  );
}

function StuddedBelt() {
  return (
    <div className={s.belt} aria-hidden="true">
      <div className={s.studs} />
    </div>
  );
}

export function GrungePage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "track"),
    caption: `track ${String(i + 1).padStart(2, "0")}`,
    notes: o.notes,
    items: o.items,
    width: o.width,
    height: o.height,
  }));
  const strips = outfits.slice(0, 4);

  return (
    <div className={s.root}>
      {/* behind the title, and scrolls away with it */}
      <div className={s.chainBehind}>
        <CrossChain />
      </div>

      <div className={s.content}>
        <nav className={s.topbar}>
          <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
            &lt;&lt; back to everything
          </Link>
          <span aria-hidden="true">side A · {outfits.length} {outfits.length === 1 ? "track" : "tracks"}</span>
        </nav>

        <header className={s.hero}>
          <div className={s.heroTop}>
            <div>
              <p className={s.issue}>issue no. {pad3(Math.max(outfits.length, 1))} — xerox edition</p>
              <div className={s.titleWrap}>
                <h1 className={s.title}>{category.name}</h1>
                <Drips />
              </div>
              <RansomLines
                label="Are you who you want to be?"
                lines={[["are", "you", "who", "you", "want", "to", "be?"]]}
              />
            </div>

            {strips.length >= 2 && (
              <div className={s.strips} aria-hidden="true">
                {strips.map((o, i) => (
                  <div
                    key={o.id}
                    className={s.strip}
                    style={
                      {
                        backgroundImage: `url("${o.imageUrl}")`,
                        backgroundPosition: `center ${14 + i * 9}%`,
                        "--sx": `${(jitter(i + 70) * 14).toFixed(0)}px`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className={s.notes}>
            <LinerNotes />
          </div>
        </header>

        <StuddedBelt />

        <main className={s.wall}>
          <div className={s.wallInner}>
            <div className={s.fitsHead}>
              <h2 className={s.fitsTitle}>
                the fits
                {/* marker underline, drawn twice for a scrawled look */}
                <svg className={s.fitsUnderline} viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 15C70 7 150 19 230 9S340 13 396 6" />
                  <path d="M14 19C90 12 170 22 250 14S350 16 388 11" opacity=".6" />
                </svg>
              </h2>
              <p className={s.hint}>
                hover to bring the color back
                <svg className={s.hintArrow} viewBox="0 0 44 64" aria-hidden="true">
                  <path d="M8 4C30 14 34 34 22 58" />
                  <path d="M12 50l10 9 6-12" />
                </svg>
              </p>
            </div>

            {outfits.length === 0 ? (
              <p className={s.empty}>
                <strong>nothing here yet.</strong>
                still digging through the thrift bins. check back.
              </p>
            ) : (
              <Lightbox
                items={items}
                closeLabel="[ close ]"
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
                    extras: [s.tagTail, s.tagGuitar, s.tagStars, s.tagDrips],
                  },
                }}
              >
                <div className={s.grid}>
                  {outfits.map((o, i) => (
                    <OpenOutfit
                      key={o.id}
                      index={i}
                      label={`Open ${items[i].title}`}
                      className={s.print}
                      style={{ "--r": `${(jitter(i + 5) * 2).toFixed(2)}deg` } as React.CSSProperties}
                    >
                      <span
                        className={`${s.label} ${s.track}`}
                        style={{ "--r": `${(jitter(i + 17) * 5).toFixed(1)}deg` } as React.CSSProperties}
                      >
                        {items[i].caption}
                      </span>
                      <span className={s.photo}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                        <img
                          src={o.imageUrl}
                          alt={items[i].title}
                          width={o.width ?? undefined}
                          height={o.height ?? undefined}
                          loading={i < 4 ? "eager" : "lazy"}
                        />
                      </span>
                      <span className={s.printCaption}>{items[i].title}</span>
                    </OpenOutfit>
                  ))}
                </div>
              </Lightbox>
            )}
          </div>
        </main>

        <StuddedBelt />

        <footer className={s.footer}>
          <span className={s.footerTitle}>
            turn it up.
            <Drips drips={[{ left: "30%", w: 2, l: 70, d: 0.2 }]} />
          </span>
          <p>photocopied with love · no rights reserved</p>
        </footer>
      </div>
    </div>
  );
}
