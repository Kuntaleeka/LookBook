import { googleFontsHref } from "@/lib/theme/fonts";

/**
 * Loads the Google Fonts a theme needs. React hoists the <link> into <head>
 * and de-duplicates it, so it's safe to render once per themed section.
 */
export function ThemeFonts({ families }: { families: string[] }) {
  const href = googleFontsHref(families);
  if (!href) return null;
  return <link rel="stylesheet" href={href} precedence="fonts" />;
}
