type Validator<T> = (payload: unknown) => payload is T;

interface HttpClientOptions {
  baseUrl: string;
  timeoutMs: number;
  defaultHeaders?: Record<string, string>;
}

function normalizeUrl(baseUrl: string, path: string): string {
  const sanitizedBase = baseUrl.replace(/\/+$/, '');
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${sanitizedBase}${sanitizedPath}`;
}

export class HttpClient {
  constructor(private readonly options: HttpClientOptions) {}

  async get<T>(path: string, validator?: Validator<T>): Promise<T> {
    return this.request<T>(path, { method: 'GET' }, validator);
  }

  private async request<T>(
    path: string,
    init: RequestInit,
    validator?: Validator<T>,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch(normalizeUrl(this.options.baseUrl, path), {
        ...init,
        headers: {
          Accept: 'application/json',
          ...this.options.defaultHeaders,
          ...init.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      if (validator && !validator(payload)) {
        throw new Error('External API response did not match expected schema');
      }

      return payload as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
