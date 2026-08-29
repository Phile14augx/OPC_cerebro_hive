import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ["module-sync", "module", "browser", "node"],
  },
  test: { 
    globals: true,
    environment: "node",
    exclude: [...configDefaults.exclude, 'dist/**', 'OPC/**', 'node_modules/**']
  },
});


