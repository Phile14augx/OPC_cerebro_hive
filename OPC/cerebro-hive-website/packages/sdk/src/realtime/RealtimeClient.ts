export abstract class RealtimeTransport {
  abstract connect(url: string): void;
  abstract disconnect(): void;
  abstract subscribe(event: string, callback: (data: unknown) => void): void;
}

export class SseTransport extends RealtimeTransport {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Array<(data: unknown) => void>> = new Map();

  connect(url: string) {
    this.eventSource = new EventSource(url);
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const callbacks = this.listeners.get(data.type) || [];
      callbacks.forEach(cb => cb(data.payload));
    };
  }

  disconnect() {
    this.eventSource?.close();
  }

  subscribe(event: string, callback: (data: unknown) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }
}

export class RealtimeClient {
  constructor(private transport: RealtimeTransport = new SseTransport()) {}

  connect(url: string) {
    this.transport.connect(url);
  }

  onLog(callback: (log: unknown) => void) {
    this.transport.subscribe('log', callback);
  }

  onToken(callback: (token: string) => void) {
    this.transport.subscribe('token', (data) => callback(typeof data === 'string' ? data : JSON.stringify(data)));
  }

  disconnect() {
    this.transport.disconnect();
  }
}
