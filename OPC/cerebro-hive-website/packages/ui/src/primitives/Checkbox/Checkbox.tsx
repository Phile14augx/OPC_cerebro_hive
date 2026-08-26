import React from 'react';
import { CheckboxProps } from './Checkbox.types';
import { checkboxStyles } from './Checkbox.styles';

export const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={checkboxStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
