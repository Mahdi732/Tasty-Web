import { API_BASE_URL } from './endpoints';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};
