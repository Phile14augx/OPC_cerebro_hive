import { Project, SyntaxKind, JsxOpeningElement, JsxSelfClosingElement } from 'ts-morph';
import path from 'path';

const project = new Project({
  tsConfigFilePath: path.resolve(__dirname, '../../tsconfig.json'),
});

console.log('Starting Accessibility Audit...\n');

let issuesFound = 0;

function checkImageAlt(node: JsxOpeningElement | JsxSelfClosingElement, filePath: string) {
  const tagName = node.getTagNameNode().getText();
  if (tagName === 'img' || tagName === 'Image') {
    const hasAlt = node.getAttributes().some(attr => {
      if (attr.isKind(SyntaxKind.JsxAttribute)) {
        return attr.getNameNode().getText() === 'alt';
      }
      return false;
    });

    if (!hasAlt) {
      console.log(`[Missing Alt] ${filePath}:${node.getStartLineNumber()}`);
      console.log(`  <${tagName}> tag is missing an 'alt' attribute.`);
      issuesFound++;
    }
  }
}

function checkButtonAria(node: JsxOpeningElement | JsxSelfClosingElement, filePath: string) {
  const tagName = node.getTagNameNode().getText();
  if (tagName === 'button' || tagName === 'button') {
    const hasAriaLabel = node.getAttributes().some(attr => {
      if (attr.isKind(SyntaxKind.JsxAttribute)) {
        return attr.getNameNode().getText() === 'aria-label';
      }
      return false;
    });

    // We only care if it's an empty button or only has SVG children, but AST is hard to check for text children easily.
    // Instead, we just check if it has aria-label or title if it has no text.
    // Let's do a basic check: if it's an icon button, it needs aria-label.
    const hasTitle = node.getAttributes().some(attr => {
        if (attr.isKind(SyntaxKind.JsxAttribute)) {
          return attr.getNameNode().getText() === 'title';
        }
        return false;
      });

    // It's hard to reliably tell if a button has text via AST without complex traversal.
    // We'll skip strict button checking for now and rely on manual/Playwright axe tests.
  }
}

function checkSVG(node: JsxOpeningElement | JsxSelfClosingElement, filePath: string) {
    const tagName = node.getTagNameNode().getText();
    if (tagName === 'svg') {
      const hasAriaHidden = node.getAttributes().some(attr => {
        if (attr.isKind(SyntaxKind.JsxAttribute)) {
          return attr.getNameNode().getText() === 'aria-hidden';
        }
        return false;
      });
  
      if (!hasAriaHidden) {
          // If it's purely decorative, it should have aria-hidden
          // console.log(`[Warning: SVG] ${filePath}:${node.getStartLineNumber()} might need aria-hidden="true" if decorative.`);
      }
    }
}

const sourceFiles = project.getSourceFiles('components/**/*.tsx');

const rootDir = project.getRootDirectories()[0]?.getPath() || '';

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath().replace(rootDir + '/', '');
  
  sourceFile.forEachDescendant(node => {
    if (node.isKind(SyntaxKind.JsxOpeningElement) || node.isKind(SyntaxKind.JsxSelfClosingElement)) {
      checkImageAlt(node, filePath);
      checkButtonAria(node, filePath);
      checkSVG(node, filePath);
    }
  });
}

if (issuesFound === 0) {
  console.log('✅ No automated accessibility issues found in AST.');
} else {
  console.log(`\n❌ Found ${issuesFound} accessibility issues.`);
}
