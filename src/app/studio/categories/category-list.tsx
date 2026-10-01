"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderCategories, setCategoryVisible } from "./actions";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  isVisible: boolean;
  outfitCount: number;
  parentName: string | null;
  /** Background colour of the category's hand-built page; null if it has no page yet. */
  pageColor: string | null;
  /** Its newest outfit photo, if it has any. */
  cover: string | null;
};

export function CategoryList({ initialRows }: { initialRows: CategoryRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Pick up fresh server data (e.g. after router.refresh()).
  const [lastInitial, setLastInitial] = useState(initialRows);
  if (initialRows !== lastInitial) {
    setLastInitial(initialRows);
    setRows(initialRows);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = rows.findIndex((r) => r.id === active.id);
    const to = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, from, to);
    const previous = rows;
    setRows(next);
    startTransition(async () => {
      const result = await reorderCategories(next.map((r) => r.id));
      if (result.error) {
        setRows(previous);
        setError(result.error);
      }
    });
  }

  function toggleVisible(id: string, isVisible: boolean) {
    setRows((all) => all.map((r) => (r.id === id ? { ...r, isVisible } : r)));
    startTransition(async () => {
      const result = await setCategoryVisible(id, isVisible);
      if (result.error) {
        setRows((all) => all.map((r) => (r.id === id ? { ...r, isVisible: !isVisible } : r)));
        setError(result.error);
      }
    });
  }

  return (
    <>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <SortableRow key={row.id} row={row} onToggleVisible={toggleVisible} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}

function SortableRow({
  row,
  onToggleVisible,
}: {
  row: CategoryRow;
  onToggleVisible: (id: string, isVisible: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-stretch overflow-hidden rounded-xl bg-white ring-1 ring-stone-200 ${
        isDragging ? "relative z-10 shadow-lg" : ""
      }`}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${row.name}`}
        className="flex w-9 shrink-0 cursor-grab touch-none items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 active:cursor-grabbing"
      >
        <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" aria-hidden="true">
          {[3, 9, 15].flatMap((y) => [<circle key={`a${y}`} cx="3" cy={y} r="1.5" />, <circle key={`b${y}`} cx="9" cy={y} r="1.5" />])}
        </svg>
      </button>

      {/* The real page's colour, with the newest outfit photo over it. */}
      <Link
        href={`/studio/categories/${row.id}`}
        style={{ background: row.pageColor ?? "#e7e5e4" }}
        className="relative flex w-28 shrink-0 items-end sm:w-40"
        aria-hidden="true"
        tabIndex={-1}
      >
        {row.cover && (
          // eslint-disable-next-line @next/next/no-img-element -- already sized on upload
          <img src={row.cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        )}
        {!row.pageColor && (
          <span className="relative m-1.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
            no page yet
          </span>
        )}
      </Link>

      <Link href={`/studio/categories/${row.id}`} className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3 hover:bg-stone-50">
        <span className="truncate font-medium text-stone-900">{row.name}</span>
        <span className="truncate text-xs text-stone-500">
          /{row.slug}
          {row.parentName && ` · under ${row.parentName}`} · {row.outfitCount}{" "}
          {row.outfitCount === 1 ? "outfit" : "outfits"}
        </span>
      </Link>

      <label className="flex shrink-0 cursor-pointer items-center gap-2 px-4 text-xs text-stone-600">
        <input
          type="checkbox"
          checked={row.isVisible}
          onChange={(e) => onToggleVisible(row.id, e.target.checked)}
          className="h-4 w-4 accent-stone-900"
        />
        <span className="hidden sm:inline">{row.isVisible ? "Visible" : "Hidden"}</span>
      </label>
    </li>
  );
}
