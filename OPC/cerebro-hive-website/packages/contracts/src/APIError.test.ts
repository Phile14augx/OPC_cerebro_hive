import { describe, it, expect } from 'vitest';
import { APIErrorSchema } from './errors/APIError';

describe('APIError Contract', () => {
  it('should validate a correct API error object', () => {
    const valid = { code: 'ERR_1', message: 'Something went wrong' };
    const result = APIErrorSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should fail validation when domain behavior is incorrect (Negative Control)', () => {
    const invalid = { message: 'Missing code' };
    const result = APIErrorSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
