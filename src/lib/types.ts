export type OutfitStatus = "inbox" | "sorted" | "archived";

export type Outfit = {
  id: string;
  image_path: string;
  image_width: number | null;
  image_height: number | null;
  title: string | null;
  notes: string | null;
  status: OutfitStatus;
  is_published: boolean;
  primary_category_id: string | null;
  created_at: string;
  updated_at: string;
};

/** An extra photo of the same outfit (another angle, a detail). */
export type OutfitPhoto = {
  id: string;
  outfit_id: string;
  image_path: string;
  image_width: number | null;
  image_height: number | null;
  sort_order: number;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  keywords: string[];
  theme: unknown; // parse with parseTheme()
  moodboard_urls: string[];
  parent_id: string | null;
  cover_outfit_id: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};
