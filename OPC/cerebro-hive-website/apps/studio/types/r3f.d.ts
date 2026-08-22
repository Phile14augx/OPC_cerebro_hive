// react-three-fiber's own type declarations augment the global JSX namespace
// for React's intrinsic elements (<group>, <mesh>, <points>, ...), but that
// augmentation isn't being picked up in this workspace's module resolution
// (likely due to multiple resolved React versions across pnpm workspace
// packages). Re-declaring it explicitly here fixes JSX.IntrinsicElements
// for every file that renders react-three-fiber primitives.
import type { ThreeElements } from '@react-three/fiber';

declare module 'react' {
  namespace JSX {
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- ARCH-LINT: Deferred
    interface IntrinsicElements extends ThreeElements {}
  }
}
