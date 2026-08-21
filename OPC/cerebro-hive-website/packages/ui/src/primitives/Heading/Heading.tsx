import React from 'react';
import { HeadingProps } from './Heading.types';
import { headingStyles } from './Heading.styles';

export const Heading = React.forwardRef<HTMLDivElement, HeadingProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={headingStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Heading.displayName = 'Heading';
