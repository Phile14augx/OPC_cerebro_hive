import { describe, expect, it } from 'vitest';
import { LogInterceptorPipeline, SecretScrubber } from '../LogInterceptorPipeline';

describe('LogInterceptorPipeline (M26.7)', () => {
  it('scrubs registered secrets from the log stream chunk', () => {
    const pipeline = new LogInterceptorPipeline([
      new SecretScrubber(['super-secret-token', 'AWS_KEY_123'])
    ]);

    const chunk = 'Starting analysis... Token super-secret-token used. Also AWS_KEY_123';
    const processed = pipeline.process(chunk);

    expect(processed).toBe('Starting analysis... Token [REDACTED] used. Also [REDACTED]');
  });

  it('allows safe logs to pass through unmodified', () => {
    const pipeline = new LogInterceptorPipeline([
      new SecretScrubber(['super-secret-token'])
    ]);

    const chunk = 'Everything looks fine here.';
    expect(pipeline.process(chunk)).toBe(chunk);
  });
});
