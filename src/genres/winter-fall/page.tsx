import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { jitter, lookTitle } from "../utils";
import { StillLife } from "./props";
import { Snowfall } from "./snowfall";
import s from "./winter-fall.module.css";

const filed = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

// Worn on the knit band when the genre has no keywords of its own.
const LAYERS = ["wool coat", "chunky knit", "scarf", "plaid", "knee-high boots", "mittens", "turtleneck"];

export function WinterFallPage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "look"),
    caption: `no. ${String(i + 1).padStart(2, "0")} · ${filed.format(new Date(o.createdAt))}`,
    notes: o.notes,
    items: o.items,
    width: o.width,
    height: o.height,
  }));
  const layers = category.keywords.length ? category.keywords : LAYERS;

  return (
    <div className={s.root}>
      <Snowfall className={s.snow} />

      {/* ── frost on fallen leaves, at night, with the snow coming down ── */}
      <header className={s.hero}>
        <nav className={s.topbar}>
          <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
            ← back to all aesthetics
          </Link>
        </nav>

        <div className={s.heroInner}>
          <div className={s.heroText}>
            <p className={s.kicker}>it&apos;s cold outside</p>
            <h1 className={s.title}>{category.name}</h1>
            {category.description && <p className={s.lede}>{category.description}</p>}
          </div>
          <StillLife className={s.still} caption="snuggle up, it's cold outside" />
        </div>
      </header>

      {/* ── a band of chunky oatmeal knit with the layers stitched on ── */}
      <section className={s.knit} aria-label="The layers">
        <ul className={s.labels}>
          {layers.map((k, i) => (
            <li key={k} style={{ rotate: `${(jitter(i + 5) * 2.5).toFixed(1)}deg` }}>
              {k}
            </li>
          ))}
        </ul>
      </section>

      {/* ── the fits, laid out on the wooden table by candlelight ── */}
      <main className={s.table}>
        <div className={s.tableInner}>
          <h2 className={s.sectionTitle}>the fits</h2>
          {outfits.length === 0 ? (
            <p className={s.empty}>
              <strong>still bundling up</strong>
              new looks are on their way in from the cold.
            </p>
          ) : (
            <Lightbox
              items={items}
              closeLabel="close ✕"
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
                  extras: [s.tagFlake],
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
                    style={{ "--tilt": `${(jitter(i + 2) * 2.4).toFixed(2)}deg` } as React.CSSProperties}
                  >
                    <span className={s.tape} aria-hidden="true" />
                    <span className={s.photo} style={{ aspectRatio: `${o.width ?? 3} / ${o.height ?? 4}` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                      <img src={o.imageUrl} alt={items[i].title} loading={i < 3 ? "eager" : "lazy"} />
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
        <p>snuggle up, it&apos;s cold outside</p>
        <span aria-hidden="true">❄</span>
      </footer>
    </div>
  );
}
