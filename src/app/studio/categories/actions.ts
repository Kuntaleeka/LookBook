"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { themeSchema } from "@/lib/theme/theme";

const categorySchema = z.object({
  id: z.uuid().nullable(),
  name: z.string().trim().min(1, "Give it a name").max(60, "Keep the name under 60 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Add a URL name")
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single dashes"),
  description: z.string().trim().max(500).nullable(),
  keywords: z.array(z.string().trim().min(1).max(40)).max(30),
  moodboardUrls: z.array(z.url("Mood board links must be full URLs (https://…)")).max(20),
  parentId: z.uuid().nullable(),
  isVisible: z.boolean(),
  theme: themeSchema,
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ActionResult = { error?: string };

function revalidateCategories() {
  revalidatePath("/studio/categories");
  revalidatePath("/", "layout");
}

export async function saveCategory(raw: CategoryInput): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const input = parsed.data;

  // Only one level of nesting: a parent can't itself have a parent.
  if (input.parentId) {
    if (input.parentId === input.id) return { error: "A category can't be its own parent." };
    const { data: parent } = await supabase
      .from("categories")
      .select("parent_id")
      .eq("id", input.parentId)
      .single();
    if (!parent) return { error: "Parent category not found." };
    if (parent.parent_id) return { error: "Pick a top-level category as the parent." };
    if (input.id) {
      const { count } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", input.id);
      if (count) return { error: "This category has sub-categories, so it can't be nested itself." };
    }
  }

  const row = {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    keywords: [...new Set(input.keywords)],
    moodboard_urls: input.moodboardUrls,
    parent_id: input.parentId,
    is_visible: input.isVisible,
    theme: input.theme,
  };

  let id = input.id;
  if (id) {
    const { error } = await supabase.from("categories").update(row).eq("id", id);
    if (error) return { error: friendlyError(error) };
  } else {
    // New categories go to the end of the list.
    const { data: last } = await supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("categories")
      .insert({ ...row, sort_order: (last?.sort_order ?? 0) + 1 })
      .select("id")
      .single();
    if (error) return { error: friendlyError(error) };
    id = data.id;
  }

  revalidateCategories();
  redirect(`/studio/categories/${id}?saved=1`);
}

export async function duplicateCategory(id: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { data: source, error } = await supabase.from("categories").select("*").eq("id", id).single();
  if (error || !source) return { error: "Category not found." };

  const { data: taken } = await supabase
    .from("categories")
    .select("slug")
    .like("slug", `${source.slug}-copy%`);
  const takenSlugs = new Set((taken ?? []).map((r) => r.slug));
  let slug = `${source.slug}-copy`;
  for (let n = 2; takenSlugs.has(slug); n++) slug = `${source.slug}-copy-${n}`;

  const { data: created, error: insertError } = await supabase
    .from("categories")
    .insert({
      name: `${source.name} (copy)`.slice(0, 60),
      slug,
      description: source.description,
      keywords: source.keywords,
      theme: source.theme,
      moodboard_urls: source.moodboard_urls,
      parent_id: source.parent_id,
      sort_order: source.sort_order,
      is_visible: false,
    })
    .select("id")
    .single();
  if (insertError) return { error: friendlyError(insertError) };

  revalidateCategories();
  redirect(`/studio/categories/${created.id}`);
}

/** Deletes a category. With `moveTo`, its outfits move there (a merge); otherwise they go back to the inbox. */
export async function deleteCategory(id: string, moveTo: string | null): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.rpc("delete_category", { p_id: id, p_move_to: moveTo });
  if (error) return { error: error.message };

  revalidateCategories();
  redirect("/studio/categories");
}

export async function reorderCategories(ids: string[]): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  if (!z.array(z.uuid()).safeParse(ids).success) return { error: "Invalid order." };

  const { error } = await supabase.rpc("reorder_categories", { p_ids: ids });
  if (error) return { error: error.message };

  revalidateCategories();
  return {};
}

export async function setCategoryVisible(id: string, isVisible: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const { error } = await supabase.from("categories").update({ is_visible: isVisible }).eq("id", id);
  if (error) return { error: error.message };

  revalidateCategories();
  return {};
}

function friendlyError(error: { code?: string; message: string }) {
  if (error.code === "23505") return "That URL name is already used by another category.";
  return error.message;
}
