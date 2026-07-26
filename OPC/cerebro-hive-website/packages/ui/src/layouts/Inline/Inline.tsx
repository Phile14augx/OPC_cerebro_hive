import React from 'react';
import { InlineProps } from './Inline.types';
import { inlineStyles } from './Inline.styles';

export const Inline = React.forwardRef<HTMLElement, InlineProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={inlineStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Inline.displayName = 'Inline';
