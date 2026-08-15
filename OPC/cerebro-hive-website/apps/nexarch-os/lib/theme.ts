export const DEFAULT_THEME = "mono";

export const THEMES = ["mono", "terminal"] as const;
export type ThemeName = (typeof THEMES)[number];

export function isTheme(value: string | null | undefined): value is ThemeName {
  return value === "mono" || value === "terminal";
}
