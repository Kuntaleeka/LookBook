export const MOTIF_IDS = [
  "none",
  "bow",
  "heart",
  "star",
  "sparkle",
  "cross",
  "moon",
  "chain",
  "flower",
] as const;

export type MotifId = (typeof MOTIF_IDS)[number];
