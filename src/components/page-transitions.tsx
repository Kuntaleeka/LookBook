import { ViewTransition } from "react";

/*
 * Page transitions (React <ViewTransition> + the browser's View Transitions API).
 * Links tag navigations with a type, and each page maps those types to the
 * CSS animations in globals.css:
 *   "open-genre"  home → genre: home zooms past you, the genre opens as a portal
 *   "nav-back"    genre → home: the genre closes back up, the carousel settles in
 * Anything untyped (browser back button, refreshes) swaps without animation.
 */
export const OPEN_GENRE = ["open-genre"];
export const NAV_BACK = ["nav-back"];

export function HomeTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-back": "home-in", default: "none" }}
      exit={{ "open-genre": "home-out", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}

export function GenreTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "open-genre": "genre-in", default: "none" }}
      exit={{ "nav-back": "genre-out", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
