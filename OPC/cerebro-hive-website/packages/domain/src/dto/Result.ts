import { DomainError } from '../errors/DomainError';

export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly data?: T,
    public readonly error?: DomainError
  ) {}

  static ok<T>(data: T): Result<T> {
    return new Result<T>(true, data, undefined);
  }

  static fail<T>(error: DomainError): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }
}
