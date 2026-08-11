
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
    const arbitraryRegex = /\[\d+(px|rem|em|vh|vw)\]/;

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
