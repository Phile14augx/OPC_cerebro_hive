import React from 'react';
import { SwitchProps } from './Switch.types';
import { switchStyles } from './Switch.styles';

export const Switch = React.forwardRef<HTMLElement, SwitchProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={switchStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Switch.displayName = 'Switch';
