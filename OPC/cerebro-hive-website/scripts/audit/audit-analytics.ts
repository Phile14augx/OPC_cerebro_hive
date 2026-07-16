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
  console.log(`Starting analytics audit across ${files.length} files...`);

  const results: any[] = [];
  let totalInteractions = 0;
  let trackedInteractions = 0;

  files.forEach(file => {
    const filePath = file.getFilePath().replace(process.cwd(), '').replace(/\\/g, '/');
    const elements = file.getDescendantsOfKind(SyntaxKind.JsxElement);
    const selfClosing = file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    
    const checkElement = (node: any, isSelfClosing: boolean) => {
      const targetNode = isSelfClosing ? node : node.getOpeningElement();
      const tagName = targetNode.getTagNameNode().getText();

      const isUntrackedLink = tagName === 'Link' || tagName === 'a';
      const isUntrackedButton = tagName.toLowerCase().includes('button') && !tagName.includes('Tracked');
      
      const isTracked = tagName === 'TrackedLink' || tagName === 'TrackedButton';
      const hasOnClick = !!targetNode.getAttribute('onClick');

      if (isUntrackedLink || isUntrackedButton || hasOnClick || isTracked) {
        totalInteractions++;
        
        let status = 'Untracked';
        if (isTracked) status = 'Tracked';
        
        // If an onClick has some manual tracking, we might consider it tracked, but for Enterprise 10/10 we enforce wrappers
        if (status === 'Tracked') {
          trackedInteractions++;
        } else {
          results.push({
            File: filePath,
            Line: getLineNumber(node),
            Element: tagName,
            Violation: 'Interaction element is not using a Tracked wrapper',
            Severity: 'Medium'
          });
        }
      }
    };

    elements.forEach(node => checkElement(node, false));
    selfClosing.forEach(node => checkElement(node, true));
  });

  const analyticsScore = Math.round((trackedInteractions / totalInteractions) * 100) || 0;

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'analytics-audit.csv');
  const header = ['File', 'Line', 'Element', 'Violation', 'Severity'].join(',');
  const rows = results.map(r => `${r.File},${r.Line},${r.Element},"${r.Violation}",${r.Severity}`);
  
  fs.writeFileSync(csvPath, [header, ...rows].join('\n'));
  
  const scorePath = path.join(outDir, 'scores.json');
  let scores: any = {};
  if (fs.existsSync(scorePath)) {
    scores = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  }
  scores.analytics = analyticsScore;
  fs.writeFileSync(scorePath, JSON.stringify(scores, null, 2));

  console.log(`Analytics audit complete. Score: ${analyticsScore}%. Tracked: ${trackedInteractions}/${totalInteractions}. Saved to audit/analytics-audit.csv`);
}

run();
