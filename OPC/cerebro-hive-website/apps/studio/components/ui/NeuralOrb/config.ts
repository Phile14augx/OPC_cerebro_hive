import type { OrbSize, OrbColor } from './types';

export const ORB_SIZES: Record<OrbSize, {
  outer: number;
  core: number;
  particle: number;
  haloBlur: number;
  ringStroke: number;
}> = {
  sm: { outer: 28,  core: 18,  particle: 2.5, haloBlur: 8,  ringStroke: 0.75 },
  md: { outer: 40,  core: 26,  particle: 3.5, haloBlur: 12, ringStroke: 1    },
  lg: { outer: 56,  core: 36,  particle: 4.5, haloBlur: 18, ringStroke: 1    },
  xl: { outer: 72,  core: 46,  particle: 5.5, haloBlur: 24, ringStroke: 1.25 },
};

export const ORB_COLORS: Record<OrbColor, { hex: string; rgb: string; gradient: string[] }> = {
  cyan:   { hex: '#00E5FF', rgb: '0,229,255',   gradient: ['#00E5FF', '#9D00FF', '#00E5FF'] },
  green:  { hex: '#00F57A', rgb: '0,245,122',   gradient: ['#00F57A', '#00E5FF', '#00F57A'] },
  purple: { hex: '#9D00FF', rgb: '157,0,255',   gradient: ['#9D00FF', '#00E5FF', '#9D00FF'] },
  amber:  { hex: '#FFC857', rgb: '255,200,87',  gradient: ['#FFC857', '#FF6B35', '#FFC857'] },
  white:  { hex: '#FFFFFF', rgb: '255,255,255', gradient: ['#FFFFFF', '#9D00FF', '#FFFFFF'] },
};

export const ORB_TIMING = {
  breathe:       12,    // seconds — ambient halo cycle
  rotate:        24,    // seconds — dashed ring full rotation
  particle:      6,     // seconds — orbital particle revolution
  pulseInterval: 5,     // seconds — between pulse waves
  pulseDuration: 1.5,   // seconds — pulse expansion time
  hover:         0.18,  // seconds — hover response
  active:        0.8,   // seconds — state transition
} as const;
