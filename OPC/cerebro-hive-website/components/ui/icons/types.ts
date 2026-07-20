import { HTMLMotionProps } from "framer-motion";

export type IconSize = 16 | 20 | 24 | 32 | 48 | 64 | number;
export type IconVariant = "outline" | "duotone" | "filled" | "rounded" | "sharp" | "solid" | "mini";
export type IconAnimation = "idle" | "hover" | "active" | "loading" | "success" | "error" | "pulse" | "glow" | "flow" | "orbit" | "rotate" | "float";

export interface IconMetadata {
  id: string;
  category: string;
  keywords: string[];
  tags: string[];
  aliases: string[];
}

export interface BaseIconProps extends Omit<HTMLMotionProps<"svg">, "children" | "fill" | "stroke"> {
  size?: IconSize;
  strokeWidth?: number;
  variant?: IconVariant;
  animation?: IconAnimation;
  children?: React.ReactNode;
}
