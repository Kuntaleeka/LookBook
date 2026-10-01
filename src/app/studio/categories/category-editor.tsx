"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteCategory,
  duplicateCategory,
  saveCategory,
  type CategoryInput,
} from "./actions";

type Option = { id: string; name: string };

export function CategoryEditor({
  initial,
  parentOptions,
  mergeOptions,
  outfitCount,
  hasPage,
  justSaved,
}: {
  initial: CategoryInput;
  parentOptions: Option[];
  mergeOptions: Option[];
  outfitCount: number;
  /** Whether a hand-built page exists for this category's saved URL name. */
  hasPage: boolean;
  justSaved: boolean;
}) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(justSaved);
  const [pending, startTransition] = useTransition();
  const deleteDialog = useRef<HTMLDialogElement>(null);

  function set<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  }
  function run(action: () => Promise<{ error?: string } | void>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* ── Form ─────────────────────────────────────────────────────── */}
      <form
        className="flex flex-col gap-8"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => saveCategory(form));
        }}
      >
        <Section title="Basics">
          <Field label="Name">
            <input
              value={form.name}
              maxLength={60}
              required
              onChange={(e) => {
                const name = e.target.value;
                set("name", name);
                if (!slugTouched) set("slug", slugify(name));
              }}
              className={inputClass}
              placeholder="e.g. Office Siren"
            />
          </Field>
          <Field label="URL name" hint={`Page address: /${form.slug || "…"}`}>
            <input
              value={form.slug}
              maxLength={60}
              required
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              className={inputClass}
            />
          </Field>
          <Field label="Description" hint="Your definition of the aesthetic. Shown on its page.">
            <textarea
              value={form.description ?? ""}
              maxLength={500}
              rows={3}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Parent category" hint="Optional grouping, e.g. Goth under “Dark”.">
              <select
                value={form.parentId ?? ""}
                onChange={(e) => set("parentId", e.target.value || null)}
                className={inputClass}
              >
                <option value="">None (top level)</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Visibility">
              <label className="flex h-[42px] cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={(e) => set("isVisible", e.target.checked)}
                  className="h-4 w-4 accent-stone-900"
                />
                Visible on the public lookbook
              </label>
            </Field>
          </div>
        </Section>

        <Section title="Keywords" hint="Pieces, colors and details that define this aesthetic. Shown on its page.">
          <TagInput values={form.keywords} onChange={(v) => set("keywords", v)} placeholder="Type and press Enter" />
        </Section>

        <Section title="Mood board" hint="Links to Pinterest boards or reference images, for your own inspiration.">
          <UrlList values={form.moodboardUrls} onChange={(v) => set("moodboardUrls", v)} />
        </Section>

        {/* ── Actions ─────────────────────────────────────────────────── */}
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-stone-200 bg-stone-50/95 px-4 py-4 backdrop-blur md:-mx-10 md:px-10">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : isNew ? "Create category" : "Save changes"}
          </button>
          <Link href="/studio/categories" className="text-sm text-stone-600 hover:text-stone-900">
            {isNew ? "Cancel" : "Back to list"}
          </Link>
          {saved && <span className="text-sm text-emerald-700">Saved ✓</span>}
          {error && (
            <span role="alert" className="text-sm text-red-700">
              {error}
            </span>
          )}
          {!isNew && (
            <span className="ml-auto flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => duplicateCategory(initial.id!))}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm hover:border-stone-500"
              >
                Duplicate
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => deleteDialog.current?.showModal()}
                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Delete or merge…
              </button>
            </span>
          )}
        </div>
      </form>

      {/* ── The real page ───────────────────────────────────────────── */}
      <PagePreview isNew={isNew} slug={initial.slug} isVisible={initial.isVisible} hasPage={hasPage} />

      {!isNew && (
        <DeleteDialog
          ref={deleteDialog}
          name={initial.name}
          outfitCount={outfitCount}
          mergeOptions={mergeOptions}
          pending={pending}
          onConfirm={(moveTo) => run(() => deleteCategory(initial.id!, moveTo))}
        />
      )}
    </div>
  );
}

// ─── Pieces ─────────────────────────────────────────────────────────────────

/**
 * The category's actual public page, shown small. Each genre's look is built
 * by hand from its inspo, so there are no colour or font settings here: what
 * this form changes on the page is the name, description and keywords.
 */
