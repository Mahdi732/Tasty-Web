import { httpClient } from '@/shared/api/http/client';

export const userApi = {
  getProfile: (token: string) =>
    httpClient('/api/v1/auth/profile', {
      method: 'GET',
      token,
    }),
};
