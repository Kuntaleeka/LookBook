import type { MotifId } from "@/lib/theme/motif-ids";

export const MOTIF_LABELS: Record<MotifId, string> = {
  none: "None",
  bow: "Bow",
  heart: "Heart",
  star: "Star",
  sparkle: "Sparkle",
  cross: "Cross",
  moon: "Moon",
  chain: "Chain",
  flower: "Flower",
};

const SHAPES: Record<Exclude<MotifId, "none">, React.ReactNode> = {
  bow: (
    <>
      <path d="M12 12C9.5 8.5 5 6.5 3.5 8S3 14.5 6 14.5c2.2 0 4.3-1.2 6-2.5Z" />
      <path d="M12 12c2.5-3.5 7-5.5 8.5-4S21 14.5 18 14.5c-2.2 0-4.3-1.2-6-2.5Z" />
      <path d="M11 13.2 8.5 20M13 13.2l2.5 6.8" />
      <circle cx="12" cy="12" r="1.3" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" />,
  star: <path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6l-5.4 2.9 1.2-6-4.5-4.2 6.1-.7L12 3Z" />,
  sparkle: <path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7Z" />,
  cross: <path d="M12 3v18M6.5 8.5h11M10.5 3h3M10.5 21h3M6.5 7v3M17.5 7v3" />,
  moon: <path d="M19.5 14.5A7.8 7.8 0 1 1 9.5 4.5a6.3 6.3 0 0 0 10 10Z" />,
  chain: (
    <>
      <rect x="2.5" y="8.5" width="10" height="7" rx="3.5" />
      <rect x="11.5" y="8.5" width="10" height="7" rx="3.5" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="6.8" r="3" />
      <circle cx="17" cy="10.4" r="3" />
      <circle cx="15.1" cy="16.3" r="3" />
      <circle cx="8.9" cy="16.3" r="3" />
      <circle cx="7" cy="10.4" r="3" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
};

export function Motif({
  id,
  size = 20,
  className,
}: {
  id: MotifId;
  size?: number;
  className?: string;
}) {
  if (id === "none") return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {SHAPES[id]}
    </svg>
  );
}
