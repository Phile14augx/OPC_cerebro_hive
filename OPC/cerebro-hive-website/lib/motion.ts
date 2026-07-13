export const motionPresets = {
  // Container stagger for sequential entrance
  stagger: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  
  // Standard fade up for items inside staggered containers
  fadeUp: {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }
    }
  },
  
  // Smooth reveal with slight scale
  reveal: {
    hidden: { opacity: 0, scale: 0.96 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
    }
  },
  
  // Hover lift for interactive cards
  hoverLift: {
    rest: { y: 0 },
    hover: { 
      y: -4, 
      transition: { duration: 0.3, ease: "easeOut" } 
    }
  },
  
  // Hover glow expansion
  cardGlow: {
    rest: { opacity: 0, scale: 0.9 },
    hover: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.4 } 
    }
  }
};
