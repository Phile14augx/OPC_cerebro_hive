import React from 'react';
import { SplitViewProps } from './SplitView.types';
import { splitviewStyles } from './SplitView.styles';

export const SplitView = React.forwardRef<HTMLElement, SplitViewProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={splitviewStyles({ className })} {...props}>
      {children}
    </div>
  );
});
SplitView.displayName = 'SplitView';
