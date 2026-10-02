"use client";

import { useEffect, useRef, useState } from "react";
import s from "./y2k.module.css";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

type Pic = { url: string; title: string };

/**
 * The clack of a flip phone, made on the spot with the Web Audio API (no audio
 * file). Opening is a light plastic click with a quick rising chirp; closing
 * is a lower, firmer snap with a soft thud.
 */
function playFlip(ctx: AudioContext, opening: boolean) {
  const now = ctx.currentTime;

  // the plastic click: a very short burst of filtered noise
  const length = Math.floor(ctx.sampleRate * 0.06);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2;
  const click = ctx.createBufferSource();
  click.buffer = buffer;
  const tone = ctx.createBiquadFilter();
  tone.type = "bandpass";
  tone.frequency.value = opening ? 3200 : 1700;
  tone.Q.value = 0.9;
  const clickGain = ctx.createGain();
  clickGain.gain.value = opening ? 0.5 : 0.7;
  click.connect(tone).connect(clickGain).connect(ctx.destination);
  // closing clacks when the lid lands, a moment after the tap
  const at = now + (opening ? 0 : 0.16);
  click.start(at);

  // the body of the sound: a chirp up on opening, a thud down on closing
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opening ? "triangle" : "sine";
  if (opening) {
    osc.frequency.setValueAtTime(900, at);
    osc.frequency.exponentialRampToValueAtTime(1900, at + 0.07);
  } else {
    osc.frequency.setValueAtTime(210, at);
    osc.frequency.exponentialRampToValueAtTime(70, at + 0.09);
  }
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(opening ? 0.12 : 0.4, at + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + (opening ? 0.1 : 0.14));
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);
  osc.stop(at + 0.2);
}

/**
 * A rhinestoned flip phone. It flips open by itself when the page loads; tap
 * it to snap it shut, tap again to open it, with a click each way. Every time
 * it opens, a different fit (picked at random) is on the screen.
 */
export function FlipPhone({ className, name, pics }: { className?: string; name: string; pics: Pic[] }) {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<number | null>(null);
  const last = useRef<number | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      audio.current?.close();
      audio.current = null;
    },
    [],
  );

  /** Only ever called from a tap, which is when browsers allow sound. */
  function sound(opening: boolean) {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      audio.current ??= new Ctx();
      audio.current.resume();
      playFlip(audio.current, opening);
    } catch {
      // no sound available: the phone still flips
    }
  }

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
      onClick={() => {
        sound(!open);
        if (open) setOpen(false);
        else flipOpen();
      }}
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
