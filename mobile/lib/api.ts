import axios from 'axios';
import { useAuthStore } from './store';

// Point this at your backend (see ../backend). Use your machine's LAN IP
// when testing on a physical device — "localhost" won't resolve from the phone.
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',
  timeout: 15000,
});

// Attach the JWT from the session store to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface a friendly, consistent message regardless of how the backend fails
// (network error, 4xx/5xx with a `message` body, or a plain thrown Error).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const backendMessage = error?.response?.data?.message;
    const message = Array.isArray(backendMessage)
      ? backendMessage.join(', ')
      : backendMessage || error?.message || 'Something went wrong. Please try again.';

    // 401 → session is no longer valid, drop it so the auth guard redirects to /login.
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(new Error(message));
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
