import { ApiRequestError, apiRequest } from '@/api/client';
import {
  API_ENDPOINTS,
  buildOrderCancelPath,
  buildAdminRestaurantSubscriptionPath,
  buildOrderDriverArrivedPath,
  buildManagerMenuItemAvailabilityPath,
  buildManagerMenuItemPublishPath,
  buildManagerRestaurantArchivePath,
  buildManagerRestaurantLowStockPath,
  buildManagerRestaurantMenuCategoriesPath,
  buildManagerRestaurantMenuCategoryPath,
  buildManagerRestaurantMenuItemPath,
  buildManagerRestaurantMenuItemsPath,
  buildManagerRestaurantPath,
  buildManagerRestaurantPublishPath,
  buildManagerRestaurantRestoreFeePath,
  buildManagerRestaurantStaffPath,
  buildOpsRestaurantOrdersPath,
  buildRestaurantDetailsPath,
  buildRestaurantEstimatePath,
  buildRestaurantMenuPath,
} from '@/api/endpoints';
import type {
  AdminSubscriptionPayload,
  ApiEnvelope,
  CreatedOrder,
  CreateOrderPayload,
  DebtStatusResult,
  DeliveryEstimate,
  DriverArrivedPayload,
  DriverArrivedResult,
  ManagerCategory,
  ManagerCategoryPayload,
  ManagerLowStockPayload,
  ManagerMenuItem,
  ManagerMenuItemPayload,
  ManagerRestoreFeePayload,
  ManagerRestaurant,
  ManagerRestaurantCreatePayload,
  ManagerRestaurantUpdatePayload,
  ManagerStaffAssignmentPayload,
  MenuCategory,
  MenuItem,
  MenuOptionGroup,
  MenuOptionItem,
  OrderHistoryEntry,
  OrderPaymentPayload,
  OrderPaymentResult,
  PublicRestaurant,
  QrScanPayload,
  QrScanResult,
  RestaurantMenuProjection,
  SubscriptionPaymentPayload,
  SubscriptionPaymentResult,
} from './types';

