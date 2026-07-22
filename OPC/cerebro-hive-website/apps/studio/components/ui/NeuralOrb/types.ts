export type OrbSize = 'sm' | 'md' | 'lg' | 'xl';
export type OrbColor = 'cyan' | 'green' | 'purple' | 'amber' | 'white';
export type OrbState = 'idle' | 'active' | 'completed' | 'upcoming' | 'thinking';
export type OrbVariant = 'timeline' | 'leadership' | 'org' | 'map' | 'nav' | 'process' | 'default';

export interface NeuralOrbProps {
  size?: OrbSize;
  color?: OrbColor;
  state?: OrbState;
  variant?: OrbVariant;
  pulse?: boolean;
  interactive?: boolean;
  /** 0..1 — passed from parent useScroll to sync brightness with scroll position */
  scrollProgress?: number;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
