'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPhonePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/verify-email?step=2');
  }, [router]);

  return null;
}
