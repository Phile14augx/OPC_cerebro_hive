import { Injectable } from '@nestjs/common';
import type { IFederationEngine } from './engines/federation.interface';

export type FailureMode = 'partial' | 'fail-fast';
export interface FederationRequest { sql: string; sources?: string[]; failureMode?: FailureMode }
export interface SourceResult { source: string; rows: unknown[] }
export interface SourceFailure { source: string; message: string }
export interface FederationResult { status: 'completed' | 'partial'; results: SourceResult[]; errors: SourceFailure[] }

export class FederationQueryError extends Error {
  constructor(readonly source: string, cause: unknown) {
    super(`Federation source "${source}" failed: ${messageOf(cause)}`);
    this.name = 'FederationQueryError';
  }
}

@Injectable()
export class FederationService {
  private readonly sources = new Map<string, IFederationEngine>();

  registerSource(name: string, engine: IFederationEngine): void {
    if (!name.trim()) throw new Error('Federation source name is required');
    if (!engine || typeof engine.query !== 'function') throw new Error('Federation engine must provide query');
    if (this.sources.has(name)) throw new Error(`Federation source "${name}" is already registered`);
    this.sources.set(name, engine);
  }

  async executeQuery(data: FederationRequest): Promise<FederationResult> {
    if (typeof data?.sql !== 'string' || !/^\s*(SELECT|WITH)\b/i.test(data.sql)) {
      throw new Error('Federation query must start with SELECT or WITH');
    }
    if (data.failureMode !== undefined && data.failureMode !== 'partial' && data.failureMode !== 'fail-fast') {
      throw new Error('Unknown federation failure mode');
    }
    const names = data.sources ?? [...this.sources.keys()];
    if (new Set(names).size !== names.length) throw new Error('Federation sources must be unique');
    if (!names.length) throw new Error('At least one federation source is required');
    for (const name of names) if (!this.sources.has(name)) throw new Error(`Unknown federation source "${name}"`);

    const results: SourceResult[] = [];
    const errors: SourceFailure[] = [];
    const causes: Error[] = [];
    for (const name of names) {
      try {
        const rows = await this.sources.get(name)!.query(data.sql);
        results.push({ source: name, rows });
      } catch (cause) {
        const error = new FederationQueryError(name, cause);
        if (data.failureMode === 'fail-fast') throw error;
        errors.push({ source: name, message: messageOf(cause) });
        causes.push(error);
      }
    }
    if (!results.length && errors.length) throw new AggregateError(causes, 'All federation sources failed');
    return { status: errors.length ? 'partial' : 'completed', results, errors };
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
