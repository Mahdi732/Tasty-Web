import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, PendingRegistration } from './types';
import type { DebtStatusResult } from '@/services/commerce/types';

type AccountDebtLock = DebtStatusResult | null;

interface AuthState {
  hydrated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  pendingRegistration: PendingRegistration | null;
  pendingFaceImage: string | null;
  accountDebtLock: AccountDebtLock;
  setHydrated: (hydrated: boolean) => void;
  setSession: (user: AuthUser, accessToken: string) => void;
  clearSession: () => void;
  setPendingRegistration: (registration: PendingRegistration | null) => void;
  setPendingFaceImage: (imageBase64: string | null) => void;
  setAccountDebtLock: (accountDebtLock: AccountDebtLock) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      hydrated: false,
      user: null,
      accessToken: null,
      pendingRegistration: null,
      pendingFaceImage: null,
      accountDebtLock: null,
      setHydrated: (hydrated) => set({ hydrated }),
      setSession: (user, accessToken) => set({ user, accessToken }),
      clearSession: () => set({
        user: null,
        accessToken: null,
        pendingFaceImage: null,
        accountDebtLock: null,
      }),
      setPendingRegistration: (pendingRegistration) => set({ pendingRegistration }),
      setPendingFaceImage: (pendingFaceImage) => set({ pendingFaceImage }),
      setAccountDebtLock: (accountDebtLock) => set({ accountDebtLock }),
    }),
    {
      name: 'tasty-auth-store',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
