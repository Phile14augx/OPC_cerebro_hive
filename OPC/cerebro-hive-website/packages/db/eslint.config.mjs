import baseConfig from '../../eslint.config.mjs';

// Remove the global ignore for packages/** so this package's files are linted
const filteredBase = baseConfig.filter(cfg => !(cfg.ignores && cfg.ignores.includes('packages/**')));

export default [
  ...filteredBase,
  {
    ignores: ['src/generated/**', 'dist/**']
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  }
];
