import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/env";
import type { Outfit } from "@/lib/types";
import { OutfitCard } from "./outfit-card";
import { UploadDropzone } from "./upload-dropzone";

type Tab = "inbox" | "published";

export default async function OutfitsPage({ searchParams }: PageProps<"/studio">) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === "published" ? "published" : "inbox";
  const { supabase } = await requireAdmin();

  const outfitsQuery = supabase
    .from("outfits")
    .select("*")
    .order("created_at", { ascending: false });

  const [{ data, error }, { data: genres }, { count: inboxCount }, { count: publishedCount }] =
    await Promise.all([
      (tab === "inbox"
        ? outfitsQuery.eq("status", "inbox")
        : outfitsQuery.not("primary_category_id", "is", null)
      ).returns<Outfit[]>(),
      supabase.from("categories").select("id, name").order("sort_order").order("created_at"),
      supabase.from("outfits").select("id", { count: "exact", head: true }).eq("status", "inbox"),
      supabase
        .from("outfits")
        .select("id", { count: "exact", head: true })
        .not("primary_category_id", "is", null),
    ]);

  const outfits = data ?? [];
  const genreOptions = genres ?? [];

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "inbox", label: "To sort", count: inboxCount ?? 0 },
    { id: "published", label: "Published", count: publishedCount ?? 0 },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Outfits</h1>
        <p className="text-sm text-stone-500">
          Upload photos, then pick a genre for each one. Picking a genre publishes it on that
          genre&apos;s page straight away; choosing &ldquo;Inbox&rdquo; takes it down again.
        </p>
      </header>

      <UploadDropzone />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load outfits: {error.message}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <nav className="flex gap-1 border-b border-stone-200" aria-label="Outfit lists">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.id === "inbox" ? "/studio" : "/studio?tab=published"}
              aria-current={tab === t.id ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                tab === t.id
                  ? "border-stone-900 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              {t.label} <span className="text-stone-400">({t.count})</span>
            </Link>
          ))}
        </nav>

        {genreOptions.length === 0 && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            You don&apos;t have any genres yet.{" "}
            <Link href="/studio/categories/new" className="font-medium underline">
              Create one
            </Link>{" "}
            to start sorting.
          </p>
        )}

        {outfits.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center text-sm text-stone-500">
            {tab === "inbox"
              ? "Nothing to sort. Upload some fits above."
              : "Nothing published yet. Pick a genre on a photo in “To sort”."}
          </p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {outfits.map((o) => (
              <OutfitCard
                key={o.id}
                id={o.id}
                imageUrl={publicImageUrl(o.image_path)}
                width={o.image_width}
                height={o.image_height}
                title={o.title}
                categoryId={o.primary_category_id}
                genres={genreOptions}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
