import { ApiRequestError } from '@/api/client';

const AUTH_ERROR_USER_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Email or password is not correct.',
  EMAIL_NOT_VERIFIED: 'Please verify your email first, then continue.',
  AUTH_INVALID_VERIFICATION_CODE: 'The verification code is not correct. Please try again.',
  AUTH_VERIFICATION_LOCKED: 'Too many incorrect code attempts. Please wait and request a new code.',
  AUTH_VERIFICATION_COOLDOWN: 'Please wait a moment before requesting another code.',
  AUTH_RATE_LIMITED: 'Too many requests right now. Please try again in a minute.',
  AUTH_UNAUTHORIZED: 'Your session expired. Please sign in again.',
  AUTH_FORBIDDEN: 'This action is not allowed for your account right now.',
  FACE_ACTIVATION_BLOCKED: 'We could not verify your selfie and ID match. Retake both images in good lighting and try again.',
  FACE_SERVICE_UNAVAILABLE: 'Face verification is temporarily unavailable. Please try again shortly.',
  OAUTH_PROVIDER_ERROR: 'OAuth sign-in failed. Please try again.',
  OAUTH_LINK_CONFLICT: 'This OAuth account is already linked to another user.',
  OAUTH_NOT_SUPPORTED: 'This OAuth provider is not available right now.',
};

export const getReadableAuthError = (error: unknown, fallbackMessage: string): string => {
  if (error instanceof ApiRequestError) {
    if (error.userMessage?.trim()) {
      return error.userMessage;
    }

    const mapped = AUTH_ERROR_USER_MESSAGES[error.code];
    if (mapped) {
      return mapped;
    }

    if (error.message?.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message?.trim()) {
    return error.message;
  }

  return fallbackMessage;
};

export const reportAuthError = (context: string, error: unknown): void => {
  if (error instanceof ApiRequestError) {
    console.error(`[${context}]`, {
      status: error.status,
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      requestId: error.requestId,
      details: error.details,
    });
    return;
  }

  console.error(`[${context}]`, error);
};

export const getReadableOAuthCallbackError = (callbackError: string): string => {
  const normalized = callbackError.trim().toUpperCase();
  if (!normalized) {
    return 'OAuth sign-in was canceled or failed. Please try again.';
  }

  if (normalized.includes('ACCESS_DENIED')) {
    return 'OAuth sign-in was canceled. You can try again anytime.';
  }

  if (normalized.includes('INVALID_STATE') || normalized.includes('STATE')) {
    return 'OAuth session expired. Please start sign-in again.';
  }

  if (normalized.includes('OAUTH_LINK_CONFLICT')) {
    return AUTH_ERROR_USER_MESSAGES.OAUTH_LINK_CONFLICT;
  }

  if (normalized.includes('OAUTH_NOT_SUPPORTED')) {
    return AUTH_ERROR_USER_MESSAGES.OAUTH_NOT_SUPPORTED;
  }

  if (normalized.includes('OAUTH_PROVIDER_ERROR')) {
    return AUTH_ERROR_USER_MESSAGES.OAUTH_PROVIDER_ERROR;
  }

  return 'OAuth sign-in failed. Please try again.';
};
