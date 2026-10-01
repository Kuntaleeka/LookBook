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
      supabase.from("categories").select("id, name, slug, is_visible").order("sort_order").order("created_at"),
      supabase.from("outfits").select("id", { count: "exact", head: true }).eq("status", "inbox"),
      supabase
        .from("outfits")
        .select("id", { count: "exact", head: true })
        .not("primary_category_id", "is", null),
    ]);

  const outfits = data ?? [];
  const genreOptions = (genres ?? []).map(({ id, name }) => ({ id, name }));

  // Published fits, grouped under their genre, in the order the genres appear on the site.
  const groups =
    tab === "published"
      ? (genres ?? [])
          .map((g) => ({ ...g, outfits: outfits.filter((o) => o.primary_category_id === g.id) }))
          .filter((g) => g.outfits.length > 0)
      : [];

  const card = (o: Outfit) => (
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
  );

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

      <section className="flex flex-col gap-6">
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
        ) : tab === "published" ? (
          <>
            {/* jump straight to a genre */}
            {groups.length > 1 && (
              <nav className="flex flex-wrap gap-2" aria-label="Jump to a genre">
                {groups.map((g) => (
                  <a
                    key={g.id}
                    href={`#genre-${g.slug}`}
                    className="rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-700 hover:border-stone-500"
                  >
                    {g.name} <span className="text-stone-400">({g.outfits.length})</span>
                  </a>
                ))}
              </nav>
            )}

            {groups.map((g) => (
              <section key={g.id} id={`genre-${g.slug}`} className="flex scroll-mt-6 flex-col gap-3">
                <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-stone-200 pb-2">
                  <h2 className="text-lg font-semibold">
                    {g.name}{" "}
                    <span className="text-sm font-normal text-stone-500">
                      · {g.outfits.length} {g.outfits.length === 1 ? "fit" : "fits"}
                      {!g.is_visible && " · hidden from visitors"}
                    </span>
                  </h2>
                  {g.is_visible && (
                    <Link href={`/${g.slug}`} target="_blank" className="text-sm text-stone-600 underline hover:text-stone-900">
                      View page ↗
                    </Link>
                  )}
                </header>
                <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">{g.outfits.map(card)}</div>
              </section>
            ))}
          </>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">{outfits.map(card)}</div>
        )}
      </section>
    </div>
  );
}
