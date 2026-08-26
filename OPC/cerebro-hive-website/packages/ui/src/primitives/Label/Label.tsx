import React from 'react';
import { LabelProps } from './Label.types';
import { labelStyles } from './Label.styles';

export const Label = React.forwardRef<HTMLDivElement, LabelProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={labelStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Label.displayName = 'Label';
