export const motionTokens = {
  // Time in seconds
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
    ambient: 3.0,
    glacial: 10.0, // For slow background drifting
  },

  // Easing functions matching Framer Motion's cubic-bezier
  easing: {
    spring: [0.175, 0.885, 0.32, 1.275], // Bouncy, playful but enterprise-controlled
    smooth: [0.4, 0, 0.2, 1], // Standard enterprise flow (Material/Apple-like)
    enter: [0.0, 0, 0.2, 1], // Decelerate entering screen
    exit: [0.4, 0, 1, 1], // Accelerate leaving screen
    linear: "linear",
  },

  // Glow configurations (box-shadow or filter blur values)
  glow: {
    none: "none",
    low: "0 0 10px rgba(var(--primary-rgb), 0.2)",
    medium: "0 0 20px rgba(var(--primary-rgb), 0.4)",
    active: "0 0 30px rgba(var(--primary-rgb), 0.6)",
    alert: "0 0 30px rgba(var(--warning-rgb), 0.8)",
  },

  // Opacity values for semantic layers
  opacity: {
    hidden: 0,
    ambient: 0.05,
    subtle: 0.3,
    base: 0.6,
    active: 1,
  },

  // Elevations (Z-axis motion or shadow layers)
  elevation: {
    flat: 0,
    lift: -4,
    float: -12,
  },

  // Stagger delays for children elements
  stagger: {
    fast: 0.05,
    normal: 0.1,
    slow: 0.2,
  },

  // Framer Motion spring physics presets
  physics: {
    snappy: { type: "spring", stiffness: 400, damping: 25 },
    gentle: { type: "spring", stiffness: 100, damping: 20 },
    wobbly: { type: "spring", stiffness: 200, damping: 10 },
  }
} as const;

// Types for strict usage
export type MotionDuration = keyof typeof motionTokens.duration;
export type MotionEasing = keyof typeof motionTokens.easing;
export type MotionPhysics = keyof typeof motionTokens.physics;
