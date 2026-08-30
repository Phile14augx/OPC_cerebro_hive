import { describe, it, expect, beforeEach } from 'vitest';
import { TransformerEngine } from '../src/TransformerEngine';
import { ITransformer, TransformerContext } from '../src/contracts/ITransformer';

class DummyTransformer implements ITransformer<string, string> {
    name = 'dummy';
    version = '1.0.0';

    async transform(input: string, context: TransformerContext): Promise<string> {
        return input.toUpperCase() + ' ' + context.executionId;
    }
}

describe('TransformerEngine', () => {
    let engine: TransformerEngine;

    beforeEach(() => {
        engine = new TransformerEngine();
    });

    it('should register and retrieve a transformer', () => {
        const dummy = new DummyTransformer();
        engine.registerTransformer(dummy);
        
        const retrieved = engine.getTransformer('dummy');
        expect(retrieved).toBeDefined();
        expect(retrieved?.version).toBe('1.0.0');
    });

    it('should execute a registered transformer', async () => {
        engine.registerTransformer(new DummyTransformer());
        
        const result = await engine.execute<string, string>('dummy', 'hello', {
            executionId: 'exec-123',
            metadata: { tenantId: 'test-tenant' }
        });

        expect(result).toBe('HELLO exec-123');
    });

    it('should throw when executing an unregistered transformer', async () => {
        await expect(engine.execute('missing', 'data')).rejects.toThrow('Transformer missing not found');
    });
});
