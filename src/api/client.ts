import { API_BASE_URL } from './endpoints';

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown;
  token?: string | null;
  baseUrl?: string;
  headers?: HeadersInit;
  skipAuthRefresh?: boolean;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;
  details: unknown;
  userMessage: string;
  requestId: string | null;

  constructor(
    message: string,
    status: number,
    code = 'REQUEST_FAILED',
    details: unknown = null,
    userMessage?: string,
    requestId?: string | null,
  ) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.userMessage = userMessage || message;
    this.requestId = requestId || null;
  }
}

const LOCAL_HTTPS_ORIGIN = 'https://localhost';
const LOCAL_HTTP_FALLBACK_ORIGIN = 'http://localhost:8080';
const AUTH_REFRESH_PATH = '/api/v1/auth/refresh';
const AUTH_LOGIN_PATH = '/api/v1/auth/login';
const AUTH_REGISTER_PATH = '/api/v1/auth/register';

const shouldRetryWithHttpFallback = (error: unknown, baseUrl: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!(error instanceof TypeError)) {
    return false;
  }

  if (!baseUrl.startsWith(LOCAL_HTTPS_ORIGIN)) {
    return false;
  }

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const asRecord = (value: unknown): Record<string, unknown> =>
  (value && typeof value === 'object' ? value as Record<string, unknown> : {});

const parseJsonSafe = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const performFetch = async (url: string, config: RequestInit, baseUrl: string): Promise<Response> => {
  try {
    return await fetch(url, config);
  } catch (error) {
    if (!shouldRetryWithHttpFallback(error, baseUrl)) {
      throw error;
    }

    const fallbackUrl = url.replace(LOCAL_HTTPS_ORIGIN, LOCAL_HTTP_FALLBACK_ORIGIN);
    return fetch(fallbackUrl, config);
  }
};

const extractAccessToken = (payload: unknown): string => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const nested = asRecord(data.data);

  const token =
    root.accessToken || root.access_token ||
    data.accessToken || data.access_token ||
    nested.accessToken || nested.access_token;

  return typeof token === 'string' ? token : '';
};

const syncTokenInAuthStore = async (token: string): Promise<void> => {
  if (!token || typeof window === 'undefined') {
    return;
  }

  try {
    const { useAuthStore } = await import('@/services/auth/store');
    const state = useAuthStore.getState();
    if (state.user) {
      state.setSession(state.user, token);
    }
  } catch {
    // noop
  }
};

const tryRefreshAccessToken = async (baseUrl: string): Promise<string> => {
  const response = await performFetch(`${baseUrl}${AUTH_REFRESH_PATH}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  }, baseUrl);

  if (!response.ok) {
    return '';
  }

  const payload = await parseJsonSafe(response);
  const token = extractAccessToken(payload);
  if (token) {
    await syncTokenInAuthStore(token);
  }
  return token;
};

const shouldAttemptAuthRefresh = (path: string, skipAuthRefresh: boolean): boolean => {
  if (skipAuthRefresh) {
    return false;
  }

  if (
    path.startsWith(AUTH_REFRESH_PATH)
    || path.startsWith(AUTH_LOGIN_PATH)
    || path.startsWith(AUTH_REGISTER_PATH)
  ) {
    return false;
  }

  return true;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { skipAuthRefresh = false, ...requestOptions } = options;

  const requestConfig: RequestInit = {
    ...requestOptions,
    credentials: requestOptions.credentials ?? 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(requestOptions.token ? { Authorization: `Bearer ${requestOptions.token}` } : {}),
      ...(requestOptions.headers ?? {}),
    },
    body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
  };

  const primaryBaseUrl = requestOptions.baseUrl ?? API_BASE_URL;

  let response = await performFetch(`${primaryBaseUrl}${path}`, requestConfig, primaryBaseUrl);
  let payload = await parseJsonSafe(response);

  if (
    response.status === 401
    && shouldAttemptAuthRefresh(path, skipAuthRefresh)
  ) {
    const refreshedToken = await tryRefreshAccessToken(primaryBaseUrl);
    if (refreshedToken) {
      const retryConfig: RequestInit = {
        ...requestConfig,
        headers: {
          ...(requestConfig.headers ?? {}),
          Authorization: `Bearer ${refreshedToken}`,
        },
      };

      response = await performFetch(`${primaryBaseUrl}${path}`, retryConfig, primaryBaseUrl);
      payload = await parseJsonSafe(response);
    }
  }

  if (!response.ok) {
    const normalized = payload as {
      error?: { code?: string; message?: string; userMessage?: string; requestId?: string };
      message?: string;
    } | null;

    const message = normalized?.error?.message || normalized?.message || `Request failed: ${response.status}`;
    const userMessage = normalized?.error?.userMessage || message;
    const requestId = normalized?.error?.requestId || null;
    const code = normalized?.error?.code || 'REQUEST_FAILED';
    throw new ApiRequestError(message, response.status, code, payload, userMessage, requestId);
  }

  return payload as T;
};
