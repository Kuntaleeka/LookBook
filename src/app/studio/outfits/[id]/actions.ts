"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { normalizeHandle, type ItemRow, type ItemSource } from "@/lib/items";
import { OUTFITS_BUCKET } from "@/lib/supabase/env";
import type { OutfitPhoto } from "@/lib/types";

const fraction = z.number().min(0).max(1);

function revalidate(outfitId: string) {
  revalidatePath(`/studio/outfits/${outfitId}`);
  revalidatePath("/", "layout"); // genre pages
}

/** Drops a new pin on the photo. */
export async function addItem(outfitId: string, x: number, y: number) {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(outfitId).success || !fraction.safeParse(x).success || !fraction.safeParse(y).success) {
    return { error: "Invalid pin position." };
  }

  const { count } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true })
    .eq("outfit_id", outfitId);

  const { data, error } = await supabase
    .from("items")
    .insert({ outfit_id: outfitId, pin_x: x, pin_y: y, sort_order: count ?? 0 })
    .select("*")
    .single<ItemRow>();
  if (error) return { error: error.message };

  revalidate(outfitId);
  return { item: data };
}

export async function moveItem(id: string, outfitId: string, x: number, y: number) {
  const { supabase } = await requireAdmin();
  if (!fraction.safeParse(x).success || !fraction.safeParse(y).success) return { error: "Invalid pin position." };

  const { error } = await supabase.from("items").update({ pin_x: x, pin_y: y }).eq("id", id);
  if (error) return { error: error.message };

  revalidate(outfitId);
  return {};
}

export type ItemFields = {
  name: string;
  source: ItemSource;
  /** Shop link, Instagram handle or store name, depending on `source`. */
  where: string;
};

export async function saveItem(id: string, outfitId: string, fields: ItemFields) {
  const { supabase } = await requireAdmin();

  const name = fields.name.trim().slice(0, 80);
  const where = fields.where.trim();
  const row: Partial<ItemRow> = { name, source: fields.source, shop_url: null, ig_handle: null, place: null };

  if (fields.source === "shop" && where) {
    const url = /^https?:\/\//i.test(where) ? where : `https://${where}`;
    try {
      new URL(url);
    } catch {
      return { error: "That shop link doesn't look like a web address." };
    }
    row.shop_url = url;
  } else if (fields.source === "instagram" && where) {
    const handle = normalizeHandle(where);
    if (!handle) return { error: "Instagram handles are letters, numbers, dots and underscores." };
    row.ig_handle = handle;
  } else if (fields.source === "local" && where) {
    row.place = where.slice(0, 120);
  }

  const { error } = await supabase.from("items").update(row).eq("id", id);
  if (error) return { error: error.message };

  revalidate(outfitId);
  return {};
}

export async function deleteItem(id: string, outfitId: string) {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidate(outfitId);
  return {};
}

const PHOTO_PATH = /^inbox\/[0-9a-f-]{36}\.(webp|jpg)$/;

/** Records an extra photo of this outfit, already uploaded to storage. */
export async function addPhoto(outfitId: string, input: { path: string; width: number; height: number }) {
  const { supabase } = await requireAdmin();
  if (!z.uuid().safeParse(outfitId).success || !PHOTO_PATH.test(input.path)) return { error: "Invalid photo." };

  const { count } = await supabase
    .from("outfit_photos")
    .select("id", { count: "exact", head: true })
    .eq("outfit_id", outfitId);

  const { data, error } = await supabase
    .from("outfit_photos")
    .insert({
      outfit_id: outfitId,
      image_path: input.path,
      image_width: Math.round(input.width) || null,
      image_height: Math.round(input.height) || null,
      sort_order: count ?? 0,
    })
    .select("*")
    .single<OutfitPhoto>();
  if (error) {
    // Don't leave an orphaned file behind.
    await supabase.storage.from(OUTFITS_BUCKET).remove([input.path]);
    return { error: error.message };
  }

  revalidate(outfitId);
  return { photo: data };
}

export async function deletePhoto(id: string, outfitId: string) {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("outfit_photos")
    .delete()
    .eq("id", id)
    .select("image_path")
    .single<{ image_path: string }>();
  if (error) return { error: error.message };

  await supabase.storage.from(OUTFITS_BUCKET).remove([data.image_path]);
  revalidate(outfitId);
  return {};
}