interface ListRestaurantsInput {
  page?: number;
  limit?: number;
  citySlug?: string;
  query?: string;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  (value && typeof value === 'object' ? value as Record<string, unknown> : {});

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;

const unwrapData = <T>(payload: ApiEnvelope<T>): T => {
  if (!payload?.success) {
    throw new ApiRequestError(
      payload?.error?.message || 'Request failed',
      400,
      payload?.error?.code || 'REQUEST_FAILED',
      payload
    );
  }

  return payload.data;
};

const normalizeRestaurant = (raw: unknown): PublicRestaurant => {
  const data = asRecord(raw);
  const location = asRecord(data.location);
  const settings = asRecord(data.settings);

  return {
    id: asString(data.id || data._id),
    name: asString(data.name),
    slug: asString(data.slug),
    city: asString(location.city),
    citySlug: asString(location.citySlug),
    description: asString(data.description),
    logoUrl: asString(data.logoUrl),
    coverUrl: asString(data.coverUrl),
    currency: asString(settings.currency || 'USD', 'USD'),
    taxRate: asNumber(settings.taxRate),
    serviceFee: asNumber(settings.serviceFee),
    supportedOrderModes: asStringArray(settings.supportedOrderModes),
  };
};

const normalizeOptionItem = (raw: unknown): MenuOptionItem => {
  const data = asRecord(raw);

  return {
    id: asString(data.id || data._id),
    name: asString(data.name),
    priceDelta: asNumber(data.priceDelta),
    sortOrder: asNumber(data.sortOrder),
  };
};

const normalizeOptionGroup = (raw: unknown): MenuOptionGroup => {
  const data = asRecord(raw);

  return {
    id: asString(data.id || data._id),
    name: asString(data.name),
    required: Boolean(data.required),
    multiSelect: Boolean(data.multiSelect),
    minSelect: asNumber(data.minSelect),
    maxSelect: asNumber(data.maxSelect),
    sortOrder: asNumber(data.sortOrder),
    items: Array.isArray(data.items) ? data.items.map(normalizeOptionItem) : [],
  };
};

const normalizeMenuItem = (raw: unknown): MenuItem => {
  const data = asRecord(raw);

  return {
    id: asString(data.id || data._id),
    name: asString(data.name),
    description: asString(data.description),
    images: asStringArray(data.images),
    basePrice: asNumber(data.basePrice),
    averagePrepTime: asNumber(data.averagePrepTime, 15),
    currency: asString(data.currency || 'USD', 'USD'),
    availability: asString(data.availability || 'IN_STOCK', 'IN_STOCK'),
    tags: asStringArray(data.tags),
    allergens: asStringArray(data.allergens),
    optionGroups: Array.isArray(data.optionGroups) ? data.optionGroups.map(normalizeOptionGroup) : [],
  };
};

const normalizeCategory = (raw: unknown): MenuCategory => {
  const data = asRecord(raw);

  return {
    id: asString(data.id || data._id),
    name: asString(data.name),
    description: asString(data.description),
    sortOrder: asNumber(data.sortOrder),
    items: Array.isArray(data.items) ? data.items.map(normalizeMenuItem) : [],
  };
};

const normalizeMenuProjection = (raw: unknown): RestaurantMenuProjection => {
  const data = asRecord(raw);
  const restaurant = asRecord(data.restaurant);

  return {
    citySlug: asString(data.citySlug),
    slug: asString(data.slug),
    restaurant: {
      name: asString(restaurant.name),
      logoUrl: asString(restaurant.logoUrl),
      coverUrl: asString(restaurant.coverUrl),
      city: asString(restaurant.city),
      citySlug: asString(restaurant.citySlug),
    },
    categories: Array.isArray(data.categories) ? data.categories.map(normalizeCategory) : [],
  };
};

const normalizeOrderHistoryEntry = (raw: unknown): OrderHistoryEntry => {
  const data = asRecord(raw);
  const payment = asRecord(data.payment);
  const snapshot = asRecord(data.restaurantSnapshot);
  const immutableSnapshot = asRecord(data.immutableSnapshot);
  const immutableRestaurant = asRecord(immutableSnapshot.restaurant);
  const totals = asRecord(data.totals);
  const qr = asRecord(data.qr);

  return {
    id: asString(data.id || data._id),
    userId: asString(data.userId),
    restaurantId: asString(data.restaurantId),
    orderType: asString(data.orderType),
    orderStatus: asString(data.orderStatus),
    paymentMethod: asString(payment.method),
    paymentStatus: asString(payment.status),
    total: asNumber(totals.total),
    currency: asString(
      immutableRestaurant.currency || snapshot.currency || 'USD',
      'USD'
    ),
    createdAt: asString(data.createdAt),
    updatedAt: asString(data.updatedAt),
    restaurantName: asString(snapshot.name || immutableRestaurant.name),
    restaurantSlug: asString(snapshot.slug || immutableRestaurant.slug),
    restaurantCitySlug: asString(snapshot.citySlug || immutableRestaurant.citySlug),
    qrToken: asString(qr.token || data.qrToken || data.qr_token),
    qrScannedAt: asString(qr.scannedAt),
    qrExpiresAt: asString(qr.expiresAt),
    items: Array.isArray(data.items)
      ? data.items.map((item): OrderHistoryEntry['items'][number] => {
        const parsed = asRecord(item);
        return {
          menuItemId: asString(parsed.menuItemId),
          name: asString(parsed.name),
          unitPrice: asNumber(parsed.unitPrice),
          quantity: asNumber(parsed.quantity),
          lineTotal: asNumber(parsed.lineTotal),
        };
      })
      : [],
  };
};

const normalizeQrScanResult = (raw: unknown): QrScanResult => {
  const data = asRecord(raw);
  const qr = asRecord(data.qr);

  return {
    orderId: asString(data.id || data._id),
    orderStatus: asString(data.orderStatus),
    paymentStatus: asString(asRecord(data.payment).status),
    restaurantId: asString(data.restaurantId),
    scannedAt: asString(qr.scannedAt),
    scannedBy: asString(qr.scannedBy),
  };
};

const normalizeDriverArrivedResult = (raw: unknown): DriverArrivedResult => {
  const data = asRecord(raw);
  return {
    orderId: asString(data.order_id || data.orderId),
    orderStatus: asString(data.order_status || data.orderStatus),
    paymentStatus: asString(data.payment_status || data.paymentStatus),
  };
};

const normalizeManagerRestaurant = (raw: unknown): ManagerRestaurant => {
  const data = asRecord(raw);
  const location = asRecord(data.location);
  const contact = asRecord(data.contact);
  const settings = asRecord(data.settings);
  const subscription = asRecord(data.subscription);
  const verification = asRecord(data.verification);

  return {
    id: asString(data.id || data._id),
    name: asString(data.name),
    slug: asString(data.slug),
    description: asString(data.description),
    logoUrl: asString(data.logoUrl),
    coverUrl: asString(data.coverUrl),
    status: asString(data.status),
    visibility: asString(data.visibility),
    activationBlockers: asStringArray(data.activationBlockers),
    publishRequestedAt: asString(data.publishRequestedAt),
    activatedAt: asString(data.activatedAt),
    suspendedAt: asString(data.suspendedAt),
    archivedAt: asString(data.archivedAt),
    restoreFeeRequired: asBoolean(data.restoreFeeRequired),
    location: {
      city: asString(location.city),
      citySlug: asString(location.citySlug),
      address: asString(location.address),
    },
    contact: {
      phone: asString(contact.phone),
      email: asString(contact.email),
    },
    settings: {
      currency: asString(settings.currency || 'USD', 'USD'),
      taxRate: asNumber(settings.taxRate),
      serviceFee: asNumber(settings.serviceFee),
      supportedOrderModes: asStringArray(settings.supportedOrderModes),
    },
    subscription: {
      status: asString(subscription.status),
      subscriptionPlanId: asString(subscription.subscriptionPlanId),
      providerCustomerId: asString(subscription.providerCustomerId),
      providerSubscriptionId: asString(subscription.providerSubscriptionId),
      currentPeriodEnd: asString(subscription.currentPeriodEnd),
      cancelAtPeriodEnd: asBoolean(subscription.cancelAtPeriodEnd),
    },
    verification: {
      status: asString(verification.status),
      reviewNotes: asString(verification.reviewNotes),
    },
  };
};

const normalizeManagerCategory = (raw: unknown): ManagerCategory => {
  const data = asRecord(raw);
  return {
    id: asString(data.id || data._id),
    restaurantId: asString(data.restaurantId),
    name: asString(data.name),
    description: asString(data.description),
    sortOrder: asNumber(data.sortOrder),
  };
};

const normalizeManagerMenuItem = (raw: unknown): ManagerMenuItem => {
  const data = asRecord(raw);
  return {
    id: asString(data.id || data._id),
    restaurantId: asString(data.restaurantId),
    categoryId: asString(data.categoryId),
    name: asString(data.name),
    description: asString(data.description),
    images: asStringArray(data.images),
    basePrice: asNumber(data.basePrice),
    averagePrepTime: asNumber(data.averagePrepTime),
    currency: asString(data.currency || 'USD', 'USD'),
    availability: asString(data.availability || 'IN_STOCK', 'IN_STOCK'),
    isPublished: asBoolean(data.isPublished),
    sortOrder: asNumber(data.sortOrder),
    tags: asStringArray(data.tags),
    allergens: asStringArray(data.allergens),
  };
};

const normalizeTransactionResult = (raw: unknown): OrderPaymentResult => {
  const data = asRecord(raw);
  const transaction = asRecord(data.transaction);

  return {
    transactionId: asString(transaction._id || transaction.id),
    status: asString(transaction.status || 'UNKNOWN', 'UNKNOWN'),
    providerRef: asString(transaction.providerRef),
  };
};

export const listPublicRestaurants = async (
  input: ListRestaurantsInput = {}
): Promise<{ data: PublicRestaurant[]; meta: ApiEnvelope<unknown[]>['meta'] }> => {
  const params = new URLSearchParams();

  if (input.page) {
    params.set('page', String(input.page));
  }

  if (input.limit) {
    params.set('limit', String(input.limit));
  }

  if (input.citySlug?.trim()) {
    params.set('citySlug', input.citySlug.trim());
  }

  if (input.query?.trim()) {
    params.set('q', input.query.trim());
  }

  const querySuffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(
    `${API_ENDPOINTS.restaurants.list}${querySuffix}`,
    {
      method: 'GET',
    }
  );

  const restaurants = unwrapData(payload);
  return {
    data: Array.isArray(restaurants) ? restaurants.map(normalizeRestaurant) : [],
    meta: payload.meta,
  };
};

export const getPublicRestaurant = async (
  citySlug: string,
  slug: string
): Promise<PublicRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(
    buildRestaurantDetailsPath(citySlug, slug),
    {
      method: 'GET',
    }
  );

