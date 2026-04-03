export interface SubscriptionPlanOption {
  id: string;
  title: string;
  amount: number;
  currency: string;
  accent: string;
  subtitle: string;
  highlights: string[];
}

export interface OpeningPlanSelection {
  planId: string;
  amount: number;
  currency: string;
  selectedAt: string;
}

export interface OpeningPaymentReceipt {
  transactionId: string;
  providerRef: string;
  status: string;
  planId: string;
  amount: number;
  currency: string;
  paidAt: string;
}

const PLAN_SELECTION_STORAGE_KEY = 'tasty.opening.plan-selection';
const PAYMENT_RECEIPT_STORAGE_KEY = 'tasty.opening.payment-receipt';

export const SUBSCRIPTION_PLANS: SubscriptionPlanOption[] = [
  {
    id: 'plan_starter',
    title: 'Starter',
    amount: 19,
    currency: 'USD',
    accent: 'border-[#ffce96]/45 bg-[#744011]/26',
    subtitle: 'Best for single-kitchen launches',
    highlights: ['1 active restaurant', 'Basic manager tools', 'Standard onboarding'],
  },
  {
    id: 'plan_pro',
    title: 'Pro',
    amount: 39,
    currency: 'USD',
    accent: 'border-[#ff9e93]/45 bg-[#722324]/26',
    subtitle: 'Balanced growth plan',
    highlights: ['Priority activation', 'Team management tools', 'Menu scaling options'],
  },
  {
    id: 'plan_scale',
    title: 'Scale',
    amount: 79,
    currency: 'USD',
    accent: 'border-[#91d7ff]/45 bg-[#143f5a]/24',
    subtitle: 'For multi-branch operators',
    highlights: ['Multi-location readiness', 'Operations visibility', 'Priority support lane'],
  },
];

const readFromStorage = <T>(key: string): T | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeToStorage = (key: string, value: unknown) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors and keep flow functional.
  }
};

const removeFromStorage = (key: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage errors and keep flow functional.
  }
};

export const saveOpeningPlanSelection = (selection: OpeningPlanSelection) => {
  writeToStorage(PLAN_SELECTION_STORAGE_KEY, selection);
};

export const readOpeningPlanSelection = (): OpeningPlanSelection | null =>
  readFromStorage<OpeningPlanSelection>(PLAN_SELECTION_STORAGE_KEY);

export const clearOpeningPlanSelection = () => {
  removeFromStorage(PLAN_SELECTION_STORAGE_KEY);
};

export const saveOpeningPaymentReceipt = (receipt: OpeningPaymentReceipt) => {
  writeToStorage(PAYMENT_RECEIPT_STORAGE_KEY, receipt);
};

export const readOpeningPaymentReceipt = (): OpeningPaymentReceipt | null =>
  readFromStorage<OpeningPaymentReceipt>(PAYMENT_RECEIPT_STORAGE_KEY);

export const clearOpeningPaymentReceipt = () => {
  removeFromStorage(PAYMENT_RECEIPT_STORAGE_KEY);
};

export const clearOpeningFlowState = () => {
  clearOpeningPlanSelection();
  clearOpeningPaymentReceipt();
};
