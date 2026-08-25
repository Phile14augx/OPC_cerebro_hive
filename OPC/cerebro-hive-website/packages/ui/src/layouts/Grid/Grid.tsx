import React from 'react';
import { GridProps } from './Grid.types';
import { gridStyles } from './Grid.styles';

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={gridStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Grid.displayName = 'Grid';
