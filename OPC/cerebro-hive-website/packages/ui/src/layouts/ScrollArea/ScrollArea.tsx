import React from 'react';
import { ScrollAreaProps } from './ScrollArea.types';
import { scrollareaStyles } from './ScrollArea.styles';

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={scrollareaStyles({ className })} {...props}>
      {children}
    </div>
  );
});
ScrollArea.displayName = 'ScrollArea';
