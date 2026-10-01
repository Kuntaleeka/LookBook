import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { lookTitle, pad3 } from "../utils";
import { Camera } from "./camera";
import { SleepyCat, StarBullet, Starburst } from "./doodles";
import { StarClips } from "./star-clips";
import s from "./acubi.module.css";

const dateFmt = new Intl.DateTimeFormat("en", { year: "2-digit", month: "2-digit", day: "2-digit" });

export function AcubiPage({ category, outfits }: GenrePageProps) {
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "look"),
    caption: `▶ play ${pad3(i + 1)}/${pad3(outfits.length)} · ${dateFmt.format(new Date(o.createdAt))}`,
    notes: o.notes,
    items: o.items,
    photos: o.photos,
    width: o.width,
    height: o.height,
  }));

  return (
    <div className={s.root}>
      <StarClips />

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
            extras: [s.tagTail],
          },
        }}
      >
        <div className={s.content}>
          <nav className={s.topbar}>
            <span aria-hidden="true">fashionops ▸ archive ▸ {category.slug}</span>
            <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
              ← index
            </Link>
          </nav>

          {/* ── a manga page: panels with thick borders and white gutters ── */}
          <header className={s.page}>
            <div className={`${s.panel} ${s.kata}`} aria-hidden="true">
              <span className={s.kataBig}>アクビ</span>
              <span className={s.kataSmall}>今日のコーデ</span>
            </div>

            <div className={`${s.panel} ${s.titlePanel}`}>
              <p className={s.issue}>
                vol.{pad3(outfits.length)} · {dateFmt.format(new Date())}
              </p>
              <div className={s.titleRow}>
                <h1 className={s.title}>{category.name}</h1>
                <Starburst className={s.burst} />
              </div>
              <p className={s.balloon}>{category.description || "uh."}</p>
              <SleepyCat className={s.cat} />
            </div>

            <div className={`${s.panel} ${s.cameraPanel}`}>
              <Camera shots={items.map(({ imageUrl, title }) => ({ imageUrl, title }))} />
            </div>

            <div className={`${s.panel} ${s.memo}`}>
              <p className={s.memoHead}>memo.</p>
              {category.keywords.length > 0 ? (
                <ul className={s.memoList} aria-label="Signature pieces">
                  {category.keywords.map((k) => (
                    <li key={k}>
                      <StarBullet className={s.memoStar} />
                      {k}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={s.memoList}>nothing to note yet.</p>
              )}
            </div>
          </header>

          {/* ── the moodboard: soft grey squares, colour comes back on hover ── */}
          <main className={s.roll}>
            <div className={s.rollHead}>
              <h2>photo roll</h2>
              <span>{outfits.length ? `001–${pad3(outfits.length)}` : "000"}</span>
            </div>

            {outfits.length === 0 ? (
              <p className={s.empty}>
                <strong>no image.</strong>
                the roll is empty for now.
              </p>
            ) : (
              <div className={s.grid}>
                {outfits.map((o, i) => (
                  <OpenOutfit key={o.id} index={i} label={`Open ${items[i].title}`} className={s.tile}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                    <img src={o.imageUrl} alt={items[i].title} loading={i < 6 ? "eager" : "lazy"} />
                    <span className={s.tileLabel}>
                      <span>No.{pad3(i + 1)}</span>
                      <span>{items[i].title}</span>
                    </span>
                  </OpenOutfit>
                ))}
              </div>
            )}
          </main>

          <footer className={s.footer}>
            <p className={s.balloonSmall}>…end.</p>
            <SleepyCat className={s.footerCat} />
          </footer>
        </div>
      </Lightbox>
    </div>
  );
}
