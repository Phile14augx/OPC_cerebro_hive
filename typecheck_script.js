const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Running typecheck...');
  // We run from within the studio app
  const output = execSync('pnpm exec tsc --noEmit', { encoding: 'utf-8', cwd: 'd:/CEREBRO_RECOVERY_RUNNER/OPC/cerebro-hive-website/apps/studio' });
  fs.writeFileSync('typecheck_output.txt', 'SUCCESS\n' + output);
} catch (e) {
  fs.writeFileSync('typecheck_output.txt', 'FAILED\n' + e.stdout + '\n' + e.stderr);
}
console.log('Done');
