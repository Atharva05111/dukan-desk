import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from './store';

// Point this at your backend (see ../backend). Use your machine's LAN IP
// when testing on a physical device — "localhost" won't resolve from the phone.
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
// Generous on purpose: the free Render server sleeps when idle and takes
// ~1 minute to wake, so the first request after a quiet spell is slow.
const timeout = 75000;

export const api = axios.create({ baseURL, timeout });

// Interceptor-free client used only for /auth/refresh. If a failing refresh went
// through `api`, its 401 would trigger another refresh, and so on forever.
const refreshClient = axios.create({ baseURL, timeout });

// Attach the JWT from the session store to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Swap the refresh token for a new token pair. Resolves to the new access token,
// or null if the server rejected the refresh token (the session is really over).
// Network failures throw instead, so a flaky connection doesn't log anyone out.
async function refreshSession(): Promise<string | null> {
  const { refreshToken, setSession } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const { data } = await refreshClient.post('/auth/refresh', { refreshToken });
    await setSession({ token: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  } catch (e) {
    if ((e as AxiosError).response?.status === 401) return null;
    throw e;
  }
}

// If several screens hit a 401 at the same moment, they all wait on this one
// refresh instead of each firing their own.
let refreshInFlight: Promise<string | null> | null = null;

function getRefreshedToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Surface a friendly, consistent message regardless of how the backend fails
// (network error, 4xx/5xx with a `message` body, or a plain thrown Error).
function toFriendlyError(error: any): Error {
  const backendMessage = error?.response?.data?.message;
  const message = Array.isArray(backendMessage)
    ? backendMessage.join(', ')
    : backendMessage || error?.message || 'Something went wrong. Please try again.';
  return new Error(message);
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config as RetriableConfig | undefined;
    // A 401 from /auth/login just means a wrong password — not an expired session.
    const isAuthCall = original?.url?.startsWith('/auth/') ?? false;

    // 401 on a normal request → access token expired. Refresh once, then retry.
    if (error?.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;

      let newToken: string | null;
      try {
        newToken = await getRefreshedToken();
      } catch {
        // Couldn't reach the server to refresh — keep the session, report the error.
        return Promise.reject(toFriendlyError(error));
      }

      if (newToken) {
        return api(original); // the request interceptor attaches the new token
      }

      // Refresh token rejected → drop the session so the auth guard redirects to /login.
      await useAuthStore.getState().logout();
    }

    return Promise.reject(toFriendlyError(error));
  },
);

// ---- Shared response types, mirrored from the backend controllers ----

export type MenuItem = {
  id: string;
  outletId: string;
  categoryId: string | null;
  name: string;
  price: string | number;
  taxRatePct: string | number;
  imageUrl: string | null;
  sku: string | null;
  barcode: string | null;
  unit: string | null;
  isActive: boolean;
};

export type StockItem = {
  id: string;
  outletId: string;
  name: string;
  unit: string;
  currentQty: string | number;
  avgCostPerUnit: string | number;
  lowStockThreshold: string | number;
  expiryDate: string | null;
};

export type DineTable = {
  id: string;
  outletId: string;
  label: string;
};

export type OrderStatus = 'OPEN' | 'ON_HOLD' | 'KOT_SENT' | 'BILLED' | 'CLOSED' | 'CANCELLED';
export type PaymentMode = 'CASH' | 'UPI' | 'CARD' | 'OTHER';

export type OrderItem = {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  menuItem?: MenuItem;
};

export type Order = {
  id: string;
  outletId: string;
  tableId: string | null;
  status: OrderStatus;
  totalAmount: string | number;
  discountAmt: string | number;
  createdAt: string;
  closedAt: string | null;
  items?: OrderItem[];
};

export type SalesSummary = {
  totalSales: number;
  orderCount: number;
  topItems: { name: string; qty: number; revenue: number }[];
};

export type ProfitAndLoss = {
  periodStart: string;
  periodEnd: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingExpenses: number;
  netProfit: number;
};

export type Staff = {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'KITCHEN';
};
