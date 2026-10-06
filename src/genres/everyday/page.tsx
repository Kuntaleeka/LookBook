import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle } from "../utils";
import s from "./everyday.module.css";

const shortDay = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

// Listed under the description when the genre has no keywords of its own.
const BASICS = ["white tee", "straight jeans", "grey hoodie", "trainers", "tote bag"];

export function EverydayPage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "fit"),
    caption: `no. ${String(i + 1).padStart(2, "0")} · ${shortDay.format(new Date(o.createdAt))}`,
    notes: o.notes,
    items: o.items,
    photos: o.photos,
    width: o.width,
    height: o.height,
  }));
  const basics = (category.keywords.length ? category.keywords : BASICS).slice(0, 8);

  return (
    <div className={s.root}>
      {/* ── a slow morning: white linen with the window light moving over it ── */}
      <header className={s.morning}>
        <div className={s.light} aria-hidden="true" />

        <nav className={s.topbar}>
          <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
            ← all aesthetics
          </Link>
        </nav>

        <div className={s.hero}>
          <div className={s.heroText}>
            <p className={s.kicker}>a day in the life</p>
            <h1 className={s.title}>{category.name}</h1>
            {category.description && <p className={s.lede}>{category.description}</p>}
            <ul className={s.pieces} aria-label="Signature pieces">
              {basics.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
            <p className={s.note}>same jeans, different day ♡</p>
          </div>

          {/* three snapshots of an ordinary day, laid over each other like
              prints on the bed: the slow morning, the ride, the shoes */}
          <div className={s.prints} aria-hidden="true">
            <span className={`${s.snap} ${s.snapMorning}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img src="/genres/everyday/morning.jpg" alt="" />
            </span>
            <span className={`${s.snap} ${s.snapRide}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img src="/genres/everyday/ride.jpg" alt="" />
            </span>
            <span className={`${s.snap} ${s.snapShoes}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img src="/genres/everyday/shoes.jpg" alt="" />
            </span>
          </div>
        </div>
      </header>

      {/* ── the fits, looked down on against the shop floor ── */}
      <main className={s.floor}>
        <div className={s.floorInner}>
          <div className={s.floorHead}>
            <h2>the fits</h2>
            <span>
              {outfits.length} {outfits.length === 1 ? "look" : "looks"}
            </span>
          </div>

          {outfits.length === 0 ? (
            <p className={s.empty}>
              <strong>nothing here yet.</strong>
              new fits get added soon.
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
                  <OpenOutfit
                    key={o.id}
                    index={i}
                    label={`Open ${items[i].title}`}
                    className={s.print}
                    style={{ "--tilt": `${(jitter(i + 4) * 1.6).toFixed(2)}deg` } as React.CSSProperties}
                  >
                    <span className={s.photo} style={{ aspectRatio: `${o.width ?? 3} / ${o.height ?? 4}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                      <img src={o.imageUrl} alt={items[i].title} loading={i < 4 ? "eager" : "lazy"} />
                    </span>
                    <span className={s.printTitle}>{items[i].title}</span>
                    <span className={s.printMeta}>{items[i].caption}</span>
                  </OpenOutfit>
                ))}
              </div>
            </Lightbox>
          )}
        </div>
      </main>

      <footer className={s.footer}>
        <p>nothing special. worn every day anyway.</p>
        <Link href="/" className={s.footBack} transitionTypes={NAV_BACK}>
          ← back to all aesthetics
        </Link>
      </footer>
    </div>
  );
}
