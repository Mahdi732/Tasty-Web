'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Outfit } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ApiRequestError } from '@/api/client';
import { OAuthProviderButtons } from '@/components/auth/OAuthProviderButtons';
import { fetchMyProfile, loginUser, startEmailVerification, startOAuthLogin } from '@/services/auth/api';
import { getReadableAuthError, reportAuthError } from '@/services/auth/error-messages';
import { getLifecycleRoute } from '@/services/auth/lifecycle';
import { useAuthStore } from '@/services/auth/store';
import { useRequireGuest } from '@/services/auth/hooks';
import { fetchMyDebtStatus } from '@/services/commerce/api';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export default function SignInPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const setAccountDebtLock = useAuthStore((state) => state.setAccountDebtLock);
  const setPendingRegistration = useAuthStore((state) => state.setPendingRegistration);

  const { hydrated, isAuthenticated } = useRequireGuest('/');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOAuthStart = (provider: 'google' | 'facebook') => {
    void (async () => {
      setErrorMessage('');
      setIsOAuthSubmitting(true);

      try {
        await startOAuthLogin({ provider, mode: 'login', platform: 'web' });
      } catch (error) {
        reportAuthError('sign-in.oauth.start', error);
        const message = getReadableAuthError(error, 'Unable to start OAuth login.');
        setErrorMessage(message);
        setIsOAuthSubmitting(false);
      }
    })();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      setErrorMessage('');
      setIsSubmitting(true);

      try {
        const data = await loginUser({
          email: email.trim().toLowerCase(),
          password,
        });

        const profile = await fetchMyProfile(data.accessToken);
        setSession(profile, data.accessToken);

        const debtStatus = await fetchMyDebtStatus(data.accessToken);
        setAccountDebtLock(debtStatus);
        if (debtStatus.hasOutstandingDebt) {
          router.replace('/account-locked');
          return;
        }

        const nextRoute = getLifecycleRoute(profile);
        if (nextRoute.startsWith('/verify-email')) {
          setPendingRegistration({
            email: email.trim().toLowerCase(),
            password,
            phoneNumber: profile.phoneNumber || '',
            nickname: profile.nickname || undefined,
          });
        }

        router.replace(nextRoute);
      } catch (error) {
        if (error instanceof ApiRequestError && error.code === 'EMAIL_NOT_VERIFIED') {
          const normalizedEmail = email.trim().toLowerCase();
          setPendingRegistration({
            email: normalizedEmail,
            password,
            phoneNumber: '',
          });

          try {
            await startEmailVerification(normalizedEmail);
          } catch {
            // Keep navigation even if resend fails; user can retry from verification page.
          }

          router.replace('/verify-email?step=1');
          return;
        }

        reportAuthError('sign-in.submit', error);
        const message = getReadableAuthError(error, 'Unable to sign in.');
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  if (!hydrated || isAuthenticated) {
    return null;
  }

  return (
    <main className={`${outfit.className} relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_14%_10%,#4c120f_0%,#220b0a_44%,#09090b_100%)] px-4 py-6 text-white sm:px-8 sm:py-10`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(233,88,64,0.18),transparent_34%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 rounded-full border border-white/20 bg-white/8 px-4 py-3 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
              Tasty<span className="text-[#b10f18]">.</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
                Home
              </Link>
              <Link href="/sign-up" className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a31116]">
                Sign Up
              </Link>
            </div>
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_28px_80px_rgba(56,14,10,0.4)] backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/80">Welcome Back</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              Sign In
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              Access your orders, rewards, favorites, and fast checkout from your Tasty account.
            </p>

            <OAuthProviderButtons
              onStart={handleOAuthStart}
              disabled={isSubmitting || isOAuthSubmitting}
              isLoading={isOAuthSubmitting}
            />

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/14" />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/70">Or sign in with email</span>
              <span className="h-px flex-1 bg-white/14" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                  placeholder="Enter your password"
                />
              </div>

              {errorMessage ? (
                <p className="text-sm font-semibold text-[#ffe6d8]">{errorMessage}</p>
              ) : null}

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-xs text-white/72">
                  <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent" />
                  Keep me signed in
                </label>
                <Link href="#" className="text-xs font-semibold uppercase tracking-[0.16em] text-white/85 hover:text-white">
                  Forgot password
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In Now'}
              </button>
            </form>
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Tasty food and auth experience" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(200,31,37,0.1)_0%,rgba(49,20,17,0.72)_62%,rgba(36,16,14,0.86)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80">Tasty Member Access</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl">
                Bold Flavor,
                <br />
                Faster Orders
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                Sign in to manage favorites, re-order instantly, and keep every meal in one place.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
