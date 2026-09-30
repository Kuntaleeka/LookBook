"use client";

import { useState } from "react";
import { useOpenOutfit } from "../lightbox";
import { pad3 } from "../utils";
import s from "./acubi.module.css";

type Shot = { imageUrl: string; title: string };

/**
 * A silver compact digital camera (inspo: the camera-back photo). Its screen
 * shows the looks; the d-pad flips through them and the middle button opens
 * the one on screen full size. Must sit inside <Lightbox>.
 */
export function Camera({ shots }: { shots: Shot[] }) {
  const [index, setIndex] = useState(0);
  const open = useOpenOutfit();
  const count = shots.length;
  const shot = shots[index];
  const step = (d: number) => count && setIndex((i) => (i + d + count) % count);

  return (
    <figure className={s.camera} aria-label="Camera showing the looks">
      <div className={s.camTop} aria-hidden="true">
        <span className={s.camKey}>FOCUS</span>
        <span className={s.camKey}>AE LOCK</span>
        <span className={s.camLed} />
      </div>

      <div className={s.camBody}>
        <div className={s.lcdBezel}>
          <div className={s.lcd}>
            {shot ? (
              // eslint-disable-next-line @next/next/no-img-element -- sized on upload
              <img key={shot.imageUrl} src={shot.imageUrl} alt={shot.title} className={s.lcdImg} />
            ) : (
              <span className={s.noImage}>NO IMAGE</span>
            )}
            <span className={s.osdTop} aria-hidden="true">
              <span>▶ {count ? `${pad3(index + 1)}/${pad3(count)}` : "000/000"}</span>
              <span className={s.battery} />
            </span>
            {shot && (
              <span className={s.osdBottom} aria-live="polite">
                {shot.title}
              </span>
            )}
          </div>
          <span className={s.camBrand} aria-hidden="true">
            acubi·cam
          </span>
        </div>

        <div className={s.controls}>
          <span className={s.smallKey} aria-hidden="true">
            ⧉
          </span>
          <div className={s.dpad}>
            <button type="button" className={`${s.dBtn} ${s.dLeft}`} onClick={() => step(-1)} aria-label="Previous look" disabled={count < 2}>
              ◀
            </button>
            <button type="button" className={`${s.dBtn} ${s.dRight}`} onClick={() => step(1)} aria-label="Next look" disabled={count < 2}>
              ▶
            </button>
            <span className={`${s.dBtn} ${s.dUp}`} aria-hidden="true">
              ▲
            </span>
            <span className={`${s.dBtn} ${s.dDown}`} aria-hidden="true">
              ▼
            </span>
            <button
              type="button"
              className={s.dOk}
              onClick={() => shot && open(index)}
              aria-label={shot ? `Open ${shot.title}` : "No looks yet"}
              disabled={!shot}
            />
          </div>
          <span className={s.smallKey} aria-hidden="true">
            MENU
          </span>
        </div>
      </div>
      <figcaption className={s.camHint}>◀ ▶ to flip · ● to open</figcaption>
    </figure>
  );
}
