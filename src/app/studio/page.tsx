import { requireAdmin } from "@/lib/auth";
import { publicImageUrl } from "@/lib/supabase/env";
import type { Outfit } from "@/lib/types";
import { OutfitCard } from "./outfit-card";
import { UploadDropzone } from "./upload-dropzone";

export default async function InboxPage() {
  const { supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("status", "inbox")
    .order("created_at", { ascending: false })
    .returns<Outfit[]>();

  const outfits = data ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-stone-500">
          New uploads wait here until you sort them into a category. Nothing here is public.
        </p>
      </header>

      <UploadDropzone />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Couldn&apos;t load the inbox: {error.message}
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-medium text-stone-500">
          {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"} to sort
        </h2>
        {outfits.length === 0 ? (
          <p className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center text-sm text-stone-500">
            Your inbox is empty. Upload some fits above.
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
                createdAt={o.created_at}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
