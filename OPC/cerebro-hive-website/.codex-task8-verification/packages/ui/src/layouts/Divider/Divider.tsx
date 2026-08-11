import React from 'react';
import { DividerProps } from './Divider.types';
import { dividerStyles } from './Divider.styles';

export const Divider = React.forwardRef<HTMLElement, DividerProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={dividerStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Divider.displayName = 'Divider';
