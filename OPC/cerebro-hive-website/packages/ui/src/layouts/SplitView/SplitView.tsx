import React from 'react';
import { SplitViewProps } from './SplitView.types';
import { splitviewStyles } from './SplitView.styles';

export const SplitView = React.forwardRef<HTMLDivElement, SplitViewProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={splitviewStyles({ className })} {...props}>
      {children}
    </div>
  );
});
SplitView.displayName = 'SplitView';
