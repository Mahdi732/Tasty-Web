import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NAV_LINKS, NAV_SCROLL_COLLAPSE_Y } from './Config';
import { useNavbarMorph } from '@/services/navbar/useNavbarMorph';
import { useAuthStore } from '@/services/auth/store';
import { logoutUser } from '@/services/auth/api';
import { getLifecycleRoute, isAccountFullyVerified } from '@/services/auth/lifecycle';

export const useNavbarLogic = () => {
  const router = useRouter();
  const { isCollapsed } = useNavbarMorph(NAV_SCROLL_COLLAPSE_Y);
  const [isMenuOpenRaw, setIsMenuOpenRaw] = useState(false);
  const isMenuOpen = isCollapsed && isMenuOpenRaw;
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const isAuthenticated = Boolean(accessToken);
  const isFullyVerified = isAccountFullyVerified(user);
  const roleSet = new Set(user?.roles || []);
  const lifecycleRoute = getLifecycleRoute(user);
  const continueVerificationHref = lifecycleRoute === '/' ? '/verify-email?step=1' : lifecycleRoute;
  const accountEntryHref = isAuthenticated
    ? (isFullyVerified ? '/dashboard' : continueVerificationHref)
    : '/sign-in';
  const accountEntryLabel = isAuthenticated
    ? (isFullyVerified ? 'Dashboard' : 'Continue Verification')
    : 'Sign In';

  const visibleLinks = NAV_LINKS.filter((link) => {
    if (link.requiresAuth && !isAuthenticated) {
      return false;
    }

    if (link.requiresFullVerification && !isFullyVerified) {
      return false;
    }

    if (link.allowedRoles && link.allowedRoles.length) {
      return link.allowedRoles.some((role) => roleSet.has(role));
    }

    return true;
  });

  const toggleMenu = () => {
    if (!isCollapsed) {
      return;
    }

    setIsMenuOpenRaw((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpenRaw(false);
  };

  const logout = () => {
    void (async () => {
      const token = accessToken;
      clearSession();

      if (token) {
        try {
          await logoutUser(token);
        } catch {
          // noop
        }
      }

      closeMenu();
      router.replace('/');
    })();
  };

  return {
    hydrated,
    user,
    isAuthenticated,
    isFullyVerified,
    visibleLinks,
    accountEntryHref,
    accountEntryLabel,
    isCollapsed,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    logout,
  };
};
