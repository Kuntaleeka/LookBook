"use client";

import { useEffect, useRef } from "react";
import s from "./y2k.module.css";

type Audio = { ctx: AudioContext; src: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode };

/**
 * The burned CD. It turns as the page scrolls, and you can rub it round with
 * a finger or the mouse: it follows your hand and makes a DJ-style scratch,
 * louder and higher the faster you rub. The sound is made on the spot with
 * the Web Audio API (filtered noise), so there is no audio file to load.
 */
export function ScratchDisc({ className, children }: { className?: string; children: React.ReactNode }) {
  const discRef = useRef<HTMLDivElement>(null);
  const audio = useRef<Audio | null>(null);
  const drag = useRef({ active: false, angle: 0, last: 0, time: 0, turned: 0 });

  useEffect(
    () => () => {
      audio.current?.ctx.close();
      audio.current = null;
    },
    [],
  );

  /** Starts the (silent) scratch sound; must be called from a tap or click. */
  function startAudio() {
    if (audio.current) {
      audio.current.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    // two seconds of hiss, looped
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 2.2;
    filter.frequency.value = 600;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    audio.current = { ctx, src, filter, gain };
  }

  /** Angle of the pointer around the disc's centre, in degrees. */
  function angleAt(e: React.PointerEvent) {
    const box = discRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (box.top + box.height / 2), e.clientX - (box.left + box.width / 2)) * 180) / Math.PI;
  }

  function hush() {
    const a = audio.current;
    if (a) a.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.04);
  }

  return (
    <div className={className}>
      <div
        ref={discRef}
        className={s.disc}
        data-spin
        role="img"
        aria-label="A burned CD. Rub it to scratch."
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startAudio();
          const d = drag.current;
          d.active = true;
          d.last = angleAt(e);
          d.time = performance.now();
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d.active) return;
          const now = performance.now();
          const angle = angleAt(e);
          // shortest way round, so crossing 180° doesn't jump
          const delta = ((angle - d.last + 540) % 360) - 180;
          const dt = Math.max(8, now - d.time);
          d.last = angle;
          d.time = now;
          d.turned += delta;
          e.currentTarget.style.setProperty("--rub", d.turned.toFixed(1));

          const a = audio.current;
          if (!a) return;
          const speed = Math.min(2.2, Math.abs(delta) / dt); // degrees per ms
          const t = a.ctx.currentTime;
          // drop the fade-out queued by the last movement, then set the new level
          a.gain.gain.cancelScheduledValues(t);
          // faster = louder and higher; rubbing backwards sounds lower
          a.gain.gain.setTargetAtTime(Math.min(0.6, speed * 0.95), t, 0.015);
          a.filter.frequency.setTargetAtTime((delta < 0 ? 380 : 620) + speed * 2600, t, 0.02);
          a.src.playbackRate.setTargetAtTime(0.5 + speed * 1.6, t, 0.02);
          // falls quiet by itself if the hand stops moving
          a.gain.gain.setTargetAtTime(0, t + 0.07, 0.05);
        }}
        onPointerUp={() => {
          drag.current.active = false;
          hush();
        }}
        onPointerCancel={() => {
          drag.current.active = false;
          hush();
        }}
      />
      {children}
    </div>
  );
}
