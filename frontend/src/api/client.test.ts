import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiClientError } from './client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiClient', () => {
  it('unwraps a successful envelope and returns only the data payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { hello: 'world' }, error: null }),
      }))
    );

    const result = await apiClient.get<{ hello: string }>('/anything');
    expect(result).toEqual({ hello: 'world' });
  });

  it('throws a typed ApiClientError carrying the backend error code and message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 404,
        json: async () => ({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'Customer C9999 not found' } }),
      }))
    );

    await expect(apiClient.get('/customers/C9999')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
      message: 'Customer C9999 not found',
    });
  });

  it('surfaces a network/offline failure as a distinct, human-friendly error rather than crashing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );

    let caught: unknown;
    try {
      await apiClient.get('/customers/C1001');
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(ApiClientError);
    expect((caught as ApiClientError).isNetworkError).toBe(true);
  });
});
