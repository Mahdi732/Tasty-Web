import type { AuthLifecycleStatus, AuthUser } from './types';

const KNOWN_STATUSES: AuthLifecycleStatus[] = [
  'PENDING_EMAIL_VERIFICATION',
  'PENDING_PHONE_VERIFICATION',
  'PENDING_FACE_ACTIVATION',
  'ACTIVE',
  'ARCHIVED',
];

export const normalizeLifecycleStatus = (
  status: string | undefined | null
): AuthLifecycleStatus | null => {
  if (!status) {
    return null;
  }

  const normalized = status.trim().toUpperCase() as AuthLifecycleStatus;
  return KNOWN_STATUSES.includes(normalized) ? normalized : null;
};

export const getLifecycleRoute = (user: AuthUser | null | undefined): string => {
  const status = normalizeLifecycleStatus(user?.status);

  if (status === 'PENDING_EMAIL_VERIFICATION') {
    return '/verify-email?step=1';
  }

  if (status === 'PENDING_PHONE_VERIFICATION') {
    return '/verify-email?step=2';
  }

  if (status === 'PENDING_FACE_ACTIVATION') {
    return '/verify-face';
  }

  if (status === 'ACTIVE') {
    return '/';
  }

  if (status === 'ARCHIVED') {
    return '/sign-in';
  }

  if (typeof user?.isEmailVerified === 'boolean' && !user.isEmailVerified) {
    return '/verify-email?step=1';
  }

  if (typeof user?.isPhoneVerified === 'boolean' && !user.isPhoneVerified) {
    return '/verify-email?step=2';
  }

  if (
    (typeof user?.isFaceVerified === 'boolean' && !user.isFaceVerified)
    || (typeof user?.isCardVerified === 'boolean' && !user.isCardVerified)
  ) {
    return '/verify-face';
  }

  return '/';
};

export const isAccountFullyVerified = (user: AuthUser | null | undefined): boolean => {
  const status = normalizeLifecycleStatus(user?.status);
  return status === 'ACTIVE';
};

export const getStatusLabel = (status: string | undefined): string => {
  const normalized = normalizeLifecycleStatus(status);
  if (!normalized) {
    return 'SIGNED_IN';
  }

  if (normalized === 'PENDING_EMAIL_VERIFICATION') {
    return 'EMAIL_PENDING';
  }

  if (normalized === 'PENDING_PHONE_VERIFICATION') {
    return 'PHONE_PENDING';
  }

  if (normalized === 'PENDING_FACE_ACTIVATION') {
    return 'FACE_PENDING';
  }

  return normalized;
};

