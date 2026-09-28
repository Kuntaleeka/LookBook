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
  created_at: string;
  updated_at: string;
};
