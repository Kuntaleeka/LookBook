"use client";

import { useState, useTransition } from "react";
import { SOURCE_LABELS, itemLink, type ItemRow, type ItemSource } from "@/lib/items";
import { addItem, deleteItem, moveItem, saveItem } from "./actions";

const WHERE: Record<ItemSource, { label: string; placeholder: string } | null> = {
  shop: { label: "Link to the product or shop", placeholder: "https://www.zara.com/… or an app link" },
  instagram: { label: "Instagram handle", placeholder: "@thriftshop or instagram.com/thriftshop" },
  local: { label: "Store name and area", placeholder: "e.g. Sarojini Nagar Market, Delhi" },
  unknown: null,
};

function whereValue(item: Pick<ItemRow, "source" | "shop_url" | "ig_handle" | "place">) {
  if (item.source === "shop") return item.shop_url ?? "";
  if (item.source === "instagram") return item.ig_handle ? `@${item.ig_handle}` : "";
  if (item.source === "local") return item.place ?? "";
  return "";
}

/** A piece already tagged on another outfit, offered for reuse. */
export type SavedPiece = {
  key: string;
  name: string;
  source: ItemSource;
  where: string;
  /** Genre of the outfit it was tagged on, if sorted. */
  genre: string | null;
};

export function TagEditor({
  outfitId,
  imageUrl,
  initialItems,
  library,
}: {
  outfitId: string;
  imageUrl: string;
  initialItems: ItemRow[];
  library: SavedPiece[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selected, setSelected] = useState<string | null>(initialItems[0]?.id ?? null);
  const [moving, setMoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPhotoClick(e: React.MouseEvent<HTMLDivElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width));
    const y = Math.min(1, Math.max(0, (e.clientY - box.top) / box.height));
    setError(null);

    if (moving) {
      const id = moving;
      setMoving(null);
      setItems((all) => all.map((i) => (i.id === id ? { ...i, pin_x: x, pin_y: y } : i)));
      startTransition(async () => {
        const result = await moveItem(id, outfitId, x, y);
        if (result.error) setError(result.error);
      });
      return;
    }

    startTransition(async () => {
      const result = await addItem(outfitId, x, y);
      if (result.error || !result.item) {
        setError(result.error ?? "Couldn't add the pin.");
        return;
      }
      setItems((all) => [...all, result.item!]);
      setSelected(result.item.id);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-sm text-stone-600">
          {moving
            ? "Click where this item should go."
            : "Click on a piece of clothing to drop a pin on it."}
        </p>
        <div
          onClick={onPhotoClick}
          className={`relative mx-auto w-fit overflow-hidden rounded-xl ring-1 ring-stone-200 ${
            moving ? "cursor-move ring-2 ring-amber-400" : "cursor-crosshair"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- already sized on upload */}
          <img src={imageUrl} alt="Outfit" className="block max-h-[75dvh] w-auto max-w-full select-none" draggable={false} />
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(item.id);
              }}
              aria-label={`Item ${i + 1}: ${item.name || "untitled"}`}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold shadow-md ring-2 transition ${
                selected === item.id
                  ? "scale-110 bg-stone-900 text-white ring-white"
                  : "bg-white text-stone-900 ring-stone-900/60"
              } ${moving === item.id ? "animate-pulse" : ""}`}
              style={{ left: `${item.pin_x * 100}%`, top: `${item.pin_y * 100}%` }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">
          Items {items.length > 0 && <span className="font-normal text-stone-500">({items.length})</span>}
        </h2>
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
            No items yet. Click the photo to add the first one.
          </p>
        )}
        {items.map((item, i) => (
          <ItemForm
            key={item.id}
            n={i + 1}
            item={item}
            outfitId={outfitId}
            library={library}
            open={selected === item.id}
            moving={moving === item.id}
            busy={pending}
            onOpen={() => setSelected(item.id)}
            onMove={() => setMoving(moving === item.id ? null : item.id)}
            onSaved={(next) => setItems((all) => all.map((x) => (x.id === next.id ? next : x)))}
            onDeleted={() => {
              setItems((all) => all.filter((x) => x.id !== item.id));
              if (selected === item.id) setSelected(null);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ItemForm({
  n,
  item,
  outfitId,
  library,
  open,
  moving,
  busy,
  onOpen,
  onMove,
  onSaved,
  onDeleted,
}: {
  n: number;
  item: ItemRow;
  outfitId: string;
  library: SavedPiece[];
  open: boolean;
  moving: boolean;
  busy: boolean;
  onOpen: () => void;
  onMove: () => void;
  onSaved: (item: ItemRow) => void;
  onDeleted: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [source, setSource] = useState<ItemSource>(item.source);
  const [where, setWhere] = useState(whereValue(item));
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  /**
   * The dropdown under the name box:
   * - "choose": two options, type a new item or reuse one (empty box)
   * - "all":    every saved piece, to pick from
   * - "closed": nothing (e.g. after choosing "type a new item")
   * Whatever the panel, typing shows saved pieces that match.
   */
  const [panel, setPanel] = useState<"closed" | "choose" | "all">(
    !item.name && library.length > 0 ? "choose" : "closed",
  );
  const [pending, startTransition] = useTransition();
  const link = itemLink(item);

  const query = name.trim().toLowerCase();
  const matches = query
    ? library
        .filter((p) => p.name.toLowerCase().includes(query))
        .filter((p) => !(p.name === name.trim() && p.source === source && p.where === where.trim()))
        .slice(0, 8)
    : [];

  function save(fields: { name: string; source: ItemSource; where: string }, okText = "Saved") {
    setStatus(null);
    startTransition(async () => {
      const result = await saveItem(item.id, outfitId, fields);
      if (result.error) {
        setStatus({ ok: false, text: result.error });
        return;
      }
      const trimmed = fields.where.trim();
      onSaved({
        ...item,
        name: fields.name.trim(),
        source: fields.source,
        shop_url:
          fields.source === "shop" && trimmed ? (/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`) : null,
        ig_handle:
          fields.source === "instagram" && trimmed
            ? trimmed.replace(/^.*instagram\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "")
            : null,
        place: fields.source === "local" && trimmed ? trimmed : null,
      });
      setStatus({ ok: true, text: okText });
    });
  }

  function reuse(piece: SavedPiece) {
    setName(piece.name);
    setSource(piece.source);
    setWhere(piece.where);
    setPanel("closed");
    save(
      { name: piece.name, source: piece.source, where: piece.where },
      `Filled in from ${piece.genre ? `your ${piece.genre} outfit` : "a saved piece"} and saved`,
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-left ring-1 ring-stone-200 hover:ring-stone-400"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold">{n}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{item.name || "Untitled piece"}</span>
          <span className="block truncate text-xs text-stone-500">{link.label ?? "No source yet"}</span>
        </span>
      </button>
    );
  }

  const whereField = WHERE[source];

  return (
    <form
      className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-2 ring-stone-900"
      onSubmit={(e) => {
        e.preventDefault();
        save({ name, source, where });
      }}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">{n}</span>
        <span className="text-sm font-medium">Item {n}</span>
      </div>

      <div className="relative flex flex-col gap-1 text-xs text-stone-600">
        <label htmlFor={`name-${item.id}`}>What is it?</label>
        <input
          id={`name-${item.id}`}
          value={name}
          maxLength={80}
          autoFocus={!item.name}
          autoComplete="off"
          placeholder="e.g. Black studded belt"
          onChange={(e) => {
            setName(e.target.value);
            // Cleared the box: offer the two options again.
            if (!e.target.value.trim() && library.length > 0) setPanel("choose");
          }}
          onFocus={() => {
            if (!name.trim() && library.length > 0) setPanel("choose");
          }}
          onBlur={() => setPanel("closed")}
          onKeyDown={(e) => {
            if (e.key === "Escape") setPanel("closed");
          }}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900"
        />

        {/* typing: saved pieces whose name matches */}
        {query && matches.length > 0 && (
          <Dropdown label="Already tagged on another outfit:">
            <PieceList pieces={matches} onPick={reuse} />
          </Dropdown>
        )}

        {/* empty box: the two options */}
        {!query && panel === "choose" && (
          <Dropdown>
            <ul>
              <li>
                <MenuButton onPick={() => setPanel("closed")}>
                  <span className="font-medium text-stone-900">✎ Type a new item</span>
                  <span className="text-[11px] text-stone-500">Name it and add where it&apos;s from</span>
                </MenuButton>
              </li>
              <li className="border-t border-stone-100">
                <MenuButton onPick={() => setPanel("all")}>
                  <span className="font-medium text-stone-900">↺ Reuse an item ›</span>
                  <span className="text-[11px] text-stone-500">
                    Pick from {library.length} {library.length === 1 ? "piece" : "pieces"} you&apos;ve tagged before
                  </span>
                </MenuButton>
              </li>
            </ul>
          </Dropdown>
        )}

        {/* "reuse an item": everything saved */}
        {!query && panel === "all" && (
          <Dropdown
            label={
              <span className="flex items-center justify-between gap-2">
                <span>All saved pieces ({library.length})</span>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setPanel("choose");
                  }}
                  className="rounded px-1.5 py-0.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                >
                  ‹ back
                </button>
              </span>
            }
          >
            <div className="max-h-72 overflow-y-auto">
              <PieceList pieces={library} onPick={reuse} />
            </div>
          </Dropdown>
        )}
      </div>

      <label className="flex flex-col gap-1 text-xs text-stone-600">
        Where is it from?
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as ItemSource)}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900"
        >
          {(Object.keys(SOURCE_LABELS) as ItemSource[]).map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {whereField && (
        <label className="flex flex-col gap-1 text-xs text-stone-600">
          {whereField.label}
          <input
            value={where}
            placeholder={whereField.placeholder}
            onChange={(e) => setWhere(e.target.value)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none focus:border-stone-900"
          />
          {source === "local" && (
            <span className="text-stone-500">Visitors get a Google Maps link that searches for this.</span>
          )}
        </label>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pending || busy}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onMove}
          className={`rounded-lg border px-3 py-2 text-sm ${
            moving ? "border-amber-400 bg-amber-50" : "border-stone-300 hover:border-stone-500"
          }`}
        >
          {moving ? "Cancel move" : "Move pin"}
        </button>
        <button
          type="button"
          disabled={pending || busy}
          onClick={() => {
            if (!confirm(`Remove item ${n}?`)) return;
            startTransition(async () => {
              const result = await deleteItem(item.id, outfitId);
              if (result.error) setStatus({ ok: false, text: result.error });
              else onDeleted();
            });
          }}
          className="ml-auto rounded-lg px-3 py-2 text-sm text-stone-500 hover:bg-red-50 hover:text-red-700"
        >
          Remove
        </button>
      </div>
      {status && (
        <p role={status.ok ? "status" : "alert"} className={`text-xs ${status.ok ? "text-emerald-700" : "text-red-700"}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}

// ─── Dropdown pieces for the name box ───────────────────────────────────────

function Dropdown({ label, children }: { label?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="absolute top-full right-0 left-0 z-20 mt-1 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-stone-200">
      {label && <div className="border-b border-stone-100 px-3 py-1.5 text-[11px] text-stone-500">{label}</div>}
      {children}
    </div>
  );
}

/** Uses mousedown so it fires before the name box's blur closes the dropdown. */
function MenuButton({ onPick, children }: { onPick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onPick();
      }}
      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-stone-50"
    >
      {children}
    </button>
  );
}

function PieceList({ pieces, onPick }: { pieces: SavedPiece[]; onPick: (piece: SavedPiece) => void }) {
  return (
    <ul>
      {pieces.map((p) => {
        const detail = itemLink({
          source: p.source,
          shop_url: p.source === "shop" ? p.where : null,
          ig_handle: p.source === "instagram" ? p.where.replace(/^@/, "") : null,
          place: p.source === "local" ? p.where : null,
        }).label;
        return (
          <li key={p.key}>
            <MenuButton onPick={() => onPick(p)}>
              <span className="font-medium text-stone-900">{p.name}</span>
              <span className="text-[11px] text-stone-500">
                {detail ?? "source unknown"}
                {p.genre && ` · from ${p.genre}`}
              </span>
            </MenuButton>
          </li>
        );
      })}
    </ul>
  );
}
