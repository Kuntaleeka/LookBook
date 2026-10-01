/** Cookie holding the admin's light/dark choice, so the server can render it. */
export const THEME_COOKIE = "studio-theme";

export type Mode = "light" | "dark";

/** A saved choice from the cookie, or undefined to follow the device setting. */
export function savedMode(value: string | undefined): Mode | undefined {
  return value === "dark" || value === "light" ? value : undefined;
}
