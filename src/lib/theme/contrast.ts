// WCAG 2.x contrast ratio between two hex colors.

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastCheck = { label: string; ratio: number; min: number; ok: boolean };

export function checkThemeContrast(t: {
  bg: string;
  surface: string;
  fg: string;
  mutedFg: string;
  accent: string;
  accentFg: string;
}): ContrastCheck[] {
  const pairs: [string, string, string, number][] = [
    ["Text on background", t.fg, t.bg, 4.5],
    ["Text on cards", t.fg, t.surface, 4.5],
    ["Secondary text on background", t.mutedFg, t.bg, 4.5],
    ["Button text on accent", t.accentFg, t.accent, 4.5],
  ];
  return pairs.map(([label, a, b, min]) => {
    const ratio = contrastRatio(a, b);
    return { label, ratio, min, ok: ratio >= min };
  });
}
