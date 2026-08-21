import { describe, it, expect } from 'vitest';
import { EngineeringReviewClient } from './EngineeringReviewClient';

describe('EngineeringReviewClient', () => {
  it('should strip trailing slashes from baseUrl', () => {
    const client = new EngineeringReviewClient({ baseUrl: 'https://api.example.com/' });
    // @ts-ignore - accessing private field for test
    expect(client.config.baseUrl).toBe('https://api.example.com');
  });

  it('should throw an error or handle correctly when domain behavior is incorrect (Negative Control)', () => {
    // Empty baseUrl shouldn't crash constructor but should be tested
    const client = new EngineeringReviewClient({ baseUrl: '' });
    // @ts-ignore
    expect(client.config.baseUrl).toBe('');
  });
});
