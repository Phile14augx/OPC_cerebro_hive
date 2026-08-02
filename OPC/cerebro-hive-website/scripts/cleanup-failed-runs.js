#!/usr/bin/env node
const { execSync } = require('child_process');

// Paginated fetch of all run IDs
const allIds = new Set();
let page = 0;
const perPage = 100;

while (true) {
  const output = execSync(
    `gh api repos/Phile14augx/OPC_cerebro_hive/actions/runs --paginate -f per_page=${perPage} -f page=$((page+1)) -f status=completed --jq '.workflow_runs[] | select(.conclusion=="failure") | .databaseId' 2>/dev/null`,
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim();
  
  const ids = output.split('\n').filter(Boolean).map(n => parseInt(n, 10));
  if (ids.length === 0) break;
  
  ids.forEach(id => allIds.add(id));
  console.log(`Page ${page+1}: found ${ids.length} failed runs`);
  page++;
  if (page > 5) break; // safety limit
}

const idList = Array.from(allIds);
console.log(`\nTotal unique failed run IDs: ${idList.length}`);

if (idList.length === 0) {
  console.log('Nothing to delete.');
  process.exit(0);
}

let deleted = 0;
let errors = 0;

for (const runId of idList) {
  try {
    execSync(`gh run delete ${runId} --repo Phile14augx/OPC_cerebro_hive 2>/dev/null`, {
      stdio: 'pipe',
      timeout: 15000,
    });
    deleted++;
  } catch (e) {
    errors++;
  }
  if (deleted % 20 === 0) {
    console.log(`Progress: ${deleted}/${idList.length}`);
  }
}

console.log(`\nDone. Deleted: ${deleted}, Errors: ${errors}`);