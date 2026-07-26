import React from 'react';
import { PanelProps } from './Panel.types';
import { panelStyles } from './Panel.styles';

export const Panel = React.forwardRef<HTMLElement, PanelProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={panelStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Panel.displayName = 'Panel';
