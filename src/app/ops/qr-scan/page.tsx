'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ScanLine } from 'lucide-react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import { listAllOpsOrders, listRestaurantOrders, markOrderDriverArrived, scanOrderQr } from '@/services/commerce/api';
import type { OrderHistoryEntry, QrScanResult } from '@/services/commerce/types';

const OPS_SCAN_ROLES = ['delivery_man'];

const formatDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

export default function OpsQrScanPage() {
  const router = useRouter();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');

  const [qrToken, setQrToken] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [scanResult, setScanResult] = useState<QrScanResult | null>(null);
  const [arrivalOrderId, setArrivalOrderId] = useState('');
  const [arrivalPhone, setArrivalPhone] = useState('');
  const [arrivalDebt, setArrivalDebt] = useState('');
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isMarkingArrival, setIsMarkingArrival] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canScan = useMemo(
    () => (user?.roles || []).some((role) => OPS_SCAN_ROLES.includes(role)),
    [user?.roles]
  );
  const isSuperadmin = (user?.roles || []).includes('superadmin');

  useEffect(() => {
    if (!hydrated || !accessToken || !isFullyVerified) {
      return;
    }

    if (!canScan) {
      router.replace('/dashboard');
    }
  }, [hydrated, accessToken, isFullyVerified, canScan, router]);

  const runScan = () => {
    if (!accessToken || !canScan) {
      setErrorMessage('You do not have permission to scan QR orders.');
      return;
    }

    if (!qrToken.trim()) {
      setErrorMessage('QR token is required.');
      return;
    }

    setErrorMessage('');
    setMessage('');
    setIsScanning(true);

    void (async () => {
      try {
        const result = await scanOrderQr(accessToken, { qrToken: qrToken.trim() });
        setScanResult(result);
        setMessage(`Order ${result.orderId} updated to ${result.orderStatus}.`);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to scan QR.');
      } finally {
        setIsScanning(false);
      }
    })();
  };

  const runDriverArrived = () => {
    if (!accessToken || !canScan) {
      setErrorMessage('You do not have permission to mark driver arrival.');
      return;
    }

    if (!arrivalOrderId.trim()) {
      setErrorMessage('Order ID is required to mark driver arrival.');
      return;
    }

    const debtAmount = Number(arrivalDebt || 0);
    if (!Number.isFinite(debtAmount) || debtAmount < 0) {
      setErrorMessage('Debt amount must be zero or greater.');
      return;
    }

    setErrorMessage('');
    setMessage('');
    setIsMarkingArrival(true);

    void (async () => {
      try {
        const result = await markOrderDriverArrived(accessToken, arrivalOrderId.trim(), {
          phoneNumber: arrivalPhone.trim() || undefined,
          debtAmount,
        });
        setMessage(`Driver arrival recorded for order ${result.orderId} (${result.orderStatus}).`);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to mark driver arrival.');
      } finally {
        setIsMarkingArrival(false);
      }
    })();
  };

  const loadOrders = (mode: 'restaurant' | 'all') => {
    if (!accessToken || !canScan) {
      setErrorMessage('You do not have permission to view ops orders.');
      return;
    }

    if (mode === 'restaurant' && !restaurantId.trim()) {
      setErrorMessage('Restaurant ID is required for restaurant order list.');
      return;
    }

    setErrorMessage('');
    setMessage('');
    setIsLoadingOrders(true);

    void (async () => {
      try {
        const data = mode === 'all'
          ? await listAllOpsOrders(accessToken)
          : await listRestaurantOrders(accessToken, restaurantId.trim());
        setOrders(data);
        setMessage(`Loaded ${data.length} orders.`);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load ops orders.');
      } finally {
        setIsLoadingOrders(false);
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

  if (!canScan) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#40100f_0%,#140909_52%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcdbd]">Operations</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff3eb] sm:text-5xl">QR Scan Console</h1>
          <p className="mt-3 text-sm text-[#f6cdbd]">Scan order QR tokens and review operational order queues.</p>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">Scan QR Token</p>
            <div className="mt-3 space-y-3">
              <textarea
                value={qrToken}
                onChange={(event) => setQrToken(event.target.value)}
                rows={3}
                placeholder="Paste raw qrToken here"
                className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
              <button
                type="button"
                onClick={runScan}
                disabled={isScanning}
                className="inline-flex items-center gap-2 rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
              >
                <ScanLine className="h-4 w-4" />
                {isScanning ? 'Scanning...' : 'Scan And Update'}
              </button>
            </div>

            {scanResult ? (
              <div className="mt-4 rounded-2xl border border-emerald-400/35 bg-emerald-900/20 p-4 text-sm text-emerald-100">
                <p className="font-semibold uppercase tracking-[0.14em]">Scan Success</p>
                <p className="mt-1">Order: {scanResult.orderId}</p>
                <p>Status: {scanResult.orderStatus}</p>
                <p>Payment: {scanResult.paymentStatus}</p>
                <p>Scanned At: {formatDate(scanResult.scannedAt)}</p>
              </div>
            ) : null}
          </article>

          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">Order Queue</p>
            <div className="mt-3 space-y-3">
              <input
                value={restaurantId}
                onChange={(event) => setRestaurantId(event.target.value)}
                placeholder="Restaurant ID"
                className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadOrders('restaurant')}
                  disabled={isLoadingOrders}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                >
                  Load Restaurant Orders
                </button>
                {isSuperadmin ? (
                  <button
                    type="button"
                    onClick={() => loadOrders('all')}
                    disabled={isLoadingOrders}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                  >
                    Load All Orders
                  </button>
                ) : null}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/70">Driver Arrived</p>
                <div className="mt-2 grid gap-2">
                  <input
                    value={arrivalOrderId}
                    onChange={(event) => setArrivalOrderId(event.target.value)}
                    placeholder="Order ID"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  />
                  <input
                    value={arrivalPhone}
                    onChange={(event) => setArrivalPhone(event.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  />
                  <input
                    value={arrivalDebt}
                    onChange={(event) => setArrivalDebt(event.target.value)}
                    placeholder="Debt amount (optional)"
                    className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white outline-none focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={runDriverArrived}
                    disabled={isMarkingArrival}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  >
                    {isMarkingArrival ? 'Saving...' : 'Mark Driver Arrived'}
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>

        {errorMessage ? (
          <p className="mt-5 rounded-2xl border border-[#f29194]/35 bg-[#571418]/35 px-4 py-3 text-sm text-[#ffd8d9]">
            {errorMessage}
          </p>
        ) : null}

        {message ? (
          <p className="mt-5 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/88">
            {message}
          </p>
        ) : null}

        <section className="mt-6 space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#ffddcf]">{order.id}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-white/70">{formatDate(order.createdAt)}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.15em]">
                <span className="rounded-full border border-white/20 px-3 py-1 text-white/85">{order.orderStatus}</span>
                <span className="rounded-full border border-[#88d9ad]/35 px-3 py-1 text-emerald-100">{order.paymentStatus}</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-white/85">{order.orderType}</span>
                    <button
                      type="button"
                      onClick={() => setArrivalOrderId(order.id)}
                      className="rounded-full border border-[#f0bc9f]/40 px-3 py-1 text-[#ffd7c4]"
                    >
                      Use For Arrival
                    </button>
              </div>
              <p className="mt-2 text-xs text-white/72">
                <QrCode className="mr-1 inline h-3.5 w-3.5" />
                QR: {order.qrScannedAt ? `Scanned ${formatDate(order.qrScannedAt)}` : 'Not scanned yet'}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
