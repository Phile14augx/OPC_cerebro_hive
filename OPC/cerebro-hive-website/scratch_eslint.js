const fs = require('fs');
const path = require('path');

const pluginDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'tooling', 'eslint-plugin-design-system');
const srcDir = path.join(pluginDir, 'src');
const rulesDir = path.join(srcDir, 'rules');

fs.mkdirSync(rulesDir, { recursive: true });

// package.json
fs.writeFileSync(path.join(pluginDir, 'package.json'), JSON.stringify({
  name: "eslint-plugin-design-system",
  version: "0.1.0",
  main: "src/index.js",
  dependencies: {
    "eslint": "^8.0.0"
  }
}, null, 2));

// rules/no-hardcoded-colors.js
fs.writeFileSync(path.join(rulesDir, 'no-hardcoded-colors.js'), `
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded hex, rgb, and hsl colors. Use semantic design tokens instead.',
      category: 'Stylistic Issues',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    const colorRegex = /(#([0-9a-fA-F]{3}){1,2}|rgb\\(|hsl\\()/;

    return {
      Literal(node) {
        if (typeof node.value === 'string' && colorRegex.test(node.value)) {
          context.report({
            node,
            message: 'Avoid hardcoded colors ({{ value }}). Use semantic tokens from @cerebro/tokens.',
            data: { value: node.value }
          });
        }
      }
    };
  }
};
`);

// rules/no-arbitrary-tailwind.js
fs.writeFileSync(path.join(rulesDir, 'no-arbitrary-tailwind.js'), `
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow arbitrary Tailwind spacing and sizing values (e.g., p-[15px]).',
      category: 'Best Practices',
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    const arbitraryRegex = /\\[\\d+(px|rem|em|vh|vw)\\]/;

    return {
      Literal(node) {
        if (typeof node.value === 'string' && arbitraryRegex.test(node.value)) {
          context.report({
            node,
            message: 'Arbitrary Tailwind values like {{ value }} break the density scale. Use semantic layout primitives or tokens.',
            data: { value: node.value }
          });
        }
      }
    };
  }
};
`);

// index.js
fs.writeFileSync(path.join(srcDir, 'index.js'), `
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
`);

console.log('WP-013 ESLint Plugin scaffolded successfully');
