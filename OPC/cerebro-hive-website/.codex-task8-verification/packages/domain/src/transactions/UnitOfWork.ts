/**
 * An opaque interface representing an ongoing transaction.
 * Repositories will cast this to their required underlying client (e.g. PrismaTransactionClient).
 */
export interface ITransactionContext {}

/**
 * Abstract UnitOfWork. 
 * Allows domain services to execute multiple repository calls atomically.
 */
export interface UnitOfWork {
  execute<T>(work: (tx: ITransactionContext) => Promise<T>): Promise<T>;
}
