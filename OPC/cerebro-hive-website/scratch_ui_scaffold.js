const fs = require('fs');
const path = require('path');

const primitivesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'ui', 'src', 'primitives');
const layoutsDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'ui', 'src', 'layouts');

const primitives = ['Button', 'Icon', 'Text', 'Heading', 'Badge', 'Card', 'Input', 'Label', 'Checkbox', 'Switch', 'Tooltip', 'Spinner', 'Skeleton'];
const layouts = ['Stack', 'Inline', 'Grid', 'Container', 'Surface', 'Panel', 'Divider', 'ScrollArea', 'Sidebar', 'SplitView'];

function scaffoldComponents(components, baseDir) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  components.forEach(comp => {
    const compDir = path.join(baseDir, comp);
    fs.mkdirSync(compDir, { recursive: true });

    // index.ts
    fs.writeFileSync(path.join(compDir, 'index.ts'), `export * from './${comp}';\nexport * from './${comp}.types';\n`);

    // Component.types.ts
    fs.writeFileSync(path.join(compDir, `${comp}.types.ts`), `export interface ${comp}Props {\n  className?: string;\n  children?: React.ReactNode;\n}\n`);

    // Component.styles.ts
    fs.writeFileSync(path.join(compDir, `${comp}.styles.ts`), `import { cva } from 'class-variance-authority';\n\nexport const ${comp.toLowerCase()}Styles = cva(\n  'base-classes-here',\n  {\n    variants: {},\n    defaultVariants: {}\n  }\n);\n`);

    // Component.tsx
    fs.writeFileSync(path.join(compDir, `${comp}.tsx`), `import React from 'react';\nimport { ${comp}Props } from './${comp}.types';\nimport { ${comp.toLowerCase()}Styles } from './${comp}.styles';\n\nexport const ${comp} = React.forwardRef<HTMLElement, ${comp}Props>(({ className, children, ...props }, ref) => {\n  return (\n    <div ref={ref as any} className={${comp.toLowerCase()}Styles({ className })} {...props}>\n      {children}\n    </div>\n  );\n});\n${comp}.displayName = '${comp}';\n`);

    // Component.test.tsx
    fs.writeFileSync(path.join(compDir, `${comp}.test.tsx`), `import { describe, it, expect } from 'vitest';\nimport { render } from '@testing-library/react';\nimport { ${comp} } from './${comp}';\n\ndescribe('${comp}', () => {\n  it('renders without crashing', () => {\n    const { container } = render(<${comp} />);\n    expect(container).toBeDefined();\n  });\n});\n`);

    // Component.stories.tsx
    fs.writeFileSync(path.join(compDir, `${comp}.stories.tsx`), `import type { Meta, StoryObj } from '@storybook/react';\nimport { ${comp} } from './${comp}';\n\nconst meta: Meta<typeof ${comp}> = {\n  title: 'Primitives/${comp}',\n  component: ${comp},\n  tags: ['autodocs'],\n};\n\nexport default meta;\ntype Story = StoryObj<typeof ${comp}>;\n\nexport const Default: Story = {\n  args: {\n    children: '${comp}',\n  },\n};\n`);
  });
}

scaffoldComponents(primitives, primitivesDir);
scaffoldComponents(layouts, layoutsDir);

console.log('UI and Layout components scaffolded successfully.');
