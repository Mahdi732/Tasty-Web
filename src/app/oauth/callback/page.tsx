'use client';

import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { fetchMyProfile } from '@/services/auth/api';
import {
  getReadableAuthError,
  getReadableOAuthCallbackError,
  reportAuthError,
} from '@/services/auth/error-messages';
import { getLifecycleRoute } from '@/services/auth/lifecycle';
import { useAuthStore } from '@/services/auth/store';
import { fetchMyDebtStatus } from '@/services/commerce/api';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

const knownProviders: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '==='.slice((normalized.length + 3) % 4);
  return atob(padded);
};

type JwtPayloadLike = {
  sub?: string;
  roles?: string[];
  status?: string;
  email?: string;
  nickname?: string;
  phoneNumber?: string;
  verification?: {
    email?: boolean;
    phone?: boolean;
    face?: boolean;
  };
};

const buildFallbackUserFromAccessToken = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayloadLike;
    if (!payload.sub) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email || '',
      nickname: payload.nickname || null,
      phoneNumber: payload.phoneNumber,
      roles: Array.isArray(payload.roles) ? payload.roles : ['user'],
      status: payload.status,
      isEmailVerified: Boolean(payload.verification?.email),
      isPhoneVerified: Boolean(payload.verification?.phone),
      isFaceVerified: Boolean(payload.verification?.face),
      isCardVerified: payload.status === 'ACTIVE',
    };
  } catch {
    return null;
  }
};

function OAuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const setAccountDebtLock = useAuthStore((state) => state.setAccountDebtLock);
  const setPendingRegistration = useAuthStore((state) => state.setPendingRegistration);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const provider = useMemo(() => {
    const raw = (searchParams?.get('provider') || '').toLowerCase();
    return knownProviders[raw] || 'OAuth';
  }, [searchParams]);
  const providerKey = useMemo(() => (searchParams?.get('provider') || '').toLowerCase(), [searchParams]);
  const accessToken = useMemo(
    () => searchParams?.get('accessToken') || searchParams?.get('access_token') || searchParams?.get('token') || '',
    [searchParams]
  );
  const callbackError = useMemo(() => searchParams?.get('error') || '', [searchParams]);
  const callbackMode = useMemo(() => (searchParams?.get('mode') || 'login').toLowerCase(), [searchParams]);
  const linkedFlag = useMemo(() => (searchParams?.get('linked') || '').toLowerCase(), [searchParams]);

  useEffect(() => {
    let active = true;

    void (async () => {
      if (callbackError) {
        if (active) {
          setErrorMessage(getReadableOAuthCallbackError(callbackError));
          setIsLoading(false);
        }
        return;
      }

      if (callbackMode === 'link') {
        if (linkedFlag === 'true') {
          router.replace(`/dashboard?oauth=linked&provider=${providerKey || 'oauth'}`);
          return;
        }

        if (active) {
          setErrorMessage('Unable to link OAuth account. Please try again.');
          setIsLoading(false);
        }
        return;
      }

      if (!accessToken) {
        if (active) {
          setErrorMessage('OAuth callback did not return an access token. Please try again.');
          setIsLoading(false);
        }
        return;
      }

      try {
        let profile = null;
        try {
          profile = await fetchMyProfile(accessToken);
        } catch {
          const fallbackUser = buildFallbackUserFromAccessToken(accessToken);
          if (fallbackUser) {
            setSession(fallbackUser, accessToken);

            const debtStatus = await fetchMyDebtStatus(accessToken);
            setAccountDebtLock(debtStatus);
            if (debtStatus.hasOutstandingDebt) {
              router.replace('/account-locked');
              return;
            }

            router.replace(getLifecycleRoute(fallbackUser));
            return;
          }
          throw new Error('Unable to read account profile after OAuth login.');
        }

        if (!active) {
          return;
        }

        setSession(profile, accessToken);

        const debtStatus = await fetchMyDebtStatus(accessToken);
        setAccountDebtLock(debtStatus);
        if (debtStatus.hasOutstandingDebt) {
          router.replace('/account-locked');
          return;
        }

        if (profile.status === 'PENDING_EMAIL_VERIFICATION' || profile.status === 'PENDING_PHONE_VERIFICATION') {
          setPendingRegistration({
            email: profile.email,
            phoneNumber: profile.phoneNumber || '',
            nickname: profile.nickname || undefined,
            password: '',
          });
        }

        router.replace(getLifecycleRoute(profile));
      } catch (error) {
        if (!active) {
          return;
        }

        reportAuthError('oauth-callback.finalize', error);
        const message = getReadableAuthError(error, 'Unable to complete OAuth sign-in.');
        setErrorMessage(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    callbackError,
    callbackMode,
    linkedFlag,
    providerKey,
    router,
    setAccountDebtLock,
    setPendingRegistration,
    setSession,
  ]);

  return (
    <main className={`${outfit.className} tasty-app-bg px-4 py-10`}>
      <div className="mx-auto max-w-xl rounded-3xl border border-white/12 bg-black/35 p-8 shadow-[0_24px_55px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[#ffccb8]">OAuth Callback</p>
        <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.08em] text-[#fff3eb]">Continue with {provider}</h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-[#e2b9a6]">Finishing your sign-in and loading your profile...</p>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm font-semibold text-[#ffd6d7]">{errorMessage}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-in" className="rounded-full bg-[#c61a22] px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white hover:bg-[#a8131a]">
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={(
      <main className={`${outfit.className} tasty-app-bg px-4 py-10`}>
        <div className="mx-auto h-24 max-w-xl animate-pulse rounded-3xl border border-white/12 bg-black/35" />
      </main>
    )}
    >
      <OAuthCallbackPageContent />
    </Suspense>
  );
}
