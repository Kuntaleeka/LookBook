import type { ComponentType } from "react";
import type { LookbookCategory, LookbookOutfit } from "@/lib/lookbook";

export type GenrePageProps = {
  category: LookbookCategory;
  outfits: LookbookOutfit[];
};

export type GenreDesign = {
  id: string;
  label: string;
  /** Google Fonts this design uses (must exist in lib/theme/fonts.ts). */
  fonts: string[];
  /** Page background, so the browser chrome and overscroll match. */
  background: string;
  Page: ComponentType<GenrePageProps>;
};
