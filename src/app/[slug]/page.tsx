import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GenreTransition } from "@/components/page-transitions";
import { ThemeFonts } from "@/components/theme/theme-fonts";
import { getDesign } from "@/genres/registry";
import { getGenre } from "@/lib/lookbook";

// Re-check the database at most once a minute; studio changes also revalidate.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const genre = await getGenre(slug);
  if (!genre) return {};
  return {
    title: `${genre.category.name} · FashionOps`,
    description:
      genre.category.description ?? `${genre.category.name} outfits, broken down piece by piece.`,
  };
}

export async function generateViewport({ params }: PageProps<"/[slug]">): Promise<Viewport> {
  const { slug } = await params;
  const design = getDesign(slug);
  return design ? { themeColor: design.background } : {};
}

export default async function GenrePage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const design = getDesign(slug);
  if (!design) notFound();

  const genre = await getGenre(slug);
  if (!genre) notFound(); // missing or hidden category

  const { Page } = design;
  return (
    <GenreTransition>
      <div>
        <ThemeFonts families={design.fonts} />
        <Page category={genre.category} outfits={genre.outfits} />
      </div>
    </GenreTransition>
  );
}
