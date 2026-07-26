const fs = require('fs');
const path = require('path');

const iconsDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'icons');
const srcDir = path.join(iconsDir, 'src');

const dirs = [
  'providers',
  'components',
  'metadata'
];

fs.mkdirSync(srcDir, { recursive: true });
dirs.forEach(d => fs.mkdirSync(path.join(srcDir, d), { recursive: true }));

// package.json
fs.writeFileSync(path.join(iconsDir, 'package.json'), JSON.stringify({
  name: "@cerebro/icons",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "lucide-react": "^0.300.0"
  }
}, null, 2));

// manifest.ts
fs.writeFileSync(path.join(srcDir, 'metadata', 'manifest.ts'), `
export interface IconMetadata {
  name: string;
  category: string;
  tags: string[];
  rtlMirrored: boolean;
  filledVariant: boolean;
}

export const iconManifest: Record<string, IconMetadata> = {
  agent: {
    name: 'agent',
    category: 'ai',
    tags: ['assistant', 'llm', 'copilot'],
    rtlMirrored: false,
    filledVariant: true
  },
  settings: {
    name: 'settings',
    category: 'core',
    tags: ['gear', 'preferences'],
    rtlMirrored: false,
    filledVariant: true
  }
};
`);

// providers/lucide.ts
fs.writeFileSync(path.join(srcDir, 'providers', 'lucide.ts'), `
import { Bot, Settings } from 'lucide-react';

export const LucideProviderMap = {
  agent: Bot,
  settings: Settings
};
`);

// registry.ts
fs.writeFileSync(path.join(srcDir, 'registry.ts'), `
import { LucideProviderMap } from './providers/lucide';

// Single source of truth for resolving icon implementations
export const IconRegistry = {
  ...LucideProviderMap
};
`);

// Icon.tsx
fs.writeFileSync(path.join(srcDir, 'components', 'Icon.tsx'), `
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
    console.warn(\`Icon "\${name}" not found in registry.\`);
    return null;
  }

  return (
    <Component 
      size={sizeMap[size]} 
      strokeWidth={strokeMap[stroke]} 
      className={\`text-icon-\${color} \${className || ''}\`}
      aria-hidden={decorative}
    />
  );
};
`);

fs.writeFileSync(path.join(srcDir, 'index.ts'), `
export * from './components/Icon';
export * from './metadata/manifest';
export * from './registry';
`);

console.log('WP-012 Icon System scaffolded successfully');
