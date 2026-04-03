import { apiRequest, ApiRequestError } from '@/api/client';
import {
  API_ENDPOINTS,
  buildOAuthLinkPath,
  buildOAuthStartPath,
  buildOAuthUnlinkPath,
  buildSessionRevokePath,
} from '@/api/endpoints';
import type {
  ActivateAccountPayload,
  AuthUser,
  LoginPayload,
  LoginResult,
  OAuthStartInput,
  OAuthStartResult,
  OAuthUnlinkResult,
  RefreshResult,
  RegisterPayload,
  UserSession,
} from './types';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  error?: { code?: string; message?: string };
}

interface RegisterResult {
  user: AuthUser;
  verificationRequired: boolean;
}

interface RegisterGatewayResult {
  success?: boolean;
  user_id?: string;
  email?: string;
  nickname?: string;
  roles?: string[];
  message?: string;
}

interface VerificationResult {
  sent?: boolean;
  verified?: boolean;
  code?: string;
}

interface ActivateAccountResult {
  activated: boolean;
  profile: AuthUser;
}

type ProfileGatewayResult = {
  userId?: string;
  email?: string;
  nickname?: string;
  phoneNumber?: string;
  roles?: string[];
  status?: string;
  verification?: {
    email?: boolean;
    phone?: boolean;
    face?: boolean;
  };
};

const normalizeAuthUser = (raw: unknown): AuthUser => {
  const data = (raw || {}) as AuthUser & ProfileGatewayResult;
  const status = String(data.status || '').toUpperCase();

  const derivedEmailVerified =
    status === 'PENDING_PHONE_VERIFICATION'
    || status === 'PENDING_FACE_ACTIVATION'
    || status === 'ACTIVE';

  const derivedPhoneVerified = status === 'PENDING_FACE_ACTIVATION' || status === 'ACTIVE';
  const derivedFaceVerified = status === 'ACTIVE';
  const derivedCardVerified = status === 'ACTIVE';

  return {
    id: data.id || data.userId || '',
    email: data.email || '',
    nickname: data.nickname || null,
    phoneNumber: data.phoneNumber,
    roles: Array.isArray(data.roles) ? data.roles : [],
    status: data.status,
    isEmailVerified:
      typeof data.isEmailVerified === 'boolean'
        ? data.isEmailVerified
        : (typeof data.verification?.email === 'boolean' ? data.verification.email : derivedEmailVerified),
    isPhoneVerified:
      typeof data.isPhoneVerified === 'boolean'
        ? data.isPhoneVerified
        : (typeof data.verification?.phone === 'boolean' ? data.verification.phone : derivedPhoneVerified),
    isFaceVerified:
      typeof data.isFaceVerified === 'boolean'
        ? data.isFaceVerified
        : (typeof data.verification?.face === 'boolean' ? data.verification.face : derivedFaceVerified),
    isCardVerified:
      typeof data.isCardVerified === 'boolean'
        ? data.isCardVerified
        : derivedCardVerified,
  };
};

const unwrapData = <T>(payload: ApiEnvelope<T>): T => {
  if (!payload?.success) {
    throw new ApiRequestError(payload?.error?.message || 'Request failed', 400, payload?.error?.code || 'REQUEST_FAILED', payload);
  }
  return payload.data;
};

export const registerUser = async (input: RegisterPayload): Promise<RegisterResult> => {
  const payload = await apiRequest<ApiEnvelope<RegisterResult | RegisterGatewayResult>>(API_ENDPOINTS.auth.register, {
    method: 'POST',
    body: input,
  });

  const data = unwrapData(payload);
  if ('user' in data) {
    return {
      user: normalizeAuthUser(data.user),
      verificationRequired: Boolean(data.verificationRequired),
    };
  }

  return {
    user: normalizeAuthUser({
      id: data.user_id,
      email: data.email,
      nickname: data.nickname || null,
      roles: data.roles || ['user'],
      status: 'PENDING_EMAIL_VERIFICATION',
      isEmailVerified: false,
      isPhoneVerified: false,
      isFaceVerified: false,
    }),
    verificationRequired: true,
  };
};

export const loginUser = async (input: LoginPayload): Promise<LoginResult> => {
  const payload = await apiRequest<ApiEnvelope<LoginResult & {
    access_token?: string;
    refresh_token?: string;
    access_token_expires_in?: number;
  }>>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: input,
  });

  const data = unwrapData(payload);
  const accessToken = data.accessToken || data.access_token || '';
  if (!accessToken) {
    throw new ApiRequestError(
      'Login succeeded but access token is missing in gateway response.',
      500,
      'ACCESS_TOKEN_MISSING',
      payload
    );
  }

  return {
    ...data,
    accessToken,
    refreshToken: data.refreshToken || data.refresh_token,
    accessTokenExpiresIn: data.accessTokenExpiresIn || data.access_token_expires_in || 0,
    user: normalizeAuthUser(data.user),
  };
};

export const refreshSession = async (refreshToken?: string): Promise<RefreshResult> => {
  const payload = await apiRequest<ApiEnvelope<{
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
    accessTokenExpiresIn?: number;
    access_token_expires_in?: number;
  }>>(API_ENDPOINTS.auth.refresh, {
    method: 'POST',
    body: refreshToken ? { refreshToken } : {},
    skipAuthRefresh: true,
  });

  const data = unwrapData(payload);
  const accessToken = data.accessToken || data.access_token || '';
  if (!accessToken) {
    throw new ApiRequestError(
      'Refresh succeeded but access token is missing in gateway response.',
      500,
      'ACCESS_TOKEN_MISSING',
      payload
    );
  }

  return {
    accessToken,
    refreshToken: data.refreshToken || data.refresh_token,
    accessTokenExpiresIn: data.accessTokenExpiresIn || data.access_token_expires_in || 0,
  };
};

