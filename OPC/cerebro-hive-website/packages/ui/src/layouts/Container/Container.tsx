import React from 'react';
import { ContainerProps } from './Container.types';
import { containerStyles } from './Container.styles';

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={containerStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Container.displayName = 'Container';
