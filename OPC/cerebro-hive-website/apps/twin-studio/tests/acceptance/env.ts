import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function loadTwinStudioEnv() {
  const file = resolve(__dirname, '../../.env.local');
  try {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const index = line.indexOf('=');
      if (index < 0) continue;
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // CI can supply DATABASE_URL directly.
  }
}

export const BASE_URL = process.env['TWIN_STUDIO_BASE_URL'] ?? 'http://localhost:3401';
