"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OUTFITS_BUCKET } from "@/lib/supabase/env";
import { prepareImage } from "@/lib/prepare-image";
import { createOutfit } from "./actions";

type Job = { id: string; name: string; state: "working" | "done" | "error"; message?: string };

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);

  const update = (id: string, patch: Partial<Job>) =>
    setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...patch } : j)));

  async function uploadOne(file: File, jobId: string) {
    try {
      const { blob, ext, width, height } = await prepareImage(file);
      const path = `inbox/${crypto.randomUUID()}.${ext}`;

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(OUTFITS_BUCKET)
        .upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
      if (uploadError) throw new Error(uploadError.message);

      const result = await createOutfit({ path, width, height });
      if (result.error) throw new Error(result.error);

      update(jobId, { state: "done" });
    } catch (e) {
      update(jobId, { state: "error", message: e instanceof Error ? e.message : "Upload failed" });
    }
  }

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((f) => f.type.startsWith("image/") || /\.hei[cf]$/i.test(f.name));
    if (!files.length) return;

    const newJobs = files.map((f) => ({ id: crypto.randomUUID(), name: f.name, state: "working" as const }));
    setJobs((all) => [...newJobs, ...all].slice(0, 20));

    // Upload three at a time to keep the browser responsive.
    const queue = files.map((file, i) => ({ file, jobId: newJobs[i].id }));
    const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        await uploadOne(next.file, next.jobId);
      }
    });
    await Promise.all(workers);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging ? "border-stone-900 bg-stone-100" : "border-stone-300 bg-white hover:border-stone-500"
        }`}
      >
        <span className="text-base font-medium text-stone-900">Drop outfit photos here</span>
        <span className="text-sm text-stone-500">or click to choose · JPEG, PNG, WebP · several at once is fine</span>
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

      {jobs.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {jobs.map((job) => (
            <li key={job.id} className="flex items-center gap-2">
              <span
                className={
                  job.state === "done"
                    ? "text-emerald-700"
                    : job.state === "error"
                      ? "text-red-700"
                      : "text-stone-500"
                }
              >
                {job.state === "done" ? "✓" : job.state === "error" ? "✕" : "…"}
              </span>
              <span className="truncate text-stone-700">{job.name}</span>
              {job.message && <span className="text-red-700">— {job.message}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
