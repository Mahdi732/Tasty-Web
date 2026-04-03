'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Clock3, MapPin, ShoppingCart, Sparkles } from 'lucide-react';
import {
  estimateRestaurantDeliveryTime,
  getPublicRestaurant,
  getPublicRestaurantMenu,
} from '@/services/commerce/api';
import { useCartStore } from '@/services/cart/store';
import type { CartRestaurantSnapshot, MenuItem, PublicRestaurant, RestaurantMenuProjection } from '@/services/commerce/types';

export default function RestaurantMenuPage() {
  const params = useParams<{ citySlug: string; slug: string }>();
  const citySlug = String(params?.citySlug || '');
  const slug = String(params?.slug || '');

  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [menu, setMenu] = useState<RestaurantMenuProjection | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [etaText, setEtaText] = useState('');
  const [isEtaLoading, setIsEtaLoading] = useState(false);

  const cartRestaurant = useCartStore((state) => state.restaurant);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);

  const quantities = useMemo(() => {
    return cartItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.menuItemId] = item.quantity;
      return acc;
    }, {});
  }, [cartItems]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const restaurantSnapshot = useMemo<CartRestaurantSnapshot | null>(() => {
    if (!restaurant) {
      return null;
    }

    return {
      restaurantId: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      citySlug: restaurant.citySlug,
      currency: restaurant.currency,
      taxRate: restaurant.taxRate,
      serviceFee: restaurant.serviceFee,
    };
  }, [restaurant]);

  useEffect(() => {
    const load = async () => {
      if (!citySlug || !slug) {
        setErrorMessage('Invalid restaurant route.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const [restaurantPayload, menuPayload] = await Promise.all([
          getPublicRestaurant(citySlug, slug),
          getPublicRestaurantMenu(citySlug, slug),
        ]);
        setRestaurant(restaurantPayload);
        setMenu(menuPayload);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load restaurant menu.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [citySlug, slug]);

  const handleAdd = (item: MenuItem) => {
    if (!restaurantSnapshot) {
      return;
    }

    addItem(
      restaurantSnapshot,
      {
        menuItemId: item.id,
        name: item.name,
        unitPrice: item.basePrice,
        imageUrl: item.images[0] || '',
      },
      1
    );
  };

  const handleEstimateEta = () => {
    const itemIds = cartItems.map((item) => item.menuItemId);
    if (!itemIds.length) {
      setEtaText('Add at least one item to estimate delivery time.');
      return;
    }

    setIsEtaLoading(true);
    setEtaText('');

    void (async () => {
      try {
        const estimate = await estimateRestaurantDeliveryTime(citySlug, slug, itemIds, 5);
        setEtaText(`Estimated delivery in ${estimate.estimatedDeliveryMinutes} min.`);
      } catch (error) {
        setEtaText(error instanceof Error ? error.message : 'Unable to estimate delivery now.');
      } finally {
        setIsEtaLoading(false);
      }
    })();
  };

  const hasCartFromAnotherRestaurant =
    Boolean(cartRestaurant)
    && Boolean(restaurantSnapshot)
    && cartRestaurant?.restaurantId !== restaurantSnapshot?.restaurantId;

  const cover = restaurant?.coverUrl || menu?.restaurant.coverUrl || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1700&q=80';

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#0f0a09_0%,#290f0f_45%,#120808_100%)] text-white">
      <div className="relative h-[280px] w-full overflow-hidden border-b border-white/10 sm:h-[340px]">
        <img src={cover} alt={restaurant?.name || 'Restaurant'} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35)_0%,rgba(4,4,4,0.84)_72%,rgba(4,4,4,0.96)_100%)]" />

        <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#ffccbb]">Restaurant Menu</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff3eb] sm:text-5xl">
            {restaurant?.name || 'Loading...'}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#f2cdbf]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {restaurant?.city || menu?.restaurant.city || citySlug}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              {restaurant?.currency || 'USD'}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[1fr_330px] lg:px-8">
        <section>
          {hasCartFromAnotherRestaurant ? (
            <p className="mb-4 rounded-2xl border border-[#f7a17f]/35 bg-[#5e1f17]/35 px-4 py-3 text-sm text-[#ffd8c8]">
              Your cart currently belongs to another restaurant. Adding items here will replace it.
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl border border-[#f49093]/35 bg-[#53161b]/35 px-4 py-3 text-sm text-[#ffd6d7]">
              {errorMessage}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-52 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {(menu?.categories || []).map((category) => (
                <div key={category.id}>
                  <div className="mb-4">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">Category</p>
                    <h2 className="text-2xl font-black uppercase tracking-[0.04em] text-[#fff2ea]">{category.name}</h2>
                    {category.description ? (
                      <p className="mt-1 text-sm text-[#d7b5a7]">{category.description}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {category.items.map((item) => {
                      const quantity = quantities[item.id] || 0;
                      const image = item.images[0] || 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80';

                      return (
                        <article
                          key={item.id}
                          className="overflow-hidden rounded-3xl border border-white/12 bg-[#140d0d] shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
                        >
                          <div className="h-36 w-full overflow-hidden">
                            <img src={image} alt={item.name} className="h-full w-full object-cover" />
                          </div>

                          <div className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="text-base font-extrabold uppercase tracking-[0.05em] text-[#fff1e8]">{item.name}</h3>
                                <p className="mt-1 line-clamp-2 text-sm text-[#d7b2a2]">{item.description || 'Chef recommendation from this category.'}</p>
                              </div>
                              <p className="shrink-0 text-sm font-bold uppercase tracking-[0.12em] text-[#ffb08d]">
                                {item.basePrice.toFixed(2)} {item.currency || restaurant?.currency || 'USD'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-white/60">
                                <Clock3 className="h-3.5 w-3.5" />
                                {item.averagePrepTime} min prep
                              </span>

                              {quantity > 0 ? (
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => setItemQuantity(item.id, quantity - 1)}
                                    className="h-7 w-7 rounded-full bg-white/12 text-sm font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="w-6 text-center text-sm font-bold text-[#ffe7da]">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setItemQuantity(item.id, quantity + 1)}
                                    className="h-7 w-7 rounded-full bg-[#c51a22] text-sm font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAdd(item)}
                                  className="rounded-full bg-[#c61a22] px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white"
                                >
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-white/14 bg-black/40 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:sticky lg:top-24">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffccbb]">Your Cart</p>
          <p className="mt-3 text-3xl font-black uppercase tracking-[0.06em] text-[#fff4ed]">{cartCount} items</p>
          <p className="mt-2 text-sm text-[#dfb6a4]">Subtotal: {subtotal.toFixed(2)} {restaurant?.currency || cartRestaurant?.currency || 'USD'}</p>

          <button
            type="button"
            onClick={handleEstimateEta}
            disabled={isEtaLoading || cartCount === 0}
            className="mt-5 w-full rounded-full border border-white/18 bg-white/6 px-4 py-3 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEtaLoading ? 'Estimating...' : 'Estimate Delivery'}
          </button>

          {etaText ? (
            <p className="mt-3 text-sm text-[#ffd7c7]">{etaText}</p>
          ) : null}

          <Link
            href="/checkout"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c61a22] px-4 py-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            Proceed To Checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
