import React from 'react';
import { StackProps } from './Stack.types';
import { stackStyles } from './Stack.styles';

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={stackStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Stack.displayName = 'Stack';
