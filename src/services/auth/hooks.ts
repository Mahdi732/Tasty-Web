'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './store';
import { getLifecycleRoute, isAccountFullyVerified } from './lifecycle';
import { fetchMyDebtStatus } from '@/services/commerce/api';

export const useRequireGuest = (redirectTo = '/') => {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const accountDebtLock = useAuthStore((state) => state.accountDebtLock);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (accessToken) {
      if (accountDebtLock?.hasOutstandingDebt) {
        router.replace('/account-locked');
        return;
      }

      const nextRoute = getLifecycleRoute(user);
      router.replace(nextRoute || redirectTo);
    }
  }, [hydrated, accessToken, user, accountDebtLock, redirectTo, router]);

  return { hydrated, isAuthenticated: Boolean(accessToken), user };
};

export const useRequireAuth = (redirectTo = '/sign-in') => {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const accountDebtLock = useAuthStore((state) => state.accountDebtLock);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!accessToken) {
      router.replace(redirectTo);
      return;
    }

    if (accountDebtLock?.hasOutstandingDebt) {
      router.replace('/account-locked');
    }
  }, [hydrated, accessToken, accountDebtLock, redirectTo, router]);

  return { hydrated, accessToken, user };
};

export const useRequireFullyVerified = (redirectTo = '/sign-in') => {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const accountDebtLock = useAuthStore((state) => state.accountDebtLock);
  const setAccountDebtLock = useAuthStore((state) => state.setAccountDebtLock);

  useEffect(() => {
    let active = true;

    if (!hydrated) {
      return;
    }

    if (!accessToken) {
      router.replace(redirectTo);
      return;
    }

    if (!user) {
      return;
    }

    if (!isAccountFullyVerified(user)) {
      const lifecycleRoute = getLifecycleRoute(user);
      router.replace(lifecycleRoute === '/' ? '/verify-email?step=1' : lifecycleRoute);
      return;
    }

    void (async () => {
      try {
        const debtStatus = await fetchMyDebtStatus(accessToken);
        if (!active) {
          return;
        }

        setAccountDebtLock(debtStatus);
        if (debtStatus.hasOutstandingDebt) {
          router.replace('/account-locked');
        }
      } catch {
        if (!active) {
          return;
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [hydrated, accessToken, user, redirectTo, router, setAccountDebtLock]);

  return {
    hydrated,
    accessToken,
    user,
    accountDebtLock,
    isFullyVerified: isAccountFullyVerified(user),
  };
};
