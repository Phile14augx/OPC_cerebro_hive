export interface TransformerContext {
    executionId: string;
    timestamp: number;
    metadata?: Record<string, any>;
}

export interface ITransformer<TInput = any, TOutput = any> {
    readonly name: string;
    readonly version: string;
    
    transform(input: TInput, context: TransformerContext): Promise<TOutput>;
}
