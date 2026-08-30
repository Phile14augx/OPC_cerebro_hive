export * from './contracts';

export class NeuralStudioClient {
  constructor(private config: import('./contracts').NeuralStudioConfig) {}

  public initializeSession(): import('./contracts').StudioSession {
    return {
      id: 'session_' + Math.random().toString(36).substr(2, 9),
      status: 'active'
    };
  }
}
export * from './domain';
