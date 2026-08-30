import { ITransformer, TransformerContext } from './ITransformer';

export interface ITransformerEngine {
    registerTransformer(transformer: ITransformer): void;
    getTransformer(name: string): ITransformer | undefined;
    execute<TInput, TOutput>(
        transformerName: string, 
        input: TInput, 
        context?: Partial<TransformerContext>
    ): Promise<TOutput>;
}
