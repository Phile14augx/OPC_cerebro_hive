import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { exclude: ['dist/**', 'OPC/**', 'node_modules/**'], globals: true, environment: 'node' } });

