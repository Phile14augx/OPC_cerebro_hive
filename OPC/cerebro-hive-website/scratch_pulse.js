const fs = require('fs');
const path = require('path');

const pulseDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'apps', 'pulse');

const domains = [
  'identity', 'workspace', 'knowledge', 'agents', 
  'workflows', 'governance', 'marketplace', 'observability', 
  'billing', 'security', 'search', 'settings'
];

const shared = ['ui', 'api', 'providers'];

domains.forEach(d => fs.mkdirSync(path.join(pulseDir, 'domains', d), { recursive: true }));
shared.forEach(d => fs.mkdirSync(path.join(pulseDir, 'shared', d), { recursive: true }));
fs.mkdirSync(path.join(pulseDir, 'app'), { recursive: true });

fs.writeFileSync(path.join(pulseDir, 'package.json'), JSON.stringify({
  name: '@cerebro/pulse',
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start',
    lint: 'next lint'
  },
  dependencies: {
    'react': '^18.0.0',
    'react-dom': '^18.0.0',
    'next': '^14.0.0',
    'zustand': '^4.5.0',
    '@tanstack/react-query': '^5.0.0',
    'react-hook-form': '^7.0.0'
  },
  devDependencies: {
    'typescript': '^5.0.0',
    '@types/node': '^20.0.0',
    '@types/react': '^18.0.0',
    '@types/react-dom': '^18.0.0',
    'autoprefixer': '^10.4.0',
    'postcss': '^8.4.0',
    'tailwindcss': '^3.4.0',
    'eslint': '^8.0.0',
    'eslint-config-next': '^14.0.0'
  }
}, null, 2));

fs.writeFileSync(path.join(pulseDir, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    target: 'es5',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'node',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [
      { name: 'next' }
    ],
    paths: {
      '@/*': ['./*']
    }
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules']
}, null, 2));

fs.writeFileSync(path.join(pulseDir, 'tailwind.config.js'), `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './domains/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);

fs.writeFileSync(path.join(pulseDir, 'postcss.config.js'), `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

fs.writeFileSync(path.join(pulseDir, 'next.config.js'), `/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
`);

fs.writeFileSync(path.join(pulseDir, 'app', 'layout.tsx'), `import '../shared/ui/globals.css';

export const metadata = {
  title: 'HivePulse Command Center',
  description: 'Enterprise AI Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang=\"en\">
      <body>{children}</body>
    </html>
  )
}
`);

fs.writeFileSync(path.join(pulseDir, 'app', 'page.tsx'), `export default function MissionControl() {
  return (
    <main className=\"p-8\">
      <h1 className=\"text-2xl font-bold\">HivePulse Mission Control</h1>
      <p>Phase 0 Foundation established.</p>
    </main>
  )
}
`);

fs.mkdirSync(path.join(pulseDir, 'shared', 'ui'), { recursive: true });
fs.writeFileSync(path.join(pulseDir, 'shared', 'ui', 'globals.css'), `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`);

