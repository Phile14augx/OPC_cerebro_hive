import { HTMLMotionProps } from "framer-motion";

export type IconSize = 16 | 20 | 24 | 32 | 48 | 64 | number;
export type IconVariant = "outline" | "duotone" | "filled" | "rounded" | "sharp" | "solid" | "mini";
export type IconAnimation = "idle" | "hover" | "active" | "loading" | "success" | "error" | "pulse" | "glow" | "flow" | "orbit" | "rotate" | "float";

export type IconStability = "experimental" | "beta" | "stable" | "legacy";

export interface IconMetadata {
  id: string;
  displayName?: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  tags: string[];
  aliases: string[];
  version: string;
  introduced: string;
  stability: IconStability;
  deprecated?: boolean;
  deprecatedReason?: string;
  replacedBy?: string;
  animated?: boolean;
  duotone?: boolean;
}

export interface BaseIconProps extends Omit<HTMLMotionProps<"svg">, "children" | "fill" | "stroke"> {
  size?: IconSize;
  strokeWidth?: number;
  variant?: IconVariant;
  animation?: IconAnimation;
  children?: React.ReactNode;
  
  // Accessibility
  decorative?: boolean;
  label?: string;
}
