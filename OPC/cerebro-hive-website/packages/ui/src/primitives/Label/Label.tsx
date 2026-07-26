import React from 'react';
import { LabelProps } from './Label.types';
import { labelStyles } from './Label.styles';

export const Label = React.forwardRef<HTMLElement, LabelProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={labelStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Label.displayName = 'Label';
