import { Project, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function getLineNumber(node: any): number {
  return node.getSourceFile().getLineAndColumnAtPos(node.getStart()).line;
}

function run() {
  const project = new Project();
  project.addSourceFilesAtPaths([
    'components/**/*.tsx',
    'app/**/*.tsx'
  ]);

  const files = project.getSourceFiles();
  console.log(`Starting accessibility audit across ${files.length} files...`);

  const results: any[] = [];
  let a11yScore = 100;
  let totalChecks = 0;
  let violations = 0;

  files.forEach(file => {
    const filePath = file.getFilePath().replace(process.cwd(), '').replace(/\\/g, '/');
    const elements = file.getDescendantsOfKind(SyntaxKind.JsxElement);
    const selfClosing = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    
    const checkElement = (node: any, isSelfClosing: boolean) => {
      let targetNode = isSelfClosing ? node : node.getOpeningElement();
      const tagName = targetNode.getTagNameNode().getText();
      const isImg = tagName === 'img' || tagName === 'Image';
      const isButton = tagName === 'button' || tagName === 'button'; // Native only for now
      const isLink = tagName === 'a';
      const isInteractive = isButton || isLink || !!targetNode.getAttribute('onClick');

      if (isImg) {
        totalChecks++;
        const hasAlt = !!targetNode.getAttribute('alt');
        if (!hasAlt) {
          violations++;
          results.push({
            File: filePath,
            Line: getLineNumber(node),
            Element: tagName,
            Violation: 'Missing alt attribute on image',
            Severity: 'High'
          });
        }
      }

      if (isInteractive) {
        totalChecks++;
        const hasAriaLabel = !!targetNode.getAttribute('aria-label');
        const hasAriaHidden = !!targetNode.getAttribute('aria-hidden');
        
        let text = '';
        if (!isSelfClosing) {
          text = node.getText();
        }
        
        const hasText = text.replace(/<[^>]*>?/gm, '').trim().length > 0;

        if (!hasText && !hasAriaLabel && !hasAriaHidden) {
          violations++;
          results.push({
            File: filePath,
            Line: getLineNumber(node),
            Element: tagName,
            Violation: 'Interactive element has no accessible name (no text, no aria-label)',
            Severity: 'High'
          });
        }
      }
    };

    elements.forEach(node => checkElement(node, false));
    selfClosing.forEach(node => checkElement(node, true));
  });

  if (totalChecks > 0) {
    a11yScore = Math.round(((totalChecks - violations) / totalChecks) * 100);
  }

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'accessibility-audit.csv');
  const header = ['File', 'Line', 'Element', 'Violation', 'Severity'].join(',');
  const rows = results.map(r => `${r.File},${r.Line},${r.Element},"${r.Violation}",${r.Severity}`);
  
  fs.writeFileSync(csvPath, [header, ...rows].join('\n'));
  
  const scorePath = path.join(outDir, 'scores.json');
  let scores: any = {};
  if (fs.existsSync(scorePath)) {
    scores = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  }
  scores.accessibility = a11yScore;
  fs.writeFileSync(scorePath, JSON.stringify(scores, null, 2));

  console.log(`Accessibility audit complete. Score: ${a11yScore}%. Found ${violations} violations across ${totalChecks} checks. Saved to audit/accessibility-audit.csv`);
}

run();
