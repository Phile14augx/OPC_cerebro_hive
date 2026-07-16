import { Project, SyntaxKind, StringLiteral, NoSubstitutionTemplateLiteral } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

// Class replacement mappings
const classMappings: Record<string, string> = {
  'bg-white/5': 'bg-surface',
  'bg-white/10': 'bg-surface-elevated',
  'bg-white/20': 'bg-surface-elevated',
  'bg-white/30': 'bg-surface-elevated',
  'bg-white/50': 'bg-surface-elevated',
  'bg-white': 'bg-surface',
  'bg-black/50': 'bg-overlay',
  'bg-black/80': 'bg-overlay',
  'bg-black': 'bg-page',
  'text-white/90': 'text-text-primary',
  'text-white/80': 'text-text-secondary',
  'text-white/70': 'text-text-secondary',
  'text-white/60': 'text-text-muted',
  'text-white/50': 'text-text-muted',
  'text-white/40': 'text-text-disabled',
  'text-white': 'text-text-primary',
  'text-black': 'text-text-primary',
  'text-gray-200': 'text-text-secondary',
  'text-gray-300': 'text-text-secondary',
  'text-gray-400': 'text-text-secondary',
  'text-gray-500': 'text-text-muted',
  'text-gray-600': 'text-text-muted',
  'border-white/5': 'border-border-subtle',
  'border-white/10': 'border-border-default',
  'border-white/20': 'border-border-strong',
  'border-white/30': 'border-border-strong',
  'border-white': 'border-border-default',
  'border-black': 'border-border-default',
  'border-gray-500': 'border-border-default',
  'border-gray-600': 'border-border-default',
  'border-gray-700': 'border-border-strong',
  'border-gray-800': 'border-border-strong',
};

const svgColorMappings = ['#fff', '#ffffff', 'white', '#000', '#000000', 'black'];

function replaceClassesInString(className: string): string {
  let newClassName = className;
  for (const [oldClass, newClass] of Object.entries(classMappings)) {
    // Regex to match class name after space or colon (for variants like hover:bg-white)
    const regex = new RegExp(`(^|\\s|:)${oldClass.replace('/', '\\/')}(\\s|$)`, 'g');
    newClassName = newClassName.replace(regex, `$1${newClass}$2`);
  }
  return newClassName;
}

function processFile(file: any) {
  let isModified = false;

  // 1. Process all StringLiterals
  file.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach((node: any) => {
    const oldText = node.getLiteralValue();
    const newText = replaceClassesInString(oldText);
    if (oldText !== newText) {
      node.setLiteralValue(newText);
      isModified = true;
    }
  });

  // 2. Process all NoSubstitutionTemplateLiterals
  file.getDescendantsOfKind(SyntaxKind.NoSubstitutionTemplateLiteral).forEach((node: any) => {
    const oldText = node.getLiteralValue();
    const newText = replaceClassesInString(oldText);
    if (oldText !== newText) {
      node.replaceWithText(`\`${newText}\``);
      isModified = true;
    }
  });

  // 3. Process SVG colors (fill, stroke) on JSX Attributes
  file.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach((attr: any) => {
    if (typeof attr.getName !== 'function') return;
    const attrName = attr.getName();
    if (attrName === 'fill' || attrName === 'stroke') {
      const initializer = attr.getInitializer();
      if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
        const value = initializer.getLiteralValue().toLowerCase();
        if (svgColorMappings.includes(value)) {
          initializer.setLiteralValue('currentColor');
          isModified = true;
        }
      }
    }
  });

  if (isModified) {
    file.saveSync();
    console.log(`Updated: ${file.getFilePath()}`);
  }
}

async function run() {
  const project = new Project();
  project.addSourceFilesAtPaths([
    'components/**/*.tsx',
    'components/**/*.ts',
    'app/**/*.tsx',
    'app/**/*.ts'
  ]);

  const files = project.getSourceFiles();
  console.log(`Found ${files.length} files. Starting codemod...`);

  let count = 0;
  files.forEach(file => {
    try {
      processFile(file);
      count++;
    } catch (e) {
      console.error(`Failed to process ${file.getFilePath()}:`, e);
    }
  });

  console.log(`Codemod complete. Processed ${count} files.`);
}

run();
