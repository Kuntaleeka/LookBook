"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { MOTIF_LABELS, Motif } from "@/components/theme/motif";
import { ThemeFonts } from "@/components/theme/theme-fonts";
import { ThemePreview } from "@/components/theme/theme-preview";
import { checkThemeContrast } from "@/lib/theme/contrast";
import { FONTS } from "@/lib/theme/fonts";
import { MOTIF_IDS } from "@/lib/theme/motif-ids";
import { PRESETS } from "@/lib/theme/presets";
import type { Theme } from "@/lib/theme/theme";
import {
  deleteCategory,
  duplicateCategory,
  saveCategory,
  type CategoryInput,
} from "./actions";

type Option = { id: string; name: string };

const COLOR_FIELDS: { key: keyof Theme & ("bg" | "surface" | "fg" | "mutedFg" | "accent" | "accentFg"); label: string; hint: string }[] = [
  { key: "bg", label: "Background", hint: "Page background" },
  { key: "surface", label: "Cards", hint: "Outfit cards" },
  { key: "fg", label: "Text", hint: "Headings and body" },
  { key: "mutedFg", label: "Secondary text", hint: "Captions, details" },
  { key: "accent", label: "Accent", hint: "Buttons, links, decorations" },
  { key: "accentFg", label: "Text on accent", hint: "Button labels" },
];

export function CategoryEditor({
  initial,
  parentOptions,
  mergeOptions,
  outfitCount,
  previewImages,
  justSaved,
}: {
  initial: CategoryInput;
  parentOptions: Option[];
  mergeOptions: Option[];
  outfitCount: number;
  previewImages: string[];
  justSaved: boolean;
}) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(justSaved);
  const [pending, startTransition] = useTransition();
  const deleteDialog = useRef<HTMLDialogElement>(null);

  const theme = form.theme;
  const contrast = checkThemeContrast(theme);

  function set<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setTheme<K extends keyof Theme>(key: K, value: Theme[K]) {
    setSaved(false);
    setForm((f) => ({ ...f, theme: { ...f.theme, [key]: value } }));
  }

  function applyPreset(slug: string) {
    const preset = PRESETS.find((p) => p.slug === slug);
    if (!preset) return;
    setSaved(false);
    setForm((f) => ({
      ...f,
      theme: { ...preset.theme },
      // For a brand-new category, also fill in the text if it's still empty.
      ...(isNew && !f.name ? { name: preset.name } : {}),
      ...(isNew && !slugTouched && !f.name ? { slug: preset.slug } : {}),
      ...(isNew && !f.description ? { description: preset.description } : {}),
      ...(isNew && f.keywords.length === 0 ? { keywords: preset.keywords } : {}),
    }));
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
      <ThemeFonts families={FONTS.map((f) => f.family)} />

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

        <Section title="Theme">
          <Field label="Start from a preset" hint="Replaces the colors, fonts and decoration below.">
            <select value="" onChange={(e) => applyPreset(e.target.value)} className={inputClass}>
              <option value="" disabled>
                Choose a preset…
              </option>
              {PRESETS.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-2 2xl:grid-cols-2">
            {COLOR_FIELDS.map(({ key, label, hint }) => (
              <ColorField
                key={key}
                label={label}
                hint={hint}
                value={theme[key]}
                onChange={(v) => setTheme(key, v)}
              />
            ))}
          </div>

          <ContrastReport checks={contrast} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Heading font">
              <FontSelect value={theme.fontDisplay} onChange={(v) => setTheme("fontDisplay", v)} />
            </Field>
            <Field label="Body font">
              <FontSelect value={theme.fontBody} onChange={(v) => setTheme("fontBody", v)} />
            </Field>
          </div>

          <Field label={`Corner rounding · ${theme.radius}px`}>
            <input
              type="range"
              min={0}
              max={32}
              value={theme.radius}
              onChange={(e) => setTheme("radius", Number(e.target.value))}
              className="w-full accent-stone-900"
            />
          </Field>

          <Field label="Decoration">
            <div className="flex flex-wrap gap-2">
              {MOTIF_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTheme("motif", id)}
                  aria-pressed={theme.motif === id}
                  className={`flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-lg border text-[11px] ${
                    theme.motif === id
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
                  }`}
                >
                  {id === "none" ? <span className="text-base leading-none">∅</span> : <Motif id={id} size={18} />}
                  {MOTIF_LABELS[id]}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Keywords" hint="Pieces, colors and details that define this aesthetic. Used for search and filters.">
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

      {/* ── Live preview ─────────────────────────────────────────────── */}
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone-500">Live preview</p>
        <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-stone-200">
          <ThemePreview
            theme={theme}
            name={form.name}
            description={form.description}
            keywords={form.keywords}
            images={previewImages}
          />
        </div>
      </aside>

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

function ColorField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  // Keep the text box in sync when the value changes from outside (presets).
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-10 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-800">{label}</p>
        <p className="truncate text-xs text-stone-500">{hint}</p>
      </div>
      <input
        value={text}
        maxLength={7}
        spellCheck={false}
        aria-label={`${label} hex`}
        onChange={(e) => {
          const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
          setText(v);
          if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toLowerCase());
        }}
        onBlur={() => setText(value)}
        className="w-20 rounded border border-stone-200 px-1.5 py-1 font-mono text-xs outline-none focus:border-stone-900"
      />
    </div>
  );
}

function ContrastReport({ checks }: { checks: ReturnType<typeof checkThemeContrast> }) {
  const failing = checks.filter((c) => !c.ok);
  return (
    <div
      className={`rounded-lg px-3 py-2.5 text-xs ${
        failing.length ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"
      }`}
    >
      <p className="font-medium">
        {failing.length ? `Readability: ${failing.length} low-contrast pair${failing.length > 1 ? "s" : ""}` : "Readability: all text is easy to read ✓"}
      </p>
      <ul className="mt-1 grid gap-0.5 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.label} className={c.ok ? "opacity-70" : "font-medium"}>
            {c.ok ? "✓" : "⚠"} {c.label}: {c.ratio.toFixed(1)}:1
          </li>
        ))}
      </ul>
      {failing.length > 0 && <p className="mt-1 opacity-80">Aim for at least 4.5:1. You can still save.</p>}
    </div>
  );
}

function FontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {FONTS.map((f) => (
          <option key={f.family} value={f.family}>
            {f.family} — {f.vibe}
          </option>
        ))}
      </select>
      <span className="truncate text-xl text-stone-800" style={{ fontFamily: `'${value}'` }}>
        The quick brown fox
      </span>
    </>
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
