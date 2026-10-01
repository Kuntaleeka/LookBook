import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import type { ItemRow } from "@/lib/items";
import { publicImageUrl } from "@/lib/supabase/env";
import type { Outfit, OutfitPhoto } from "@/lib/types";
import { ExtraPhotos } from "./extra-photos";
import { TagEditor, type SavedPiece } from "./tag-editor";

export default async function TagOutfitPage({ params }: PageProps<"/studio/outfits/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [
    { data: outfit },
    { data: items, error: itemsError },
    { data: others },
    { data: photos, error: photosError },
  ] = await Promise.all([
    supabase.from("outfits").select("*, categories!primary_category_id(name, slug)").eq("id", id).maybeSingle<
      Outfit & { categories: { name: string; slug: string } | null }
    >(),
    supabase
      .from("items")
      .select("*")
      .eq("outfit_id", id)
      .order("sort_order")
      .order("created_at")
      .returns<ItemRow[]>(),
    // Pieces tagged on other outfits, newest first, to offer for reuse.
    supabase
      .from("items")
      .select("*, outfits(categories!primary_category_id(name))")
      .neq("outfit_id", id)
      .neq("name", "")
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<(ItemRow & { outfits: { categories: { name: string } | null } | null })[]>(),
    // Other photos of this same fit.
    supabase
      .from("outfit_photos")
      .select("*")
      .eq("outfit_id", id)
      .order("sort_order")
      .order("created_at")
      .returns<OutfitPhoto[]>(),
  ]);
  if (!outfit) notFound();

  const genre = outfit.categories;
  const library = savedPieces(others ?? []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={outfit.is_published ? "/studio?tab=published" : "/studio"}
            className="text-sm text-stone-500 hover:text-stone-900"
          >
            ← Outfits
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">Tag items{outfit.title ? `: ${outfit.title}` : ""}</h1>
          <p className="text-sm text-stone-500">
            Each pin becomes a line and a bubble with the item&apos;s name and link when visitors open this photo.
          </p>
        </div>
        {genre && outfit.is_published && (
          <Link
            href={`/${genre.slug}`}
            target="_blank"
            className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm hover:border-stone-500"
          >
            View on {genre.name} ↗
          </Link>
        )}
      </header>

      {itemsError ? (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load items: {itemsError.message}. Did you run the{" "}
          <code className="font-mono">0003_items.sql</code> migration in Supabase?
        </p>
      ) : (
        <TagEditor
          outfitId={outfit.id}
          imageUrl={publicImageUrl(outfit.image_path)}
          initialItems={items ?? []}
          library={library}
        />
      )}

      {photosError ? (
        <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          To add more photos of the same fit, run the <code className="font-mono">0004_outfit_photos.sql</code>{" "}
          migration in Supabase first.
        </p>
      ) : (
        <ExtraPhotos outfitId={outfit.id} initialPhotos={photos ?? []} />
      )}
    </div>
  );
}

/** One entry per distinct piece (same name, source and link), keeping the newest. */
function savedPieces(rows: (ItemRow & { outfits: { categories: { name: string } | null } | null })[]): SavedPiece[] {
  const seen = new Set<string>();
  const pieces: SavedPiece[] = [];
  for (const row of rows) {
    const where =
      row.source === "shop"
        ? (row.shop_url ?? "")
        : row.source === "instagram"
          ? row.ig_handle
            ? `@${row.ig_handle}`
            : ""
          : row.source === "local"
            ? (row.place ?? "")
            : "";
    const key = `${row.name.trim().toLowerCase()}|${row.source}|${where.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pieces.push({
      key,
      name: row.name.trim(),
      source: row.source,
      where,
      genre: row.outfits?.categories?.name ?? null,
    });
  }
  return pieces;
}
