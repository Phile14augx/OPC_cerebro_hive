const fs = require('fs');
const path = require('path');

const packages = ['experience', 'visualization', 'tables', 'motion', 'icons', 'tokens', 'plugin-sdk', 'config'];
const rootDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');

packages.forEach(pkg => {
  const pkgDir = path.join(rootDir, pkg);
  fs.mkdirSync(path.join(pkgDir, 'src'), { recursive: true });
  
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({
    name: '@cerebro/' + pkg,
    version: '0.1.0',
    private: true,
    main: 'src/index.ts',
    scripts: {
      build: 'tsc',
      lint: 'eslint .',
      test: 'vitest run'
    },
    dependencies: {},
    devDependencies: {
      typescript: '^5.0.0',
      eslint: '^8.0.0',
      vitest: '^1.0.0'
    }
  }, null, 2));

  fs.writeFileSync(path.join(pkgDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'es2022',
      module: 'commonjs',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: './dist'
    },
    include: ['src/**/*']
  }, null, 2));

  fs.writeFileSync(path.join(pkgDir, 'src', 'index.ts'), '// @cerebro/' + pkg + '\nexport {};\n');
  fs.writeFileSync(path.join(pkgDir, 'vitest.config.ts'), "import { defineConfig } from 'vitest/config';\nexport default defineConfig({});\n");
  fs.writeFileSync(path.join(pkgDir, 'eslint.config.js'), "module.exports = [];\n");
  fs.writeFileSync(path.join(pkgDir, 'README.md'), '# @cerebro/' + pkg + '\n');
  fs.writeFileSync(path.join(pkgDir, 'CHANGELOG.md'), '# Changelog\n');
});

// For ui package which already exists, create the strict directories
const uiDir = path.join(rootDir, 'ui');
const uiDirs = ['base', 'primitives', 'compositions', 'patterns', 'templates', 'utilities', 'providers', 'experimental'];
uiDirs.forEach(d => fs.mkdirSync(path.join(uiDir, 'src', d), { recursive: true }));
