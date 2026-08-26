import React from 'react';
import { InputProps } from './Input.types';
import { inputStyles } from './Input.styles';

export const Input = React.forwardRef<HTMLDivElement, InputProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={inputStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Input.displayName = 'Input';
