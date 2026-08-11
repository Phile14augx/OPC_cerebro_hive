import React from 'react';
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
