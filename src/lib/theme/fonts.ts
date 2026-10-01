/**
 * Google Fonts the app can load. `weights` lists what we request; fonts
 * that only ship one weight have a single entry.
 */
export type FontOption = {
  family: string;
  fallback: "serif" | "sans-serif" | "monospace" | "cursive";
  weights: number[];
  /** Also request italic styles. */
  italic?: boolean;
  vibe: string;
};

export const FONTS: FontOption[] = [
  // Serif / romantic
  { family: "Playfair Display", fallback: "serif", italic: true, weights: [400, 600, 700], vibe: "Elegant serif" },
  { family: "Cormorant Garamond", fallback: "serif", italic: true, weights: [400, 500, 600], vibe: "Delicate serif" },
  { family: "Bodoni Moda", fallback: "serif", italic: true, weights: [400, 600, 700], vibe: "Fashion-magazine serif" },
  { family: "DM Serif Display", fallback: "serif", weights: [400], vibe: "Bold display serif" },
  { family: "Lora", fallback: "serif", italic: true, weights: [400, 500, 600], vibe: "Soft book serif" },
  { family: "Libre Baskerville", fallback: "serif", italic: true, weights: [400, 700], vibe: "Classic serif" },
  { family: "Cinzel", fallback: "serif", weights: [400, 600], vibe: "Engraved Roman caps" },
  // Script / handwritten
  { family: "Pinyon Script", fallback: "cursive", weights: [400], vibe: "Romantic script" },
  { family: "Great Vibes", fallback: "cursive", weights: [400], vibe: "Flowing script" },
  { family: "Permanent Marker", fallback: "cursive", weights: [400], vibe: "Marker scrawl" },
  { family: "Rock Salt", fallback: "cursive", weights: [400], vibe: "Messy handwriting" },
  { family: "Caveat", fallback: "cursive", weights: [400, 600], vibe: "Handwritten" },
  // Dark / edgy
  { family: "UnifrakturMaguntia", fallback: "serif", weights: [400], vibe: "Blackletter" },
  { family: "Pirata One", fallback: "serif", weights: [400], vibe: "Gothic display" },
  { family: "Special Elite", fallback: "monospace", weights: [400], vibe: "Worn typewriter" },
  { family: "Rubik Dirt", fallback: "sans-serif", weights: [400], vibe: "Distressed" },
  { family: "New Rocker", fallback: "serif", weights: [400], vibe: "Gothic swash" },
  { family: "Metal Mania", fallback: "serif", weights: [400], vibe: "Spiky metal" },
  { family: "IM Fell English", fallback: "serif", italic: true, weights: [400], vibe: "Worn letterpress" },
  { family: "IM Fell Double Pica", fallback: "serif", italic: true, weights: [400], vibe: "Worn letterpress, heavy" },
  // Mono
  { family: "VT323", fallback: "monospace", weights: [400], vibe: "Pixel terminal" },
  { family: "IBM Plex Mono", fallback: "monospace", weights: [400, 500, 600], vibe: "Clean mono" },
  { family: "Space Mono", fallback: "monospace", weights: [400, 700], vibe: "Retro mono" },
  // Sans
  { family: "Inter", fallback: "sans-serif", weights: [400, 500, 600, 700], vibe: "Neutral sans" },
  { family: "Inter Tight", fallback: "sans-serif", italic: true, weights: [400, 500, 700, 800, 900], vibe: "Tight magazine sans" },
  { family: "DM Sans", fallback: "sans-serif", weights: [400, 500, 700], vibe: "Friendly sans" },
  { family: "Space Grotesk", fallback: "sans-serif", weights: [300, 400, 500, 700], vibe: "Techy sans" },
  { family: "Syne", fallback: "sans-serif", weights: [400, 600, 700], vibe: "Arty sans" },
  { family: "Archivo Narrow", fallback: "sans-serif", weights: [400, 600, 700], vibe: "Sharp condensed" },
  { family: "Oswald", fallback: "sans-serif", weights: [400, 500, 700], vibe: "Tall condensed" },
  { family: "Bebas Neue", fallback: "sans-serif", weights: [400], vibe: "Poster caps" },
  { family: "Nunito", fallback: "sans-serif", weights: [400, 600, 700], vibe: "Rounded sans" },
  // Japanese-capable
  { family: "Dela Gothic One", fallback: "sans-serif", weights: [400], vibe: "Heavy poster (JP)" },
  { family: "DotGothic16", fallback: "monospace", weights: [400], vibe: "Pixel LCD (JP)" },
  { family: "Zen Kaku Gothic New", fallback: "sans-serif", weights: [400, 500, 700], vibe: "Clean gothic (JP)" },
];

const BY_FAMILY = new Map(FONTS.map((f) => [f.family, f]));

export function isKnownFont(family: string) {
  return BY_FAMILY.has(family);
}

export function fontStack(family: string) {
  const font = BY_FAMILY.get(family);
  return `'${family}', ${font?.fallback ?? "sans-serif"}`;
}

/** One stylesheet URL for several families (Google Fonts css2 API). */
export function googleFontsHref(families: string[]) {
  const params = [...new Set(families)]
    .map((family) => BY_FAMILY.get(family))
    .filter((f): f is FontOption => Boolean(f))
    .map((f) => {
      const name = f.family.replace(/ /g, "+");
      if (f.italic) {
        const axes = [...f.weights.map((w) => `0,${w}`), ...f.weights.map((w) => `1,${w}`)];
        return `family=${name}:ital,wght@${axes.join(";")}`;
      }
      return f.weights.length > 1 ? `family=${name}:wght@${f.weights.join(";")}` : `family=${name}`;
    });
  if (!params.length) return null;
  return `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap`;
}
