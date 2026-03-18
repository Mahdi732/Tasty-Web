import { env } from '@/shared/config/env';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  token?: string;
}

export const httpClient = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', headers, body, token } = options;

  const response = await fetch(`${env.gatewayUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} on ${path}`);
  }

  return (await response.json()) as T;
};
