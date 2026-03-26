import Link from 'next/link';
import Image from 'next/image';
import { Oswald, Plus_Jakarta_Sans } from 'next/font/google';

const headingFont = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

export default function SignUpPage() {
  return (
    <main className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-[#0f0907] px-4 py-6 text-white sm:px-8 sm:py-10`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(253,111,43,0.24),transparent_35%),radial-gradient(circle_at_84%_20%,rgba(177,20,41,0.28),transparent_42%),linear-gradient(132deg,#0f0907_0%,#1a0f0b_44%,#130b08_100%)]" />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 transition hover:text-white">
            Back Home
          </Link>
          <Link href="/sign-in" className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffd5bc] transition hover:text-white">
            Already have an account? Sign In
          </Link>
        </div>

        <section className="grid overflow-hidden rounded-[2.2rem] border border-white/18 bg-[#1a0f0b]/90 shadow-[0_36px_90px_rgba(0,0,0,0.52)] backdrop-blur-xl lg:grid-cols-[1.02fr_0.98fr]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="animate-fade-in rounded-full border border-[#ffb78f]/30 bg-[#ff6b2a]/14 px-4 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd2b8]" style={{ animationDelay: '60ms' }}>
              Join Today and Get a New Member Reward
            </div>

            <p className="animate-fade-in mt-6 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-[#ffc7a8]/90" style={{ animationDelay: '120ms' }}>
              Start Better Ordering
            </p>

            <h1 className={`${headingFont.className} animate-slide-up mt-3 text-5xl uppercase leading-[0.94] tracking-[0.05em] text-[#fff3e8] sm:text-6xl lg:text-7xl`} style={{ animationDelay: '180ms' }}>
              Create Account
            </h1>

            <p className="animate-fade-in mt-4 max-w-xl text-sm leading-7 text-[#f8d8c5]/84 sm:text-base" style={{ animationDelay: '230ms' }}>
              Build your Tasty profile in less than a minute to unlock personalized picks, saved addresses, and repeat-order speed.
            </p>

            <div className="animate-fade-in mt-6 grid gap-3 sm:grid-cols-2" style={{ animationDelay: '260ms' }}>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/22 bg-white/10 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:scale-[1.015] hover:bg-white/18"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M21.6 12.23c0-.77-.07-1.5-.2-2.2H12v4.16h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 3-4.33 3-7.48Z" />
                  <path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.23-2.5c-.9.6-2.04.95-3.4.95-2.61 0-4.82-1.76-5.61-4.13H3.05v2.6A10 10 0 0 0 12 22Z" />
                  <path d="M6.39 13.88a6 6 0 0 1 0-3.76v-2.6H3.05a10 10 0 0 0 0 8.96l3.34-2.6Z" />
                  <path d="M12 6.02c1.47 0 2.8.5 3.85 1.5l2.88-2.88A9.7 9.7 0 0 0 12 2 10 10 0 0 0 3.05 7.52l3.34 2.6C7.18 7.78 9.39 6.02 12 6.02Z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/18 bg-[#1877f2]/88 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-white transition hover:scale-[1.015] hover:bg-[#1877f2]"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.87 3.77-3.87 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
                </svg>
                Continue with Facebook
              </button>
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/14" />
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.24em] text-white/60">Or register by email</span>
              <span className="h-px flex-1 bg-white/14" />
            </div>

            <form className="space-y-4">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-[0.64rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd0b5]/92">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#ff9e73]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-[0.64rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd0b5]/92">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-white/18 bg-white/7 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#ff9e73]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="password" className="mb-2 block text-[0.64rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd0b5]/92">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full rounded-xl border border-white/18 bg-white/7 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#ff9e73]"
                    placeholder="Create password"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-[0.64rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd0b5]/92">
                    Confirm
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full rounded-xl border border-white/18 bg-white/7 px-4 py-3 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#ff9e73]"
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
                className="w-full rounded-full bg-[linear-gradient(135deg,#cb1523_0%,#ff5e2b_100%)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.24em] text-white shadow-[0_18px_40px_rgba(219,64,28,0.48)] transition hover:brightness-110"
              >
                Create My Account
              </button>

              <Link
                href="/verify-email"
                className="block text-center text-xs font-bold uppercase tracking-[0.2em] text-[#ffd1b7] transition hover:text-white"
              >
                Already got a code? Verify Email
              </Link>
            </form>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-white/14 bg-white/6 px-3 py-2">
                <p className="text-sm font-extrabold text-white">3 steps</p>
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-white/60">Setup Time</p>
              </div>
              <div className="rounded-xl border border-white/14 bg-white/6 px-3 py-2">
                <p className="text-sm font-extrabold text-white">100%</p>
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-white/60">Free Signup</p>
              </div>
              <div className="rounded-xl border border-white/14 bg-white/6 px-3 py-2">
                <p className="text-sm font-extrabold text-white">24/7</p>
                <p className="text-[0.58rem] uppercase tracking-[0.2em] text-white/60">Support</p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] border-t border-white/14 lg:min-h-full lg:border-t-0 lg:border-l">
            <Image src="/auth.jpg" alt="Tasty food and onboarding experience" fill className="object-cover" priority sizes="(min-width: 1024px) 46vw, 100vw" />
            <div className="absolute inset-0 bg-[linear-gradient(155deg,rgba(18,10,7,0.14)_0%,rgba(18,10,7,0.76)_62%,rgba(18,10,7,0.92)_100%)]" />

            <div className="absolute left-5 right-5 top-5 rounded-2xl border border-white/20 bg-black/32 p-4 backdrop-blur-xl sm:left-8 sm:right-8 sm:top-8 sm:p-5">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#ffd2b8]">Member Privileges</p>
              <h2 className={`${headingFont.className} mt-2 text-3xl uppercase leading-[0.95] tracking-[0.05em] text-white sm:text-4xl`}>
                Rewards,
                <br />
                Faster Reorders
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/84">
                Build your profile and instantly save favorite meals for one-tap checkout on future visits.
              </p>
            </div>

            <div className="absolute inset-x-5 bottom-5 grid gap-2 sm:inset-x-8 sm:bottom-8">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/92 backdrop-blur-xl">
                Exclusive member-only promo drops
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/92 backdrop-blur-xl">
                Real-time order timeline and updates
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
