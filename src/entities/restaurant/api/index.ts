import { httpClient } from '@/shared/api/http/client';

export const restaurantApi = {
  estimateDeliveryTime: (citySlug: string, slug: string, payload: unknown) =>
    httpClient(`/api/v1/restaurants/${citySlug}/${slug}/estimate-delivery-time`, {
      method: 'POST',
      body: payload,
    }),
};
