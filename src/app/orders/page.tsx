'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { History, QrCode, RefreshCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cancelMyOrder, listMyOrders } from '@/services/commerce/api';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import type { OrderHistoryEntry } from '@/services/commerce/types';

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

export default function OrdersPage() {
  const { hydrated, accessToken, isFullyVerified } = useRequireFullyVerified('/sign-in');
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancellingOrderId, setIsCancellingOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  const canCancelOrder = (order: OrderHistoryEntry): boolean => {
    if (order.qrScannedAt) {
      return false;
    }

    if (!['CREATED', 'PAID'].includes(order.orderStatus)) {
      return false;
    }

    return true;
  };

  const loadOrders = async (token: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await listMyOrders(token);
      setOrders(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load order history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    void loadOrders(accessToken);
  }, [accessToken]);

  const handleCancelOrder = async (orderId: string) => {
    if (!accessToken) {
      return;
    }

    setErrorMessage('');
    setIsCancellingOrderId(orderId);
    try {
      await cancelMyOrder(accessToken, orderId);
      const updatedOrders = await listMyOrders(accessToken);
      setOrders(updatedOrders);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to cancel order.');
    } finally {
      setIsCancellingOrderId(null);
    }
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#42120f_0%,#140909_50%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.35)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffd0bf]">Orders</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed] sm:text-5xl">Order History</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
              {orders.length} Orders
            </p>
            <p className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/85">
              Total {totalSpent.toFixed(2)}
            </p>
            <button
              type="button"
              onClick={() => void loadOrders(accessToken)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-[#c61a22] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[#f48f92]/35 bg-[#571116]/35 px-4 py-3 text-sm text-[#ffd6d7]">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-7 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : null}

        {!isLoading && orders.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-white/12 bg-black/30 p-8 text-center">
            <History className="mx-auto h-9 w-9 text-white/70" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/85">No Orders Yet</p>
            <p className="mt-2 text-sm text-white/65">Start by placing your first order from restaurants.</p>
            <Link
              href="/restaurants"
              className="mt-5 inline-flex rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : null}

        <section className="mt-8 space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-3xl border border-white/12 bg-black/30 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.34)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-[#ffcab8]">Order</p>
                  <h2 className="mt-1 text-lg font-black uppercase tracking-[0.05em] text-[#fff2eb]">{order.id}</h2>
                  <p className="mt-1 text-xs text-white/68">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em]">
                  {canCancelOrder(order) ? (
                    <button
                      type="button"
                      onClick={() => void handleCancelOrder(order.id)}
                      disabled={isCancellingOrderId === order.id}
                      className="rounded-full border border-[#ff9f84]/40 bg-[#6d1f18]/45 px-3 py-1 text-[#ffe0d4] disabled:opacity-60"
                    >
                      {isCancellingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  ) : null}
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/88">
                    {order.orderType}
                  </span>
                  <span className="rounded-full border border-[#f4a486]/35 bg-[#5a2018]/35 px-3 py-1 text-[#ffd4c3]">
                    {order.orderStatus}
                  </span>
                  <span className="rounded-full border border-[#89dcb2]/35 bg-emerald-900/20 px-3 py-1 text-emerald-100">
                    {order.paymentStatus}
                  </span>
                  {order.orderStatus === 'CANCELLED' ? (
                    <span className="rounded-full border border-[#e8b7bb]/35 bg-[#53181f]/35 px-3 py-1 text-[#ffd9dc]">
                      Cancelled
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/55">Restaurant</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">{order.restaurantName || '-'}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/55">Total</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">
                    {order.total.toFixed(2)} {order.currency || 'USD'}
                  </p>
                </div>
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/55">QR Scan</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">{order.qrScannedAt ? 'Scanned' : 'Pending'}</p>
                </div>
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/55">QR Expiry</p>
                  <p className="mt-1 text-sm font-semibold text-white/90">{formatDate(order.qrExpiresAt)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/65">Items</p>
                <div className="mt-2 space-y-2">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.menuItemId}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm text-white/85">
                      <span>{item.name}</span>
                      <span>x{item.quantity} @ {item.unitPrice.toFixed(2)}</span>
                      <span>{item.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/65">
                    <QrCode className="h-3.5 w-3.5" />
                    Generated QR
                  </p>
                  {order.qrToken ? (
                    <>
                      <div className="mt-3 rounded-xl bg-white p-3">
                        <QRCodeSVG value={order.qrToken} size={140} className="mx-auto" />
                      </div>
                      <p className="mt-2 break-all rounded-lg border border-white/15 bg-black/25 px-2 py-1 font-mono text-[0.65rem] text-white/88">
                        {order.qrToken}
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-white/70">QR token unavailable for legacy order. New orders show full QR code here.</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
