import React from 'react';
import { HeadingProps } from './Heading.types';
import { headingStyles } from './Heading.styles';

export const Heading = React.forwardRef<HTMLElement, HeadingProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={headingStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Heading.displayName = 'Heading';
