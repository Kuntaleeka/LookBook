// Drawn bits for the Acubi page. Original doodles in the spirit of the inspo
// (manga stickers, the spiky sparkle on the cat poster, silver star clips).

/** Hollow five-point star, like the silver hair clips. */
export const STAR_CLIP_PATH =
  "M50.0 5.0L61.2 37.6L95.7 38.2L68.1 58.9L78.2 91.8L50.0 72.0L21.8 91.8L31.9 58.9L4.3 38.2L38.8 37.6Z " +
  "M50.0 23.0L56.8 43.7L78.5 43.7L60.9 56.6L67.6 77.3L50.0 64.5L32.4 77.3L39.1 56.6L21.5 43.7L43.2 43.7Z";

/** Spiky black sparkle, drawn a little uneven like a marker doodle. */
export function Starburst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path
        d="M47.7 9.1L52.0 43.0L80.3 12.4L57.0 46.4L76.5 45.5L60.6 51.2L89.2 76.4L55.7 56.0L64.8 94.2L49.4 57.3L33.3 92.9L44.8 57.2L10.3 77.7L41.9 51.3L6.4 38.4L42.5 44.9L20.2 15.8L46.6 42.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** A sleepy cat-face sticker with a plaster on its head (acubi = yawn). */
export function SleepyCat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden="true">
      <g stroke="#111" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
        {/* die-cut white sticker edge */}
        <path
          d="M14 30 20 6l24 16c10-3 22-3 32 0L100 6l6 24c8 9 10 20 7 31-5 18-26 29-53 29S12 79 7 61C4 50 6 39 14 30Z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="12"
        />
        <path
          d="M14 30 20 6l24 16c10-3 22-3 32 0L100 6l6 24c8 9 10 20 7 31-5 18-26 29-53 29S12 79 7 61C4 50 6 39 14 30Z"
          fill="#fff"
        />
        {/* closed, sleepy eyes */}
        <path d="M30 54c5 5 12 5 17 0M73 54c5 5 12 5 17 0" fill="none" />
        {/* little mouth */}
        <path d="M54 64c2 3 4 3 6 0 2 3 4 3 6 0" fill="none" strokeWidth="2.6" />
        {/* whiskers */}
        <path d="M4 58h14M5 66l13-3M102 58h14M102 63l13 3" fill="none" strokeWidth="2.4" />
        {/* plaster */}
        <g transform="rotate(-24 36 32)">
          <rect x="24" y="27" width="24" height="10" rx="4" fill="#fff" strokeWidth="2.4" />
          <path d="M33 30v4M39 30v4" strokeWidth="2" />
        </g>
      </g>
      {/* a tiny "z" */}
      <text x="94" y="30" fontSize="16" fontWeight="700" fill="#111" fontFamily="sans-serif">
        z
      </text>
    </svg>
  );
}

/** Small hollow star used as a bullet on the memo pad. */
export function StarBullet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <path d={STAR_CLIP_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
