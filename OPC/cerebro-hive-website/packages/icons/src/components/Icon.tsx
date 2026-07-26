
import React from 'react';
import { IconRegistry } from '../registry';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger';
export type IconStroke = 'light' | 'regular' | 'bold';

export interface IconProps {
  name: keyof typeof IconRegistry;
  size?: IconSize;
  color?: IconColor;
  stroke?: IconStroke;
  decorative?: boolean;
  className?: string;
}

const sizeMap: Record<IconSize, number> = { sm: 16, md: 20, lg: 24, xl: 32 };
const strokeMap: Record<IconStroke, number> = { light: 1.2, regular: 1.5, bold: 2.0 };

export const Icon = ({ 
  name, 
  size = 'md', 
  color = 'primary', 
  stroke = 'regular',
  decorative = true,
  className 
}: IconProps) => {
  const Component = IconRegistry[name];
  
  if (!Component) {
    console.warn(`Icon "${name}" not found in registry.`);
    return null;
  }

  return (
    <Component 
      size={sizeMap[size]} 
      strokeWidth={strokeMap[stroke]} 
      className={`text-icon-${color} ${className || ''}`}
      aria-hidden={decorative}
    />
  );
};
