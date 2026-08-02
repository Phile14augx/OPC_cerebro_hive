const fs = require('fs');
const path = require('path');

const workflowsDir = path.join(__dirname, '../../../.github/workflows');
const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

for (const file of files) {
  const filePath = path.join(workflowsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add cache-dependency-path to setup-node
  content = content.replace(/cache:\s*['"]?pnpm['"]?/g, `cache: pnpm\n          cache-dependency-path: OPC/cerebro-hive-website/pnpm-lock.yaml`);

  // 2. Add workflow-level defaults if not present
  if (!content.includes('working-directory: OPC/cerebro-hive-website')) {
    // Insert after env: if it exists, otherwise before jobs:
    const defaultsStr = `
defaults:
  run:
    working-directory: OPC/cerebro-hive-website
`;
    if (content.includes('\nenv:\n')) {
      // Find the end of the env block (which is before jobs:)
      content = content.replace(/\njobs:/, `${defaultsStr}\njobs:`);
    } else {
      content = content.replace(/\njobs:/, `${defaultsStr}\njobs:`);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