  return normalizeRestaurant(unwrapData(payload));
};

export const getPublicRestaurantMenu = async (
  citySlug: string,
  slug: string,
  includeOutOfStock = false
): Promise<RestaurantMenuProjection> => {
  const params = new URLSearchParams();
  if (includeOutOfStock) {
    params.set('includeOutOfStock', 'true');
  }

  const querySuffix = params.toString() ? `?${params.toString()}` : '';
  const payload = await apiRequest<ApiEnvelope<unknown>>(
    `${buildRestaurantMenuPath(citySlug, slug)}${querySuffix}`,
    {
      method: 'GET',
    }
  );

  return normalizeMenuProjection(unwrapData(payload));
};

export const estimateRestaurantDeliveryTime = async (
  citySlug: string,
  slug: string,
  itemIds: string[],
  distanceKm = 5
): Promise<DeliveryEstimate> => {
  const payload = await apiRequest<ApiEnvelope<{
    estimated_delivery_minutes?: number;
    max_prep_time_minutes?: number;
    travel_minutes?: number;
  }>>(buildRestaurantEstimatePath(citySlug, slug), {
    method: 'POST',
    body: {
      itemIds,
      distanceKm,
      averageSpeedKmph: 25,
    },
  });

  const data = unwrapData(payload);
  return {
    estimatedDeliveryMinutes: asNumber(data.estimated_delivery_minutes),
    maxPrepTimeMinutes: asNumber(data.max_prep_time_minutes),
    travelMinutes: asNumber(data.travel_minutes),
  };
};

