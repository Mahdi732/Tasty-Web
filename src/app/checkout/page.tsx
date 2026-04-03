'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CreditCard, QrCode, ShieldCheck, Truck, Wallet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import { createOrder, createOrderPayment } from '@/services/commerce/api';
import { useCartStore } from '@/services/cart/store';

export default function CheckoutPage() {
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');
  const restaurant = useCartStore((state) => state.restaurant);
  const items = useCartStore((state) => state.items);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [fulfillmentMode, setFulfillmentMode] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'PAY_ON_APP' | 'PAY_LATER'>('PAY_ON_APP');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [qrToken, setQrToken] = useState('');

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const handleCheckout = () => {
    if (!accessToken || !user?.id || !restaurant) {
      setErrorMessage('You need an active verified session to continue.');
      return;
    }

    if (fulfillmentMode === 'DELIVERY' && !deliveryAddress.trim()) {
      setErrorMessage('Delivery address is required for delivery orders.');
      return;
    }

    if (!items.length) {
      setErrorMessage('Cart is empty.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setQrToken('');
    setIsSubmitting(true);

    void (async () => {
      try {
        const order = await createOrder(accessToken, {
          restaurantId: restaurant.restaurantId,
          orderType: fulfillmentMode === 'DELIVERY' ? 'DELIVERY' : 'PREORDER',
          paymentMethod,
          restaurantSnapshot: {
            name: restaurant.name,
            slug: restaurant.slug,
            citySlug: restaurant.citySlug,
            taxRate: restaurant.taxRate,
            serviceFee: restaurant.serviceFee,
            currency: restaurant.currency,
            version: 1,
          },
          fulfillment: {
            mode: fulfillmentMode,
            deliveryAddress: fulfillmentMode === 'DELIVERY' ? deliveryAddress.trim() : undefined,
          },
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        });

        let paymentSummary = 'Payment on delivery selected. You can pay at handoff.';
        if (paymentMethod === 'PAY_ON_APP') {
          const payment = await createOrderPayment(accessToken, {
            userId: user.id,
            orderId: order.orderId,
            amount: subtotal,
            currency: restaurant.currency,
            payment: {
              type: 'CARD',
              token: 'tok_demo_visa_4242',
              maskedPan: '**** **** **** 4242',
              brand: 'VISA',
            },
          });
          paymentSummary = `Payment ${payment.status.toUpperCase()} with transaction ${payment.transactionId}.`;
        }

        clearCart();
        setQrToken(order.qrToken);
        setSuccessMessage(
          `Order ${order.orderId} confirmed. ${paymentSummary}`
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Checkout failed.');
      } finally {
        setIsSubmitting(false);
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

  if (!restaurant || items.length === 0) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#10080a_0%,#09090b_100%)] px-4 pt-24 text-white sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/12 bg-black/35 p-8 text-center shadow-[0_18px_42px_rgba(0,0,0,0.35)]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Checkout</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.06em] text-[#fff3ed]">Your cart is empty</h1>
          <p className="mt-3 text-sm text-[#d8b8ab]">Pick items from a restaurant menu to continue.</p>
          <Link
            href="/restaurants"
            className="mt-6 inline-flex rounded-full bg-[#c61a22] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white"
          >
            Browse Restaurants
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#481210_0%,#120809_42%,#09090b_100%)] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-16 pt-24 sm:px-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)]">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcbb8]">Checkout</p>
          <h1 className="mt-3 text-3xl font-black uppercase tracking-[0.06em] text-[#fff2eb]">{restaurant.name}</h1>

          <div className="mt-6 grid gap-4 rounded-2xl border border-white/12 bg-white/5 p-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setFulfillmentMode('DELIVERY')}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                fulfillmentMode === 'DELIVERY'
                  ? 'border-[#e53a3f] bg-[#5e1318]/45'
                  : 'border-white/12 bg-black/20 hover:border-white/25'
              }`}
            >
              <Truck className="h-5 w-5 text-[#ff8a72]" />
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em]">Delivery</p>
              <p className="mt-1 text-xs text-white/65">Drop at your address.</p>
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentMode('PICKUP')}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                fulfillmentMode === 'PICKUP'
                  ? 'border-[#e53a3f] bg-[#5e1318]/45'
                  : 'border-white/12 bg-black/20 hover:border-white/25'
              }`}
            >
              <ShieldCheck className="h-5 w-5 text-[#ff8a72]" />
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em]">Pickup</p>
              <p className="mt-1 text-xs text-white/65">Collect from the restaurant.</p>
            </button>
          </div>

          {fulfillmentMode === 'DELIVERY' ? (
            <div className="mt-5">
              <label htmlFor="deliveryAddress" className="mb-2 block text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/82">
                Delivery Address
              </label>
              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                rows={3}
                placeholder="Street, building, floor, apartment, notes"
                className="w-full rounded-2xl border border-white/14 bg-black/28 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
              />
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 rounded-2xl border border-white/12 bg-white/5 p-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('PAY_ON_APP')}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                paymentMethod === 'PAY_ON_APP'
                  ? 'border-[#e53a3f] bg-[#5e1318]/45'
                  : 'border-white/12 bg-black/20 hover:border-white/25'
              }`}
            >
              <CreditCard className="h-5 w-5 text-[#ff8a72]" />
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em]">Pay Now</p>
              <p className="mt-1 text-xs text-white/65">Card charge immediately in checkout.</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('PAY_LATER')}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                paymentMethod === 'PAY_LATER'
                  ? 'border-[#e53a3f] bg-[#5e1318]/45'
                  : 'border-white/12 bg-black/20 hover:border-white/25'
              }`}
            >
              <Wallet className="h-5 w-5 text-[#ff8a72]" />
              <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em]">Pay On Delivery</p>
              <p className="mt-1 text-xs text-white/65">Order now, settle payment on handoff.</p>
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.08em] text-[#fff0e6]">{item.name}</p>
                  <p className="mt-1 text-xs text-white/70">
                    {item.unitPrice.toFixed(2)} {restaurant.currency}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-2 py-1">
                  <button
                    type="button"
                    onClick={() => setItemQuantity(item.menuItemId, item.quantity - 1)}
                    className="h-7 w-7 rounded-full bg-white/12 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setItemQuantity(item.menuItemId, item.quantity + 1)}
                    className="h-7 w-7 rounded-full bg-[#c61a22] text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {errorMessage ? (
            <p className="mt-5 rounded-2xl border border-[#f58d92]/40 bg-[#5f131a]/35 px-4 py-3 text-sm text-[#ffd5d7]">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="mt-5 rounded-2xl border border-emerald-400/40 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </p>
          ) : null}

          {qrToken ? (
            <div className="mt-5 rounded-2xl border border-cyan-300/40 bg-cyan-950/30 px-4 py-4 text-cyan-50">
              <p className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <QrCode className="h-4 w-4" />
                Pickup QR Token
              </p>
              <p className="mt-2 text-sm text-cyan-100/90">Show this QR code or token to the restaurant or delivery staff to validate your order handoff.</p>
              <div className="mt-3 inline-flex rounded-2xl bg-white p-3">
                <QRCodeSVG value={qrToken} size={128} className="h-32 w-32" />
              </div>
              <p className="mt-3 rounded-xl border border-cyan-300/30 bg-black/35 px-3 py-2 font-mono text-sm tracking-wide text-cyan-100">
                {qrToken}
              </p>
              <Link
                href="/orders"
                className="mt-3 inline-flex rounded-full border border-cyan-200/35 px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-cyan-100"
              >
                View Orders And QR
              </Link>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#a8131a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paymentMethod === 'PAY_ON_APP' ? <CreditCard className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            {isSubmitting
              ? 'Processing...'
              : paymentMethod === 'PAY_ON_APP'
                ? 'Place Order And Pay Now'
                : 'Place Order And Pay Later'}
          </button>
        </section>

        <aside className="h-fit rounded-3xl border border-white/12 bg-black/35 p-5 shadow-[0_24px_55px_rgba(0,0,0,0.34)] lg:sticky lg:top-24">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Summary</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-white/85">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-white/85">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} {restaurant.currency}</span>
            </div>
            <div className="flex items-center justify-between text-white/65">
              <span>Fraud gate</span>
              <span>Verified</span>
            </div>
            <div className="flex items-center justify-between text-white/65">
              <span>Payment mode</span>
              <span>{paymentMethod === 'PAY_ON_APP' ? 'Pay now' : 'Pay later'}</span>
            </div>
            <div className="h-px bg-white/14" />
            <div className="flex items-center justify-between text-base font-black uppercase tracking-[0.08em] text-[#fff2ea]">
              <span>Total</span>
              <span>{subtotal.toFixed(2)} {restaurant.currency}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
