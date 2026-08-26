import React from 'react';
import { IconProps } from './Icon.types';
import { iconStyles } from './Icon.styles';

export const Icon = React.forwardRef<HTMLDivElement, IconProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={iconStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Icon.displayName = 'Icon';
