import Link from "next/link";
import { notFound } from "next/navigation";
import { getDesign } from "@/genres/registry";
import { requireAdmin } from "@/lib/auth";
import { parseTheme } from "@/lib/theme/theme";
import type { Category } from "@/lib/types";
import { CategoryEditor } from "../category-editor";
import { loadEditorData } from "../editor-data";

export default async function EditCategoryPage({
  params,
  searchParams,
}: PageProps<"/studio/categories/[id]">) {
  const { id } = await params;
  const { saved } = await searchParams;
  const { supabase } = await requireAdmin();

  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: category }, { count }, editorData] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).maybeSingle<Category>(),
    supabase
      .from("outfits")
      .select("id", { count: "exact", head: true })
      .eq("primary_category_id", id),
    loadEditorData(supabase, id),
  ]);
  if (!category) notFound();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header>
        <Link href="/studio/categories" className="text-sm text-stone-500 hover:text-stone-900">
          ← Categories
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{category.name}</h1>
      </header>
      <CategoryEditor
        // Remount after a save/duplicate so the form shows fresh server data.
        key={category.updated_at}
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          keywords: category.keywords ?? [],
          moodboardUrls: category.moodboard_urls ?? [],
          parentId: category.parent_id,
          isVisible: category.is_visible,
          theme: parseTheme(category.theme),
        }}
        parentOptions={editorData.parentOptions}
        mergeOptions={editorData.mergeOptions}
        outfitCount={count ?? 0}
        hasPage={Boolean(getDesign(category.slug))}
        justSaved={saved === "1"}
      />
    </div>
  );
}
