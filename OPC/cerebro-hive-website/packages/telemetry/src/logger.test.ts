import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger';

describe('Telemetry Logger Contract', () => {
  it('should log info messages without throwing', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.info('Test info message', { requestId: 'req-1' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should log error messages to console.error (Negative Control)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('Something failed', new Error('test error'), { requestId: 'req-2' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
