import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'test/integration/**/*.spec.ts', 'test/l4/**/*.spec.ts'],
    exclude: ['dist/**', 'coverage/**', 'node_modules/**'],
    globals: true,
    environment: 'node',
  },
});
