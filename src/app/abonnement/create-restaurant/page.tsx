'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Store, Sparkles } from 'lucide-react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import { managerCreateRestaurant } from '@/services/commerce/api';
import {
  clearOpeningFlowState,
  readOpeningPaymentReceipt,
  readOpeningPlanSelection,
} from '@/services/commerce/opening-flow';
import type { ManagerRestaurant } from '@/services/commerce/types';

const toSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function CreateRestaurantAfterPaymentPage() {
  const searchParams = useSearchParams();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Casablanca');
  const [citySlug, setCitySlug] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdRestaurant, setCreatedRestaurant] = useState<ManagerRestaurant | null>(null);

  const paymentReceipt = useMemo(() => readOpeningPaymentReceipt(), []);
  const planSelection = useMemo(() => readOpeningPlanSelection(), []);
  const paymentStatus = (searchParams.get('payment') || '').toLowerCase();

  useEffect(() => {
    if (!name.trim()) {
      return;
    }

    setSlug(toSlug(name));
  }, [name]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (paymentStatus === 'success') {
      setSuccessMessage('Payment captured. Complete your restaurant details and submit.');
    }
  }, [paymentStatus]);

  const handleCreateRestaurant = () => {
    if (!accessToken || !user?.id) {
      setErrorMessage('Missing session data. Please sign in again.');
      return;
    }

    if (!paymentReceipt) {
      setErrorMessage('No successful payment found. Pay plan first.');
      return;
    }

    if (!name.trim() || !city.trim()) {
      setErrorMessage('Restaurant name and city are required.');
      return;
    }

    const effectiveCurrency = (currency || paymentReceipt.currency || planSelection?.currency || 'USD').toUpperCase();
    const effectiveSlug = toSlug(slug || name);
    const effectiveCitySlug = toSlug(citySlug || city);

    setErrorMessage('');
    setSuccessMessage('');
    setIsBusy(true);

    void (async () => {
      try {
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const created = await managerCreateRestaurant(accessToken, {
          creationFlow: 'MEMBERSHIP_FIRST',
          name: name.trim(),
          slug: effectiveSlug,
          description: description.trim() || undefined,
          location: {
            city: city.trim(),
            citySlug: effectiveCitySlug,
            address: address.trim() || undefined,
          },
          contact: {
            phone: phone.trim() || undefined,
            email: email.trim() || undefined,
          },
          settings: {
            currency: effectiveCurrency,
            supportedOrderModes: ['pickup', 'delivery'],
          },
          subscription: {
            status: 'ACTIVE',
            subscriptionPlanId: paymentReceipt.planId,
            providerCustomerId: `owner_${user.id}`,
            providerSubscriptionId: paymentReceipt.transactionId,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
        });

        setCreatedRestaurant(created);
        setSuccessMessage(`Restaurant ${created.name} created and activated.`);
        clearOpeningFlowState();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to create restaurant.');
      } finally {
        setIsBusy(false);
      }
    })();
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

  if (!paymentReceipt) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2b120c_0%,#140b09_48%,#09090b_100%)] text-white">
        <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-24 sm:px-6">
          <div className="rounded-3xl border border-white/12 bg-black/35 p-6 sm:p-8">
            <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Step 3</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed]">Create Restaurant</h1>
            <p className="mt-3 text-sm text-[#f6cfbf]">No successful plan payment found. Complete the payment step first.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/abonnement" className="rounded-full bg-[#c61a22] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
                Choose Plan
              </Link>
              <Link href="/abonnement/payment" className="rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Go To Payment
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const managerPath = createdRestaurant
    ? `/manager?restaurantId=${encodeURIComponent(createdRestaurant.id)}`
    : '/manager';

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2b120c_0%,#140b09_48%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Abonnement</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed] sm:text-5xl">Create Active Restaurant</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#f6cfbf]">
            Step 3 of 3: submit your restaurant profile. It will be created active and public directly.
          </p>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              <Store className="h-4 w-4" />
              Restaurant Details
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Restaurant name" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              <input value={slug} onChange={(event) => setSlug(toSlug(event.target.value))} placeholder="Slug" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
            </div>

            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="Description" className="mt-3 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              <input value={citySlug} onChange={(event) => setCitySlug(toSlug(event.target.value))} placeholder="City slug" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              <input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
            </div>

            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Address" className="mt-3 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Contact phone" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Contact email" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
            </div>

            <button type="button" onClick={handleCreateRestaurant} disabled={isBusy} className="mt-4 rounded-full bg-[#c61a22] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60">
              Create Active Restaurant
            </button>
          </article>

          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              <Sparkles className="h-4 w-4" />
              Payment Receipt
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/88">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/68">Transaction</p>
              <p className="mt-1 break-all text-xs text-white/88">{paymentReceipt.transactionId}</p>
              <p className="mt-2">Plan: {paymentReceipt.planId}</p>
              <p>Amount: {paymentReceipt.amount} {paymentReceipt.currency}</p>
              <p>Status: {paymentReceipt.status}</p>
            </div>

            {createdRestaurant ? (
              <div className="mt-4 rounded-2xl border border-emerald-300/35 bg-emerald-900/20 p-4 text-sm text-emerald-100">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                  <CheckCircle2 className="h-4 w-4" />
                  Created And Active
                </p>
                <p className="mt-2">{createdRestaurant.name}</p>
                <p>Status: {createdRestaurant.status}</p>
                <p>Visibility: {createdRestaurant.visibility}</p>
                <Link href={managerPath} className="mt-3 inline-flex rounded-full border border-emerald-300/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                  Open In Manager
                </Link>
              </div>
            ) : null}
          </article>
        </section>

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[#f48f92]/35 bg-[#571418]/35 px-4 py-3 text-sm text-[#ffd7d8]">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-6 rounded-2xl border border-emerald-400/35 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </p>
        ) : null}
      </div>
    </main>
  );
}
