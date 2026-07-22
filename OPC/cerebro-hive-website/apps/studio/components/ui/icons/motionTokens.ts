export const MotionTokens = {
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.6,
    ambient: 3.0,
  },
  easings: {
    easeOut: [0.0, 0.0, 0.2, 1],
    easeIn: [0.4, 0.0, 1, 1],
    easeInOut: [0.4, 0.0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
    linear: [0, 0, 1, 1],
  },
};

export const createTransition = (duration: keyof typeof MotionTokens.durations = 'normal', easing: keyof typeof MotionTokens.easings = 'easeOut', options = {}) => {
  return {
    duration: MotionTokens.durations[duration],
    ease: MotionTokens.easings[easing],
    ...options
  };
};
