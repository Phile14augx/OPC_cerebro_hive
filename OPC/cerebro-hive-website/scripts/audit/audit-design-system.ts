import { Project, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function run() {
  const project = new Project();
  project.addSourceFilesAtPaths([
    'components/**/*.tsx',
    'app/**/*.tsx'
  ]);

  const files = project.getSourceFiles();
  console.log(`Starting design system audit across ${files.length} files...`);

  let violations = 0;
  let totalFilesChecked = files.length;
  const legacyRegex = /(?<=[\s"':`])(bg-white|text-white|from-white|bg-black|text-black|from-black|border-white|border-black|fill-white|fill-black)(?=\/?[\s"':`\[0-9]*)/g;

  files.forEach(file => {
    const text = file.getFullText();
    const matches = text.match(legacyRegex);
    if (matches && matches.length > 0) {
      violations += matches.length;
    }
  });

  const dsScore = Math.max(0, 100 - violations); // 1 point lost per violation

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  const scorePath = path.join(outDir, 'scores.json');
  let scores: any = {};
  if (fs.existsSync(scorePath)) {
    scores = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  }
  scores.designSystem = dsScore;
  fs.writeFileSync(scorePath, JSON.stringify(scores, null, 2));

  console.log(`Design System audit complete. Score: ${dsScore}%. Found ${violations} legacy token violations. Saved to audit/scores.json`);
}

run();
