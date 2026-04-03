'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Layers3, Sparkles } from 'lucide-react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import {
  SUBSCRIPTION_PLANS,
  clearOpeningPaymentReceipt,
  saveOpeningPlanSelection,
} from '@/services/commerce/opening-flow';

export default function SubscriptionPage() {
  const router = useRouter();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');
  const [selectedPlanId, setSelectedPlanId] = useState('plan_pro');

  const selectedPlan = useMemo(
    () => SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlanId) || SUBSCRIPTION_PLANS[0],
    [selectedPlanId]
  );

  const handleContinueToPayment = () => {
    saveOpeningPlanSelection({
      planId: selectedPlan.id,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      selectedAt: new Date().toISOString(),
    });
    clearOpeningPaymentReceipt();

    const params = new URLSearchParams({
      planId: selectedPlan.id,
      amount: String(selectedPlan.amount),
      currency: selectedPlan.currency,
    });
    router.push(`/abonnement/payment?${params.toString()}`);
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 pt-24 text-white sm:px-6">
        <div className="mx-auto h-24 max-w-4xl animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      </main>
    );
  }

  if (!accessToken || !isFullyVerified) {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 pt-24 text-white sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/80">Redirecting to verification flow...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#301208_0%,#130a08_45%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Abonnement</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed] sm:text-5xl">Choose Plan First</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#f6cfbf]">
            Step 1 of 3: choose your plan. Next step is bank card payment, then you create your restaurant as active and public.
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-white/12 bg-black/30 p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
            <Layers3 className="h-4 w-4" />
            Plans
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const selected = selectedPlanId === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`rounded-2xl border p-4 text-left transition ${selected
                    ? `${plan.accent} shadow-[0_16px_40px_rgba(198,26,34,0.25)]`
                    : 'border-white/12 bg-black/20 hover:border-white/25'
                    }`}
                >
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/75">{plan.title}</p>
                  <p className="mt-2 text-3xl font-black uppercase tracking-[0.04em] text-[#fff2ea]">{plan.amount.toFixed(0)} {plan.currency}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/60">monthly</p>
                  <p className="mt-3 text-sm text-white/78">{plan.subtitle}</p>
                  <ul className="mt-3 space-y-1 text-xs text-white/72">
                    {plan.highlights.map((feature) => (
                      <li key={feature} className="inline-flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[#ffb9a8]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleContinueToPayment}
              className="inline-flex items-center gap-2 rounded-full bg-[#c61a22] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
            >
              Continue To Card Payment
              <ArrowRight className="h-4 w-4" />
            </button>

            <Link href="/abonnement/create-restaurant" className="inline-flex rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Already Paid? Create Restaurant
            </Link>

            <Link href="/manager" className="inline-flex rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Back To Manager
            </Link>
          </div>

          <p className="mt-4 text-sm text-white/70">
            Signed in as {user?.nickname || user?.email || 'Owner'}. Existing inactive restaurants can still be activated from manager cards.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffccb6]">Step 1</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">Choose Plan</p>
            <p className="mt-2 text-sm text-white/72">Select the package that matches your operation size.</p>
          </article>

          <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffccb6]">Step 2</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">Pay By Card</p>
            <p className="mt-2 text-sm text-white/72">Complete secure bank card payment on the next screen.</p>
          </article>

          <article className="rounded-2xl border border-white/12 bg-black/25 p-4">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#ffccb6]">Step 3</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">Create Active Restaurant</p>
            <p className="mt-2 text-sm text-white/72">After payment, your new restaurant is created directly as active and public.</p>
          </article>
        </section>
      </div>
    </main>
  );
}
