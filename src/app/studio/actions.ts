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

  const { data: outfit, error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .select("image_path")
    .single();
  if (error) return { error: error.message };

  await supabase.storage.from(OUTFITS_BUCKET).remove([outfit.image_path]);
  revalidatePath("/studio");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
