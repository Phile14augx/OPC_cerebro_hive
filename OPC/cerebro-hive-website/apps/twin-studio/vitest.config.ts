import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@cerebro/twin-domain': path.resolve(__dirname, '../../packages/twin-domain/src/index.ts'),
      '@cerebro/twin-contracts': path.resolve(__dirname, '../../packages/twin-contracts/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'modules/**/*.test.ts'],
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    coverage: {
      reporter: ['text', 'json-summary'],
    },
  },
});
