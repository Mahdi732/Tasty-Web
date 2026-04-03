'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import {
  fetchMyProfile,
  loginUser,
  startEmailVerification,
  startPhoneVerification,
  verifyEmailCode,
  verifyPhoneCode,
} from '@/services/auth/api';
import { getReadableAuthError, reportAuthError } from '@/services/auth/error-messages';
import { getLifecycleRoute } from '@/services/auth/lifecycle';
import { useAuthStore } from '@/services/auth/store';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

const EMAIL_CODE_LENGTH = 6;
const PHONE_CODE_LENGTH = 4;
type VerificationStep = 1 | 2 | 3;

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const createEmptyCode = (length: number) => Array.from({ length }, () => '');

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const pendingRegistration = useAuthStore((state) => state.pendingRegistration);
  const setSession = useAuthStore((state) => state.setSession);
  const setPendingRegistration = useAuthStore((state) => state.setPendingRegistration);
  const [step, setStep] = useState<VerificationStep>(1);
  const [emailCode, setEmailCode] = useState<string[]>(createEmptyCode(EMAIL_CODE_LENGTH));
  const [phone, setPhone] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [phoneCode, setPhoneCode] = useState<string[]>(createEmptyCode(PHONE_CODE_LENGTH));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const emailInputs = useRef<Array<HTMLInputElement | null>>([]);
  const phoneInputs = useRef<Array<HTMLInputElement | null>>([]);

  const emailCodeComplete = emailCode.every((digit) => digit.length === 1);
  const phoneNumberValid = onlyDigits(phone).length >= 8;
  const phoneCodeComplete = phoneCode.every((digit) => digit.length === 1);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (accessToken && user) {
      const nextRoute = getLifecycleRoute(user);

      if (nextRoute === '/') {
        void (async () => {
          try {
            const profile = await fetchMyProfile(accessToken);
            setSession(profile, accessToken);

            const refreshedRoute = getLifecycleRoute(profile);
            if (refreshedRoute === '/verify-face') {
              router.replace(refreshedRoute);
              return;
            }

            if (refreshedRoute.includes('step=2')) {
              setStep(2);
              if (profile.phoneNumber) {
                setPhone(profile.phoneNumber);
              }
              return;
            }

            if (refreshedRoute === '/') {
              router.replace('/');
            }
          } catch {
            router.replace('/sign-in');
          }
        })();
        return;
      }

      if (nextRoute === '/verify-face') {
        router.replace(nextRoute);
        return;
      }

      if (nextRoute.includes('step=2')) {
        setStep(2);
      }

      if (user.phoneNumber) {
        setPhone(user.phoneNumber);
      }

      return;
    }

    if (!pendingRegistration) {
      router.replace('/sign-in');
      return;
    }

    setPhone(pendingRegistration.phoneNumber);

    const requestedStep = Number(searchParams?.get('step'));
    if (requestedStep === 2 && accessToken) {
      setStep(2);
    }
  }, [hydrated, accessToken, user, pendingRegistration, router, searchParams, setSession]);

  const focusEmailInput = (index: number) => {
    const target = emailInputs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const focusPhoneInput = (index: number) => {
    const target = phoneInputs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleEmailCodeChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextDigit = onlyDigits(event.target.value).slice(-1);

    setEmailCode((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < EMAIL_CODE_LENGTH - 1) {
      focusEmailInput(index + 1);
    }
  };

  const handleEmailCodeKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && emailCode[index] === '' && index > 0) {
      event.preventDefault();
      focusEmailInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusEmailInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < EMAIL_CODE_LENGTH - 1) {
      event.preventDefault();
      focusEmailInput(index + 1);
    }
  };

  const handleEmailCodePaste = (
    event: ClipboardEvent<HTMLInputElement>,
  ) => {
    const pasted = onlyDigits(event.clipboardData.getData('text')).slice(0, EMAIL_CODE_LENGTH);
    if (!pasted) {
      return;
    }

    event.preventDefault();

    setEmailCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < EMAIL_CODE_LENGTH; i += 1) {
        next[i] = pasted[i] ?? '';
      }
      return next;
    });

    focusEmailInput(Math.min(pasted.length, EMAIL_CODE_LENGTH - 1));
  };

  const handlePhoneCodeChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const nextDigit = onlyDigits(event.target.value).slice(-1);

    setPhoneCode((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < PHONE_CODE_LENGTH - 1) {
      focusPhoneInput(index + 1);
    }
  };

  const handlePhoneCodeKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && phoneCode[index] === '' && index > 0) {
      event.preventDefault();
      focusPhoneInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusPhoneInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < PHONE_CODE_LENGTH - 1) {
      event.preventDefault();
      focusPhoneInput(index + 1);
    }
  };

  const handlePhoneCodePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = onlyDigits(event.clipboardData.getData('text')).slice(0, PHONE_CODE_LENGTH);
    if (!pasted) {
      return;
    }

    event.preventDefault();

    setPhoneCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < PHONE_CODE_LENGTH; i += 1) {
        next[i] = pasted[i] ?? '';
      }
      return next;
    });

    focusPhoneInput(Math.min(pasted.length, PHONE_CODE_LENGTH - 1));
  };

  const submitEmailCode = (event: FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      const verificationEmail = (pendingRegistration?.email || user?.email || '').trim().toLowerCase();
      if (!emailCodeComplete || !verificationEmail) {
        return;
      }

      setIsSubmitting(true);
      setErrorMessage('');

      try {
        await verifyEmailCode(verificationEmail, emailCode.join(''));

        let token = accessToken;
        if (!token && pendingRegistration?.password) {
          const loginResult = await loginUser({
            email: verificationEmail,
            password: pendingRegistration.password,
          });
          token = loginResult.accessToken;
          setSession(loginResult.user, loginResult.accessToken);
        }

        if (!token) {
          setErrorMessage('Unable to continue. Please sign in again.');
          return;
        }

        const profile = await fetchMyProfile(token);
        setSession(profile, token);
        if (pendingRegistration) {
          setPendingRegistration({
            ...pendingRegistration,
            phoneNumber: profile.phoneNumber || pendingRegistration.phoneNumber,
          });
        }

        const nextRoute = getLifecycleRoute(profile);
        if (nextRoute.includes('step=2')) {
          setStep(2);
          if (profile.phoneNumber) {
            setPhone(profile.phoneNumber);
          }
          return;
        }

        router.replace(nextRoute);
      } catch (error) {
        reportAuthError('verify-email.submit-email-code', error);
        const message = getReadableAuthError(error, 'Unable to verify email code.');
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const submitPhoneNumber = (event: FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      if (!phoneNumberValid || !accessToken) {
        if (!accessToken) {
          setErrorMessage('You are not authenticated. Please register again.');
        }
        return;
      }

      setIsSubmitting(true);
      setErrorMessage('');

      try {
        const normalizedPhone = phone.trim();
        await startPhoneVerification(normalizedPhone, accessToken);

        setVerifiedPhone(normalizedPhone);
        setPhoneCode(createEmptyCode(PHONE_CODE_LENGTH));
        setStep(3);

        setTimeout(() => {
          focusPhoneInput(0);
        }, 0);
      } catch (error) {
        reportAuthError('verify-email.submit-phone-number', error);
        const message = getReadableAuthError(error, 'Unable to send phone verification code.');
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const submitPhoneCode = (event: FormEvent<HTMLFormElement>) => {
    void (async () => {
      event.preventDefault();
      if (!phoneCodeComplete || !accessToken) {
        if (!accessToken) {
          setErrorMessage('You are not authenticated. Please sign in again.');
        }
        return;
      }

      setIsSubmitting(true);
      setErrorMessage('');

      try {
        await verifyPhoneCode(verifiedPhone || phone.trim(), phoneCode.join(''), accessToken);

        const profile = await fetchMyProfile(accessToken);
        setSession(profile, accessToken);
        router.push(getLifecycleRoute(profile));
      } catch (error) {
        reportAuthError('verify-email.submit-phone-code', error);
        const message = getReadableAuthError(error, 'Unable to verify phone code.');
        setErrorMessage(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const resendEmailCode = () => {
    void (async () => {
      const verificationEmail = (pendingRegistration?.email || user?.email || '').trim().toLowerCase();
      if (!verificationEmail) {
        return;
      }

      setErrorMessage('');
      try {
        await startEmailVerification(verificationEmail);
      } catch (error) {
        reportAuthError('verify-email.resend-email-code', error);
        const message = getReadableAuthError(error, 'Unable to resend email code.');
        setErrorMessage(message);
      }
    })();
  };

  const resendPhoneCode = () => {
    void (async () => {
      if (!accessToken) {
        setErrorMessage('You are not authenticated. Please sign in again.');
        return;
      }

      const targetPhone = (verifiedPhone || phone).trim();
      if (onlyDigits(targetPhone).length < 8) {
        setErrorMessage('Enter a valid phone number first.');
        return;
      }

      setErrorMessage('');
      try {
        await startPhoneVerification(targetPhone, accessToken);
      } catch (error) {
        reportAuthError('verify-email.resend-phone-code', error);
        const message = getReadableAuthError(error, 'Unable to resend phone code.');
        setErrorMessage(message);
      }
    })();
  };

  if (!hydrated) {
    return null;
  }

  const emailCodeLabel = emailCode.join('') || '------';
  const phoneCodeLabel = phoneCode.join('') || '------';

  return (
    <main className={`${outfit.className} relative min-h-screen overflow-hidden bg-[#c81f25] px-4 py-6 text-white sm:px-8 sm:py-10`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.2),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(255,153,105,0.22),transparent_30%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-6 rounded-full border border-white/20 bg-white/8 px-4 py-3 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
              Tasty<span className="text-[#b10f18]">.</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/sign-up" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
                Sign Up
              </Link>
              <Link href="/sign-in" className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a31116]">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_28px_80px_rgba(56,14,10,0.4)] backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-4 flex items-center gap-2">
              {[1, 2, 3].map((node) => (
                <span
                  key={`verify-step-${node}`}
                  className={`h-2.5 w-2.5 rounded-full ${node <= step ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>

            <div className="rounded-full border border-white/24 bg-white/8 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/90">
              {step === 1 && 'Step 1 of 3 - Verify email code'}
              {step === 2 && 'Step 2 of 3 - Add phone number'}
              {step === 3 && 'Step 3 of 3 - Verify phone code'}
            </div>

            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/80">
              {step === 1 && 'Email Confirmation'}
              {step === 2 && 'Phone Setup'}
              {step === 3 && 'Phone Confirmation'}
            </p>

            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              {step === 1 && 'Enter Email Code'}
              {step === 2 && 'Enter Number'}
              {step === 3 && 'Enter Phone Code'}
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              {step === 1 && 'We sent a 6-digit verification code to your email. Paste it or type it below to continue.'}
              {step === 2 && 'Now add your phone number. We will send another one-time code to complete verification.'}
              {step === 3 && `Enter the 4-digit code sent to ${verifiedPhone || 'your phone number'}.`}
            </p>

            {errorMessage ? (
              <p className="mt-4 text-sm font-semibold text-[#ffe6d8]">{errorMessage}</p>
            ) : null}

            {step === 1 ? (
              <form className="mt-7 space-y-5" onSubmit={submitEmailCode}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {emailCode.map((digit, index) => (
                    <input
                      key={`email-code-${index}`}
                      ref={(element) => {
                        emailInputs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => handleEmailCodeChange(index, event)}
                      onKeyDown={(event) => handleEmailCodeKeyDown(index, event)}
                      onPaste={handleEmailCodePaste}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      aria-label={`Email verification digit ${index + 1}`}
                      className="h-14 w-11 rounded-xl border border-white/24 bg-white/10 text-center text-lg font-extrabold text-white outline-none transition focus:border-white/50 sm:h-16 sm:w-12"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!emailCodeComplete || isSubmitting}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying Email...' : 'Verify Email and Continue'}
                </button>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/70">
                  <button type="button" className="font-semibold text-white/90 transition hover:text-white" onClick={resendEmailCode}>
                    Resend Email Code
                  </button>
                  <span className="hidden h-3 w-px bg-white/25 sm:block" />
                  <p>Code expires in 10:00</p>
                </div>

                <p className="text-xs text-white/55">
                  Entered email code: <span className="font-bold text-white/85">{emailCodeLabel}</span>
                </p>
              </form>
            ) : null}

            {step === 2 ? (
              <form className="mt-7 space-y-5" onSubmit={submitPhoneNumber}>
                <div>
                  <label htmlFor="phone" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/[^\d+\s()-]/g, ''))}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!phoneNumberValid || isSubmitting}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending Phone Code...' : 'Send Phone Code'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full rounded-full border border-white/22 bg-white/8 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/14"
                >
                  Back to Email Code
                </button>
              </form>
            ) : null}

            {step === 3 ? (
              <form className="mt-7 space-y-5" onSubmit={submitPhoneCode}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {phoneCode.map((digit, index) => (
                    <input
                      key={`phone-code-${index}`}
                      ref={(element) => {
                        phoneInputs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => handlePhoneCodeChange(index, event)}
                      onKeyDown={(event) => handlePhoneCodeKeyDown(index, event)}
                      onPaste={handlePhoneCodePaste}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      aria-label={`Phone verification digit ${index + 1}`}
                      className="h-14 w-11 rounded-xl border border-white/24 bg-white/10 text-center text-lg font-extrabold text-white outline-none transition focus:border-white/50 sm:h-16 sm:w-12"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!phoneCodeComplete || isSubmitting}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying Phone...' : 'Finish Verification'}
                </button>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/70">
                  <button type="button" className="font-semibold text-white/90 transition hover:text-white" onClick={() => setStep(2)}>
                    Edit Number
                  </button>
                  <span className="hidden h-3 w-px bg-white/25 sm:block" />
                  <button type="button" className="font-semibold text-white/90 transition hover:text-white" onClick={resendPhoneCode}>
                    Resend Phone Code
                  </button>
                </div>

                <p className="text-xs text-white/55">
                  Entered phone code: <span className="font-bold text-white/85">{phoneCodeLabel}</span>
                </p>
              </form>
            ) : null}
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Food and email verification visual" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(200,31,37,0.1)_0%,rgba(49,20,17,0.72)_62%,rgba(36,16,14,0.86)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80">Secure onboarding</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl">
                Protect Your
                <br />
                Tasty Account
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                Verification keeps your account safe and ensures only you can access your saved meals and rewards.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={(
      <main className={`${outfit.className} min-h-screen bg-[#c81f25] px-4 py-6 text-white sm:px-8 sm:py-10`}>
        <div className="mx-auto h-24 max-w-6xl animate-pulse rounded-3xl border border-white/20 bg-white/10" />
      </main>
    )}
    >
      <VerifyEmailPageContent />
    </Suspense>
  );
}
