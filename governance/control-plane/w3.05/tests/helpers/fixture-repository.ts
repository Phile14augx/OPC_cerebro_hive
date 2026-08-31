import * as fs from 'node:fs';
import * as path from 'node:path';

export class FixtureRepository {
  private tempDir: string;
  private id: string;

  constructor(id: string) {
    this.id = id;
    this.tempDir = path.join(process.cwd(), 'test-root', 'fixtures', id);
  }

  public setup(files: Record<string, string>): string {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(this.tempDir, { recursive: true });
    for (const [file, content] of Object.entries(files)) {
      const fullPath = path.join(this.tempDir, file);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content);
    }
    return this.tempDir;
  }

  public teardown(): void {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}
