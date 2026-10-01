"use client";

import { useEffect, useRef, useState } from "react";
import s from "./y2k.module.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

type Pic = { url: string; title: string };

/**
 * A rhinestoned flip phone. It flips open by itself when the page loads; tap
 * it to snap it shut, tap again to open it. Every time it opens, a different
 * fit (picked at random) is on the screen.
 */
export function FlipPhone({ className, name, pics }: { className?: string; name: string; pics: Pic[] }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<number | null>(null);
  const last = useRef<number | null>(null);

  /** A random fit, never the same one twice in a row. */
  function nextPic() {
    if (!pics.length) return null;
    let i = Math.floor(Math.random() * pics.length);
    if (pics.length > 1 && i === last.current) i = (i + 1) % pics.length;
    last.current = i;
    return i;
  }

  function flipOpen() {
    setShown(nextPic());
    setOpen(true);
  }

  // flips open on its own shortly after the page loads
  useEffect(() => {
    const timer = setTimeout(flipOpen, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  const pic = shown === null ? null : pics[shown];

  return (
    <button
      type="button"
      className={`${className ?? ""} ${s.phone} ${open ? s.phoneOpen : ""}`}
      onClick={() => (open ? setOpen(false) : flipOpen())}
      aria-label={open ? "Close the flip phone" : "Open the flip phone to see a random fit"}
      aria-pressed={open}
    >
      <span className={s.lid}>
        <span className={s.lidInside}>
          <span className={s.screen}>
            <span className={s.screenBar}>▂▄▆ &nbsp; ✉ &nbsp; ▮▮▮</span>
            {pic ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- sized on upload */}
                <img key={pic.url} src={pic.url} alt="" className={s.screenPic} />
                <span className={s.screenCaption}>{pic.title}</span>
              </>
            ) : (
              <>
                <span className={s.screenText}>*...{name.toLowerCase()} &lt;3</span>
                <span className={s.screenSub}>no new pics</span>
              </>
            )}
          </span>
        </span>
        <span className={s.lidOutside}>
          <span className={s.outerDisplay}>1:35</span>
        </span>
      </span>
      <span className={s.hinge} />
      <span className={s.base}>
        <span className={s.pad} />
        <span className={s.keys}>
          {KEYS.map((k) => (
            <span key={k}>{k}</span>
          ))}
        </span>
      </span>
      <span className={s.charm} />
      <span className={s.phoneHint}>{open ? "tap 2 close" : "tap 2 open"}</span>
    </button>
  );
}
