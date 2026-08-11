import { ILogInterceptor } from './ISandboxRuntime';

export class LogInterceptorPipeline {
  constructor(private readonly interceptors: ILogInterceptor[]) {}

  process(chunk: string): string | null {
    let currentChunk: string | null = chunk;
    
    for (const interceptor of this.interceptors) {
      if (currentChunk === null) break;
      currentChunk = interceptor.intercept(currentChunk);
    }
    
    return currentChunk;
  }
}

export class SecretScrubber implements ILogInterceptor {
  constructor(private readonly secrets: string[]) {}

  intercept(chunk: string): string | null {
    let scrubbed = chunk;
    for (const secret of this.secrets) {
      scrubbed = scrubbed.split(secret).join('[REDACTED]');
    }
    return scrubbed;
  }
}
