'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ChefHat, Layers, LockKeyhole, ShieldCheck, Store } from 'lucide-react';
import { useRequireFullyVerified } from '@/services/auth/hooks';
import {
  managerAddStaff,
  managerArchiveRestaurant,
  managerCreateCategory,
  managerCreateMenuItem,
  managerGetRestaurant,
  managerListCategories,
  managerListMenuItems,
  managerListRestaurants,
  managerRequestPublish,
  managerRequestRestoreFee,
  managerSetMenuItemAvailability,
  managerSetMenuItemPublish,
  managerUpdateRestaurant,
} from '@/services/commerce/api';
import type {
  ManagerCategory,
  ManagerMenuItem,
  ManagerRestaurant,
  ManagerStaffAssignmentPayload,
} from '@/services/commerce/types';

const MANAGER_ROLES = ['user', 'manager', 'superadmin'];
const STAFF_ROLE_OPTIONS: ManagerStaffAssignmentPayload['role'][] = ['STAFF', 'MANAGER', 'DELIVERY_MAN', 'CHEF'];

export default function ManagerConsolePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hydrated, accessToken, user, isFullyVerified } = useRequireFullyVerified('/sign-in');

  const [managedRestaurants, setManagedRestaurants] = useState<ManagerRestaurant[]>([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurant, setRestaurant] = useState<ManagerRestaurant | null>(null);
  const [categories, setCategories] = useState<ManagerCategory[]>([]);
  const [menuItems, setMenuItems] = useState<ManagerMenuItem[]>([]);

  const [editDescription, setEditDescription] = useState('');
  const [editCurrency, setEditCurrency] = useState('USD');

  const [staffUserId, setStaffUserId] = useState('');
  const [staffRole, setStaffRole] = useState<ManagerStaffAssignmentPayload['role']>('STAFF');

  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const [itemCategoryId, setItemCategoryId] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCurrency, setItemCurrency] = useState('USD');

  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const canManage = useMemo(
    () => (user?.roles || []).some((role) => MANAGER_ROLES.includes(role)),
    [user?.roles]
  );
  const isSuperadmin = (user?.roles || []).includes('superadmin');
  const selectedRestaurantIsActive = restaurant?.subscription.status === 'ACTIVE';
  const managerUnlocked = isSuperadmin || (Boolean(restaurant) && selectedRestaurantIsActive);
  const preferredRestaurantId = (searchParams.get('restaurantId') || '').trim();

  useEffect(() => {
    if (!hydrated || !accessToken || !isFullyVerified) {
      return;
    }

    if (!canManage) {
      router.replace('/dashboard');
    }
  }, [hydrated, accessToken, isFullyVerified, canManage, router]);

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    setEditDescription(restaurant.description || '');
    setEditCurrency(restaurant.settings.currency || 'USD');
  }, [restaurant]);

  const runAction = (action: () => Promise<void>) => {
    if (!accessToken) {
      setErrorMessage('Missing access token. Please sign in again.');
      return;
    }

    setErrorMessage('');
    setMessage('');
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

  const refreshRestaurantData = useCallback(async (token: string, id: string) => {
    const [restaurantData, categoryData, itemData] = await Promise.all([
      managerGetRestaurant(token, id),
      managerListCategories(token, id),
      managerListMenuItems(token, id),
    ]);

    setRestaurant(restaurantData);
    setCategories(categoryData);
    setMenuItems(itemData);
  }, []);

  const refreshManagedRestaurants = useCallback(async (token: string, requestedRestaurantId?: string) => {
    const restaurants = await managerListRestaurants(token);
    setManagedRestaurants(restaurants);

    if (!restaurants.length) {
      setRestaurantId('');
      setRestaurant(null);
      setCategories([]);
      setMenuItems([]);
      return;
    }

    const preferred = requestedRestaurantId || restaurantId;
    const selected = preferred && restaurants.some((entry) => entry.id === preferred)
      ? preferred
      : restaurants[0].id;

    setRestaurantId(selected);
    await refreshRestaurantData(token, selected);
  }, [refreshRestaurantData, restaurantId]);

  useEffect(() => {
    if (!hydrated || !accessToken || !isFullyVerified || !canManage) {
      return;
    }

    setIsLoadingRestaurants(true);
    setErrorMessage('');

    void (async () => {
      try {
        await refreshManagedRestaurants(accessToken, preferredRestaurantId || undefined);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load managed restaurants.');
      } finally {
        setIsLoadingRestaurants(false);
      }
    })();
  }, [hydrated, accessToken, isFullyVerified, canManage, refreshManagedRestaurants, preferredRestaurantId]);

  const getUnlockedRestaurant = (): ManagerRestaurant | null => {
    if (!restaurant) {
      setErrorMessage('Select a restaurant first.');
      return null;
    }

    if (!managerUnlocked) {
      setErrorMessage('Restaurant is locked. Complete payment activation first.');
      return null;
    }

    return restaurant;
  };

  const handleSelectManagedRestaurant = (id: string) => {
    if (!accessToken) {
      return;
    }

    setRestaurantId(id);
    runAction(async () => {
      await refreshRestaurantData(accessToken, id);
      setMessage('Restaurant loaded.');
    });
  };

  const handleSaveRestaurantProfile = () => {
    if (!accessToken || !restaurant) {
      return;
    }

    const activeRestaurant = getUnlockedRestaurant();
    if (!activeRestaurant) {
      return;
    }

    runAction(async () => {
      const updated = await managerUpdateRestaurant(accessToken, activeRestaurant.id, {
        description: editDescription.trim() || undefined,
        settings: {
          currency: editCurrency.trim().toUpperCase() || 'USD',
        },
      });
      setRestaurant(updated);
      await refreshManagedRestaurants(accessToken, updated.id);
      setMessage('Restaurant profile updated.');
    });
  };

  const handleRequestPublish = () => {
    const activeRestaurant = getUnlockedRestaurant();
    if (!accessToken || !activeRestaurant) {
      return;
    }

    runAction(async () => {
      const updated = await managerRequestPublish(accessToken, activeRestaurant.id);
      setRestaurant(updated);
      await refreshManagedRestaurants(accessToken, updated.id);
      setMessage('Publish request sent.');
    });
  };

  const handleArchive = () => {
    const activeRestaurant = getUnlockedRestaurant();
    if (!accessToken || !activeRestaurant) {
      return;
    }

    runAction(async () => {
      const updated = await managerArchiveRestaurant(accessToken, activeRestaurant.id);
      setRestaurant(updated);
      await refreshManagedRestaurants(accessToken, updated.id);
      setMessage('Restaurant archived.');
    });
  };

  const handleRequestRestore = () => {
    if (!accessToken || !restaurant) {
      return;
    }

    runAction(async () => {
      const updated = await managerRequestRestoreFee(accessToken, restaurant.id, {
        reason: 'Owner requested restore from manager console.',
      });
      setRestaurant(updated);
      await refreshManagedRestaurants(accessToken, updated.id);
      setMessage('Restore request submitted. Complete payment to activate.');
    });
  };

  const handleAddStaff = () => {
    const activeRestaurant = getUnlockedRestaurant();
    if (!accessToken || !activeRestaurant || !staffUserId.trim()) {
      setErrorMessage('Staff user ID is required.');
      return;
    }

    runAction(async () => {
      await managerAddStaff(accessToken, activeRestaurant.id, {
        userId: staffUserId.trim(),
        role: staffRole,
      });
      setMessage('Staff assignment created.');
    });
  };

  const handleCreateCategory = () => {
    const activeRestaurant = getUnlockedRestaurant();
    if (!accessToken || !activeRestaurant || !categoryName.trim()) {
      setErrorMessage('Category name is required.');
      return;
    }

    runAction(async () => {
      await managerCreateCategory(accessToken, activeRestaurant.id, {
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
      });
      const nextCategories = await managerListCategories(accessToken, activeRestaurant.id);
      setCategories(nextCategories);
      setMessage('Category created.');
    });
  };

  const handleCreateMenuItem = () => {
    const activeRestaurant = getUnlockedRestaurant();
    if (!accessToken || !activeRestaurant || !itemCategoryId.trim() || !itemName.trim()) {
      setErrorMessage('Category ID and item name are required.');
      return;
    }

    const basePrice = Number(itemPrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      setErrorMessage('Item base price must be zero or greater.');
      return;
    }

    runAction(async () => {
      await managerCreateMenuItem(accessToken, activeRestaurant.id, {
        categoryId: itemCategoryId.trim(),
        name: itemName.trim(),
        basePrice,
        currency: itemCurrency.trim().toUpperCase() || 'USD',
      });
      const nextItems = await managerListMenuItems(accessToken, activeRestaurant.id);
      setMenuItems(nextItems);
      setMessage('Menu item created.');
    });
  };

  const handleToggleItemAvailability = (item: ManagerMenuItem) => {
    if (!accessToken || !getUnlockedRestaurant()) {
      return;
    }

    runAction(async () => {
      const nextAvailability = item.availability === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
      const updated = await managerSetMenuItemAvailability(accessToken, item.id, nextAvailability);
      setMenuItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setMessage(`Item ${updated.name} set to ${updated.availability}.`);
    });
  };

  const handleToggleItemPublish = (item: ManagerMenuItem) => {
    if (!accessToken || !getUnlockedRestaurant()) {
      return;
    }

    runAction(async () => {
      const updated = await managerSetMenuItemPublish(accessToken, item.id, !item.isPublished);
      setMenuItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
      setMessage(`Item ${updated.name} publish updated.`);
    });
  };

  const buildActivationPath = (id: string) => `/abonnement/payment?restaurantId=${encodeURIComponent(id)}`;

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

  if (!canManage) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#42120f_0%,#150908_52%,#09090b_100%)] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6">
        <header className="rounded-3xl border border-white/12 bg-black/35 p-6 shadow-[0_24px_55px_rgba(0,0,0,0.36)] sm:p-8">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#ffcab8]">Manager</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-[0.06em] text-[#fff4ed] sm:text-5xl">Restaurant Management</h1>
          <p className="mt-3 text-sm text-[#f6cfbf]">Payment and creation are separated. This page is only for managing existing active restaurants.</p>
        </header>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              <Store className="h-4 w-4" />
              Restaurant Access
            </p>
            <p className="mt-3 text-sm text-white/75">To open a new restaurant: buy a plan, complete payment, then create the restaurant from the subscription flow.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/abonnement" className="rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
                Buy Plan
              </Link>
              <Link href="/abonnement/create-restaurant" className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                Create Restaurant After Payment
              </Link>
            </div>

            {!isLoadingRestaurants && !managedRestaurants.length ? (
              <p className="mt-4 text-sm text-white/70">No restaurants yet. Start from Buy Plan.</p>
            ) : null}
          </article>

          <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
            <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
              <Building2 className="h-4 w-4" />
              Your Restaurants
            </p>

            {isLoadingRestaurants ? (
              <div className="mt-4 h-24 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ) : null}

            {!isLoadingRestaurants && managedRestaurants.length ? (
              <div className="mt-3 space-y-3">
                {managedRestaurants.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold uppercase tracking-[0.12em] text-[#ffe0d2]">{entry.name}</p>
                      <span className="rounded-full border border-white/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/85">
                        {entry.subscription.status || 'PENDING'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/70">Status: {entry.status || '-'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleSelectManagedRestaurant(entry.id)} disabled={isBusy} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60">
                        Open
                      </button>
                      {entry.subscription.status !== 'ACTIVE' ? (
                        <Link href={buildActivationPath(entry.id)} className="rounded-full bg-[#c61a22] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                          Activate
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        </section>

        {restaurant && !managerUnlocked ? (
          <section className="mt-6 rounded-3xl border border-[#f2b487]/35 bg-[#5f281a]/35 p-5 text-[#ffe3d4]">
            <p className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-[#ffd6c2]">
              <LockKeyhole className="h-4 w-4" />
              Restaurant Locked
            </p>
            <p className="mt-2 text-sm">This restaurant is not active yet. Activate payment first to unlock manager tools.</p>
            <Link href={buildActivationPath(restaurant.id)} className="mt-3 inline-flex rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white">
              Go To Activation Payment
            </Link>
          </section>
        ) : null}

        {restaurant && managerUnlocked ? (
          <>
            <section className="mt-6 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
                <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                  <Building2 className="h-4 w-4" />
                  Restaurant Profile
                </p>
                <div className="mt-3 space-y-3">
                  <textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} placeholder="Description" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                  <input value={editCurrency} onChange={(event) => setEditCurrency(event.target.value)} placeholder="Currency" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                  <button type="button" onClick={handleSaveRestaurantProfile} disabled={isBusy} className="rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                    Save Info
                  </button>
                </div>
              </article>

              <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
                <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                  <ShieldCheck className="h-4 w-4" />
                  Restaurant Actions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={handleRequestPublish} disabled={isBusy} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50">Request Publish</button>
                  <button type="button" onClick={handleArchive} disabled={isBusy} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50">Archive</button>
                  <button type="button" onClick={handleRequestRestore} disabled={isBusy} className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50">Request Restore Fee</button>
                </div>
                <p className="mt-4 text-sm text-white/75">Chef alert is separated by role.</p>
                <Link href="/ops/chef-alerts" className="mt-2 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/88">
                  Open Chef Alerts
                </Link>
              </article>
            </section>

            <section className="mt-6 grid gap-5 lg:grid-cols-2">
              <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
                <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                  <ShieldCheck className="h-4 w-4" />
                  Staff Assignment
                </p>
                <div className="mt-3 space-y-3">
                  <input value={staffUserId} onChange={(event) => setStaffUserId(event.target.value)} placeholder="User ID" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                  <select value={staffRole} onChange={(event) => setStaffRole(event.target.value as ManagerStaffAssignmentPayload['role'])} className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30">
                    {STAFF_ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role} className="bg-[#181818]">{role}</option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddStaff} disabled={isBusy} className="rounded-full bg-[#c61a22] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                    Assign Role
                  </button>
                </div>
              </article>

              <article className="rounded-3xl border border-white/12 bg-black/30 p-5">
                <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                  <Layers className="h-4 w-4" />
                  Menu Categories ({categories.length})
                </p>
                <div className="mt-3 space-y-3">
                  <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                  <input value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} placeholder="Category description" className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                  <button type="button" onClick={handleCreateCategory} disabled={isBusy} className="rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                    Add Category
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85">
                      <p className="font-semibold text-[#ffe0d3]">{category.name}</p>
                      <p className="text-xs text-white/65">{category.id}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="mt-6 rounded-3xl border border-white/12 bg-black/30 p-5">
              <p className="inline-flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/65">
                <ChefHat className="h-4 w-4" />
                Menu Items ({menuItems.length})
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input value={itemCategoryId} onChange={(event) => setItemCategoryId(event.target.value)} placeholder="Category ID" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                <input value={itemName} onChange={(event) => setItemName(event.target.value)} placeholder="Item name" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                <input value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} placeholder="Base price" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
                <input value={itemCurrency} onChange={(event) => setItemCurrency(event.target.value)} placeholder="Currency" className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30" />
              </div>
              <button type="button" onClick={handleCreateMenuItem} disabled={isBusy} className="mt-3 rounded-full border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                Add Menu Item
              </button>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/88">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-[#ffe0d3]">{item.name}</p>
                      <p className="text-xs text-white/65">{item.basePrice.toFixed(2)} {item.currency}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={() => handleToggleItemAvailability(item)} disabled={isBusy} className="rounded-full border border-white/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">
                        {item.availability}
                      </button>
                      <button type="button" onClick={() => handleToggleItemPublish(item)} disabled={isBusy} className="rounded-full border border-white/20 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-50">
                        {item.isPublished ? 'Published' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {errorMessage ? (
          <p className="mt-6 rounded-2xl border border-[#f48f92]/35 bg-[#571418]/35 px-4 py-3 text-sm text-[#ffd7d8]">
            {errorMessage}
          </p>
        ) : null}

        {message ? (
          <p className="mt-6 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/88">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
