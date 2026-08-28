import React from 'react';
import { PanelProps } from './Panel.types';
import { panelStyles } from './Panel.styles';

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={panelStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Panel.displayName = 'Panel';
