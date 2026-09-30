import type { Theme } from "./theme";

export type CategoryPreset = {
  name: string;
  slug: string;
  description: string;
  keywords: string[];
  theme: Theme;
};

// Keep in sync with the seed in supabase/migrations/0002_phase2_categories.sql.
export const PRESETS: CategoryPreset[] = [
  {
    name: "Soft / Coquette",
    slug: "coquette",
    description: "Hyper-feminine and romantic: bows, lace, ribbons, pearls and ballet flats in blush and cream.",
    keywords: ["bows", "lace", "ribbons", "pearls", "ballet flats", "pastel pink", "frills", "mary janes"],
    theme: {
      bg: "#fff4f6", surface: "#ffffff", fg: "#5b2b3a", mutedFg: "#8a5a69",
      accent: "#f2b8c6", accentFg: "#5b2b3a",
      fontDisplay: "Playfair Display", fontBody: "Lora", radius: 24, motif: "bow",
    },
  },
  {
    name: "Grunge",
    slug: "grunge",
    description: "Lived-in and undone: flannel, ripped denim, band tees, combat boots and faded layers.",
    keywords: ["flannel", "ripped denim", "band tee", "combat boots", "layering", "distressed", "beanie"],
    theme: {
      bg: "#2b2a26", surface: "#3a3832", fg: "#ece6d4", mutedFg: "#b3ab94",
      accent: "#d0764a", accentFg: "#1c1a17",
      fontDisplay: "Special Elite", fontBody: "IBM Plex Mono", radius: 2, motif: "star",
    },
  },
  {
    name: "Goth",
    slug: "goth",
    description: "Dark and dramatic: black lace, velvet, corsets, silver jewelry and platform boots.",
    keywords: ["black lace", "velvet", "corset", "silver jewelry", "platforms", "fishnets", "oxblood"],
    theme: {
      bg: "#0e0b0d", surface: "#1a1417", fg: "#ede6ea", mutedFg: "#a3959c",
      accent: "#8b1e3f", accentFg: "#f5edf0",
      fontDisplay: "UnifrakturMaguntia", fontBody: "Cormorant Garamond", radius: 0, motif: "cross",
    },
  },
  {
    name: "Acubi",
    slug: "acubi",
    description: "Korean minimal with an edge: washed greys, layered tanks, cargo skirts and subtle tech details.",
    keywords: ["washed grey", "layered tanks", "cargo", "mesh", "minimal", "silver", "shrug", "ice blue"],
    theme: {
      bg: "#eef0f2", surface: "#f8f9fa", fg: "#2e3338", mutedFg: "#5f6770",
      accent: "#9db4c8", accentFg: "#1f2a33",
      fontDisplay: "Space Grotesk", fontBody: "Inter", radius: 6, motif: "sparkle",
    },
  },
  {
    name: "Office Siren",
    slug: "office-siren",
    description: "Sharp and seductive corporate: pencil skirts, fitted blazers, kitten heels and rimless glasses.",
    keywords: ["pencil skirt", "fitted blazer", "kitten heels", "rimless glasses", "burgundy", "sleek bun", "pinstripe"],
    theme: {
      bg: "#f4f1ee", surface: "#ffffff", fg: "#1a1a1d", mutedFg: "#5e575b",
      accent: "#6e1423", accentFg: "#ffffff",
      fontDisplay: "Bodoni Moda", fontBody: "Inter", radius: 4, motif: "none",
    },
  },
];
