export interface ServiceResponse<T> {
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  timestamp: string;
  uptime: number;
  checks?: Record<string, { status: string; latency?: number }>;
}
