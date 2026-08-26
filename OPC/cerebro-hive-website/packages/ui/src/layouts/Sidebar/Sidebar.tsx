import React from 'react';
import { SidebarProps } from './Sidebar.types';
import { sidebarStyles } from './Sidebar.styles';

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={sidebarStyles({ className })} {...props}>
      {children}
    </div>
  );
});
Sidebar.displayName = 'Sidebar';