export const createOrder = async (
  token: string,
  input: CreateOrderPayload
): Promise<CreatedOrder> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(API_ENDPOINTS.orders.create, {
    method: 'POST',
    token,
    body: input,
  });

  const data = asRecord(unwrapData(payload));

  return {
    orderId: asString(data.order_id || data.orderId),
    orderStatus: asString(data.order_status || data.orderStatus),
    paymentStatus: asString(data.payment_status || data.paymentStatus),
    qrToken: asString(data.qr_token || data.qrToken),
  };
};

export const createOrderPayment = async (
  token: string,
  input: OrderPaymentPayload
): Promise<OrderPaymentResult> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(API_ENDPOINTS.payments.order, {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeTransactionResult(unwrapData(payload));
};

export const createSubscriptionPayment = async (
  token: string,
  input: SubscriptionPaymentPayload
): Promise<SubscriptionPaymentResult> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(API_ENDPOINTS.payments.subscribe, {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeTransactionResult(unwrapData(payload));
};

export const listMyOrders = async (token: string): Promise<OrderHistoryEntry[]> => {
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(API_ENDPOINTS.orders.my, {
    method: 'GET',
    token,
  });

  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeOrderHistoryEntry) : [];
};

export const fetchMyDebtStatus = async (token: string): Promise<DebtStatusResult> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(API_ENDPOINTS.account.debtStatus, {
    method: 'GET',
    token,
  });

  const data = asRecord(unwrapData(payload));
  const rawDebts = Array.isArray(data.debts) ? data.debts : [];

  return {
    userId: asString(data.userId),
    hasOutstandingDebt: asBoolean(data.hasOutstandingDebt, false),
    totalOutstandingAmount: asNumber(data.totalOutstandingAmount, 0),
    debts: rawDebts.map((entry) => {
      const parsed = asRecord(entry);
      return {
        orderId: asString(parsed.orderId),
        restaurantId: asString(parsed.restaurantId),
        amount: asNumber(parsed.amount, 0),
        recordedAt: asString(parsed.recordedAt) || null,
        orderStatus: asString(parsed.orderStatus) || null,
      };
    }),
  };
};

