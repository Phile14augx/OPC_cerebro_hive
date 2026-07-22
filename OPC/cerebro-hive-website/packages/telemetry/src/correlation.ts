import { AsyncLocalStorage } from 'async_hooks';

export const correlationStorage = new AsyncLocalStorage<string>();

export const withCorrelationId = <T>(id: string, fn: () => T): T => {
  return correlationStorage.run(id, fn);
};

export const getCorrelationId = (): string | undefined => {
  return correlationStorage.getStore();
};
