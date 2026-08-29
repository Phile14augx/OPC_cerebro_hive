export const MAX_RESULTS = 1000;

const NAMESPACE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const VECTOR_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InputValidationError';
  }
}

export function validateNamespace(namespace: string): void {
  if (typeof namespace !== 'string' || namespace.length > 128 || !namespace.split('/').every((part) => NAMESPACE_SEGMENT.test(part))) {
    throw new InputValidationError('namespace must contain safe hierarchical identifier segments');
  }
}

export function validateId(id: string, label = 'vector id'): void {
  if (typeof id !== 'string' || !VECTOR_ID.test(id)) {
    throw new InputValidationError(`${label} is invalid`);
  }
}

export function validateVector(vector: number[], label = 'vector'): void {
  if (!Array.isArray(vector) || vector.length === 0 || !vector.every(Number.isFinite)) {
    throw new InputValidationError(`${label} must be a non-empty finite numeric array`);
  }
}

export function validateLimit(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 1 || value > MAX_RESULTS) {
    throw new InputValidationError(`${label} must be an integer between 1 and ${MAX_RESULTS}`);
  }
}
