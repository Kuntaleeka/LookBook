/*
 * Winter / fall props: the still life (photo + drawn earphones + steam).
 */
import s from "./winter-fall.module.css";

/**
 * The still life: a real photo of a mug on a stack of books in fallen leaves,
 * printed with a white border. A pair of wired earphones is drawn over it,
 * one bud resting on the top book and one hanging off the side, the cable
 * trailing into the leaves, and steam curls up out of the mug.
 * The print shows the lower two-thirds of the photo; overlay coordinates
 * below are in that square (0–1000).
 */
export function StillLife({ className, caption }: { className?: string; caption: string }) {
  return (
    <figure className={className}>
      <div className={s.stillPhoto}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
        <img src="/genres/winter-fall/books-leaves.jpg" alt="A mug on a stack of books in fallen autumn leaves" />

        <svg className={s.stillSteam} viewBox="0 0 120 160" aria-hidden="true">
          {[34, 60, 86].map((x, i) => (
            <path
              key={x}
              d={`M${x} 158 C${x - 14} 132 ${x + 16} 110 ${x} 84 S${x + 14} 30 ${x} 4`}
              style={{ animationDelay: `${i * 1.15}s` }}
            />
          ))}
        </svg>

        <svg className={s.earphones} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <radialGradient id="wf-bud" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.55" stopColor="#ecebe8" />
              <stop offset="1" stopColor="#a9a7a2" />
            </radialGradient>
            <filter id="wf-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>
          {/* soft contact shadows */}
          <g fill="#140c06" opacity=".5" filter="url(#wf-shadow)">
            <ellipse cx="712" cy="596" rx="22" ry="7" />
            <path d="M712 590 C735 600 750 620 772 648 C790 676 793 702 808 722" stroke="#140c06" strokeWidth="7" fill="none" />
            <path d="M776 652 C800 720 838 800 868 880 C888 935 905 975 925 1010" stroke="#140c06" strokeWidth="7" fill="none" transform="translate(6 6)" />
          </g>
          {/* cables: a darker underside, then the white cord */}
          <g fill="none" strokeLinecap="round">
            <path id="wf-cord-a" d="M716 584 C738 594 752 616 772 646" stroke="#8f8c86" strokeWidth="5.4" />
            <path d="M800 704 C792 684 786 664 772 646" stroke="#8f8c86" strokeWidth="5.4" />
            <path d="M772 646 C798 716 836 798 866 878 C886 932 904 972 924 1010" stroke="#8f8c86" strokeWidth="5.4" />
            <path d="M716 584 C738 594 752 616 772 646" stroke="#f4f3f0" strokeWidth="3.4" />
            <path d="M800 704 C792 684 786 664 772 646" stroke="#f4f3f0" strokeWidth="3.4" />
            <path d="M772 646 C798 716 836 798 866 878 C886 932 904 972 924 1010" stroke="#f4f3f0" strokeWidth="3.4" />
          </g>
          {/* the splitter where the two cords join */}
          <rect x="766" y="638" width="12" height="18" rx="5" fill="url(#wf-bud)" transform="rotate(-20 772 647)" />
          {/* bud resting on the top book */}
          <g transform="rotate(-18 708 580)">
            <rect x="700" y="582" width="14" height="22" rx="6" fill="url(#wf-bud)" transform="rotate(-70 707 590)" />
            <ellipse cx="704" cy="578" rx="21" ry="16" fill="url(#wf-bud)" />
            <ellipse cx="699" cy="574" rx="7" ry="5" fill="#3a3a3c" opacity=".55" />
          </g>
          {/* bud hanging off the side of the stack */}
          <g transform="rotate(12 802 718)">
            <rect x="796" y="694" width="12" height="20" rx="5" fill="url(#wf-bud)" />
            <ellipse cx="802" cy="722" rx="19" ry="16" fill="url(#wf-bud)" />
            <ellipse cx="806" cy="726" rx="6" ry="4.5" fill="#3a3a3c" opacity=".5" />
          </g>
        </svg>
      </div>
      <figcaption className={s.stillCaption}>{caption}</figcaption>
    </figure>
  );
}
