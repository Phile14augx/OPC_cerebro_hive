import { IconColorToken } from "./types";

export const IconColors: Record<IconColorToken, string> = {
  primary: "var(--color-icon-primary)",
  secondary: "var(--color-icon-secondary)",
  accent: "var(--color-icon-accent)",
  muted: "var(--color-icon-muted)",
  success: "var(--color-icon-success)",
  warning: "var(--color-icon-warning)",
  danger: "var(--color-icon-danger)",
  info: "var(--color-icon-info)",
};

export const resolveColorToken = (color?: IconColorToken | string): string => {
  if (!color) return IconColors.primary;
  return IconColors[color as IconColorToken] || color;
};
