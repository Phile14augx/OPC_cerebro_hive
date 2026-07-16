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
  console.log(`Starting design system & motion audit across ${files.length} files...`);

  let violations = 0;
  let totalFilesChecked = files.length;
  const legacyRegex = /(?<=[\s"':`])(bg-white|text-white|from-white|bg-black|text-black|from-black|border-white|border-black|fill-white|fill-black)(?=\/?[\s"':`\[0-9]*)/g;

  const motionPropsToFlag = ['duration', 'delay', 'ease', 'type: "spring"', 'stiffness', 'damping', 'whileHover={{', 'whileTap={{', 'animate={{'];

  files.forEach(file => {
    const text = file.getFullText();
    
    // Check Legacy Tokens
    const matches = text.match(legacyRegex);
    if (matches && matches.length > 0) {
      violations += matches.length;
    }

    // Check Hardcoded Motion Properties (only if framer-motion is imported)
    if (text.includes('framer-motion')) {
      const isExempt = file.getFilePath().includes('primitives') || file.getFilePath().includes('registry');
      
      if (!isExempt) {
        file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement).forEach(node => {
          const tagName = node.getTagNameNode().getText();
          if (tagName.startsWith('motion.')) {
            node.getAttributes().forEach(attr => {
              const attrText = attr.getText();
              // Flag if it has inline transition or animate with hardcoded objects instead of variants
              if (attrText.includes('transition={{') || attrText.includes('animate={{') || attrText.includes('whileHover={{')) {
                // Ignore empty or simple ones like animate="visible"
                if (attrText.match(/duration:|delay:|ease:|stiffness:|damping:/)) {
                  violations++;
                  console.warn(`[CerebroMotion Violation] Inline physics/durations found in ${file.getBaseName()} at line ${getLineNumber(node)}. Use motion tokens or registry instead.`);
                }
              }
            });
          }
        });
      }
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

  console.log(`Design System & Motion audit complete. Score: ${dsScore}%. Found ${violations} violations. Saved to audit/scores.json`);
}

run();
