import * as fs from 'fs';
import * as path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PURE_FILES = [
  'src/proposal/generator.ts',
  'src/canonical/json.ts',
  'src/validator/invariants.ts'
];

const FORBIDDEN_PATTERNS = [
  { name: 'Clock read', regex: /\b(Date\.now|new\s+Date|performance\.now|process\.hrtime)\b/ },
  { name: 'PRNG invocation', regex: /\b(Math\.random|crypto\.randomBytes|crypto\.randomUUID)\b/ },
  { name: 'Process environment access', regex: /\b(process\.pid|process\.env|process\.cwd)\b/ },
  { name: 'Filesystem mutation', regex: /\bfs\.(writeFileSync|writeFile|appendFileSync|createWriteStream|mkdirSync)\b/ }
];

let failed = false;
for (const relPath of PURE_FILES) {
  const fullPath = path.resolve(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');
  // Strip block comments and single line comments to avoid matching text in comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/\/\/.*$/gm, '');
  
  for (const { name, regex } of FORBIDDEN_PATTERNS) {
    const match = content.match(regex);
    if (match) {
      console.error(`[PURITY VIOLATION] ${relPath}: Detected ${name} at "${match[0]}"`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('✓ All pure modules passed static purity verification.');
}
