import * as path from 'path';
import * as fs from 'fs';

export class PathIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathIdentityError';
  }
}

const DEVICE_NAMES = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..*)?$/i;

export function resolvePathIdentity(root: string, candidate: string): string {
  if (candidate.indexOf('\0') !== -1) {
    throw new PathIdentityError('INVALID: Candidate path contains null bytes');
  }

  const parts = candidate.split(/[/\\]/);
  for (const part of parts) {
    if (part === '..') {
      throw new PathIdentityError('ESCAPE: Candidate path contains forbidden ".." sequence');
    }
    if (DEVICE_NAMES.test(part)) {
      throw new PathIdentityError('DEVICE: Candidate path contains reserved device name');
    }
  }

  const absoluteRoot = path.resolve(root);
  const absoluteCandidate = path.resolve(absoluteRoot, candidate);
  
  const rootWithSep = absoluteRoot.endsWith(path.sep) ? absoluteRoot : absoluteRoot + path.sep;
  const candidateWithSep = absoluteCandidate.endsWith(path.sep) ? absoluteCandidate : absoluteCandidate + path.sep;

  if (absoluteCandidate !== absoluteRoot && !candidateWithSep.startsWith(rootWithSep)) {
    throw new PathIdentityError('ESCAPE: Candidate path escapes the root directory');
  }

  let realCandidate: string;
  try {
    realCandidate = fs.realpathSync(absoluteCandidate);
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: string }).code === 'ENOENT') {
      const partsToAppend: string[] = [];
      let current = absoluteCandidate;
      while (true) {
        partsToAppend.unshift(path.basename(current));
        const parentDir = path.dirname(current);
        if (parentDir === current) {
          realCandidate = path.resolve(parentDir, ...partsToAppend);
          break;
        }
        try {
          const realParent = fs.realpathSync(parentDir);
          realCandidate = path.resolve(realParent, ...partsToAppend);
          break;
        } catch (parentErr: unknown) {
          if (parentErr && typeof parentErr === 'object' && 'code' in parentErr && (parentErr as { code?: string }).code === 'ENOENT') {
            current = parentDir;
          } else {
            throw parentErr;
          }
        }
      }
    } else {
      throw err;
    }
  }

  const realCandidateWithSep = realCandidate.endsWith(path.sep) ? realCandidate : realCandidate + path.sep;
  if (realCandidate !== absoluteRoot && !realCandidateWithSep.startsWith(rootWithSep)) {
    throw new PathIdentityError('ESCAPE: Candidate path (symlink resolved) escapes the root directory');
  }

  return realCandidate;
}
