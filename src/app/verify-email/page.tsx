'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Oswald, Plus_Jakarta_Sans } from 'next/font/google';
import { useRef, useState, type KeyboardEvent, type ClipboardEvent, type ChangeEvent } from 'react';

const headingFont = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
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
    <main className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-[#0f0907] px-4 py-6 text-white sm:px-8 sm:py-10`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(253,111,43,0.24),transparent_35%),radial-gradient(circle_at_86%_22%,rgba(177,20,41,0.28),transparent_42%),linear-gradient(132deg,#0f0907_0%,#1a0f0b_44%,#130b08_100%)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.22em] text-white/75 transition hover:text-white">
            Back Home
          </Link>
          <Link href="/sign-in" className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffd0b5] transition hover:text-white">
            Go to Sign In
          </Link>
        </div>

        <section className="grid overflow-hidden rounded-[2.2rem] border border-white/18 bg-[#1a0f0b]/90 shadow-[0_36px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="rounded-full border border-[#ffb78f]/30 bg-[#ff6b2a]/14 px-4 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd2b8]">
              Step 2 of 2 - Verify your email
            </div>

            <p className="mt-6 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-[#ffc7a8]/90">
              Email Confirmation
            </p>

            <h1 className={`${headingFont.className} mt-3 text-5xl uppercase leading-[0.94] tracking-[0.05em] text-[#fff3e8] sm:text-6xl`}>
              Enter Code
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#f8d8c5]/84 sm:text-base">
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
                    className="h-14 w-11 rounded-xl border border-white/20 bg-white/8 text-center text-lg font-extrabold text-white outline-none transition focus:border-[#ff9e73] sm:h-16 sm:w-12"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isComplete}
                className="w-full rounded-full bg-[linear-gradient(135deg,#cb1523_0%,#ff5e2b_100%)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(219,64,28,0.48)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Verify Email
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/70">
              <button type="button" className="font-bold text-[#ffd0b5] transition hover:text-white">
                Resend Code
              </button>
              <span className="hidden h-3 w-px bg-white/25 sm:block" />
              <p>Code expires in 10:00</p>
            </div>

            <p className="mt-4 text-xs text-white/55">
              Entered code: <span className="font-bold text-white/85">{codeValue || '------'}</span>
            </p>
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Food and email verification visual" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(18,10,7,0.14)_0%,rgba(18,10,7,0.76)_62%,rgba(18,10,7,0.92)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd2b8]">Secure onboarding</p>
              <h2 className={`${headingFont.className} mt-2 text-3xl uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl`}>
                Protect Your
                <br />
                Tasty Account
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                Verification keeps your account safe and ensures only you can access your saved meals and rewards.
              </p>
            </div>

            <div className="absolute inset-x-5 bottom-5 grid gap-2 sm:inset-x-8 sm:bottom-8">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/92 backdrop-blur-xl">
                6-digit code confirmation
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/92 backdrop-blur-xl">
                One-time secure verification
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
