'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, LockKeyhole, WalletCards } from 'lucide-react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import { createSubscriptionPayment, managerGetRestaurant } from '@/services/commerce/api';
import {
  readOpeningPlanSelection,
  saveOpeningPaymentReceipt,
  saveOpeningPlanSelection,
} from '@/services/commerce/opening-flow';
import type { ManagerRestaurant } from '@/services/commerce/types';

export default function SubscriptionPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');

  const [restaurantId, setRestaurantId] = useState('');
  const [restaurant, setRestaurant] = useState<ManagerRestaurant | null>(null);
  const [planId, setPlanId] = useState('plan_pro');
  const [amount, setAmount] = useState('39');
  const [currency, setCurrency] = useState('USD');

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('123');

  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const queryRestaurantId = useMemo(
    () => (searchParams.get('restaurantId') || '').trim(),
    [searchParams]
  );

  const isExistingRestaurantActivation = Boolean(queryRestaurantId || restaurantId.trim());

  const runAction = (action: () => Promise<void>) => {
    if (!accessToken) {
      setErrorMessage('Missing access token. Please sign in again.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsBusy(true);

    void (async () => {
      try {
        await action();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Action failed.');
      } finally {
        setIsBusy(false);
      }
    })();
  };

  const loadRestaurantById = useCallback(async (id: string) => {
    if (!accessToken) {
      return null;
    }

    const loaded = await managerGetRestaurant(accessToken, id);
    setRestaurant(loaded);
    setCurrency((loaded.settings.currency || 'USD').toUpperCase());
    return loaded;
  }, [accessToken]);

  useEffect(() => {
    const queryPlanId = (searchParams.get('planId') || '').trim();
    const queryAmount = Number(searchParams.get('amount') || '');
    const queryCurrency = (searchParams.get('currency') || '').trim().toUpperCase();
    const stored = readOpeningPlanSelection();

    const resolvedPlanId = queryPlanId || stored?.planId || 'plan_pro';
    const resolvedAmount = Number.isFinite(queryAmount) && queryAmount > 0
      ? queryAmount
      : stored?.amount || 39;
    const resolvedCurrency = queryCurrency || stored?.currency || 'USD';

    setPlanId(resolvedPlanId);
    setAmount(String(resolvedAmount));
    setCurrency(resolvedCurrency);
  }, [searchParams]);

  useEffect(() => {
    setCardHolder(user?.nickname || user?.email || 'Tasty Owner');
  }, [user?.nickname, user?.email]);

  useEffect(() => {
    if (!queryRestaurantId) {
      return;
    }

    setRestaurantId(queryRestaurantId);

    if (!accessToken) {
      return;
    }

    void (async () => {
      try {
        const loaded = await loadRestaurantById(queryRestaurantId);
        if (loaded) {
          setSuccessMessage(`Restaurant ${loaded.name} loaded for activation payment.`);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load restaurant from URL.');
      }
    })();
  }, [queryRestaurantId, accessToken, loadRestaurantById]);

  const handleLoadRestaurant = () => {
    if (!restaurantId.trim()) {
      setErrorMessage('Restaurant ID is required to activate an existing restaurant.');
      return;
    }

    runAction(async () => {
      const loaded = await loadRestaurantById(restaurantId.trim());
      if (!loaded) {
        return;
      }
      setSuccessMessage(`Restaurant ${loaded.name} loaded.`);
    });
  };

  const handlePay = () => {
    if (!accessToken || !user?.id) {
      setErrorMessage('Missing access token or user ID. Please sign in again.');
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Amount must be greater than zero.');
      return;
    }

    if (!planId.trim()) {
      setErrorMessage('Plan ID is required.');
      return;
    }

    if (!cardNumber.trim() || !cardHolder.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setErrorMessage('Card number, holder name, expiry, and CVC are required.');
      return;
    }

    runAction(async () => {
      const targetRestaurantId = restaurantId.trim() || undefined;

      const payment = await createSubscriptionPayment(accessToken, {
        userId: user.id,
        restaurantId: targetRestaurantId,
        planId: planId.trim(),
        amount: parsedAmount,
        currency: currency.trim().toUpperCase() || 'USD',
        payment: {
          type: 'CARD',
          token: `tok_demo_${Date.now()}`,
          maskedPan: cardNumber.replace(/\d(?=\d{4})/g, '*'),
          brand: 'VISA',
        },
      });

      if (targetRestaurantId) {
        let refreshed: ManagerRestaurant | null = null;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          refreshed = await loadRestaurantById(targetRestaurantId);
          if (refreshed?.subscription.status === 'ACTIVE') {
            break;
          }

          await new Promise((resolve) => {
            setTimeout(resolve, 650);
          });
        }

        if (refreshed?.subscription.status === 'ACTIVE') {
          setSuccessMessage(`Payment successful (${payment.transactionId}). Restaurant is ACTIVE.`);
        } else {
          setSuccessMessage(`Payment successful (${payment.transactionId}). Activation is syncing; refresh shortly.`);
        }

        return;
      }

      saveOpeningPlanSelection({
        planId: planId.trim(),
        amount: parsedAmount,
        currency: currency.trim().toUpperCase() || 'USD',
        selectedAt: new Date().toISOString(),
      });
      saveOpeningPaymentReceipt({
        transactionId: payment.transactionId,
        providerRef: payment.providerRef,
        status: payment.status,
        planId: planId.trim(),
        amount: parsedAmount,
        currency: currency.trim().toUpperCase() || 'USD',
        paidAt: new Date().toISOString(),
      });

      router.push('/abonnement/create-restaurant?payment=success');
    });
  };

  const managerReturnPath = restaurantId.trim()
    ? `/manager?restaurantId=${encodeURIComponent(restaurantId.trim())}`
    : '/manager';

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2f120c_0%,#150a08_48%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Abonnement</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed] sm:text-5xl">Bank Card Payment</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#f6cfbf]">
            Step 2 of 3: pay your plan by card. If this payment is for a new opening, next step is creating the restaurant as active/public.
          </p>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              <LockKeyhole className="h-4 w-4" />
              Payment Context
            </p>

            {isExistingRestaurantActivation ? (
              <>
                <p className="mt-3 text-sm text-white/75">This payment will activate an existing restaurant.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={restaurantId}
                    onChange={(event) => setRestaurantId(event.target.value)}
                    placeholder="Restaurant ID"
                    className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={handleLoadRestaurant}
                    disabled={isBusy}
                    className="rounded-2xl border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  >
                    Load
                  </button>
                </div>

                {restaurant ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90">
                    <p className="font-semibold uppercase tracking-[0.16em] text-[#ffd7c8]">{restaurant.name}</p>
                    <p className="mt-1">Status: {restaurant.status || '-'}</p>
                    <p>Visibility: {restaurant.visibility || '-'}</p>
                    <p>Subscription: {restaurant.subscription.status || 'PENDING'}</p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                    Load restaurant info before payment.
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mt-3 text-sm text-white/75">This payment is for opening a new restaurant after purchase.</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/88">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/70">Selected Plan</p>
                  <p className="mt-2 text-xl font-black uppercase tracking-[0.06em] text-[#ffe7dd]">{planId || 'plan_pro'}</p>
                  <p className="mt-1 text-sm text-white/78">{amount || '0'} {currency || 'USD'}</p>
                  <p className="mt-2 text-xs text-white/65">After payment you will be redirected to create restaurant page.</p>
                </div>
              </>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/abonnement" className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/88">
                Back To Plan Selection
              </Link>
              <Link href={managerReturnPath} className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/88">
                Back To Manager
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              <WalletCards className="h-4 w-4" />
              Card Details
            </p>

            <div className="mt-4 rounded-2xl border border-[#ffb7a3]/45 bg-[linear-gradient(140deg,#7d1a1f_0%,#b82a32_48%,#5f1218_100%)] p-4">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#ffe8df]">Simulated Bank Card</p>
              <p className="mt-4 font-mono text-lg tracking-[0.22em] text-[#fff4ef]">{cardNumber || '**** **** **** ****'}</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-[#ffe0d4]">{cardHolder || 'Card Holder'}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[#ffe0d4]">{cardExpiry || 'MM/YY'}</p>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <input value={planId} onChange={(event) => setPlanId(event.target.value)} placeholder="Plan ID" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Amount" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                <input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              </div>
              <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} placeholder="Card number" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              <input value={cardHolder} onChange={(event) => setCardHolder(event.target.value)} placeholder="Card holder" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} placeholder="MM/YY" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                <input value={cardCvc} onChange={(event) => setCardCvc(event.target.value)} placeholder="CVC" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              </div>

              <button type="button" onClick={handlePay} disabled={isBusy} className="inline-flex items-center gap-2 rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                <CreditCard className="h-4 w-4" />
                Pay Now
              </button>
            </div>
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
