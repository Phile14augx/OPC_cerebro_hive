import React from 'react';
import { ContainerProps } from './Container.types';
import { containerStyles } from './Container.styles';

export const Container = React.forwardRef<HTMLElement, ContainerProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={containerStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Container.displayName = 'Container';
