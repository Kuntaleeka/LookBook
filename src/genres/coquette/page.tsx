import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle } from "../utils";
import { Pearls, SatinBow, Sparkles } from "./props";
import s from "./coquette.module.css";

// What the notebook says when the genre has no keywords of its own.
const NOTES = ["be kind", "be pretty", "be you"];

export function CoquettePage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "look no."),
    caption: `with love, look no. ${i + 1}`,
    notes: o.notes,
    items: o.items,
    width: o.width,
    height: o.height,
  }));
  const notes = category.keywords.length ? category.keywords : NOTES;

  return (
    <div className={s.root}>
      {/* golden afternoon light and glitter over everything */}
      <div className={s.light} aria-hidden="true" />
      <Sparkles className={s.sparkles} sparkClass={s.spark} count={26} />

      {/* ── the top of the page sits in a dreamy field of pink tulips ── */}
      <div className={s.top}>
        <nav className={s.topbar}>
          <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
            ‹ back to all the aesthetics
          </Link>
        </nav>

        {/* ── a flat-lay on the bed: the book, pearls, a bow and the notebook ── */}
        <header className={s.flatlay}>
          <SatinBow id="cq-bow-corner" className={s.cornerBow} />

          <div className={s.bookWrap}>
            <div className={s.book}>
              <div className={s.bookFrame}>
                <SatinBow id="cq-bow-book-top" className={s.frameBow} />
                <p className={s.bookPre}>little book of</p>
                <h1 className={s.bookTitle}>{category.name}</h1>
                <p className={s.bookSub}>
                  {category.description || "a collection of ribbons, pearls and timeless tales of romance"}
                </p>
                <SatinBow id="cq-bow-book-bottom" className={s.frameBowSmall} />
              </div>
            </div>
            <Pearls id="cq-pearls" className={s.pearls} />
          </div>

          <div className={s.notebook}>
            <p className={s.notesHead}>Notes</p>
            <ul className={s.notesList} aria-label="Signature pieces">
              {notes.map((k, i) => (
                <li key={k} style={{ "--nudge": `${(jitter(i + 11) * 6).toFixed(1)}px` } as React.CSSProperties}>
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                  {i % 2 === 0 && <span className={s.doodleHeart}>♡</span>}
                </li>
              ))}
            </ul>
            <span className={s.bigHeart} aria-hidden="true">♡</span>
            <span className={s.pen} aria-hidden="true" />
            <SatinBow id="cq-bow-pen" className={s.penBow} />
          </div>
        </header>
      </div>

      {/* ── the looks, back in the tulip field ── */}
      <main className={s.gallery}>
        <div className={s.galleryInner}>
          <h2 className={s.sectionTitle}>the looks</h2>
          {outfits.length === 0 ? (
            <p className={s.empty}>
              <strong>coming soon</strong>
              new looks are being tied up with a bow.
            </p>
          ) : (
            <Lightbox
              items={items}
              closeLabel="close ♡"
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
                  extras: [s.tagBow, s.tagTail],
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
                    style={{ "--tilt": `${(jitter(i + 1) * 2.2).toFixed(2)}deg` } as React.CSSProperties}
                  >
                    <SatinBow id={`cq-bow-look-${i}`} className={s.printBow} />
                    <span className={s.printPhoto} style={{ aspectRatio: `${o.width ?? 3} / ${o.height ?? 4}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                      <img src={o.imageUrl} alt={items[i].title} loading={i < 3 ? "eager" : "lazy"} />
                    </span>
                    <span className={s.caption}>{items[i].title}</span>
                  </OpenOutfit>
                ))}
              </div>
            </Lightbox>
          )}
        </div>
      </main>

      <footer className={s.footer}>
        <p>be kind, be pretty, be you</p>
        <span aria-hidden="true">♡</span>
      </footer>
    </div>
  );
}
