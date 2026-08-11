import React from 'react';
import { GridProps } from './Grid.types';
import { gridStyles } from './Grid.styles';

export const Grid = React.forwardRef<HTMLElement, GridProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={gridStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Grid.displayName = 'Grid';
