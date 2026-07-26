const fs = require('fs');
const path = require('path');

const motionDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'motion', 'src');

const dirs = ['tokens', 'animations', 'hooks', 'components'];
dirs.forEach(d => fs.mkdirSync(path.join(motionDir, d), { recursive: true }));

// Tokens
fs.writeFileSync(path.join(motionDir, 'tokens', 'durations.ts'), `export const durations = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms'
};
`);

fs.writeFileSync(path.join(motionDir, 'tokens', 'easing.ts'), `export const easings = {
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutQuint: [0.83, 0, 0.17, 1]
};
`);

fs.writeFileSync(path.join(motionDir, 'tokens', 'springs.ts'), `export const springs = {
  bouncy: { type: 'spring', stiffness: 300, damping: 10 },
  smooth: { type: 'spring', stiffness: 100, damping: 20 }
};
`);

// Animations
fs.writeFileSync(path.join(motionDir, 'animations', 'fade.ts'), `export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};
`);

// Hooks
fs.writeFileSync(path.join(motionDir, 'hooks', 'useReducedMotion.ts'), `import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  return useFramerReducedMotion();
}
`);

// Components (dummy placeholders for demonstration)
fs.writeFileSync(path.join(motionDir, 'components', 'FadeIn.tsx'), `import React from 'react';
import { motion } from 'framer-motion';
import { fade } from '../animations/fade';
import { durations } from '../tokens/durations';

export const FadeIn = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={fade.initial}
      animate={fade.animate}
      exit={fade.exit}
      transition={{ duration: parseFloat(durations.normal) / 1000 }}
    >
      {children}
    </motion.div>
  );
};
`);

fs.writeFileSync(path.join(motionDir, 'index.ts'), `export * from './tokens/durations';
export * from './tokens/easing';
export * from './tokens/springs';
export * from './animations/fade';
export * from './hooks/useReducedMotion';
export * from './components/FadeIn';
`);
