import { z } from "zod";
import type { CSSProperties } from "react";
import { fontStack, isKnownFont } from "./fonts";
import { MOTIF_IDS } from "./motif-ids";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color like #1a2b3c");

export const themeSchema = z.object({
  bg: hex, //         page background
  surface: hex, //    cards
  fg: hex, //         main text
  mutedFg: hex, //    secondary text
  accent: hex, //     buttons, links, chips
  accentFg: hex, //   text on accent
  fontDisplay: z.string().refine(isKnownFont, "Unknown font"),
  fontBody: z.string().refine(isKnownFont, "Unknown font"),
  radius: z.number().int().min(0).max(32),
  motif: z.enum(MOTIF_IDS),
});

export type Theme = z.infer<typeof themeSchema>;

export const DEFAULT_THEME: Theme = {
  bg: "#faf8f5",
  surface: "#ffffff",
  fg: "#1c1917",
  mutedFg: "#6b6560",
  accent: "#1c1917",
  accentFg: "#ffffff",
  fontDisplay: "Playfair Display",
  fontBody: "Inter",
  radius: 12,
  motif: "none",
};

/** Accepts whatever is stored in the DB and fills gaps with defaults. */
export function parseTheme(value: unknown): Theme {
  const merged = { ...DEFAULT_THEME, ...(typeof value === "object" && value ? value : {}) };
  const result = themeSchema.safeParse(merged);
  return result.success ? result.data : DEFAULT_THEME;
}

/** CSS variables for a themed subtree: `<div style={themeStyle(theme)}>`. */
export function themeStyle(theme: Theme): CSSProperties {
  return {
    "--bg": theme.bg,
    "--surface": theme.surface,
    "--fg": theme.fg,
    "--muted-fg": theme.mutedFg,
    "--accent": theme.accent,
    "--accent-fg": theme.accentFg,
    "--radius": `${theme.radius}px`,
    "--font-display": fontStack(theme.fontDisplay),
    "--font-body": fontStack(theme.fontBody),
  } as CSSProperties;
}
