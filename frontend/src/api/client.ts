/**
 * Centralized API client.
 *
 * Every request in the application flows through `apiRequest`. It:
 *  - reads the backend base URL from environment configuration (never hard-coded)
 *  - unwraps the standard { success, data, error } envelope
 *  - throws a typed `ApiClientError` on failure or network unavailability,
 *    so callers (React Query hooks) get consistent loading/error/success behavior
 *
 * Do not scatter raw fetch() calls in components — add a resource module
 * under src/api/ instead and call it from a hook.
 */
import type { ApiFailure, ApiResponse, PaginatedResponse, Pagination } from '@/types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number | null;
  /** true when the request never reached the backend (network/CORS failure) */
  public readonly isNetworkError: boolean;

  constructor(message: string, code: string, status: number | null, isNetworkError = false) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = buildUrl(path, options.query);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // fetch() throws on network failure, DNS failure, or a CORS rejection —
    // the browser gives no further detail, so surface a single clear message.
    throw new ApiClientError(
      'Could not reach the banking service. It may be offline or unreachable.',
      'NETWORK_ERROR',
      null,
      true
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      'The banking service returned an unexpected response.',
      'INVALID_RESPONSE',
      response.status
    );
  }

  const envelope = json as ApiResponse<T> | PaginatedResponse<T extends Array<infer U> ? U : never>;

  if (!envelope.success) {
    throw new ApiClientError(
      envelope.error?.message ?? 'Something went wrong.',
      envelope.error?.code ?? 'UNKNOWN_ERROR',
      response.status
    );
  }

  return envelope.data as T;
}

export const apiClient = {
  get: <T>(path: string, query?: RequestOptions['query']) =>
    rawRequest<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown) => rawRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => rawRequest<T>(path, { method: 'PUT', body }),
};

/** For paginated endpoints, where the pagination metadata sits alongside data. */
export async function paginatedRequest<T>(
  path: string,
  query?: RequestOptions['query']
): Promise<{ items: T[]; pagination: Pagination }> {
  const url = buildUrl(path, query);

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ApiClientError(
      'Could not reach the banking service. It may be offline or unreachable.',
      'NETWORK_ERROR',
      null,
      true
    );
  }

  const envelope = (await response.json()) as PaginatedResponse<T> | ApiFailure;

  if (!envelope.success) {
    throw new ApiClientError(
      envelope.error?.message ?? 'Something went wrong.',
      envelope.error?.code ?? 'UNKNOWN_ERROR',
      response.status
    );
  }

  return { items: envelope.data, pagination: envelope.pagination };
}
