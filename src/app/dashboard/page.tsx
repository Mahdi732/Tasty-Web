'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { restaurantService } from '../../services/restaurant.service';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, Store, ChevronRight, Navigation } from 'lucide-react';
import PageShell from '../../components/layout/PageShell';
import { Badge } from '../../components/ui';
import type { Restaurant, Menu, DeliveryETA } from '../../types';

export default function DashboardPage() {
  const router = useRouter();
  const { status, token } = useAuthStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [eta, setEta] = useState<DeliveryETA | null>(null);
  const [loading, setLoading] = useState(false);

  // Identity guarding
  useEffect(() => {
    if (!token) {
      router.push('/auth/login');
    } else if (status !== 'ACTIVE') {
      router.push('/auth/verify');
    }
  }, [status, token, router]);

  // Load restaurants on mount
  useEffect(() => {
    if (status === 'ACTIVE') {
      restaurantService
        .listPublic()
        .then((res) => {
          const data = res.data?.data;
          if (!data) {
            setRestaurants([]);
          } else if ('items' in data && Array.isArray(data.items)) {
            setRestaurants(data.items);
          } else if (Array.isArray(data)) {
            setRestaurants(data as unknown as Restaurant[]);
          } else {
            setRestaurants([]);
          }
        })
        .catch((err) => console.error('Error fetching restaurants', err));
    }
  }, [status]);

  // Load restaurant details and ETA
  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setLoading(true);
    setMenu(null);
    setEta(null);

    try {
      const menuRes = await restaurantService.getMenu(restaurant._id);
      setMenu(menuRes.data?.data ?? null);

      const etaRes = await restaurantService.getDeliveryETA(restaurant.slug, 30.42, -9.59);
      setEta(etaRes.data?.data ?? null);
    } catch (error) {
      console.error('Failed fetching restaurant details or ETA', error);
    } finally {
      setLoading(false);
    }
  };

  if (status !== 'ACTIVE') return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <PageShell title="Nearby Restaurants" description="Pick a restaurant to start your order">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: List */}
        <div className="md:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
            Available Options
          </h2>
          {restaurants.map((r) => (
            <button
              key={r._id}
              onClick={() => handleSelectRestaurant(r)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${selectedRestaurant?._id === r._id
                ? 'bg-[#111113] border-orange-500/30 shadow-lg shadow-orange-500/5'
                : 'bg-[#111113]/50 border-white/[0.06] hover:border-white/10 hover:bg-[#111113]'
                }`}
            >
              <div className="text-left">
                <h3 className="font-semibold text-gray-200">{r.name}</h3>
                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={11} /> {r.location?.city}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          ))}
          {restaurants.length === 0 && (
            <div className="p-6 bg-[#111113] border border-white/[0.06] rounded-xl text-center text-gray-500 text-sm">
              No restaurants found nearby.
            </div>
          )}
        </div>

        {/* Right Column: Menu & ETA */}
        <div className="md:col-span-2">
          {selectedRestaurant ? (
            <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 shadow-xl">

              {/* Dynamic ETA Banner */}
              {loading ? (
                <div className="animate-pulse bg-white/5 h-24 rounded-xl mb-6" />
              ) : eta ? (
                <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/5 border border-orange-500/20 p-5 rounded-xl mb-8 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-orange-400 mb-1">Live Delivery Estimate</h2>
                    <p className="text-sm text-orange-200/50">
                      Distance: <span className="font-bold text-orange-200/80">{eta.maxDistanceKm.toFixed(1)} km</span> •
                      Prep: <span className="font-bold text-orange-200/80">{eta.prepTimeMinutes}m</span> •
                      Travel: <span className="font-bold text-orange-200/80">{eta.travelTimeMinutes}m</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center bg-black/30 p-3 rounded-lg border border-white/[0.06]">
                    <Clock className="h-4 w-4 text-orange-500 mb-1" />
                    <span className="text-2xl font-black text-white">{eta.totalTimeMinutes} min</span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-4 mb-6 border-b border-white/[0.06] pb-4">
                <h2 className="text-xl font-bold text-white">{selectedRestaurant.name}</h2>
                {selectedRestaurant.isVerified && (
                  <Badge variant="success">Verified Partner</Badge>
                )}
              </div>

              {/* Menu Categories */}
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse bg-white/5 h-10 w-1/3 rounded" />
                  <div className="animate-pulse bg-white/5 h-20 rounded" />
                  <div className="animate-pulse bg-white/5 h-20 rounded" />
                </div>
              ) : menu?.categories?.length ? (
                <div className="space-y-8 pb-4">
                  {menu.categories.map((category, idx) => (
                    <div key={idx}>
                      <h3 className="text-lg font-bold text-gray-300 mb-4">{category.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.items.map((item) => (
                          <div
                            key={item._id}
                            className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-orange-500/30 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                                {item.name}
                              </span>
                              <span className="text-orange-400 font-mono ml-2">
                                ${item.price.toFixed(2)}
                              </span>
                            </div>
                            <button className="mt-3 text-xs w-full py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all font-semibold">
                              + Add to Order
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Navigation className="mx-auto h-12 w-12 text-gray-700 mb-4" />
                  <h3 className="text-lg text-gray-500 font-medium">Menu Currently Unavailable</h3>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-600 bg-[#111113]/30 border border-dashed border-white/[0.06] rounded-2xl">
              <Store className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-base text-gray-500">Select a restaurant to view its menu & delivery time</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}