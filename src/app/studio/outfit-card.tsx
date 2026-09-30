"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { assignOutfit, deleteOutfit, setOutfitTitle } from "./actions";

export type GenreOption = { id: string; name: string };

export function OutfitCard({
  id,
  imageUrl,
  width,
  height,
  title,
  categoryId,
  genres,
}: {
  id: string;
  imageUrl: string;
  width: number | null;
  height: number | null;
  title: string | null;
  categoryId: string | null;
  genres: GenreOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [genre, setGenre] = useState(categoryId ?? "");
  const [draftTitle, setDraftTitle] = useState(title ?? "");
  const [savedTitle, setSavedTitle] = useState(title ?? "");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function run(action: () => Promise<{ error?: string; ok?: boolean }>, okText: string, undo?: () => void) {
    setStatus(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        undo?.();
        setStatus({ kind: "error", text: result.error });
      } else {
        setStatus({ kind: "ok", text: okText });
      }
    });
  }

  function changeGenre(next: string) {
    const previous = genre;
    setGenre(next);
    const name = genres.find((g) => g.id === next)?.name;
    run(
      () => assignOutfit(id, next || null),
      name ? `Published to ${name}` : "Moved back to the inbox",
      () => setGenre(previous),
    );
  }

  function saveTitle() {
    if (draftTitle.trim() === savedTitle.trim()) return;
    const previous = savedTitle;
    setSavedTitle(draftTitle);
    run(() => setOutfitTitle(id, draftTitle), "Title saved", () => setSavedTitle(previous));
  }

  return (
    <figure
      className={`mb-4 break-inside-avoid overflow-hidden rounded-xl bg-white ring-1 transition ${
        genre ? "ring-emerald-300" : "ring-stone-200"
      } ${pending ? "opacity-60" : ""}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- already resized on upload */}
      <img
        src={imageUrl}
        alt={savedTitle || "Outfit photo"}
        width={width ?? undefined}
        height={height ?? undefined}
        loading="lazy"
        className="block h-auto w-full bg-stone-200"
      />
      <figcaption className="flex flex-col gap-2 p-3">
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          Genre
          <select
            value={genre}
            disabled={pending}
            onChange={(e) => changeGenre(e.target.value)}
            className={`rounded-lg border px-2 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900 ${
              genre ? "border-emerald-300 bg-emerald-50" : "border-stone-300 bg-white"
            }`}
          >
            <option value="">Inbox</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-stone-500">
          Title (optional)
          <input
            value={draftTitle}
            maxLength={80}
            placeholder="e.g. Sunday brunch"
            onChange={(e) => setDraftTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
            className="rounded-lg border border-stone-300 px-2 py-1.5 text-sm text-stone-900 outline-none focus:border-stone-900"
          />
        </label>

        <Link
          href={`/studio/outfits/${id}`}
          className="rounded-lg border border-stone-300 px-2 py-1.5 text-center text-sm text-stone-800 hover:border-stone-500"
        >
          Tag items &amp; links →
        </Link>

        <div className="flex min-h-5 items-center justify-between gap-2 text-xs">
          <span
            role={status?.kind === "error" ? "alert" : "status"}
            className={status?.kind === "error" ? "text-red-700" : "text-emerald-700"}
          >
            {pending ? "Saving…" : status?.text}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this outfit and its photo? This can't be undone.")) return;
              run(() => deleteOutfit(id), "Deleted");
            }}
            className="rounded px-2 py-1 text-stone-500 hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
