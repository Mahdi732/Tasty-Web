'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Outfit } from 'next/font/google';
import { useRef, useState, type ChangeEvent, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

const CODE_LENGTH = 6;

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export default function VerifyPhonePage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length: CODE_LENGTH }, () => ''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const normalizedPhone = onlyDigits(phone);
  const canSendCode = normalizedPhone.length >= 8;
  const codeComplete = digits.every((digit) => digit.length === 1);

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const allowed = raw.replace(/[^\d+\s()-]/g, '');
    setPhone(allowed);
  };

  const focusInput = (index: number) => {
    const target = inputRefs.current[index];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const handleCodeChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextDigit = onlyDigits(event.target.value).slice(-1);

    setDigits((prev) => {
      const next = [...prev];
      next[index] = nextDigit;
      return next;
    });

    if (nextDigit && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleCodeKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
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

  const handleCodePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = onlyDigits(event.clipboardData.getData('text')).slice(0, CODE_LENGTH);
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

    focusInput(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const handlePhoneSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSendCode) {
      return;
    }

    setSubmittedPhone(phone);
    setDigits(Array.from({ length: CODE_LENGTH }, () => ''));
    setStep(2);
    setTimeout(() => {
      focusInput(0);
    }, 0);
  };

  const handleCodeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!codeComplete) {
      return;
    }
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
              <Link href="/verify-email" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
                Verify Email
              </Link>
              <Link href="/sign-in" className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a31116]">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_28px_80px_rgba(56,14,10,0.4)] backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-5 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${step === 1 ? 'bg-white' : 'bg-white/35'}`} />
              <span className={`h-2.5 w-2.5 rounded-full ${step === 2 ? 'bg-white' : 'bg-white/35'}`} />
            </div>

            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/80">Phone Verification</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              {step === 1 ? 'Enter Number' : 'Enter Code'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              {step === 1
                ? 'Use your phone number to receive a one-time code for secure verification.'
                : `We sent a 6-digit code to ${submittedPhone || 'your phone number'}.`}
            </p>

            {step === 1 ? (
              <form className="mt-7 space-y-5" onSubmit={handlePhoneSubmit}>
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
                    onChange={handlePhoneChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSendCode}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send Code
                </button>
              </form>
            ) : (
              <form className="mt-7 space-y-5" onSubmit={handleCodeSubmit}>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {digits.map((digit, index) => (
                    <input
                      key={`phone-code-${index}`}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      value={digit}
                      onChange={(event) => handleCodeChange(index, event)}
                      onKeyDown={(event) => handleCodeKeyDown(index, event)}
                      onPaste={handleCodePaste}
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
                  disabled={!codeComplete}
                  className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Verify Number
                </button>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-white/70">
                  <button type="button" className="font-semibold text-white/90 transition hover:text-white" onClick={() => setStep(1)}>
                    Edit Number
                  </button>
                  <span className="hidden h-3 w-px bg-white/25 sm:block" />
                  <button type="button" className="font-semibold text-white/90 transition hover:text-white">
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Phone verification visual" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(200,31,37,0.1)_0%,rgba(49,20,17,0.72)_62%,rgba(36,16,14,0.86)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80">Two-step security</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl">
                Number,
                <br />
                Then Code
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                First enter your phone number, then confirm the one-time code sent to it.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
