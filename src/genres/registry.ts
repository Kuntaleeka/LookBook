import { AcubiPage } from "./acubi/page";
import { CoquettePage } from "./coquette/page";
import { GothPage } from "./goth/page";
import { GrungePage } from "./grunge/page";
import { OfficeSirenPage } from "./office-siren/page";
import type { GenreDesign } from "./types";

// Keyed by category slug for now. A later migration adds a per-category
// "design" setting so a renamed or new category can reuse one of these.
export const GENRE_DESIGNS: Record<string, GenreDesign> = {
  coquette: {
    id: "coquette",
    label: "Soft / Coquette",
    fonts: ["Playfair Display", "Pinyon Script", "Lora"],
    background: "#fff4f6",
    Page: CoquettePage,
  },
  grunge: {
    id: "grunge",
    label: "Grunge",
    fonts: ["Metal Mania", "IM Fell English", "IM Fell Double Pica", "Rock Salt", "VT323", "Special Elite", "IBM Plex Mono"],
    background: "#0a0909",
    Page: GrungePage,
  },
  goth: {
    id: "goth",
    label: "Goth",
    fonts: ["Pinyon Script", "Cormorant Garamond", "Cinzel"],
    background: "#0b0809",
    Page: GothPage,
  },
  acubi: {
    id: "acubi",
    label: "Acubi",
    fonts: ["Dela Gothic One", "DotGothic16", "Zen Kaku Gothic New"],
    background: "#f2f2f0",
    Page: AcubiPage,
  },
  "office-siren": {
    id: "office-siren",
    label: "Office Siren",
    fonts: ["Bodoni Moda", "Inter"],
    background: "#f4f1ee",
    Page: OfficeSirenPage,
  },
};

export function getDesign(slug: string): GenreDesign | null {
  return GENRE_DESIGNS[slug] ?? null;
}
