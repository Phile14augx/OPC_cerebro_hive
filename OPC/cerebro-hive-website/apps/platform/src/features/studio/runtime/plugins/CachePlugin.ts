/**
 * M24 — CachePlugin
 * Input-hash-based output caching. Skips re-execution if inputs unchanged.
 */
import { RuntimePlugin } from './RuntimePlugin';
import { StudioNode } from '../../graph/GraphModel';
import { ExecutionContext } from '../execution/ExecutionContext';
import { ExecutionResult } from '../execution/ExecutionResult';
import { TypedValue } from '../routing/ExecutionPortStore';

export class CachePlugin implements RuntimePlugin {
  readonly id = 'core.cache';
  private cache = new Map<string, ExecutionResult>();

  private hashInputs(inputs: Record<string, TypedValue>): string {
    try {
      return JSON.stringify(inputs, Object.keys(inputs).sort());
    } catch {
      return '';
    }
  }

  beforeNode(node: StudioNode, inputs: Record<string, TypedValue>, _ctx: ExecutionContext): void {
    const policy = node.configuration?.['executionPolicy'];
    if (!policy?.cache?.enabled) return;
    const key = `${node.id}::${this.hashInputs(inputs)}`;
    // Store key in context service container for afterNode to check
    _ctx.provide<string>('cache.hitKey', key);
    if (this.cache.has(key)) {
      _ctx.provide<boolean>('cache.hit', true);
      _ctx.provide<ExecutionResult>('cache.result', this.cache.get(key)!);
    }
  }

  afterNode(node: StudioNode, result: ExecutionResult, context: ExecutionContext): void {
    const key = context.get<string>('cache.hitKey');
    const policy = node.configuration?.['executionPolicy'];
    if (key && policy?.cache?.enabled && result.status === 'completed') {
      this.cache.set(key, result);
    }
  }
}
