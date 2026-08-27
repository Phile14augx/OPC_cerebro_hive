import { Injectable } from '@nestjs/common';

type RenameStep = { operation: 'rename'; from: string; to: string };
type SetStep = { operation: 'set'; path: string; value: unknown };
type RemoveStep = { operation: 'remove'; path: string };
export type TransformationStep = RenameStep | SetStep | RemoveStep;
export interface TransformationRequest { id: string; input: Record<string, unknown>; steps: TransformationStep[] }
export interface TransformationJob { id: string; status: 'completed' | 'failed'; result?: any; error?: string }

@Injectable()
export class TransformationService {
  private readonly jobs = new Map<string, TransformationJob>();

  async triggerJob(data: TransformationRequest): Promise<TransformationJob> {
    if (!data?.id?.trim()) throw new Error('Job id is required');
    if (this.jobs.has(data.id)) throw new Error(`Job "${data.id}" already exists`);
    const result = structuredClone(data.input);
    try {
      for (const step of data.steps) applyStep(result, step);
      const job = { id: data.id, status: 'completed' as const, result: structuredClone(result) };
      this.jobs.set(data.id, job);
      return structuredClone(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.jobs.set(data.id, { id: data.id, status: 'failed', error: message });
      throw error;
    }
  }

  getJob(id: string): TransformationJob | undefined {
    const job = this.jobs.get(id);
    return job ? structuredClone(job) : undefined;
  }
}

function applyStep(target: Record<string, unknown>, step: TransformationStep): void {
  if (step.operation === 'rename') {
    const value = readPath(target, step.from);
    setPath(target, step.to, value);
    removePath(target, step.from);
  } else if (step.operation === 'set') {
    setPath(target, step.path, structuredClone(step.value));
  } else if (step.operation === 'remove') {
    removePath(target, step.path);
  } else {
    throw new Error('Unsupported transformation operation');
  }
}

function parts(path: string): string[] {
  const value = path?.split('.').filter(Boolean);
  if (!value?.length) throw new Error('Transformation path is required');
  return value;
}

function parentAt(target: Record<string, unknown>, path: string, create: boolean): [Record<string, unknown>, string] {
  const segments = parts(path);
  const leaf = segments.pop()!;
  let current = target;
  for (const segment of segments) {
    const next = current[segment];
    if (typeof next !== 'object' || next === null || Array.isArray(next)) {
      if (!create) throw new Error(`Path "${path}" does not exist`);
      current[segment] = {};
    }
    current = current[segment] as Record<string, unknown>;
  }
  return [current, leaf];
}

function readPath(target: Record<string, unknown>, path: string): unknown {
  const [parent, leaf] = parentAt(target, path, false);
  if (!Object.prototype.hasOwnProperty.call(parent, leaf)) throw new Error(`Path "${path}" does not exist`);
  return parent[leaf];
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const [parent, leaf] = parentAt(target, path, true);
  parent[leaf] = value;
}

function removePath(target: Record<string, unknown>, path: string): void {
  const [parent, leaf] = parentAt(target, path, false);
  if (!Object.prototype.hasOwnProperty.call(parent, leaf)) throw new Error(`Path "${path}" does not exist`);
  delete parent[leaf];
}
