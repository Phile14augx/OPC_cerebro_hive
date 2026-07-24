import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradients for the brain halves */}
        <linearGradient id="brainLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0073E6" />
          <stop offset="100%" stopColor="#004A99" />
        </linearGradient>
        <linearGradient id="brainRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#CC8F00" />
        </linearGradient>
        <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Hexagon Border - adjusted for dark mode visibility */}
      <polygon 
        points="50,5 85,25 85,65 50,85 15,65 15,25" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinejoin="round" 
        className="opacity-90"
      />

      {/* Left Brain Half */}
      <path 
        d="M 48,15 C 30,12 18,22 18,35 C 12,42 15,55 22,60 C 18,68 25,78 48,75 C 44,65 45,50 48,40 C 45,30 46,20 48,15 Z" 
        fill="url(#brainLeft)" 
      />

      {/* Right Brain Half */}
      <path 
        d="M 52,15 C 70,12 82,22 82,35 C 88,42 85,55 78,60 C 82,68 75,78 52,75 C 56,65 55,50 52,40 C 55,30 54,20 52,15 Z" 
        fill="url(#brainRight)" 
      />

      {/* Data Connections - Left */}
      <g stroke="#00F5FF" strokeWidth="1.5" className="animate-[dash_3s_linear_infinite]" strokeDasharray="4 4" filter="url(#neonGlow)">
        <line x1="30" y1="30" x2="42" y2="35" />
        <line x1="42" y1="35" x2="35" y2="48" />
        <line x1="35" y1="48" x2="45" y2="58" />
        <line x1="35" y1="48" x2="28" y2="60" />
      </g>

      {/* Data Connections - Right */}
      <g stroke="#00F5FF" strokeWidth="1.5" className="animate-[dash_3s_linear_infinite_reverse]" strokeDasharray="4 4" filter="url(#neonGlow)">
        <line x1="70" y1="30" x2="58" y2="35" />
        <line x1="58" y1="35" x2="65" y2="48" />
        <line x1="65" y1="48" x2="55" y2="58" />
        <line x1="65" y1="48" x2="72" y2="60" />
      </g>

      {/* Nodes - Left (Animated pulse) */}
      <g fill="#00F5FF" className="animate-[glowDim_2s_ease-in-out_infinite]" filter="url(#neonGlow)">
        <circle cx="30" cy="30" r="3" />
        <circle cx="42" cy="35" r="3.5" />
        <circle cx="35" cy="48" r="4" />
        <circle cx="45" cy="58" r="3" />
        <circle cx="28" cy="60" r="3" />
      </g>

      {/* Nodes - Right (Animated pulse with delay) */}
      <g fill="#00F5FF" className="animate-[glowDim_2s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} filter="url(#neonGlow)">
        <circle cx="70" cy="30" r="3" />
        <circle cx="58" cy="35" r="3.5" />
        <circle cx="65" cy="48" r="4" />
        <circle cx="55" cy="58" r="3" />
        <circle cx="72" cy="60" r="3" />
      </g>

      {/* Bottom Chevrons */}
      <path 
        d="M 20,92 L 50,105 L 80,92" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="opacity-90"
      />
      <path 
        d="M 28,103 L 50,113 L 72,103" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="opacity-90"
      />
    </svg>
  );
}
