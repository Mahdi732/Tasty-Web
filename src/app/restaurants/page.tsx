'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Search, ShoppingBag, Store } from 'lucide-react';
import { listPublicRestaurants } from '@/services/commerce/api';
import { useCartStore } from '@/services/cart/store';
import type { PublicRestaurant } from '@/services/commerce/types';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<PublicRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  const cartItems = useCartStore((state) => state.items);
  const cartRestaurant = useCartStore((state) => state.restaurant);

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const loadRestaurants = async (searchQuery?: string, citySlug?: string) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await listPublicRestaurants({
        page: 1,
        limit: 18,
        query: searchQuery,
        citySlug,
      });
      setRestaurants(result.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load restaurants.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRestaurants();
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadRestaurants(queryInput.trim() || undefined, cityInput.trim() || undefined);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#571311_0%,#170907_48%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/12 bg-black/30 p-6 shadow-[0_28px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#ffcab4]">Marketplace</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed] sm:text-5xl">
            Pick Your Restaurant
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#f9d9cb] sm:text-base">
            Browse active restaurants and jump into the live menu flow with fast checkout and payment.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:grid-cols-[1fr_180px_auto]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                value={queryInput}
                onChange={(event) => setQueryInput(event.target.value)}
                placeholder="Search name or description"
                className="w-full rounded-xl border border-white/15 bg-black/35 py-3 pl-9 pr-3 text-sm text-white outline-none transition focus:border-white/35"
              />
            </label>
            <input
              value={cityInput}
              onChange={(event) => setCityInput(event.target.value)}
              placeholder="City slug (optional)"
              className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-3 text-sm text-white outline-none transition focus:border-white/35"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#c61a22] px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-[#aa1219]"
            >
              Filter
            </button>
          </form>
        </header>

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[#f58a8d]/40 bg-[#5f1014]/40 px-4 py-3 text-sm text-[#ffd8d9]">
            {errorMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : (
          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => {
              const href = `/restaurants/${restaurant.citySlug}/${restaurant.slug}`;
              const cover = restaurant.coverUrl || 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80';

              return (
                <article
                  key={restaurant.id}
                  className="group overflow-hidden rounded-3xl border border-white/12 bg-black/30 shadow-[0_18px_45px_rgba(0,0,0,0.36)] transition hover:-translate-y-1 hover:border-white/24"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={cover}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <p className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white/90">
                      {restaurant.city || restaurant.citySlug}
                    </p>
                  </div>

                  <div className="space-y-3 p-4">
                    <div>
                      <h2 className="text-lg font-extrabold uppercase tracking-[0.04em] text-[#fff3eb]">{restaurant.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-[#e5bda9]">
                        {restaurant.description || 'Fresh menu and quick prep ready for checkout.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                        Currency {restaurant.currency}
                      </p>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1 rounded-full bg-[#c61a22] px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white"
                      >
                        Open Menu
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {!isLoading && restaurants.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-white/14 bg-white/5 p-8 text-center">
            <Store className="mx-auto h-10 w-10 text-white/70" />
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-white/78">No restaurants found</p>
            <p className="mt-2 text-sm text-white/65">Try another search keyword or city slug.</p>
          </div>
        ) : null}
      </div>

      {cartCount > 0 ? (
        <Link
          href="/checkout"
          className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full border border-white/18 bg-[#111]/85 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        >
          <ShoppingBag className="h-4 w-4 text-[#ff786f]" />
          {cartCount} items
          <span className="text-white/50">|</span>
          <span className="max-w-[120px] truncate text-[#ffd4c4]">{cartRestaurant?.name || 'Checkout'}</span>
        </Link>
      ) : null}
    </main>
  );
}
