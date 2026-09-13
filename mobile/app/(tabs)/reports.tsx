import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, ErrorState, LoadingState, SectionHeader } from '../../components/ui';
import { api, ProfitAndLoss, SalesSummary } from '../../lib/api';
import { colors, daysAgo, endOfDay, formatCurrency, radius, spacing, startOfDay, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

const RANGES = [
  { label: 'Today', days: 0 },
  { label: '7 days', days: 6 },
  { label: '30 days', days: 29 },
];

export default function ReportsScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const businessId = useAuthStore((s) => s.businessId);
  const [rangeIndex, setRangeIndex] = useState(0);

  const from = startOfDay(daysAgo(RANGES[rangeIndex].days));
  const to = endOfDay(new Date());

  const salesQuery = useQuery<SalesSummary>({
    queryKey: ['sales-summary', outletId, RANGES[rangeIndex].label],
    enabled: Boolean(outletId),
    queryFn: async () =>
      (await api.get('/reports/sales-summary', { params: { outletId, from: from.toISOString(), to: to.toISOString() } })).data,
  });

  const plQuery = useQuery<ProfitAndLoss>({
    queryKey: ['profit-loss', businessId, RANGES[rangeIndex].label],
    enabled: Boolean(businessId),
    queryFn: async () =>
      (await api.get('/reports/profit-loss', { params: { businessId, from: from.toISOString(), to: to.toISOString() } })).data,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={typography.h1}>Reports</Text>

      <View style={styles.rangeRow}>
        {RANGES.map((r, i) => (
          <Pressable key={r.label} onPress={() => setRangeIndex(i)} style={[styles.rangeChip, rangeIndex === i && styles.rangeChipActive]}>
            <Text style={[styles.rangeChipText, rangeIndex === i && styles.rangeChipTextActive]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Sales" />
      {salesQuery.isLoading ? (
        <LoadingState />
      ) : salesQuery.isError ? (
        <ErrorState message={(salesQuery.error as Error).message} onRetry={salesQuery.refetch} />
      ) : (
        <>
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={typography.caption}>TOTAL SALES</Text>
              <Text style={styles.statValue}>{formatCurrency(salesQuery.data?.totalSales)}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={typography.caption}>ORDERS</Text>
              <Text style={styles.statValue}>{salesQuery.data?.orderCount ?? 0}</Text>
            </Card>
          </View>

          <Card style={{ marginTop: spacing.sm }}>
            <Text style={typography.h3}>Top items</Text>
            {!salesQuery.data?.topItems.length ? (
              <Text style={[typography.bodyMuted, { marginTop: spacing.sm }]}>No sales in this period yet.</Text>
            ) : (
              salesQuery.data.topItems.map((item, i) => {
                const max = salesQuery.data!.topItems[0].revenue || 1;
                return (
                  <View key={item.name} style={{ marginTop: spacing.md }}>
                    <View style={styles.topItemHeader}>
                      <Text style={typography.body}>{item.name}</Text>
                      <Text style={typography.bodyMuted}>{formatCurrency(item.revenue)}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.max(6, (item.revenue / max) * 100)}%` }]} />
                    </View>
                  </View>
                );
              })
            )}
          </Card>
        </>
      )}

      <SectionHeader title="Profit & loss" />
      {plQuery.isLoading ? (
        <LoadingState />
      ) : plQuery.isError ? (
        <ErrorState message={(plQuery.error as Error).message} onRetry={plQuery.refetch} />
      ) : (
        <Card>
          <PLRow label="Revenue" value={plQuery.data?.revenue} />
          <PLRow label="Cost of goods sold" value={plQuery.data?.cogs} negative />
          <PLRow label="Gross profit" value={plQuery.data?.grossProfit} bold />
          <View style={styles.divider} />
          <PLRow label="Operating expenses" value={plQuery.data?.operatingExpenses} negative />
          <PLRow label="Net profit" value={plQuery.data?.netProfit} bold highlight />
          <View style={{ marginTop: spacing.sm }}>
            <Badge
              label={`Gross margin ${plQuery.data ? plQuery.data.grossMarginPct.toFixed(1) : '0'}%`}
              tone={plQuery.data && plQuery.data.grossMarginPct >= 0 ? 'success' : 'danger'}
            />
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

function PLRow({
  label,
  value,
  negative,
  bold,
  highlight,
}: {
  label: string;
  value?: number;
  negative?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  const amount = value ?? 0;
  return (
    <View style={styles.plRow}>
      <Text style={bold ? typography.h3 : typography.bodyMuted}>{label}</Text>
      <Text
        style={[
          bold ? typography.h3 : typography.body,
          negative && { color: colors.danger },
          highlight && { color: amount >= 0 ? colors.success : colors.danger },
        ]}
      >
        {negative ? `− ${formatCurrency(Math.abs(amount))}` : formatCurrency(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  rangeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  rangeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rangeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rangeChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  rangeChipTextActive: { color: colors.white },

  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1 },
  statValue: { ...typography.h2, marginTop: spacing.xs },

  topItemHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, marginTop: 6, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.primary },

  plRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
