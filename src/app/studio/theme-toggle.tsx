"use client";

import { useSyncExternalStore } from "react";

const KEY = "fashionops:studio-theme";
const EVENT = "studio-theme-change";

type Mode = "light" | "dark";

function root() {
  return document.querySelector<HTMLElement>("[data-studio]");
}
function current(): Mode {
  return root()?.dataset.theme === "dark" ? "dark" : "light";
}
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * Runs before the studio paints (see layout.tsx), so the right mode is there
 * from the first frame: the saved choice, or else the device's own setting.
 */
export const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(KEY)});var d=s?s==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.currentScript.parentElement.dataset.theme=d?"dark":"light"}catch(e){}})()`;

/** Switches the studio between light and dark, and remembers the choice. */
export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, current, () => "light" as Mode);
  const next: Mode = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const el = root();
        if (el) el.dataset.theme = next;
        try {
          localStorage.setItem(KEY, next);
        } catch {
          // private mode: the choice just won't be remembered
        }
        window.dispatchEvent(new Event(EVENT));
      }}
      aria-label={`Switch to ${next} mode`}
      className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:border-stone-500"
    >
      <span aria-hidden="true">{mode === "dark" ? "☀" : "☾"}</span>
      {mode === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
