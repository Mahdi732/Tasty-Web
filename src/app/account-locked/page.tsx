'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, LockKeyhole, ShieldAlert } from 'lucide-react';
import { createOrderPayment, fetchMyDebtStatus } from '@/services/commerce/api';
import { useRequireAuth } from '@/services/auth/hooks';
import { useAuthStore } from '@/services/auth/store';
import type { DebtStatusResult } from '@/services/commerce/types';

const formatMoney = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0.00';
  }

  return value.toFixed(2);
};

export default function AccountLockedPage() {
  const router = useRouter();
  const { hydrated, accessToken, user } = useRequireAuth('/sign-in');
  const accountDebtLock = useAuthStore((state) => state.accountDebtLock);
  const setAccountDebtLock = useAuthStore((state) => state.setAccountDebtLock);

  const [loading, setLoading] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardHolder, setCardHolder] = useState(user?.nickname || 'Tasty User');
  const [cardExpiry, setCardExpiry] = useState('12/29');
  const [cardCvc, setCardCvc] = useState('123');

  const debtState = useMemo<DebtStatusResult | null>(() => accountDebtLock, [accountDebtLock]);

  const refreshDebtStatus = useCallback(async (): Promise<DebtStatusResult | null> => {
    if (!accessToken) {
      return null;
    }

    const status = await fetchMyDebtStatus(accessToken);
    setAccountDebtLock(status);

    if (!status.hasOutstandingDebt) {
      router.replace('/dashboard');
    }
    return status;
  }, [accessToken, router, setAccountDebtLock]);

  useEffect(() => {
    if (!hydrated || !accessToken) {
      return;
    }

    void (async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        await refreshDebtStatus();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load debt status.');
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, accessToken, refreshDebtStatus]);

  const handlePayDebt = (orderId: string, amount: number) => {
    if (!accessToken || !user?.id) {
      setErrorMessage('Missing authenticated session. Please sign in again.');
      return;
    }

    if (!cardNumber.trim() || !cardHolder.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setErrorMessage('Card number, holder name, expiry, and CVC are required.');
      return;
    }

    setErrorMessage('');
    setMessage('');
    setPayingOrderId(orderId);

    void (async () => {
      try {
        await createOrderPayment(accessToken, {
          userId: user.id,
          orderId,
          amount,
          currency: 'USD',
          payment: {
            type: 'CARD',
            token: `tok_demo_${Date.now()}`,
            maskedPan: cardNumber.replace(/\d(?=\d{4})/g, '*'),
            brand: 'VISA',
          },
        });

        let latestDebtStatus: DebtStatusResult | null = null;
        for (let attempt = 0; attempt < 6; attempt += 1) {
          latestDebtStatus = await refreshDebtStatus();
          const stillOutstandingForOrder = Boolean(
            latestDebtStatus?.debts?.some((debt) => debt.orderId === orderId)
          );

          if (!latestDebtStatus?.hasOutstandingDebt || !stillOutstandingForOrder) {
            break;
          }

          await new Promise((resolve) => {
            setTimeout(resolve, 700);
          });
        }

        if (!latestDebtStatus?.hasOutstandingDebt) {
          setMessage(`Debt settled for order ${orderId}. Account unlocked.`);
        } else {
          setMessage(`Payment captured for order ${orderId}. Debt sync is still processing, please refresh once.`);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Payment failed.');
      } finally {
        setPayingOrderId('');
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#481210_0%,#140808_52%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-[#ff9d8d]/40 bg-[#4b1414]/40 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.38)] sm:p-8">
          <p className="inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#ffd4cb]">
            <ShieldAlert className="h-4 w-4" />
            Account Locked
          </p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff2ea] sm:text-5xl">Outstanding Debt Detected</h1>
          <p className="mt-3 text-sm text-[#ffd8ce]">
            Your account remains signed in, but critical actions are locked until outstanding order debt is paid.
          </p>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/70">
              <LockKeyhole className="h-4 w-4" />
              Debt Ledger
            </p>

            <div className="mt-4 space-y-3">
              {(debtState?.debts || []).map((debt) => (
                <div key={debt.orderId} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#ffe0d4]">Order {debt.orderId}</p>
                    <p className="text-sm font-semibold text-[#ffd2c5]">{formatMoney(debt.amount)} USD</p>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/65">Status: {debt.orderStatus || 'EXPIRED'}</p>
                  <button
                    type="button"
                    onClick={() => handlePayDebt(debt.orderId, debt.amount)}
                    disabled={payingOrderId === debt.orderId}
                    className="mt-3 rounded-full bg-[#c61a22] px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
                  >
                    {payingOrderId === debt.orderId ? 'Processing...' : 'Pay This Debt'}
                  </button>
                </div>
              ))}

              {loading ? (
                <p className="text-sm text-white/70">Loading debt status...</p>
              ) : null}

              {!loading && !(debtState?.debts?.length) ? (
                <p className="text-sm text-white/70">No outstanding debt found. Redirecting...</p>
              ) : null}
            </div>
          </article>

          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/70">
              <CreditCard className="h-4 w-4" />
              Payment Card
            </p>

            <div className="mt-4 rounded-2xl border border-[#ffb7a3]/45 bg-[linear-gradient(140deg,#7d1a1f_0%,#b82a32_48%,#5f1218_100%)] p-4">
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-[#ffe8df]">Simulated Secure Card</p>
              <p className="mt-4 font-mono text-lg tracking-[0.22em] text-[#fff4ef]">{cardNumber || '**** **** **** ****'}</p>
              <div className="mt-4 flex items-end justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-[#ffe0d4]">{cardHolder || 'Card Holder'}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-[#ffe0d4]">{cardExpiry || 'MM/YY'}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={cardNumber}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="Card number"
                className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
              <input
                value={cardHolder}
                onChange={(event) => setCardHolder(event.target.value)}
                placeholder="Card holder"
                className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={cardExpiry}
                  onChange={(event) => setCardExpiry(event.target.value)}
                  placeholder="MM/YY"
                  className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
                <input
                  value={cardCvc}
                  onChange={(event) => setCardCvc(event.target.value)}
                  placeholder="CVC"
                  className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/88">
              Total outstanding: {formatMoney(debtState?.totalOutstandingAmount || 0)} USD
            </div>
          </article>
        </section>

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[#f48f92]/35 bg-[#571418]/35 px-4 py-3 text-sm text-[#ffd7d8]">
            {errorMessage}
          </p>
        ) : null}

        {message ? (
          <p className="mt-6 rounded-2xl border border-emerald-400/35 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
