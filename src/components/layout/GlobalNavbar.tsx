'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar/UI';

const HIDE_ON_PATH_PREFIXES = [
  '/sign-in',
  '/sign-up',
  '/verify-email',
  '/verify-phone',
  '/verify-face',
  '/verify-card-id',
  '/oauth/callback',
];

export const GlobalNavbar = () => {
  const pathname = usePathname() || '/';

  const shouldHide = useMemo(
    () => HIDE_ON_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix)),
    [pathname]
  );

  if (shouldHide) {
    return null;
  }

  return <Navbar />;
};
