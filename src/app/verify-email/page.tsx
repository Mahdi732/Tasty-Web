'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRef, useState, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from 'react';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: CODE_LENGTH }, () => ''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isComplete = digits.every((digit) => digit.length === 1);
  const codeValue = digits.join('');

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleInputChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '');
    const nextDigit = value.slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleInputKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && digits[index] === '' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
      return;
    }

    if (event.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) {
      return;
    }

    event.preventDefault();

    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < CODE_LENGTH; i += 1) {
        next[i] = pasted[i] ?? '';
      }
      return next;
    });

    const nextIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    focusInput(nextIndex);
  };

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
            <div className="rounded-full border border-white/24 bg-white/8 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-white/90">
              Verify your account email
            </div>

            <p className="mt-6 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/80">
              Email Confirmation
            </p>

            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              Enter Code
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              We sent a 6-digit verification code to your email. Paste it or type it below to activate your account.
            </p>

            <form className="mt-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {digits.map((digit, index) => (
                  <input
                    key={`code-${index}`}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event) => handleInputChange(index, event)}
                    onKeyDown={(event) => handleInputKeyDown(index, event)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    aria-label={`Verification digit ${index + 1}`}
                    className="h-14 w-11 rounded-xl border border-white/24 bg-white/10 text-center text-lg font-extrabold text-white outline-none transition focus:border-white/50 sm:h-16 sm:w-12"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isComplete}
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Verify Email
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/70">
              <button type="button" className="font-semibold text-white/90 transition hover:text-white">
                Resend Code
              </button>
              <span className="hidden h-3 w-px bg-white/25 sm:block" />
              <p>Code expires in 10:00</p>
            </div>

            <div className="mt-4">
              <Link href="/verify-phone" className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90 transition hover:text-white">
                Use Phone Instead
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/55">
              Entered code: <span className="font-bold text-white/85">{codeValue || '------'}</span>
            </p>
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
