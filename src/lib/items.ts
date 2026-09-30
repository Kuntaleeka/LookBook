// Item tags on outfit photos. Safe to import from client components.

export type ItemSource = "shop" | "instagram" | "local" | "unknown";

/** Row shape of public.items. */
export type ItemRow = {
  id: string;
  outfit_id: string;
  name: string;
  pin_x: number;
  pin_y: number;
  source: ItemSource;
  shop_url: string | null;
  ig_handle: string | null;
  place: string | null;
  sort_order: number;
  created_at: string;
};

/** What the public pages get: position, name and a ready-made link. */
export type LookbookItem = {
  id: string;
  name: string;
  x: number;
  y: number;
  source: ItemSource;
  href: string | null;
  linkLabel: string | null;
};

export const SOURCE_LABELS: Record<ItemSource, string> = {
  shop: "Online shop / app",
  instagram: "Instagram (thrift or small shop)",
  local: "Local store",
  unknown: "Don't know / not saying",
};

export function toLookbookItem(row: ItemRow): LookbookItem {
  const { href, label } = itemLink(row);
  return {
    id: row.id,
    name: row.name.trim() || "Untitled piece",
    x: row.pin_x,
    y: row.pin_y,
    source: row.source,
    href,
    linkLabel: label,
  };
}

export function itemLink(row: Pick<ItemRow, "source" | "shop_url" | "ig_handle" | "place">): {
  href: string | null;
  label: string | null;
} {
  switch (row.source) {
    case "shop": {
      if (!row.shop_url) return { href: null, label: null };
      let host = row.shop_url;
      try {
        host = new URL(row.shop_url).hostname.replace(/^www\./, "");
      } catch {}
      return { href: row.shop_url, label: host };
    }
    case "instagram":
      return row.ig_handle
        ? { href: `https://www.instagram.com/${row.ig_handle}/`, label: `@${row.ig_handle}` }
        : { href: null, label: null };
    case "local":
      return row.place
        ? {
            href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.place)}`,
            label: row.place,
          }
        : { href: null, label: null };
    default:
      return { href: null, label: null };
  }
}

/** Accepts "@handle", "handle" or an instagram.com URL; returns the bare handle or null. */
export function normalizeHandle(input: string): string | null {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/instagram\.com\/([A-Za-z0-9._]{1,30})/i);
  const handle = (fromUrl ? fromUrl[1] : trimmed).replace(/^@/, "");
  return /^[A-Za-z0-9._]{1,30}$/.test(handle) ? handle : null;
}