function PagePreview({ isNew, slug, isVisible, hasPage }: { isNew: boolean; slug: string; isVisible: boolean; hasPage: boolean }) {
  const [version, setVersion] = useState(0);
  const note = isNew
    ? "Create the category to see its page here."
    : !hasPage
      ? `There is no custom page for /${slug} yet, so visitors get “not found” there. Each genre's page is designed from your inspo: send the inspo for this one to have it built.`
      : !isVisible
        ? "This category is hidden, so its page can't be opened. Switch on “Visible on the public lookbook” and save to see it here."
        : null;

  return (
    <aside className="lg:sticky lg:top-8 lg:self-start">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Live page</p>
        {!note && (
          <span className="flex items-center gap-3 text-sm">
            <button type="button" onClick={() => setVersion((v) => v + 1)} className="text-stone-600 hover:text-stone-900">
              Reload
            </button>
            <a href={`/${slug}`} target="_blank" rel="noreferrer" className="font-medium text-stone-900 underline">
              Open page ↗
            </a>
          </span>
        )}
      </div>
      {note ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-sm text-stone-500">
          {note}
        </p>
      ) : (
        <>
          {/* the page at desktop width, scaled down to fit the panel */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            <iframe
              key={version}
              src={`/${slug}`}
              title="Live page"
              loading="lazy"
              className="absolute left-0 top-0 h-[250%] w-[250%] origin-top-left scale-[0.4] border-0"
            />
          </div>
          <p className="mt-2 text-xs text-stone-500">
            This is the real page visitors see. Changes to the name, description and keywords show here after you save.
          </p>
        </>
      )}
    </aside>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-900";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {hint && <p className="text-sm text-stone-500">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-stone-800">{label}</span>
      {children}
      {hint && <span className="text-xs text-stone-500">{hint}</span>}
    </label>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function commit() {
    const additions = draft
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && !values.includes(s));
    if (additions.length) onChange([...values, ...additions].slice(0, 30));
    setDraft("");
  }
  return (
    <div className="flex flex-wrap gap-1.5 rounded-lg border border-stone-300 bg-white p-2 focus-within:border-stone-900">
      {values.map((v) => (
        <span key={v} className="flex items-center gap-1 rounded-full bg-stone-100 py-1 pr-1 pl-2.5 text-xs">
          {v}
          <button
            type="button"
            aria-label={`Remove ${v}`}
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="flex h-4 w-4 items-center justify-center rounded-full text-stone-500 hover:bg-stone-300 hover:text-stone-900"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length ? "" : placeholder}
        className="min-w-32 flex-1 px-1 py-1 text-sm outline-none"
      />
    </div>
  );
}

function UrlList({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  const [bad, setBad] = useState(false);
  function add() {
    const url = draft.trim();
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error();
    } catch {
      setBad(true);
      return;
    }
    if (!values.includes(url)) onChange([...values, url].slice(0, 20));
    setDraft("");
    setBad(false);
  }
  return (
    <div className="flex flex-col gap-2">
      {values.length > 0 && (
        <ul className="flex flex-col gap-1">
          {values.map((url) => (
            <li key={url} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200">
              <a href={url} target="_blank" rel="noreferrer noopener" className="min-w-0 flex-1 truncate text-stone-700 underline">
                {url}
              </a>
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== url))}
                className="text-xs text-stone-500 hover:text-red-700"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          type="url"
          inputMode="url"
          onChange={(e) => {
            setDraft(e.target.value);
            setBad(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="https://pinterest.com/…"
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg border border-stone-300 bg-white px-3 text-sm hover:border-stone-500"
        >
          Add
        </button>
      </div>
      {bad && <p className="text-xs text-red-700">That doesn&apos;t look like a web link.</p>}
    </div>
  );
}

function DeleteDialog({
  ref,
  name,
  outfitCount,
  mergeOptions,
  pending,
  onConfirm,
}: {
  ref: React.Ref<HTMLDialogElement>;
  name: string;
  outfitCount: number;
  mergeOptions: Option[];
  pending: boolean;
  onConfirm: (moveTo: string | null) => void;
}) {
  const [mode, setMode] = useState<"inbox" | "merge">("inbox");
  const [target, setTarget] = useState(mergeOptions[0]?.id ?? "");

  return (
    <dialog
      ref={ref}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 backdrop:bg-black/40"
    >
      <form
        method="dialog"
        className="flex flex-col gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(mode === "merge" ? target || null : null);
        }}
      >
        <h2 className="text-lg font-semibold">Delete “{name}”?</h2>
        <p className="text-sm text-stone-600">
          It has {outfitCount} {outfitCount === 1 ? "outfit" : "outfits"}. What should happen to{" "}
          {outfitCount === 1 ? "it" : "them"}?
        </p>
        <label className="flex items-start gap-2 text-sm">
          <input type="radio" checked={mode === "inbox"} onChange={() => setMode("inbox")} className="mt-0.5 accent-stone-900" />
          <span>
            Send back to the Inbox <span className="text-stone-500">(unpublished, to re-sort later)</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            checked={mode === "merge"}
            onChange={() => setMode("merge")}
            disabled={!mergeOptions.length}
            className="mt-0.5 accent-stone-900"
          />
          <span className="flex flex-1 flex-col gap-2">
            Merge into another category
            {mode === "merge" && (
              <select value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
                {mergeOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            )}
          </span>
        </label>
        <p className="text-xs text-stone-500">The category itself is deleted permanently.</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={(e) => (e.currentTarget.closest("dialog") as HTMLDialogElement).close()}
            className="rounded-lg px-4 py-2 text-sm text-stone-600 hover:bg-stone-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60"
          >
            {pending ? "Deleting…" : mode === "merge" ? "Merge and delete" : "Delete"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
