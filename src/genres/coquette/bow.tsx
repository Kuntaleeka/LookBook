/** A filled satin bow. Color comes from `currentColor`. */
export function Bow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 44" className={className} aria-hidden="true">
      <g fill="currentColor">
        <path d="M31 17C24 7 11 1 5 4S1 22 10 24c7 1.6 15-2 21-5Z" />
        <path d="M33 17c7-10 20-16 26-13s4 18-5 20c-7 1.6-15-2-21-5Z" />
        <path d="M29 21 21 41l6-2 3 4 2-20Z" />
        <path d="M35 21l8 20-6-2-3 4-2-20Z" />
      </g>
      <g fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round">
        <path d="M27 15C21 9 13 6 9 7" />
        <path d="M37 15c6-6 14-9 18-8" />
      </g>
      <ellipse cx="32" cy="18.5" rx="5" ry="5.5" fill="currentColor" />
      <ellipse cx="32" cy="18.5" rx="5" ry="5.5" fill="#000" fillOpacity=".1" />
    </svg>
  );
}
