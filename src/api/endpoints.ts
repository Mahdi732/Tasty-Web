const defaultApiBaseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080'
  : 'https://localhost';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
export const AUTH_BASE_PATH = process.env.NEXT_PUBLIC_AUTH_BASE_PATH ?? '/api/v1/auth';
export const OAUTH_PROVIDERS = ['google', 'facebook'] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

const buildAuthPath = (suffix: string) => `${AUTH_BASE_PATH}${suffix}`;

const defaultActivateAccountPath = '/api/v1/activate-account';

const defaultProfilePath = '/api/v1/auth/me';

export const ACTIVATE_ACCOUNT_PATH =
  process.env.NEXT_PUBLIC_ACTIVATE_ACCOUNT_PATH ?? defaultActivateAccountPath;

export const AUTH_PROFILE_PATH =
  process.env.NEXT_PUBLIC_AUTH_PROFILE_PATH ?? defaultProfilePath;

export const API_ENDPOINTS = {
  auth: {
    register: buildAuthPath('/register'),
    login: buildAuthPath('/login'),
    refresh: buildAuthPath('/refresh'),
    logoutAll: buildAuthPath('/logout-all'),
    me: AUTH_PROFILE_PATH,
    sessions: buildAuthPath('/sessions'),
    startEmailVerification: buildAuthPath('/email/start-verification'),
    verifyEmail: buildAuthPath('/email/verify'),
    startPhoneVerification: buildAuthPath('/phone/start-verification'),
    verifyPhone: buildAuthPath('/phone/verify'),
    activateAccount: ACTIVATE_ACCOUNT_PATH,
    logout: buildAuthPath('/logout'),
  },
  account: {
    debtStatus: '/api/v1/account/debt-status',
  },
  restaurants: {
    list: '/api/v1/restaurants',
  },
  orders: {
    create: '/api/v1/orders',
    my: '/api/v1/orders/me',
    opsRestaurantBase: '/api/v1/ops/orders/restaurant',
    opsAdminAll: '/api/v1/ops/orders/admin/all',
    scanQr: '/api/v1/ops/orders/qr/scan',
  },
  payments: {
    order: '/api/v1/payments/order',
    subscribe: '/api/v1/payments/subscribe',
  },
  manager: {
    restaurantsBase: '/api/v1/manager/restaurants',
    menuItemsBase: '/api/v1/manager/menu/items',
  },
  admin: {
    restaurantsBase: '/api/v1/admin/restaurants',
  },
} as const;

export const buildRestaurantDetailsPath = (citySlug: string, slug: string) =>
  `/api/v1/restaurants/${encodeURIComponent(citySlug)}/${encodeURIComponent(slug)}`;

export const buildRestaurantMenuPath = (citySlug: string, slug: string) =>
  `${buildRestaurantDetailsPath(citySlug, slug)}/menu`;

export const buildRestaurantEstimatePath = (citySlug: string, slug: string) =>
  `${buildRestaurantDetailsPath(citySlug, slug)}/estimate-delivery-time`;

export const buildOAuthStartPath = (provider: OAuthProvider) =>
  buildAuthPath(`/oauth/${provider}/start`);

export const buildOAuthLinkPath = (provider: OAuthProvider) =>
  buildAuthPath(`/oauth/link/${provider}`);

export const buildOAuthUnlinkPath = (provider: OAuthProvider) =>
  buildAuthPath(`/oauth/unlink/${provider}`);

export const buildSessionRevokePath = (sessionId: string) =>
  buildAuthPath(`/sessions/${sessionId}`);

export const buildOpsRestaurantOrdersPath = (restaurantId: string) =>
  `${API_ENDPOINTS.orders.opsRestaurantBase}/${encodeURIComponent(restaurantId)}`;

export const buildOrderDriverArrivedPath = (orderId: string) =>
  `${API_ENDPOINTS.orders.create}/${encodeURIComponent(orderId)}/driver-arrived`;

export const buildOrderCancelPath = (orderId: string) =>
  `${API_ENDPOINTS.orders.create}/${encodeURIComponent(orderId)}/cancel`;

export const buildManagerRestaurantPath = (restaurantId: string) =>
  `${API_ENDPOINTS.manager.restaurantsBase}/${encodeURIComponent(restaurantId)}`;

export const buildManagerRestaurantPublishPath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/request-publish`;

export const buildManagerRestaurantStaffPath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/staff`;

export const buildManagerRestaurantArchivePath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/archive`;

export const buildManagerRestaurantRestoreFeePath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/restore/request-fee`;

export const buildManagerRestaurantLowStockPath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/inventory/low-stock-alert`;

export const buildManagerRestaurantMenuCategoriesPath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/menu/categories`;

export const buildManagerRestaurantMenuCategoryPath = (restaurantId: string, categoryId: string) =>
  `${buildManagerRestaurantMenuCategoriesPath(restaurantId)}/${encodeURIComponent(categoryId)}`;

export const buildManagerRestaurantMenuItemsPath = (restaurantId: string) =>
  `${buildManagerRestaurantPath(restaurantId)}/menu/items`;

export const buildManagerRestaurantMenuItemPath = (restaurantId: string, itemId: string) =>
  `${buildManagerRestaurantMenuItemsPath(restaurantId)}/${encodeURIComponent(itemId)}`;

export const buildManagerMenuItemAvailabilityPath = (itemId: string) =>
  `${API_ENDPOINTS.manager.menuItemsBase}/${encodeURIComponent(itemId)}/availability`;

export const buildManagerMenuItemPublishPath = (itemId: string) =>
  `${API_ENDPOINTS.manager.menuItemsBase}/${encodeURIComponent(itemId)}/publish`;

export const buildAdminRestaurantSubscriptionPath = (restaurantId: string) =>
  `${API_ENDPOINTS.admin.restaurantsBase}/${encodeURIComponent(restaurantId)}/subscription`;
