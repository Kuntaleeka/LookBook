import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Shared lookups for the new/edit category pages. */
export async function loadEditorData(supabase: SupabaseClient, currentId: string | null) {
  const { data: categories } = await supabase.from("categories").select("id, name, parent_id").order("sort_order");
  const others = (categories ?? []).filter((c) => c.id !== currentId);

  return {
    // Parents must be top-level, and not the category itself.
    parentOptions: others.filter((c) => !c.parent_id).map(({ id, name }) => ({ id, name })),
    mergeOptions: others.map(({ id, name }) => ({ id, name })),
  };
}
