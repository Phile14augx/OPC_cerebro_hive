import { Variants } from "framer-motion";

export const iconAnimations: Record<string, Variants> = {
  idle: {},
  hover: {
    hover: { scale: 1.1, transition: { duration: 0.2 } }
  },
  pulse: {
    animate: { scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } }
  },
  glow: {
    animate: { 
      filter: [
        "drop-shadow(0px 0px 0px var(--color-icon-accent))",
        "drop-shadow(0px 0px 8px var(--color-icon-accent))",
        "drop-shadow(0px 0px 0px var(--color-icon-accent))"
      ],
      transition: { duration: 2, repeat: Infinity } 
    }
  },
  rotate: {
    animate: { rotate: 360, transition: { duration: 2, repeat: Infinity, ease: "linear" } }
  },
  float: {
    animate: { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } }
  },
  flow: {
    animate: { strokeDashoffset: [-20, 0], transition: { duration: 1, repeat: Infinity, ease: "linear" } }
  },
  loading: {
    animate: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } }
  }
};
