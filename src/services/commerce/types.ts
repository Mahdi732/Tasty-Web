export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

export interface PublicRestaurant {
  id: string;
  name: string;
  slug: string;
  city: string;
  citySlug: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  currency: string;
  taxRate: number;
  serviceFee: number;
  supportedOrderModes: string[];
}

export interface MenuOptionItem {
  id: string;
  name: string;
  priceDelta: number;
  sortOrder: number;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  items: MenuOptionItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  averagePrepTime: number;
  currency: string;
  availability: string;
  tags: string[];
  allergens: string[];
  optionGroups: MenuOptionGroup[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface RestaurantMenuProjection {
  citySlug: string;
  slug: string;
  restaurant: {
    name: string;
    logoUrl: string;
    coverUrl: string;
    city: string;
    citySlug: string;
  };
  categories: MenuCategory[];
}

export interface DeliveryEstimate {
  estimatedDeliveryMinutes: number;
  maxPrepTimeMinutes: number;
  travelMinutes: number;
}

export interface CartRestaurantSnapshot {
  restaurantId: string;
  name: string;
  slug: string;
  citySlug: string;
  currency: string;
  taxRate: number;
  serviceFee: number;
}

export interface OrderCreateItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CreateOrderPayload {
  restaurantId: string;
  orderType: 'DELIVERY' | 'PREORDER';
  paymentMethod: 'PAY_ON_APP' | 'PAY_LATER';
  restaurantSnapshot: {
    name: string;
    slug: string;
    citySlug: string;
    version?: number;
    taxRate?: number;
    serviceFee?: number;
    currency?: string;
  };
  fulfillment: {
    mode: 'DELIVERY' | 'PICKUP';
    deliveryAddress?: string;
    tableRef?: string;
    scheduledAt?: string;
  };
  items: OrderCreateItem[];
}

export interface CreatedOrder {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  qrToken: string;
}

export interface OrderPaymentPayload {
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  payment: {
    type: string;
    token?: string;
    maskedPan?: string;
    brand?: string;
  };
}

export interface OrderPaymentResult {
  transactionId: string;
  status: string;
  providerRef: string;
}

export interface SubscriptionPaymentPayload {
  userId: string;
  restaurantId?: string;
  planId: string;
  amount: number;
  currency: string;
  payment: {
    type: string;
    token?: string;
    maskedPan?: string;
    brand?: string;
  };
}

export interface SubscriptionPaymentResult {
  transactionId: string;
  status: string;
  providerRef: string;
}

export interface DebtStatusEntry {
  orderId: string;
  restaurantId: string;
  amount: number;
  recordedAt: string | null;
  orderStatus: string | null;
}

export interface DebtStatusResult {
  userId: string;
  hasOutstandingDebt: boolean;
  totalOutstandingAmount: number;
  debts: DebtStatusEntry[];
}

export interface OrderHistoryItem {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderHistoryEntry {
  id: string;
  userId: string;
  restaurantId: string;
  orderType: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  restaurantName: string;
  restaurantSlug: string;
  restaurantCitySlug: string;
  qrToken: string;
  qrScannedAt: string;
  qrExpiresAt: string;
  items: OrderHistoryItem[];
}

export interface QrScanPayload {
  qrToken: string;
}

export interface QrScanResult {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  restaurantId: string;
  scannedAt: string;
  scannedBy: string;
}

export interface DriverArrivedPayload {
  phoneNumber?: string;
  pushToken?: string;
  idNumberMasked?: string;
  debtAmount?: number;
}

export interface DriverArrivedResult {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}

export interface ManagerRestaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  status: string;
  visibility: string;
  activationBlockers: string[];
  publishRequestedAt: string;
  activatedAt: string;
  suspendedAt: string;
  archivedAt: string;
  restoreFeeRequired: boolean;
  location: {
    city: string;
    citySlug: string;
    address: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  settings: {
    currency: string;
    taxRate: number;
    serviceFee: number;
    supportedOrderModes: string[];
  };
  subscription: {
    status: string;
    subscriptionPlanId: string;
    providerCustomerId: string;
    providerSubscriptionId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  verification: {
    status: string;
    reviewNotes: string;
  };
}

export interface ManagerRestaurantCreatePayload {
  creationFlow?: 'DRAFT_FIRST' | 'MEMBERSHIP_FIRST';
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  location: {
    city: string;
    citySlug?: string;
    address?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  settings?: {
    currency?: string;
    taxRate?: number;
    serviceFee?: number;
    supportedOrderModes?: string[];
  };
  subscription?: {
    status?: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
    subscriptionPlanId?: string | null;
    providerCustomerId?: string | null;
    providerSubscriptionId?: string | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
  };
}

export type ManagerRestaurantUpdatePayload = Partial<ManagerRestaurantCreatePayload>;

export interface ManagerStaffAssignmentPayload {
  userId: string;
  role: 'STAFF' | 'MANAGER' | 'DELIVERY_MAN' | 'CHEF';
}

export interface ManagerCategory {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  sortOrder: number;
}

export interface ManagerCategoryPayload {
  name: string;
  description?: string;
  sortOrder?: number;
}

export interface ManagerMenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  images: string[];
  basePrice: number;
  averagePrepTime: number;
  currency: string;
  availability: string;
  isPublished: boolean;
  sortOrder: number;
  tags: string[];
  allergens: string[];
}

export interface ManagerMenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  images?: string[];
  basePrice: number;
  averagePrepTime?: number;
  currency: string;
  availability?: 'IN_STOCK' | 'OUT_OF_STOCK';
  isPublished?: boolean;
  sortOrder?: number;
  tags?: string[];
  allergens?: string[];
}

export interface ManagerLowStockPayload {
  ingredient: string;
  level?: number;
  threshold?: number;
  note?: string;
}

export interface ManagerRestoreFeePayload {
  reason?: string;
}

export interface AdminSubscriptionPayload {
  status?: 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  subscriptionPlanId?: string | null;
  planId?: string | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}
