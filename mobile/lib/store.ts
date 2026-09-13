import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type StaffRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';
export type BusinessType = 'RESTAURANT' | 'CAFE' | 'RETAIL';

export type SessionStaff = {
  id: string;
  name: string;
  phone: string;
  role: StaffRole;
};

type PersistedSession = {
  token: string | null;
  businessId: string | null;
  businessName: string | null;
  businessType: BusinessType | null;
  outletId: string | null;
  outletName: string | null;
  staff: SessionStaff | null;
};

interface AuthState extends PersistedSession {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (session: Partial<PersistedSession>) => Promise<void>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = 'dukan-desk/session';

const emptySession: PersistedSession = {
  token: null,
  businessId: null,
  businessName: null,
  businessType: null,
  outletId: null,
  outletName: null,
  staff: null,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...emptySession,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({ ...(JSON.parse(raw) as PersistedSession), hydrated: true });
        return;
      }
    } catch {
      // corrupt/unavailable storage — fall through to a clean session
    }
    set({ hydrated: true });
  },

  setSession: async (session) => {
    const { hydrated, hydrate, setSession, logout, ...current } = get();
    const next: PersistedSession = { ...current, ...session };
    set(session);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // best-effort persistence; in-memory state is already updated
    }
  },

  logout: async () => {
    set({ ...emptySession });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
}));

export function isLoggedIn(state: AuthState): boolean {
  return Boolean(state.token && state.businessId && state.outletId);
}
