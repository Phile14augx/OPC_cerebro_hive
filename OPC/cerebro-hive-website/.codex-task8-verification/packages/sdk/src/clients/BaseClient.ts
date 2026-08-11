export class SDKError extends Error {
  constructor(
    public status: number,
    public problem: any,
    message?: string
  ) {
    super(message || problem.detail || 'SDK Error');
    this.name = 'SDKError';
  }
}

export abstract class BaseClient {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, headers: Record<string, string> = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
  }

  protected async fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers
      }
    });

    if (!res.ok) {
      let problem = await res.json().catch(() => null);
      if (!problem) {
        problem = { title: 'Unknown Error', detail: res.statusText };
      }
      throw new SDKError(res.status, problem);
    }

    const data = await res.json();
    return data as T;
  }
}
