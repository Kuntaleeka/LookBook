import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Sparkles } from "../coquette/props";
import { Lightbox, OpenOutfit } from "../lightbox";
import { Kiss } from "../office-siren/props";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle } from "../utils";
import { FlipPhone } from "./flip-phone";
import { ScratchDisc } from "./scratch-disc";
import { ScrollSpin } from "./scroll-spin";
import s from "./y2k.module.css";

// On the wish list when the genre has no keywords of its own.
const WANTS = ["low-rise jeans", "baby tee", "butterfly clips", "rhinestones", "a flip phone"];

export function Y2KPage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "pic"),
    caption: `pic ${String(i + 1).padStart(3, "0")} of ${String(outfits.length).padStart(3, "0")}`,
    notes: o.notes,
    items: o.items,
    photos: o.photos,
    width: o.width,
    height: o.height,
  }));
  const wants = (category.keywords.length ? category.keywords : WANTS).slice(0, 5);

  return (
    <ScrollSpin className={s.root}>
      {/* ── the collage wall: phone, CD, notes and stickers on pink zebra ── */}
      <div className={s.top}>
        <Sparkles className={s.sparkles} sparkClass={s.spark} count={24} seed={4} />

        <nav className={s.topbar}>
          <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
            « back 2 all
          </Link>
        </nav>

        <header className={s.collage}>
          <div className={s.titleBlock}>
            <p className={`${s.strip} ${s.strip1}`}>it&apos;s not a phase</p>
            <h1 className={s.title}>{category.name}</h1>
            <p className={`${s.strip} ${s.strip2}`}>it&apos;s a lifestyle</p>
            {category.description && <p className={s.lede}>{category.description}</p>}
            <Kiss id="y2k-kiss-title" className={s.titleKiss} />
          </div>

          {/* a rhinestoned flip phone: opens on load, tap to shut and reopen,
              and shows a random fit each time it opens */}
          <FlipPhone
            name={category.name}
            pics={items.map(({ imageUrl, title }) => ({ url: imageUrl, title }))}
          />

          <div className={s.wishlist}>
            <p className={s.wishHead}>Things I want:</p>
            <ol aria-label="Signature pieces">
              {wants.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ol>
            <Kiss id="y2k-kiss-list" className={s.listKiss} />
          </div>

          {/* the CD spins with the page, and scratches when you rub it */}
          <ScratchDisc className={s.cd}>
            <span className={s.cdText} aria-hidden="true">
              {category.name.toLowerCase()} mix
              <br />
              …play it one more time
            </span>
            <span className={s.cdHint} aria-hidden="true">
              rub the cd ♪
            </span>
          </ScratchDisc>

          <p className={s.heartSticker} aria-hidden="true">
            <span>
              ur so
              <br />
              pretty
            </span>
          </p>
          <p className={s.sticky} aria-hidden="true">
            What would
            <br />
            she wear? ♡
          </p>
        </header>
      </div>

      {/* ── the pics ── */}
      <main className={s.gallery}>
        <div className={s.galleryInner}>
          <h2 className={s.sectionTitle}>the pics</h2>
          <p className={s.sectionSub}>xoxo · click 2 zoom</p>
          {outfits.length === 0 ? (
            <p className={s.empty}>
              <strong>no new pics</strong>
              brb, uploading from the digicam…
            </p>
          ) : (
            <Lightbox
              items={items}
              closeLabel="close x"
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
                  extras: [s.tagSignal, s.tagCharm],
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
                    style={{ "--tilt": `${(jitter(i + 3) * 3).toFixed(2)}deg` } as React.CSSProperties}
                  >
                    <span className={s.star} aria-hidden="true" />
                    <span className={s.photo} style={{ aspectRatio: `${o.width ?? 3} / ${o.height ?? 4}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                      <img src={o.imageUrl} alt={items[i].title} loading={i < 3 ? "eager" : "lazy"} />
                    </span>
                    <span className={s.printTitle}>{items[i].title}</span>
                  </OpenOutfit>
                ))}
              </div>
            </Lightbox>
          )}
        </div>
      </main>

      <footer className={s.footer}>
        <Kiss id="y2k-kiss-foot" className={s.footKiss} />
        <p>xoxo</p>
      </footer>
    </ScrollSpin>
  );
}
