import React from 'react';

export const BackgroundGrid = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Base Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Drifting Particles (CSS animated via inline styles or tailwind arbitrary classes if available) */}
      {/* For performance, we just render a few static glowing orbs that drift slowly using standard CSS animation */}
      <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,245,122,0.05) 0%, transparent 60%)' }} />
      <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 60%)' }} />
      <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, transparent 60%)' }} />
    </div>
  );
};
