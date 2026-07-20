const fs = require('fs');
const path = require('path');
const { icons } = require('lucide');

const iconMapPath = path.join(__dirname, 'icon-map.json');
const baseDir = path.join(__dirname, '../components/ui/icons');
const registryPath = path.join(baseDir, 'IconRegistry.ts');
const indexPath = path.join(baseDir, 'index.ts');

if (!fs.existsSync(iconMapPath)) {
  console.error("icon-map.json not found!");
  process.exit(1);
}

const iconMap = JSON.parse(fs.readFileSync(iconMapPath, 'utf8'));

// PascalCase converter
const toPascalCase = (str) => str.replace(/(^\w|-\w)/g, (clearAndUpper) => clearAndUpper.replace(/-/, '').toUpperCase());

function renderElement(elementArray) {
  const [tag, attrs] = elementArray;
  const attrString = Object.entries(attrs)
    .map(([key, value]) => {
      // React expects camelCase for SVG attributes like stroke-width, stroke-linecap
      const reactKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      return `${reactKey}="${value}"`;
    })
    .join(' ');
  return `<${tag} ${attrString} />`;
}

function generateIconComponent(iconDef) {
  const { id, category, lucideId, keywords, tags, aliases } = iconDef;
  const componentName = toPascalCase(id);
  
  // Convert Lucide ID (kebab-case) to PascalCase for lookup
  const lucideLookup = toPascalCase(lucideId);
  const lucideAst = icons[lucideLookup];
  
  if (!lucideAst) {
    console.warn(`Lucide icon not found for: ${lucideId}`);
    return null;
  }

  // Convert AST to string
  const svgElements = lucideAst.map(renderElement).join('\n    ');

  return `import React from 'react';
import { BaseIcon } from '../BaseIcon';
import { BaseIconProps } from '../types';

export const ${componentName} = (props: BaseIconProps) => (
  <BaseIcon {...props}>
    ${svgElements}
  </BaseIcon>
);
`;
}

let generatedCount = 0;
let registryEntries = [];
let exportEntries = [];
const categoryExports = {}; // Category index map

// Ensure all categories exist
const categories = [...new Set(iconMap.map(i => i.category))];
categories.forEach(category => {
  const catPath = path.join(baseDir, category);
  if (!fs.existsSync(catPath)) {
    fs.mkdirSync(catPath, { recursive: true });
  }
  categoryExports[category] = []; // Initialize empty array for this category
});

const manifest = []; // Manifest for fast lookup

iconMap.forEach(iconDef => {
  const content = generateIconComponent(iconDef);
  if (content) {
    const componentName = toPascalCase(iconDef.id);
    const filePath = path.join(baseDir, iconDef.category, `${componentName}.tsx`);
    fs.writeFileSync(filePath, content, 'utf8');
    
    // Track exports and registry
    exportEntries.push(`export { ${componentName} } from './${iconDef.category}/${componentName}';`);
    categoryExports[iconDef.category].push(`export { ${componentName} } from './${componentName}';`);
    
    const version = iconDef.version || "1.0.0";
    const introduced = iconDef.introduced || "1.0.0";
    const stability = iconDef.stability || "stable";
    const keywords = iconDef.keywords || [];
    const tags = iconDef.tags || [];
    const aliases = iconDef.aliases || [];
    
    const metaStr = `  '${componentName}': {
    id: '${iconDef.id}',
    category: '${iconDef.category}',
    keywords: ${JSON.stringify(keywords)},
    tags: ${JSON.stringify(tags)},
    aliases: ${JSON.stringify(aliases)},
    version: '${version}',
    introduced: '${introduced}',
    stability: '${stability}'
  }`;
    registryEntries.push(metaStr);
    
    manifest.push({
      id: iconDef.id,
      component: componentName,
      category: iconDef.category,
      aliases: aliases,
      keywords: keywords
    });
    
    generatedCount++;
  }
});

// Update IconRegistry.ts (append to the existing branding icons if we want to keep them)
let currentRegistry = fs.readFileSync(registryPath, 'utf8');
// Adjust branding matches to include the new metadata fields
const brandingMatches = currentRegistry.match(/('[a-zA-Z0-9]+': { id: '[a-zA-Z0-9]+', category: 'branding'.+?),/g) || [];
// For branding icons, we append default metadata since they were generated manually
const updatedBrandingMatches = brandingMatches.map(m => {
  return "  " + m.slice(0, -1).replace("}", ", version: '1.0.0', introduced: '1.0.0', stability: 'stable' }");
});
const allRegistryEntries = [...updatedBrandingMatches, ...registryEntries];

const registryFileContent = `import { IconMetadata } from './types';

export const iconRegistry: Record<string, IconMetadata> = {
${allRegistryEntries.join(',\n')}
};
`;
fs.writeFileSync(registryPath, registryFileContent, 'utf8');

// Update Root index.ts
let currentExports = fs.readFileSync(indexPath, 'utf8');
const lines = currentExports.split('\n');
const staticExports = lines.filter(line => line.includes('./types') || line.includes('./BaseIcon') || line.includes('./IconRegistry') || line.includes('./Icon') || line.includes('./branding/')).join('\n');

const newExports = `${staticExports}\n${exportEntries.join('\n')}\n`;
fs.writeFileSync(indexPath, newExports, 'utf8');

// Update Category index.ts files
Object.keys(categoryExports).forEach(category => {
  const catIndexPath = path.join(baseDir, category, 'index.ts');
  fs.writeFileSync(catIndexPath, categoryExports[category].join('\n') + '\n', 'utf8');
});

// Generate manifest.json
const manifestPath = path.join(baseDir, 'manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

console.log(`Generated ${generatedCount} icons successfully!`);
