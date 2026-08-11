import React from 'react';
import { TextProps } from './Text.types';
import { textStyles } from './Text.styles';

export const Text = React.forwardRef<HTMLElement, TextProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={textStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Text.displayName = 'Text';
