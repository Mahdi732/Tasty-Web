import { api } from '../lib/api';
import type { ApiResponse, LoginResponse, RegisterPayload, VerifyEmailPayload } from '../types';

const AUTH_PREFIX = '/api/v1/user';

export const authService = {
    register(payload: RegisterPayload) {
        return api.post<ApiResponse<unknown>>(`${AUTH_PREFIX}/auth/register`, payload);
    },

    login(payload: RegisterPayload) {
        return api.post<ApiResponse<LoginResponse>>(`${AUTH_PREFIX}/auth/login`, payload);
    },

    startVerification(email: string) {
        return api.post<ApiResponse>(`${AUTH_PREFIX}/auth/email/start-verification`, { email });
    },

    verifyEmail(payload: VerifyEmailPayload) {
        return api.post<ApiResponse>(`${AUTH_PREFIX}/auth/email/verify`, payload);
    },

    getMe() {
        return api.get<ApiResponse>(`${AUTH_PREFIX}/auth/me`);
    },
};
