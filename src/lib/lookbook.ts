import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { publicImageUrl } from "@/lib/supabase/env";
import { parseTheme, type Theme } from "@/lib/theme/theme";
import { toLookbookItem, type ItemRow, type LookbookItem } from "@/lib/items";
import type { Category, Outfit, OutfitPhoto } from "@/lib/types";

/** A photo of an outfit, sized so layouts know its shape before it loads. */
export type LookbookPhoto = { url: string; width: number | null; height: number | null };

export type LookbookOutfit = {
  id: string;
  title: string | null;
  notes: string | null;
  imageUrl: string;
  width: number | null;
  height: number | null;
  createdAt: string;
  /** Tagged pieces, with pin positions and links. */
  items: LookbookItem[];
  /** Extra photos of the same fit (other angles, details), in the admin's order. */
  photos: LookbookPhoto[];
};

export type LookbookCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  keywords: string[];
  theme: Theme;
};

export type GenreSummary = LookbookCategory & {
  outfitCount: number;
  /** Every published outfit photo in the genre, cover first, then newest. */
  images: string[];
};

function toCategory(c: Category): LookbookCategory {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    keywords: c.keywords ?? [],
    theme: parseTheme(c.theme),
  };
}

function toOutfit(o: Outfit, items: LookbookItem[] = [], photos: LookbookPhoto[] = []): LookbookOutfit {
  return {
    id: o.id,
    title: o.title,
    notes: o.notes,
    imageUrl: publicImageUrl(o.image_path),
    width: o.image_width,
    height: o.image_height,
    createdAt: o.created_at,
    items,
    photos,
  };
}

/** Everything the homepage needs: visible genres with counts and cover photos. */
export async function getGenreSummaries(): Promise<GenreSummary[]> {
  const supabase = createPublicClient();
  const [{ data: categories }, { data: outfits }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("created_at")
      .returns<Category[]>(),
    // RLS only returns published outfits to the public.
    supabase
      .from("outfits")
      .select("id, image_path, primary_category_id")
      .not("primary_category_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  const byCategory = new Map<string, string[]>();
  for (const o of outfits ?? []) {
    const list = byCategory.get(o.primary_category_id) ?? [];
    list.push(o.image_path);
    byCategory.set(o.primary_category_id, list);
  }

  return (categories ?? []).map((c) => {
    const paths = byCategory.get(c.id) ?? [];
    const coverOutfit = c.cover_outfit_id
      ? (outfits ?? []).find((o) => o.id === c.cover_outfit_id)
      : undefined;
    const ordered = coverOutfit
      ? [coverOutfit.image_path, ...paths.filter((p) => p !== coverOutfit.image_path)]
      : paths;
    return {
      ...toCategory(c),
      outfitCount: paths.length,
      images: ordered.map(publicImageUrl),
    };
  });
}

/** One genre page: the category plus its published outfits (main and extra tags). */
export const getGenre = cache(async (slug: string) => {
  const supabase = createPublicClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<Category>();
  if (!category) return null;

  const [{ data: primary }, { data: tagged }] = await Promise.all([
    supabase
      .from("outfits")
      .select("*")
      .eq("primary_category_id", category.id)
      .order("created_at", { ascending: false })
      .returns<Outfit[]>(),
    supabase
      .from("outfit_categories")
      .select("outfits(*)")
      .eq("category_id", category.id)
      .returns<{ outfits: Outfit | null }[]>(),
  ]);

  const seen = new Set<string>();
  const rows = [...(primary ?? []), ...(tagged ?? []).map((t) => t.outfits)]
    .filter((o): o is Outfit => Boolean(o && o.is_published))
    .filter((o) => (seen.has(o.id) ? false : (seen.add(o.id), true)));

  // Tagged items for these outfits (RLS only returns items on published ones).
  const itemsByOutfit = new Map<string, LookbookItem[]>();
  if (rows.length) {
    const { data: items } = await supabase
      .from("items")
      .select("*")
      .in("outfit_id", rows.map((o) => o.id))
      .order("sort_order")
      .order("created_at")
      .returns<ItemRow[]>();
    for (const item of items ?? []) {
      const list = itemsByOutfit.get(item.outfit_id) ?? [];
      list.push(toLookbookItem(item));
      itemsByOutfit.set(item.outfit_id, list);
    }
  }

  // Extra photos of the same fits. (If the 0004 migration hasn't been run yet
  // this query errors and outfits simply have no extras.)
  const photosByOutfit = new Map<string, LookbookPhoto[]>();
  if (rows.length) {
    const { data: photos } = await supabase
      .from("outfit_photos")
      .select("*")
      .in("outfit_id", rows.map((o) => o.id))
      .order("sort_order")
      .order("created_at")
      .returns<OutfitPhoto[]>();
    for (const photo of photos ?? []) {
      const list = photosByOutfit.get(photo.outfit_id) ?? [];
      list.push({ url: publicImageUrl(photo.image_path), width: photo.image_width, height: photo.image_height });
      photosByOutfit.set(photo.outfit_id, list);
    }
  }

  const outfits = rows.map((o) => toOutfit(o, itemsByOutfit.get(o.id), photosByOutfit.get(o.id)));
  return { category: toCategory(category), outfits };
});
