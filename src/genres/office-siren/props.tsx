/*
 * Office Siren props, drawn in SVG: a red lipstick kiss print and a pair of
 * small oval "Bayonetta" glasses.
 */

/** A blotted lipstick print: ragged edges and fine lip creases. */
export function Kiss({ className, id }: { className?: string; id: string }) {
  return (
    <svg className={className} viewBox="0 0 200 124" aria-hidden="true">
      <defs>
        <filter id={`${id}-print`} x="-5%" y="-5%" width="110%" height="110%">
          {/* ragged, blotted edges */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="grain" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="5" result="edge" />
          {/* fine vertical creases: stretched noise, thresholded into thin gaps */}
          <feTurbulence type="fractalNoise" baseFrequency="0.55 0.03" numOctaves="2" seed="9" result="lines" />
          <feColorMatrix
            in="lines"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -7 0 0 0 5.2"
            result="creases"
          />
          <feComposite in="edge" in2="creases" operator="in" result="creased" />
          {/* uneven pressure: some patches print paler */}
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="2" result="press" />
          <feColorMatrix in="press" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.3 0.1" result="pressA" />
          <feComposite in="creased" in2="pressA" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-print)`} fill="currentColor">
        {/* upper lip, with the cupid's bow */}
        <path d="M8 62 C26 44 52 20 80 21 C91 22 96 30 100 35 C104 30 109 22 120 21 C148 20 174 44 192 62 C164 60 132 55 100 60 C68 55 36 60 8 62Z" />
        {/* lower lip */}
        <path d="M10 66 C40 70 70 67 100 69 C130 67 160 70 190 66 C172 94 140 114 100 114 C60 114 28 94 10 66Z" />
      </g>
    </svg>
  );
}

/** Small oval acetate frames, seen from the front. */
export function Glasses({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 120" aria-hidden="true">
      <defs>
        <linearGradient id="os-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="0.7" stopColor="#c3cfdc" stopOpacity="0.12" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="os-acetate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a3a3e" />
          <stop offset="0.45" stopColor="#0d0d0f" />
          <stop offset="1" stopColor="#1c1c20" />
        </linearGradient>
      </defs>
      {/* temples, folded back behind the frame */}
      <path d="M22 50 L4 44 M298 50 L316 44" stroke="#0d0d0f" strokeWidth="7" strokeLinecap="round" />
      {/* lenses */}
      <ellipse cx="88" cy="62" rx="66" ry="42" fill="url(#os-lens)" />
      <ellipse cx="232" cy="62" rx="66" ry="42" fill="url(#os-lens)" />
      {/* rims */}
      <ellipse cx="88" cy="62" rx="66" ry="42" fill="none" stroke="url(#os-acetate)" strokeWidth="11" />
      <ellipse cx="232" cy="62" rx="66" ry="42" fill="none" stroke="url(#os-acetate)" strokeWidth="11" />
      {/* bridge */}
      <path d="M150 52 C156 42 164 42 170 52" fill="none" stroke="#0d0d0f" strokeWidth="9" strokeLinecap="round" />
      {/* shine on the acetate and glass */}
      <path d="M40 40 C52 28 70 23 88 23" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M184 40 C196 28 214 23 232 23" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 50 L96 86 M72 44 L104 76" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" strokeLinecap="round" />
      <path d="M204 50 L240 86 M216 44 L248 76" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
