"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { OUTFITS_BUCKET } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

const INBOX_PATH = /^inbox\/[0-9a-f-]{36}\.(webp|jpg)$/;

export async function createOutfit(input: { path: string; width: number; height: number }) {
  const { supabase } = await requireAdmin();

  if (!INBOX_PATH.test(input.path)) return { error: "Invalid upload path." };

  const { error } = await supabase.from("outfits").insert({
    image_path: input.path,
    image_width: Math.round(input.width) || null,
    image_height: Math.round(input.height) || null,
  });
  if (error) {
    // Don't leave an orphaned photo behind.
    await supabase.storage.from(OUTFITS_BUCKET).remove([input.path]);
    return { error: error.message };
  }

  revalidatePath("/studio");
  return { ok: true };
}

export async function deleteOutfit(id: string) {
  const { supabase } = await requireAdmin();

  // Extra photos are removed with the outfit (cascade); collect their files first.
  const { data: extras } = await supabase.from("outfit_photos").select("image_path").eq("outfit_id", id);

  const { data: outfit, error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .select("image_path")
    .single();
  if (error) return { error: error.message };

  await supabase.storage
    .from(OUTFITS_BUCKET)
    .remove([outfit.image_path, ...(extras ?? []).map((p) => p.image_path)]);
  revalidateLookbook();
  return { ok: true };
}

/**
 * Sorts an outfit into a genre, which publishes it on that genre's page.
 * `categoryId: null` sends it back to the inbox and unpublishes it.
 */
export async function assignOutfit(id: string, categoryId: string | null) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase
    .from("outfits")
    .update(
      categoryId
        ? { primary_category_id: categoryId, status: "sorted", is_published: true }
        : { primary_category_id: null, status: "inbox", is_published: false },
    )
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateLookbook();
  return { ok: true };
}

export async function setOutfitTitle(id: string, title: string) {
  const { supabase } = await requireAdmin();

  const clean = title.trim().slice(0, 80) || null;
  const { error } = await supabase.from("outfits").update({ title: clean }).eq("id", id);
  if (error) return { error: error.message };

  revalidateLookbook();
  return { ok: true };
}

/** Refresh the studio and every public page, so changes show up immediately. */
function revalidateLookbook() {
  revalidatePath("/", "layout");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
