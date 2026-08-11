
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
    const colorRegex = /(#([0-9a-fA-F]{3}){1,2}|rgb\(|hsl\()/;

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
