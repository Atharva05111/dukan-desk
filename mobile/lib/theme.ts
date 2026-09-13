// Shared design tokens. Keep every screen's styling derived from here so the
// app reads as one product instead of a pile of one-off screens.

export const colors = {
  bg: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F1F7',
  border: '#E6E8F0',
  text: '#14162B',
  textMuted: '#6B7089',
  textFaint: '#A1A5BD',

  primary: '#4F46E5',
  primaryMuted: '#EEF0FE',
  primaryDark: '#3730A3',

  accent: '#F97316',
  accentMuted: '#FFF1E6',

  success: '#16A34A',
  successMuted: '#E8F8EE',
  danger: '#DC2626',
  dangerMuted: '#FDECEC',
  warning: '#D97706',
  warningMuted: '#FEF3E2',

  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textFaint },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
};

export const shadow = {
  card: {
    shadowColor: '#14162B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
};

export function formatCurrency(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
