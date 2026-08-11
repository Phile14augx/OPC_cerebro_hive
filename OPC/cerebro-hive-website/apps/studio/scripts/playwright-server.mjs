import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '--webpack', '--port', '3401'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, CI: '1' },
  // Next dev exits when stdin closes. Keep a private pipe open for the
  // lifetime of the Playwright-managed parent process.
  stdio: ['pipe', 'inherit', 'inherit'],
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('exit', code => process.exit(code ?? 0));
