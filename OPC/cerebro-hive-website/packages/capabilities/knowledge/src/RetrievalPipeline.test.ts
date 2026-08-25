import { describe, it, expect } from 'vitest';
import { RetrievalPipeline } from './RetrievalPipeline';
describe('RetrievalPipeline Contract', () => {
  it('should return a context result for a valid query', async () => {
    const p = new RetrievalPipeline();
    const result = await p.retrieveContext('what is cerebro?', 'ws-1');
    expect(result).toBeDefined();
  });
  it('should return result even for empty query (Negative Control)', async () => {
    const p = new RetrievalPipeline();
    const result = await p.retrieveContext('', 'ws-1');
    expect(result).toBeDefined();
  });
});