export const fetchMyProfile = async (token: string): Promise<AuthUser> => {
  const payload = await apiRequest<ApiEnvelope<AuthUser | ProfileGatewayResult>>(API_ENDPOINTS.auth.me, {
    method: 'GET',
    token,
  });
  return normalizeAuthUser(unwrapData(payload));
};

export const startEmailVerification = async (email: string): Promise<VerificationResult> => {
  const payload = await apiRequest<ApiEnvelope<VerificationResult>>(API_ENDPOINTS.auth.startEmailVerification, {
    method: 'POST',
    body: { email },
  });
  return unwrapData(payload);
};

export const verifyEmailCode = async (email: string, code: string): Promise<VerificationResult> => {
  const payload = await apiRequest<ApiEnvelope<VerificationResult>>(API_ENDPOINTS.auth.verifyEmail, {
    method: 'POST',
    body: { email, code },
  });
  return unwrapData(payload);
};

export const startPhoneVerification = async (phoneNumber: string, token: string): Promise<VerificationResult> => {
  const payload = await apiRequest<ApiEnvelope<VerificationResult>>(API_ENDPOINTS.auth.startPhoneVerification, {
    method: 'POST',
    body: { phoneNumber },
    token,
  });
  return unwrapData(payload);
};

export const verifyPhoneCode = async (
  phoneNumber: string,
  code: string,
  token: string
): Promise<VerificationResult> => {
  const payload = await apiRequest<ApiEnvelope<VerificationResult>>(API_ENDPOINTS.auth.verifyPhone, {
    method: 'POST',
    body: { phoneNumber, code },
    token,
  });
  return unwrapData(payload);
};

export const activateAccount = async (
  input: ActivateAccountPayload,
  token: string
): Promise<ActivateAccountResult> => {
  const payload = await apiRequest<ApiEnvelope<ActivateAccountResult>>(API_ENDPOINTS.auth.activateAccount, {
    method: 'POST',
    body: input,
    token,
  });

  const data = unwrapData(payload);
  return {
    ...data,
    profile: normalizeAuthUser(data.profile),
  };
};

export const logoutUser = async (token: string): Promise<void> => {
  await apiRequest<ApiEnvelope<{ revoked: boolean }>>(API_ENDPOINTS.auth.logout, {
    method: 'POST',
    body: {},
    token,
  });
};

export const logoutAllSessions = async (
  token: string,
  exceptCurrentSession = true
): Promise<{ revokedSessions: number }> => {
  const payload = await apiRequest<ApiEnvelope<{ revokedSessions: number }>>(API_ENDPOINTS.auth.logoutAll, {
    method: 'POST',
    body: { exceptCurrentSession },
    token,
  });

  return unwrapData(payload);
};

export const listUserSessions = async (token: string): Promise<UserSession[]> => {
  const payload = await apiRequest<ApiEnvelope<UserSession[]>>(API_ENDPOINTS.auth.sessions, {
    method: 'GET',
    token,
  });

  return unwrapData(payload);
};

export const revokeUserSession = async (sessionId: string, token: string): Promise<{ revoked: boolean }> => {
  const payload = await apiRequest<ApiEnvelope<{ revoked: boolean }>>(buildSessionRevokePath(sessionId), {
    method: 'DELETE',
    token,
  });

  return unwrapData(payload);
};

const buildOAuthAppRedirect = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/oauth/callback`;
};

export const startOAuthAuthorization = async (
  input: OAuthStartInput
): Promise<OAuthStartResult> => {
  const params = new URLSearchParams({
    mode: input.mode || 'login',
    platform: input.platform || 'web',
  });

  const appRedirect = buildOAuthAppRedirect();
  if (appRedirect) {
    params.set('appRedirect', appRedirect);
  }

  const payload = await apiRequest<ApiEnvelope<OAuthStartResult>>(
    `${buildOAuthStartPath(input.provider)}?${params.toString()}`,
    {
      method: 'GET',
    }
  );

  return unwrapData(payload);
};

export const startOAuthLogin = async (input: OAuthStartInput): Promise<void> => {
  const result = await startOAuthAuthorization(input);
  if (!result.authorizationUrl) {
    throw new ApiRequestError('OAuth start response is missing authorization URL', 500, 'OAUTH_START_INVALID');
  }

  if (typeof window !== 'undefined') {
    window.location.assign(result.authorizationUrl);
  }
};

export const startOAuthLink = async (provider: 'google' | 'facebook', token: string): Promise<void> => {
  const appRedirect = buildOAuthAppRedirect();

  const payload = await apiRequest<ApiEnvelope<OAuthStartResult>>(buildOAuthLinkPath(provider), {
    method: 'POST',
    token,
    body: {
      platform: 'web',
      ...(appRedirect ? { appRedirect } : {}),
    },
  });

  const result = unwrapData(payload);
  if (!result.authorizationUrl) {
    throw new ApiRequestError('OAuth link response is missing authorization URL', 500, 'OAUTH_LINK_INVALID');
  }

  if (typeof window !== 'undefined') {
    window.location.assign(result.authorizationUrl);
  }
};

export const unlinkOAuthProvider = async (
  provider: 'google' | 'facebook',
  token: string
): Promise<OAuthUnlinkResult> => {
  const payload = await apiRequest<ApiEnvelope<OAuthUnlinkResult>>(buildOAuthUnlinkPath(provider), {
    method: 'DELETE',
    token,
  });

  return unwrapData(payload);
};
