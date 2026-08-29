import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { VectorUpsertItemDto } from '../dto/vector-upsert.dto';
import { VectorRepository } from '../ports/vector-repository.port';

interface PersistedVectors {
  version: 1;
  namespaces: Record<string, VectorUpsertItemDto[]>;
}

export interface AtomicFilePort {
  read(path: string): Promise<string | undefined>;
  writeAtomically(path: string, contents: string): Promise<void>;
}

export class NodeAtomicFileAdapter implements AtomicFilePort {
  async read(path: string): Promise<string | undefined> {
    try {
      return await readFile(path, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
      throw error;
    }
  }

  async writeAtomically(path: string, contents: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    const temporary = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporary, contents, { encoding: 'utf8', flag: 'wx' });
    await rename(temporary, path);
  }
}

export class JsonFileVectorRepository implements VectorRepository {
  private operation = Promise.resolve();

  constructor(private readonly path: string, private readonly files: AtomicFilePort = new NodeAtomicFileAdapter()) {}

  private async readAll(): Promise<PersistedVectors> {
    const contents = await this.files.read(this.path);
    if (contents === undefined) return { version: 1, namespaces: {} };
    const parsed = JSON.parse(contents) as PersistedVectors;
    if (parsed.version !== 1 || !parsed.namespaces || typeof parsed.namespaces !== 'object') {
      throw new Error('Malformed P03 vector repository');
    }
    return parsed;
  }

  async readNamespace(namespace: string): Promise<VectorUpsertItemDto[]> {
    await this.operation;
    return structuredClone((await this.readAll()).namespaces[namespace] ?? []);
  }

  async replaceNamespace(namespace: string, vectors: VectorUpsertItemDto[]): Promise<void> {
    const write = async () => {
      const current = await this.readAll();
      const next: PersistedVectors = {
        version: 1,
        namespaces: { ...current.namespaces, [namespace]: structuredClone(vectors) },
      };
      await this.files.writeAtomically(this.path, `${JSON.stringify(next)}\n`);
    };
    const pending = this.operation.then(write, write);
    this.operation = pending.then(() => undefined, () => undefined);
    return pending;
  }
}
