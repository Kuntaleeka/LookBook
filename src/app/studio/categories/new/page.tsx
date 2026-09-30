import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_THEME } from "@/lib/theme/theme";
import { CategoryEditor } from "../category-editor";
import { loadEditorData } from "../editor-data";

export default async function NewCategoryPage() {
  const { supabase } = await requireAdmin();
  const { parentOptions, mergeOptions, previewImages } = await loadEditorData(supabase, null);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header>
        <Link href="/studio/categories" className="text-sm text-stone-500 hover:text-stone-900">
          ← Categories
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">New category</h1>
      </header>
      <CategoryEditor
        initial={{
          id: null,
          name: "",
          slug: "",
          description: "",
          keywords: [],
          moodboardUrls: [],
          parentId: null,
          isVisible: false,
          theme: DEFAULT_THEME,
        }}
        parentOptions={parentOptions}
        mergeOptions={mergeOptions}
        outfitCount={0}
        previewImages={previewImages}
        justSaved={false}
      />
    </div>
  );
}
