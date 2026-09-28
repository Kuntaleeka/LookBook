"use client";

import { useTransition } from "react";
import { deleteOutfit } from "./actions";

export function OutfitCard({
  id,
  imageUrl,
  width,
  height,
  createdAt,
}: {
  id: string;
  imageUrl: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <figure
      className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-xl bg-stone-200 ring-1 ring-stone-200 ${
        pending ? "opacity-40" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- already resized on upload */}
      <img
        src={imageUrl}
        alt="Outfit photo"
        width={width ?? undefined}
        height={height ?? undefined}
        loading="lazy"
        className="block h-auto w-full"
      />
      <figcaption className="flex items-center justify-between bg-white px-3 py-2 text-xs text-stone-500">
        <time dateTime={createdAt}>
          {new Date(createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
        </time>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (!confirm("Delete this outfit and its photo? This can't be undone.")) return;
            startTransition(async () => {
              const result = await deleteOutfit(id);
              if (result.error) alert(result.error);
            });
          }}
          className="rounded px-2 py-1 text-stone-500 hover:bg-red-50 hover:text-red-700"
        >
          Delete
        </button>
      </figcaption>
    </figure>
  );
}
