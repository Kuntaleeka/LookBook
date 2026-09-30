import { ThemeFonts } from "@/components/theme/theme-fonts";
import { GENRE_DESIGNS } from "@/genres/registry";
import { getGenreSummaries } from "@/lib/lookbook";
import { HomeCarousel, type CarouselGenre } from "./home-carousel";
import s from "./home.module.css";

// A fresh random portrait for each genre on every visit.
export const dynamic = "force-dynamic";

function pickRandom<T>(list: T[]): T | null {
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

export default async function Home() {
  const summaries = await getGenreSummaries();

  const genres: CarouselGenre[] = summaries.map((g) => ({
    slug: g.slug,
    name: g.name,
    description: g.description,
    count: g.outfitCount,
    portrait: pickRandom(g.images),
  }));

  // Every genre's fonts, so each card's backdrop is set in its own type.
  const fonts = [...new Set(genres.flatMap((g) => GENRE_DESIGNS[g.slug]?.fonts ?? []))];

  return (
    <main className={s.page}>
      <ThemeFonts families={fonts} />
      <header className={s.header}>
        <p className={s.brand}>FashionOps</p>
        <h1 className={s.headline}>Pick your aesthetic.</h1>
      </header>
      <HomeCarousel genres={genres} />
    </main>
  );
}
