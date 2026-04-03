import type { OAuthProvider } from '@/api/endpoints';

export type AuthLifecycleStatus =
  | 'PENDING_EMAIL_VERIFICATION'
  | 'PENDING_PHONE_VERIFICATION'
  | 'PENDING_FACE_ACTIVATION'
  | 'ACTIVE'
  | 'ARCHIVED';

export interface AuthUser {
  id: string;
  email: string;
  nickname: string | null;
  phoneNumber?: string;
  roles: string[];
  status?: AuthLifecycleStatus | string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isFaceVerified?: boolean;
  isCardVerified?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  phoneNumber: string;
  nickname?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceId?: string;
}

export interface LoginResult {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken?: string;
}

export interface RefreshResult {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken?: string;
}

export interface PendingRegistration {
  email: string;
  password: string;
  phoneNumber: string;
  nickname?: string;
}

export interface ActivateAccountPayload {
  imageBase64: string;
  idCardImageBase64: string;
}

export interface OAuthStartResult {
  authorizationUrl: string;
  state: string;
  mode: 'login' | 'link';
  platform: string;
  clientType: 'public' | 'confidential' | string;
  pkceRequired: boolean;
}

export interface OAuthStartInput {
  provider: OAuthProvider;
  mode?: 'login' | 'link';
  platform?: 'web' | 'mobile' | 'desktop' | 'android' | 'ios';
}

export interface OAuthUnlinkResult {
  unlinked: boolean;
  provider: OAuthProvider;
}

export interface UserSession {
  sessionId: string;
  familyId: string;
  userAgent: string;
  deviceId: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  revokedAt: string | null;
}
