"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { OUTFITS_BUCKET, publicImageUrl } from "@/lib/supabase/env";
import { prepareImage } from "@/lib/prepare-image";
import type { OutfitPhoto } from "@/lib/types";
import { addPhoto, deletePhoto } from "./actions";

/**
 * More photos of the same fit: other angles, close-ups. Visitors see them all
 * together with the main photo when they hide the tags.
 */
export function ExtraPhotos({ outfitId, initialPhotos }: { outfitId: string; initialPhotos: OutfitPhoto[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function uploadOne(file: File) {
    const { blob, ext, width, height } = await prepareImage(file);
    const path = `inbox/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await createClient()
      .storage.from(OUTFITS_BUCKET)
      .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
    if (uploadError) throw new Error(uploadError.message);

    const result = await addPhoto(outfitId, { path, width, height });
    if (result.error || !result.photo) throw new Error(result.error ?? "Couldn't save the photo.");
    const photo = result.photo;
    setPhotos((all) => [...all, photo]);
  }

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name));
    if (!files.length) return;
    setError(null);
    setUploading(files.length);
    // one at a time, so they keep the order they were picked in
    for (const file of files) {
      try {
        await uploadOne(file);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
      setUploading((n) => n - 1);
    }
  }

  function remove(photo: OutfitPhoto) {
    setError(null);
    setPhotos((all) => all.filter((p) => p.id !== photo.id));
    startTransition(async () => {
      const result = await deletePhoto(photo.id, outfitId);
      if (result.error) {
        setError(result.error);
        setPhotos((all) => (all.some((p) => p.id === photo.id) ? all : [...all, photo]));
      }
    });
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            More photos of this fit{" "}
            {photos.length > 0 && <span className="font-normal text-stone-500">({photos.length})</span>}
          </h2>
          <p className="text-sm text-stone-500">
            Other angles or close-ups. Visitors see them all together with the main photo when they hide the tags.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading > 0}
          className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {photos.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {photos.map((photo) => (
            <li key={photo.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- already sized on upload */}
              <img
                src={publicImageUrl(photo.image_path)}
                alt="Extra photo of this outfit"
                className="h-36 w-auto rounded-lg object-cover ring-1 ring-stone-200"
              />
              <button
                type="button"
                onClick={() => remove(photo)}
                aria-label="Remove this photo"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-red-700 shadow ring-1 ring-stone-300 hover:bg-red-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
