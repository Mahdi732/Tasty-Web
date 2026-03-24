export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export const API_ENDPOINTS = {
  auth: {
    signIn: '/api/auth/sign-in',
    signUp: '/api/auth/sign-up',
  },
  menu: {
    list: '/api/menu',
  },
} as const;
