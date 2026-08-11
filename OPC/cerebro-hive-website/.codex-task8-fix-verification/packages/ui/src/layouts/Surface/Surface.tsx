import React from 'react';
import { SurfaceProps } from './Surface.types';
import { surfaceStyles } from './Surface.styles';

export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={surfaceStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Surface.displayName = 'Surface';
