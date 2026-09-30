import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle } from "../utils";
import { Bow } from "./bow";
import s from "./coquette.module.css";

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

  return (
    <div className={s.root}>
      <nav className={s.topbar}>
        <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
          ‹ back to all the aesthetics
        </Link>
      </nav>

      <header className={s.hero}>
        <Bow className={s.heroBow} />
        <p className={s.kicker}>a love letter to</p>
        <h1 className={s.title}>{category.name}</h1>
        {category.description && <p className={s.lede}>{category.description}</p>}
        {category.keywords.length > 0 && (
          <ul className={s.keywords} aria-label="Signature pieces">
            {category.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        )}
        <div className={s.pearls} aria-hidden="true">
          {Array.from({ length: 15 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
      </header>

      <div className={s.lace} aria-hidden="true" />
      <div className={s.laceHoles} aria-hidden="true" />

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
              }}
            >
              <div className={s.grid}>
                {outfits.map((o, i) => (
                  <OpenOutfit
                    key={o.id}
                    index={i}
                    label={`Open ${items[i].title}`}
                    className={s.polaroid}
                    style={
                      {
                        "--tilt": `${(jitter(i + 1) * 2.4).toFixed(2)}deg`,
                        "--pin-tilt": `${(jitter(i + 7) * 12).toFixed(1)}deg`,
                      } as React.CSSProperties
                    }
                  >
                    <Bow className={s.pin} />
                    {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                    <img
                      src={o.imageUrl}
                      alt={items[i].title}
                      width={o.width ?? undefined}
                      height={o.height ?? undefined}
                      loading={i < 3 ? "eager" : "lazy"}
                    />
                    <span className={s.caption}>{items[i].title}</span>
                  </OpenOutfit>
                ))}
              </div>
            </Lightbox>
          )}
        </div>
      </main>

      <footer className={s.footer}>made with love &amp; ribbons ♡</footer>
    </div>
  );
}
