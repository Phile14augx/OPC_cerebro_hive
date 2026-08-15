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
    include: ['tests/acceptance/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 30_000,
  },
});
