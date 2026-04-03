export const NAV_SCROLL_COLLAPSE_Y = 50;

export type NavLinkConfig = {
  label: string;
  href: string;
  requiresAuth?: boolean;
  requiresFullVerification?: boolean;
  allowedRoles?: string[];
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Restaurants', href: '/restaurants' },
  { label: 'Orders', href: '/orders', requiresAuth: true, requiresFullVerification: true },
  { label: 'Abonnement', href: '/abonnement', requiresAuth: true, requiresFullVerification: true },
  {
    label: 'Manager',
    href: '/manager',
    requiresAuth: true,
    requiresFullVerification: true,
    allowedRoles: ['user', 'manager', 'superadmin'],
  },
  {
    label: 'Ops',
    href: '/ops/qr-scan',
    requiresAuth: true,
    requiresFullVerification: true,
    allowedRoles: ['delivery_man'],
  },
  { label: 'Checkout', href: '/checkout', requiresAuth: true, requiresFullVerification: true },
] as const satisfies readonly NavLinkConfig[];

export const NAVBAR_MOTION_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
