/**
 * Cerebro OS Design System - Core Tokens
 * Provides a strongly typed set of design and motion tokens for use in Framer Motion 
 * and standard React components, ensuring global consistency across the platform.
 */

// --- MOTION TOKENS --- //
export const motionTokens = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
    ambient: 2.0, // Continuous background animations
  },
  easing: {
    // Elegant spring effect for interactive elements (hover, click, reveal)
    spring: [0.175, 0.885, 0.32, 1.275] as const,
    // Smooth deceleration for entrances
    decelerate: [0.0, 0.0, 0.2, 1] as const,
    // Smooth acceleration for exits
    accelerate: [0.4, 0.0, 1, 1] as const,
    // Smooth, organic easing for ambient animations (nodes, brains)
    smooth: [0.4, 0.0, 0.2, 1] as const,
    linear: "linear" as const,
  }
};

// --- SPACING TOKENS --- //
export const spacingTokens = {
  pagePadding: "px-6 md:px-12 lg:px-24",
  sectionGap: "py-24 md:py-32",
  elementGap: {
    sm: "gap-4",
    md: "gap-8",
    lg: "gap-16"
  }
};

// --- VISUAL TOKENS --- //
export const visualTokens = {
  radius: {
    sm: "rounded-md",
    md: "rounded-xl",
    lg: "rounded-2xl",
    full: "rounded-full"
  },
  glow: {
    primary: "shadow-[0_0_30px_rgba(0,229,255,0.2)]",
    secondary: "shadow-[0_0_30px_rgba(112,0,255,0.2)]",
    warning: "shadow-[0_0_30px_rgba(255,166,0,0.2)]",
    ambient: "shadow-[0_0_100px_rgba(0,229,255,0.1)]"
  },
  glass: "bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 dark:border-white/5",
  glassHover: "hover:bg-white/10 dark:hover:bg-black/30 hover:border-primary-accent/50 transition-colors"
};

// --- TYPOGRAPHY TOKENS --- //
export const typeTokens = {
  hero: "text-5xl md:text-7xl font-space font-bold tracking-tight leading-tight",
  heading1: "text-4xl md:text-5xl font-space font-bold tracking-tight",
  heading2: "text-3xl md:text-4xl font-space font-semibold",
  heading3: "text-2xl md:text-3xl font-space font-medium",
  bodyLg: "text-lg md:text-xl font-inter text-slate-600 dark:text-slate-300 leading-relaxed",
  bodyMd: "text-base font-inter text-slate-600 dark:text-slate-400 leading-relaxed",
  bodySm: "text-sm font-inter text-slate-500 dark:text-slate-500",
  mono: "font-jetbrains text-sm"
};
