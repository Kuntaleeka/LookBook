"use client";

import { useSyncExternalStore } from "react";
import { savedMode, THEME_COOKIE, type Mode } from "./theme-mode";

const EVENT = "studio-theme-change";

function root() {
  return document.querySelector<HTMLElement>("[data-studio]");
}
function current(): Mode {
  const set = savedMode(root()?.dataset.theme);
  return set ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}

/**
 * Switches the studio between light and dark. Until it is pressed the studio
 * follows the device's own setting; after that the choice is kept in a cookie
 * for a year.
 */
export function ThemeToggle({ initial }: { initial?: Mode }) {
  const mode = useSyncExternalStore(subscribe, current, () => initial ?? "light");
  const next: Mode = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const el = root();
        if (el) el.dataset.theme = next;
        document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        window.dispatchEvent(new Event(EVENT));
      }}
      aria-label={`Switch to ${next} mode`}
      suppressHydrationWarning
      className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:border-stone-500"
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {mode === "dark" ? "☀" : "☾"}
      </span>
      <span suppressHydrationWarning>{mode === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
