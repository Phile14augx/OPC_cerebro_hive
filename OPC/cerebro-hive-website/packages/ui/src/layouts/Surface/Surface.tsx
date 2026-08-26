import React from 'react';
import { SurfaceProps } from './Surface.types';
import { surfaceStyles } from './Surface.styles';

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={surfaceStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Surface.displayName = 'Surface';
