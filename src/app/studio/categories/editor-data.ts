import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicImageUrl } from "@/lib/supabase/env";

/** Shared lookups for the new/edit category pages. */
export async function loadEditorData(supabase: SupabaseClient, currentId: string | null) {
  const [{ data: categories }, { data: outfits }] = await Promise.all([
    supabase.from("categories").select("id, name, parent_id").order("sort_order"),
    currentId
      ? supabase
          .from("outfits")
          .select("image_path")
          .eq("primary_category_id", currentId)
          .order("created_at", { ascending: false })
          .limit(3)
      : Promise.resolve({ data: [] as { image_path: string }[] }),
  ]);

  const others = (categories ?? []).filter((c) => c.id !== currentId);

  // Fall back to recent uploads so the preview shows real photos.
  let images = (outfits ?? []).map((o) => publicImageUrl(o.image_path));
  if (images.length < 3) {
    const { data: recent } = await supabase
      .from("outfits")
      .select("image_path")
      .order("created_at", { ascending: false })
      .limit(3);
    images = [...images, ...(recent ?? []).map((o) => publicImageUrl(o.image_path))]
      .filter((v, i, all) => all.indexOf(v) === i)
      .slice(0, 3);
  }

  return {
    // Parents must be top-level, and not the category itself.
    parentOptions: others.filter((c) => !c.parent_id).map(({ id, name }) => ({ id, name })),
    mergeOptions: others.map(({ id, name }) => ({ id, name })),
    previewImages: images,
  };
}
