import React from 'react';
import { TooltipProps } from './Tooltip.types';
import { tooltipStyles } from './Tooltip.styles';

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={tooltipStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Tooltip.displayName = 'Tooltip';
