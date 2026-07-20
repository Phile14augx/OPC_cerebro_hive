const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../components/ui/icons');
const manifestPath = path.join(baseDir, 'manifest.json');
const storiesDir = path.join(__dirname, '../stories/icons');

if (!fs.existsSync(manifestPath)) {
  console.error("manifest.json not found!");
  process.exit(1);
}

if (!fs.existsSync(storiesDir)) {
  fs.mkdirSync(storiesDir, { recursive: true });
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Group icons by category
const categories = {};
manifest.forEach(icon => {
  if (!categories[icon.category]) categories[icon.category] = [];
  categories[icon.category].push(icon);
});

// Generate a story file per category
Object.entries(categories).forEach(([category, icons]) => {
  // Title-case the category for the Storybook sidebar
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const storyFilePath = path.join(storiesDir, `${categoryTitle}.stories.tsx`);

  const imports = icons.map(i => i.component).join(', ');

  const content = `import type { Meta, StoryObj } from '@storybook/react';
import { ${imports} } from '../../components/ui/icons/${category}';

const meta: Meta = {
  title: 'Icons/${categoryTitle}',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: [16, 20, 24, 32, 48, 64],
    },
    variant: {
      control: { type: 'select' },
      options: ['outline', 'duotone', 'filled', 'rounded', 'sharp', 'solid', 'mini'],
    },
    animation: {
      control: { type: 'select' },
      options: ['idle', 'hover', 'active', 'loading', 'attention', 'success', 'error', 'disabled', 'transition', 'pulse', 'flow', 'orbit', 'sparkle', 'rotate', 'float', 'scan', 'ping', 'draw', 'breathe', 'ripple', 'wave', 'magnetic', 'glow'],
    },
    animated: {
      control: 'boolean',
    },
    color: {
      control: 'text',
      description: 'Color token (e.g. primary, accent) or hex',
    },
    secondaryColor: {
      control: 'text',
    },
  },
};

export default meta;

${icons.map(icon => `
export const ${icon.component}: StoryObj = {
  render: (args) => <${icon.component} {...args} />,
  args: {
    size: 64,
    variant: 'duotone',
    animation: 'idle',
    animated: false,
    color: 'primary',
  },
};
`).join('\n')}
`;

  fs.writeFileSync(storyFilePath, content, 'utf8');
});

console.log(`Successfully generated stories for ${Object.keys(categories).length} categories.`);
