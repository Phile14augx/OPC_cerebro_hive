import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.endsWith('.ts') && !fullPath.includes('.test.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

describe('Architecture Boundary Verification', () => {
  const rootDir = path.resolve(__dirname, '../../../../../../');
  
  it('runtime-contracts must never import runtime-core', () => {
    const contractsDir = path.join(rootDir, 'packages/runtime-contracts/src');
    const files = getAllFiles(contractsDir);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hasCoreImport = /from\s+['"]@cerebro\/runtime-core/.test(content) || /from\s+['"]\.\.\/.*\/?runtime-core/.test(content);
      
      expect(hasCoreImport, `File ${file} violates boundary by importing runtime-core`).toBe(false);
    });
  });

  it('API routes must never import ExecutionManager directly', () => {
    const routesDir = path.join(rootDir, 'apps/platform-api/src/modules');
    const files = getAllFiles(routesDir).filter(f => f.endsWith('.routes.ts'));
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hasManagerImport = /ExecutionManager/.test(content);
      
      expect(hasManagerImport, `Route ${file} violates boundary by referencing ExecutionManager`).toBe(false);
    });
  });

  it('sagas must never import ExecutionStore or ExecutionManager', () => {
    const sagasDir = path.join(rootDir, 'packages/runtime-core/src/execution/sagas');
    const files = getAllFiles(sagasDir);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const hasStoreImport = /ExecutionStore/.test(content);
      const hasManagerImport = /ExecutionManager/.test(content);
      
      expect(hasStoreImport, `Saga ${file} violates boundary by referencing ExecutionStore`).toBe(false);
      expect(hasManagerImport, `Saga ${file} violates boundary by referencing ExecutionManager`).toBe(false);
    });
  });
});
