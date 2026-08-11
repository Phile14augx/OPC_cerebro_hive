import React from 'react';
import { CheckboxProps } from './Checkbox.types';
import { checkboxStyles } from './Checkbox.styles';

export const Checkbox = React.forwardRef<HTMLElement, CheckboxProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={checkboxStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Checkbox.displayName = 'Checkbox';
