import React from 'react';
import { StackProps } from './Stack.types';
import { stackStyles } from './Stack.styles';

export const Stack = React.forwardRef<HTMLElement, StackProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={stackStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Stack.displayName = 'Stack';
