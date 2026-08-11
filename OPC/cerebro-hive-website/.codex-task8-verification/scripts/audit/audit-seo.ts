import { Project, SyntaxKind } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function run() {
  const project = new Project();
  project.addSourceFilesAtPaths([
    'app/**/page.tsx',
    'app/**/layout.tsx'
  ]);

  const files = project.getSourceFiles();
  console.log(`Starting SEO audit across ${files.length} pages/layouts...`);

  const results: any[] = [];
  let totalChecks = 0;
  let seoPasses = 0;

  files.forEach(file => {
    const filePath = file.getFilePath().replace(process.cwd(), '').replace(/\\/g, '/');
    let hasMetadataExport = false;
    let hasGenerateMetadata = false;

    file.getVariableDeclarations().forEach(decl => {
      if (decl.getName() === 'metadata' && decl.hasExportKeyword()) {
        hasMetadataExport = true;
      }
    });

    file.getFunctions().forEach(func => {
      if (func.getName() === 'generateMetadata' && func.hasExportKeyword()) {
        hasGenerateMetadata = true;
      }
    });

    totalChecks++;
    let status = 'Missing';
    
    if (hasMetadataExport || hasGenerateMetadata) {
      status = 'Present';
      seoPasses++;
    } else {
      // If it's a deeply nested page, maybe it inherits metadata.
      // But we flag it anyway for the audit report.
      status = 'Missing Metadata';
    }

    results.push({
      Page: filePath,
      Status: status,
      Type: hasGenerateMetadata ? 'Dynamic' : (hasMetadataExport ? 'Static' : 'None')
    });
  });

  const seoScore = Math.round((seoPasses / totalChecks) * 100) || 0;

  const outDir = path.join(process.cwd(), 'audit');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const csvPath = path.join(outDir, 'seo-audit.csv');
  const header = ['Page', 'MetadataStatus', 'MetadataType'].join(',');
  const rows = results.map(r => `${r.Page},${r.Status},${r.Type}`);
  
  fs.writeFileSync(csvPath, [header, ...rows].join('\n'));
  
  const scorePath = path.join(outDir, 'scores.json');
  let scores: any = {};
  if (fs.existsSync(scorePath)) {
    scores = JSON.parse(fs.readFileSync(scorePath, 'utf8'));
  }
  scores.seo = seoScore;
  fs.writeFileSync(scorePath, JSON.stringify(scores, null, 2));

  console.log(`SEO audit complete. Score: ${seoScore}%. Found metadata on ${seoPasses}/${totalChecks} pages. Saved to audit/seo-audit.csv`);
}

run();
