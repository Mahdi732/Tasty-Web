import { httpClient } from '@/shared/api/http/client';

export const orderApi = {
  create: (token: string, payload: unknown) =>
    httpClient('/api/v1/orders', {
      method: 'POST',
      token,
      body: payload,
    }),
};
