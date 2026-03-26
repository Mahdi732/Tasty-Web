import Link from 'next/link';
import Image from 'next/image';
import { Outfit } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export default function SignUpPage() {
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
              <Link href="/" className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 hover:bg-white/10">
                Home
              </Link>
              <Link href="/sign-in" className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a31116]">
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_28px_80px_rgba(56,14,10,0.4)] backdrop-blur-2xl lg:grid-cols-[1fr_1fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-white/80">Create Account</p>
            <h1 className="mt-3 text-5xl font-black uppercase leading-[0.92] tracking-[0.08em] text-white sm:text-6xl">
              Sign Up
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
              Join Tasty to save your meals, track orders, and unlock member offers instantly.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-white/20"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M21.6 12.23c0-.77-.07-1.5-.2-2.2H12v4.16h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 3-4.33 3-7.48Z" />
                  <path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.23-2.5c-.9.6-2.04.95-3.4.95-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z" />
                  <path d="M6.39 13.88a6 6 0 0 1 0-3.76v-2.6H3.05a10 10 0 0 0 0 8.96l3.34-2.6Z" />
                  <path d="M12 6.02c1.47 0 2.8.5 3.85 1.5l2.88-2.88A9.7 9.7 0 0 0 12 2 10 10 0 0 0 3.05 7.52l3.34 2.6C7.18 7.78 9.39 6.02 12 6.02Z" />
                </svg>
                Google
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/18 bg-[#1877f2] px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:brightness-110"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.87 3.77-3.87 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
                </svg>
                Facebook
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/14" />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/70">Or register by email</span>
              <span className="h-px flex-1 bg-white/14" />
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                    placeholder="Create password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/85">
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full rounded-xl border border-white/24 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none transition focus:border-white/50"
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2 text-xs text-white/72">
                <input type="checkbox" required className="h-4 w-4 rounded border-white/20 bg-transparent" />
                I agree to Terms and Privacy Policy
              </label>

              <button
                type="submit"
                className="w-full rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.22em] text-[#a31116] transition hover:bg-white/90"
              >
                Create My Account
              </button>

              <Link
                href="/verify-email"
                className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/85 transition hover:text-white"
              >
                Already got a code? Verify Email
              </Link>

              <Link
                href="/verify-phone"
                className="block text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/85 transition hover:text-white"
              >
                Verify by Phone Instead
              </Link>
            </form>
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Tasty food and onboarding experience" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(200,31,37,0.1)_0%,rgba(49,20,17,0.72)_62%,rgba(36,16,14,0.86)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80">Tasty Member Access</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl">
                Fresh Meals,
                <br />
                One Account
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                Create your account and unlock saved addresses, faster ordering, and personalized suggestions.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