export const listRestaurantOrders = async (
  token: string,
  restaurantId: string
): Promise<OrderHistoryEntry[]> => {
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(buildOpsRestaurantOrdersPath(restaurantId), {
    method: 'GET',
    token,
  });

  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeOrderHistoryEntry) : [];
};

export const listAllOpsOrders = async (token: string): Promise<OrderHistoryEntry[]> => {
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(API_ENDPOINTS.orders.opsAdminAll, {
    method: 'GET',
    token,
  });

  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeOrderHistoryEntry) : [];
};

export const scanOrderQr = async (token: string, input: QrScanPayload): Promise<QrScanResult> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(API_ENDPOINTS.orders.scanQr, {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeQrScanResult(unwrapData(payload));
};

export const markOrderDriverArrived = async (
  token: string,
  orderId: string,
  input: DriverArrivedPayload = {}
): Promise<DriverArrivedResult> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildOrderDriverArrivedPath(orderId), {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeDriverArrivedResult(unwrapData(payload));
};

export const cancelMyOrder = async (
  token: string,
  orderId: string
): Promise<OrderHistoryEntry> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildOrderCancelPath(orderId), {
    method: 'POST',
    token,
  });

  return normalizeOrderHistoryEntry(unwrapData(payload));
};

export const managerCreateRestaurant = async (
  token: string,
  input: ManagerRestaurantCreatePayload
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(API_ENDPOINTS.manager.restaurantsBase, {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};

export const managerListRestaurants = async (
  token: string
): Promise<ManagerRestaurant[]> => {
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(API_ENDPOINTS.manager.restaurantsBase, {
    method: 'GET',
    token,
  });

  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeManagerRestaurant) : [];
};

export const managerGetRestaurant = async (
  token: string,
  restaurantId: string
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantPath(restaurantId), {
    method: 'GET',
    token,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};

export const managerUpdateRestaurant = async (
  token: string,
  restaurantId: string,
  input: ManagerRestaurantUpdatePayload
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantPath(restaurantId), {
    method: 'PATCH',
    token,
    body: input,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};

export const managerRequestPublish = async (
  token: string,
  restaurantId: string
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantPublishPath(restaurantId), {
    method: 'POST',
    token,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};

export const managerAddStaff = async (
  token: string,
  restaurantId: string,
  input: ManagerStaffAssignmentPayload
): Promise<Record<string, unknown>> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(buildManagerRestaurantStaffPath(restaurantId), {
    method: 'POST',
    token,
    body: input,
  });

  return asRecord(unwrapData(payload));
};

export const managerArchiveRestaurant = async (
  token: string,
  restaurantId: string
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantArchivePath(restaurantId), {
    method: 'POST',
    token,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};

export const managerRequestRestoreFee = async (
  token: string,
  restaurantId: string,
  input: ManagerRestoreFeePayload
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantRestoreFeePath(restaurantId), {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};

export const managerTriggerLowStockAlert = async (
  token: string,
  restaurantId: string,
  input: ManagerLowStockPayload
): Promise<Record<string, unknown>> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(buildManagerRestaurantLowStockPath(restaurantId), {
    method: 'POST',
    token,
    body: input,
  });

  return asRecord(unwrapData(payload));
};

export const managerListCategories = async (
  token: string,
  restaurantId: string
): Promise<ManagerCategory[]> => {
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(buildManagerRestaurantMenuCategoriesPath(restaurantId), {
    method: 'GET',
    token,
  });

  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeManagerCategory) : [];
};

export const managerCreateCategory = async (
  token: string,
  restaurantId: string,
  input: ManagerCategoryPayload
): Promise<ManagerCategory> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantMenuCategoriesPath(restaurantId), {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeManagerCategory(unwrapData(payload));
};

export const managerUpdateCategory = async (
  token: string,
  restaurantId: string,
  categoryId: string,
  input: Partial<ManagerCategoryPayload>
): Promise<ManagerCategory> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantMenuCategoryPath(restaurantId, categoryId), {
    method: 'PATCH',
    token,
    body: input,
  });

  return normalizeManagerCategory(unwrapData(payload));
};

export const managerDeleteCategory = async (
  token: string,
  restaurantId: string,
  categoryId: string
): Promise<boolean> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(
    buildManagerRestaurantMenuCategoryPath(restaurantId, categoryId),
    {
      method: 'DELETE',
      token,
    }
  );

  return asBoolean(asRecord(unwrapData(payload)).deleted, false);
};

