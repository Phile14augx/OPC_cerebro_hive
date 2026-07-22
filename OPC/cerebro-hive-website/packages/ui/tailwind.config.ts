import type { Config } from 'tailwindcss';
import { colors } from './src/tokens/colors';
import { spacing } from './src/tokens/spacing';
import { radius } from './src/tokens/radius';
import { typography } from './src/tokens/typography';
import { shadows } from './src/tokens/shadows';
import { motion } from './src/tokens/motion';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../apps/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: radius,
      fontFamily: typography.fontFamily,
      boxShadow: shadows,
      transitionProperty: motion.transitionProperty,
    },
  },
  plugins: [],
};

export default config;
