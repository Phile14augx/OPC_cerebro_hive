export type IconStability = "experimental" | "beta" | "stable" | "legacy";

export interface IconMetadata {
  id: string;
  name?: string;
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
  related?: string[];
  animationSupport?: boolean;
  themeSupport?: boolean;
  animated?: boolean;
  duotone?: boolean;
  premium?: boolean;
  rtlSafe?: boolean;
  searchWeight?: number;
}
