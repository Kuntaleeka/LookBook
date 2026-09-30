import Link from "next/link";
import { NAV_BACK } from "@/components/page-transitions";
import { Lightbox, OpenOutfit } from "../lightbox";
import type { GenrePageProps } from "../types";
import { lookTitle, splitLastWord } from "../utils";
import s from "./office-siren.module.css";

const memoDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" });

export function OfficeSirenPage({ category, outfits }: GenrePageProps) {
  const [head, last] = splitLastWord(category.name);
  const items = outfits.map((o, i) => ({
    imageUrl: o.imageUrl,
    title: lookTitle(o.title, i + 1, "Look"),
    caption: `No. ${String(i + 1).padStart(2, "0")} — filed under ${category.name}`,
    notes: o.notes,
    items: o.items,
    width: o.width,
    height: o.height,
  }));

  return (
    <div className={s.root}>
      <div className={s.memo}>
        <div className={`${s.memoTop} ${s.smallcaps}`}>
          <span>Internal memo</span>
          <Link href="/" className={s.back} transitionTypes={NAV_BACK}>
            ← Return to directory
          </Link>
        </div>
        <dl className={s.memoFields}>
          <div>
            <dt>To:</dt>
            <dd>All visitors</dd>
          </div>
          <div>
            <dt>From:</dt>
            <dd>The lookbook</dd>
          </div>
          <div>
            <dt>Re:</dt>
            <dd>{category.name}</dd>
          </div>
          <div>
            <dt>Date:</dt>
            <dd>{memoDate.format(new Date())}</dd>
          </div>
        </dl>
      </div>

      <header className={s.hero}>
        <h1 className={s.title}>
          {head}
          <em>{last}</em>
        </h1>
        <div className={s.titleRule} aria-hidden="true" />
      </header>

      {(category.description || category.keywords.length > 0) && (
        <section className={s.pinstripe}>
          <div className={s.pinstripeInner}>
            {category.description && <p className={s.lede}>{category.description}</p>}
            {category.keywords.length > 0 && (
              <div className={s.dressCode}>
                <h2 className={s.smallcaps}>Dress code</h2>
                <ol>
                  {category.keywords.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      <main className={s.gallery}>
        <div className={s.galleryHead}>
          <h2>The Portfolio</h2>
          <span className={s.smallcaps}>
            {outfits.length} {outfits.length === 1 ? "file" : "files"} on record
          </span>
        </div>

        {outfits.length === 0 ? (
          <p className={s.empty}>
            <strong>Pending approval.</strong>
            New looks are in review. Please check back after the meeting.
          </p>
        ) : (
          <Lightbox
            items={items}
            closeLabel="Close file"
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
                  className={`${s.look} ${i === 0 && outfits.length > 2 ? s.lead : ""}`}
                >
                  <span className={s.frame}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                    <img src={o.imageUrl} alt={items[i].title} loading={i < 4 ? "eager" : "lazy"} />
                  </span>
                  <span className={s.lookCaption}>
                    <span className={s.lookTitle}>{items[i].title}</span>
                    <span className={`${s.lookNo} ${s.smallcaps}`}>No. {String(i + 1).padStart(2, "0")}</span>
                  </span>
                </OpenOutfit>
              ))}
            </div>
          </Lightbox>
        )}
      </main>

      <footer className={s.footer}>
        <p className={s.signoff}>
          Regards,
          <span>— the Siren</span>
        </p>
        <span className={s.stamp}>CONFIDENTIAL</span>
      </footer>
    </div>
  );
}
