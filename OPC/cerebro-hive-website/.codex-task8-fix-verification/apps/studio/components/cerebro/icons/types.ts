import { SVGMotionProps } from "framer-motion";

export type IconSize = 16 | 20 | 24 | 32 | 48 | 64 | number;
export type IconVariant = "outline" | "duotone" | "filled" | "rounded" | "sharp" | "solid" | "mini";
export type IconAnimation = "idle" | "hover" | "active" | "loading" | "success" | "error" | "pulse" | "glow" | "flow" | "orbit" | "rotate" | "float";

export type IconStability = "experimental" | "beta" | "stable" | "legacy";

export interface IconMetadata {
  id: string;
  displayName?: string;
  category: string;
  subcategory?: string;
  version: string;
  introduced: string;
  deprecated?: boolean;
  replacedBy?: string;
  stability: IconStability;
  keywords: string[];
  aliases: string[];
  tags: string[];
  intent?: string[];
  industries?: string[];
  animated?: boolean;
  duotone?: boolean;
  premium?: boolean;
  rtlSafe?: boolean;
  searchWeight?: number;
}

export type IconColorToken = "primary" | "secondary" | "accent" | "muted" | "success" | "warning" | "danger" | "info" | string;

export interface BaseIconProps extends Omit<SVGMotionProps<SVGSVGElement>, "children" | "fill" | "stroke"> {
  size?: IconSize;
  strokeWidth?: number;
  variant?: IconVariant;
  animation?: IconAnimation;
  children?: React.ReactNode;
  
  // Future-proof tokens
  color?: IconColorToken;
  secondaryColor?: IconColorToken;
  
  // Accessibility
  decorative?: boolean;
  label?: string;
  description?: string;
  
  animated?: boolean;
}
