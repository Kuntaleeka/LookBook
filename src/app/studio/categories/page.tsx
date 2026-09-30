import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { parseTheme } from "@/lib/theme/theme";
import type { Category } from "@/lib/types";
import { CategoryList, type CategoryRow } from "./category-list";

type CategoryWithCount = Category & { outfits: { count: number }[] };

export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("categories")
    .select("*, outfits!primary_category_id(count)")
    .order("sort_order")
    .order("created_at")
    .returns<CategoryWithCount[]>();

  const categories = data ?? [];
  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const rows: CategoryRow[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    isVisible: c.is_visible,
    outfitCount: c.outfits?.[0]?.count ?? 0,
    parentName: c.parent_id ? (nameById.get(c.parent_id) ?? null) : null,
    theme: parseTheme(c.theme),
  }));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-stone-500">
            Your aesthetics. Drag to reorder — this is the order visitors see. Hidden ones stay
            private.
          </p>
        </div>
        <Link
          href="/studio/categories/new"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          New category
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load categories: {error.message}. Did you run the Phase 2 migration?
        </p>
      )}

      {!error && rows.length === 0 ? (
        <p className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center text-sm text-stone-500">
          No categories yet.{" "}
          <Link href="/studio/categories/new" className="font-medium text-stone-900 underline">
            Create your first one
          </Link>
          .
        </p>
      ) : (
        <CategoryList initialRows={rows} />
      )}
    </div>
  );
}
