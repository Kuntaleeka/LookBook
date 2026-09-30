import type { Theme } from "@/lib/theme/theme";
import { themeStyle } from "@/lib/theme/theme";
import { Motif } from "./motif";
import { ThemeFonts } from "./theme-fonts";

/**
 * A miniature category page, rendered with the given theme. Used by the
 * theme editor (live preview) and the category list (thumbnails).
 */
export function ThemePreview({
  theme,
  name,
  description,
  keywords,
  images = [],
  compact = false,
}: {
  theme: Theme;
  name: string;
  description?: string | null;
  keywords?: string[];
  images?: string[];
  compact?: boolean;
}) {
  const cards = [0, 1, 2].slice(0, compact ? 2 : 3);

  return (
    <div
      style={themeStyle(theme)}
      className="overflow-hidden bg-[var(--bg)] text-[var(--fg)] transition-colors duration-500 [font-family:var(--font-body)]"
    >
      <ThemeFonts families={[theme.fontDisplay, theme.fontBody]} />
      <div className={compact ? "p-4" : "p-6 sm:p-8"}>
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <Motif id={theme.motif} size={compact ? 16 : 22} />
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-fg)]">Aesthetic</p>
        </div>
        <h2
          className={`mt-1 leading-tight break-words [font-family:var(--font-display)] ${
            compact ? "text-2xl" : "text-4xl sm:text-5xl"
          }`}
        >
          {name || "Untitled"}
        </h2>

        {!compact && description && (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--muted-fg)]">{description}</p>
        )}

        {!compact && keywords && keywords.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {keywords.slice(0, 8).map((k) => (
              <li
                key={k}
                className="rounded-[var(--radius)] border border-[var(--muted-fg)]/40 px-2.5 py-1 text-xs text-[var(--muted-fg)]"
              >
                {k}
              </li>
            ))}
          </ul>
        )}

        <div className={`grid gap-3 ${compact ? "mt-3 grid-cols-2" : "mt-6 grid-cols-3"}`}>
          {cards.map((i) => (
            <figure
              key={i}
              className="overflow-hidden rounded-[var(--radius)] bg-[var(--surface)] shadow-sm ring-1 ring-black/5"
            >
              <div className="aspect-[3/4] bg-[var(--fg)]/10">
                {images[i] && (
                  // eslint-disable-next-line @next/next/no-img-element -- small preview thumbnail
                  <img src={images[i]} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              {!compact && (
                <figcaption className="px-2.5 py-2">
                  <p className="truncate text-xs font-medium">Outfit {i + 1}</p>
                  <p className="truncate text-[11px] text-[var(--muted-fg)]">3 items tagged</p>
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {!compact && (
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-[var(--radius)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)]">
              Shop the look
            </span>
            <span className="text-sm underline decoration-[var(--accent)] decoration-2 underline-offset-4">View all fits</span>
            {theme.motif !== "none" && (
              <span className="ml-auto flex gap-2 text-[var(--accent)] opacity-70">
                <Motif id={theme.motif} size={14} />
                <Motif id={theme.motif} size={14} />
                <Motif id={theme.motif} size={14} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
