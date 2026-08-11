
module.exports = {
  rules: {
    'no-hardcoded-colors': require('./rules/no-hardcoded-colors'),
    'no-arbitrary-tailwind': require('./rules/no-arbitrary-tailwind')
  },
  configs: {
    recommended: {
      plugins: ['design-system'],
      rules: {
        'design-system/no-hardcoded-colors': 'error',
        'design-system/no-arbitrary-tailwind': 'error'
      }
    }
  }
};
