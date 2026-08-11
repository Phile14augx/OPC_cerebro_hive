import React from 'react';
import { SidebarProps } from './Sidebar.types';
import { sidebarStyles } from './Sidebar.styles';

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref as any} className={sidebarStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Sidebar.displayName = 'Sidebar';
