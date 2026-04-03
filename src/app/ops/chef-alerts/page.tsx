'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BellRing, ChefHat } from 'lucide-react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import { managerTriggerLowStockAlert } from '@/services/commerce/api';

const CHEF_ALERT_ROLES = ['chef', 'superadmin'];

export default function ChefAlertsPage() {
  const router = useRouter();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');

  const [restaurantId, setRestaurantId] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [threshold, setThreshold] = useState('');
  const [level, setLevel] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canSendAlerts = useMemo(
    () => (user?.roles || []).some((role) => CHEF_ALERT_ROLES.includes(role)),
    [user?.roles]
  );

  useEffect(() => {
    if (!hydrated || !accessToken || !isFullyVerified) {
      return;
    }

    if (!canSendAlerts) {
      router.replace('/dashboard');
    }
  }, [hydrated, accessToken, isFullyVerified, canSendAlerts, router]);

  const handleSendAlert = () => {
    if (!accessToken || !canSendAlerts) {
      setErrorMessage('Chef role is required to send low-stock alerts.');
      return;
    }

    if (!restaurantId.trim() || !ingredient.trim()) {
      setErrorMessage('Restaurant ID and ingredient are required.');
      return;
    }

    const parsedThreshold = Number(threshold || 0);
    const parsedLevel = Number(level || 0);

    if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0) {
      setErrorMessage('Threshold must be zero or greater.');
      return;
    }

    if (!Number.isFinite(parsedLevel) || parsedLevel < 0) {
      setErrorMessage('Current level must be zero or greater.');
      return;
    }

    setErrorMessage('');
    setMessage('');
    setIsBusy(true);

    void (async () => {
      try {
        await managerTriggerLowStockAlert(accessToken, restaurantId.trim(), {
          ingredient: ingredient.trim(),
          threshold: parsedThreshold || undefined,
          level: parsedLevel || undefined,
        });

        setMessage('Low-stock alert sent to inventory workflow.');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to send low-stock alert.');
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

  if (!canSendAlerts) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#40100f_0%,#140909_52%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcdbd]">Chef Ops</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff3eb] sm:text-5xl">Low Stock Alerts</h1>
          <p className="mt-3 text-sm text-[#f6cdbd]">Chef-only action to notify inventory and management about ingredient shortages.</p>
        </header>

        <section className="mt-6 rounded-3xl border border-white/12 bg-black/30 p-5">
          <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
            <ChefHat className="h-4 w-4" />
            Alert Form
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              value={restaurantId}
              onChange={(event) => setRestaurantId(event.target.value)}
              placeholder="Restaurant ID"
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
            />
            <input
              value={ingredient}
              onChange={(event) => setIngredient(event.target.value)}
              placeholder="Ingredient"
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
            />
            <input
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              placeholder="Minimum threshold"
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
            />
            <input
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              placeholder="Current level"
              className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30"
            />
          </div>

          <button
            type="button"
            onClick={handleSendAlert}
            disabled={isBusy}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60"
          >
            <BellRing className="h-4 w-4" />
            {isBusy ? 'Sending...' : 'Send Low-Stock Alert'}
          </button>
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
      </div>
    </main>
  );
}