export const managerListMenuItems = async (
  token: string,
  restaurantId: string
): Promise<ManagerMenuItem[]> => {
  const payload = await apiRequest<ApiEnvelope<unknown[]>>(buildManagerRestaurantMenuItemsPath(restaurantId), {
    method: 'GET',
    token,
  });

  const data = unwrapData(payload);
  return Array.isArray(data) ? data.map(normalizeManagerMenuItem) : [];
};

export const managerCreateMenuItem = async (
  token: string,
  restaurantId: string,
  input: ManagerMenuItemPayload
): Promise<ManagerMenuItem> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantMenuItemsPath(restaurantId), {
    method: 'POST',
    token,
    body: input,
  });

  return normalizeManagerMenuItem(unwrapData(payload));
};

export const managerUpdateMenuItem = async (
  token: string,
  restaurantId: string,
  itemId: string,
  input: Partial<ManagerMenuItemPayload>
): Promise<ManagerMenuItem> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerRestaurantMenuItemPath(restaurantId, itemId), {
    method: 'PATCH',
    token,
    body: input,
  });

  return normalizeManagerMenuItem(unwrapData(payload));
};

export const managerDeleteMenuItem = async (
  token: string,
  restaurantId: string,
  itemId: string
): Promise<boolean> => {
  const payload = await apiRequest<ApiEnvelope<Record<string, unknown>>>(
    buildManagerRestaurantMenuItemPath(restaurantId, itemId),
    {
      method: 'DELETE',
      token,
    }
  );

  return asBoolean(asRecord(unwrapData(payload)).deleted, false);
};

export const managerSetMenuItemAvailability = async (
  token: string,
  itemId: string,
  availability: 'IN_STOCK' | 'OUT_OF_STOCK'
): Promise<ManagerMenuItem> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerMenuItemAvailabilityPath(itemId), {
    method: 'PATCH',
    token,
    body: { availability },
  });

  return normalizeManagerMenuItem(unwrapData(payload));
};

export const managerSetMenuItemPublish = async (
  token: string,
  itemId: string,
  isPublished: boolean
): Promise<ManagerMenuItem> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildManagerMenuItemPublishPath(itemId), {
    method: 'PATCH',
    token,
    body: { isPublished },
  });

  return normalizeManagerMenuItem(unwrapData(payload));
};

export const adminUpdateRestaurantSubscription = async (
  token: string,
  restaurantId: string,
  input: AdminSubscriptionPayload
): Promise<ManagerRestaurant> => {
  const payload = await apiRequest<ApiEnvelope<unknown>>(buildAdminRestaurantSubscriptionPath(restaurantId), {
    method: 'PATCH',
    token,
    body: input,
  });

  return normalizeManagerRestaurant(unwrapData(payload));
};
