import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, ErrorState, LoadingState, SectionHeader } from '../../components/ui';
import { api, SalesSummary } from '../../lib/api';
import { colors, formatCurrency, radius, spacing, startOfDay, endOfDay, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

const QUICK_ACTIONS: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string; tone: string }[] = [
  { label: 'New Order', icon: 'add-circle-outline', route: '/billing', tone: colors.primary },
  { label: 'Add Items', icon: 'pricetag-outline', route: '/item/new', tone: colors.accent },
  { label: 'Stock In', icon: 'cube-outline', route: '/inventory/stock-in', tone: colors.success },
  { label: 'Ask AI', icon: 'sparkles-outline', route: '/assistant', tone: colors.primaryDark },
];

export default function HomeScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const businessName = useAuthStore((s) => s.businessName);
  const staffName = useAuthStore((s) => s.staff?.name);

  const today = new Date();
  const {
    data: summary,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<SalesSummary>({
    queryKey: ['sales-summary', outletId, 'today'],
    enabled: Boolean(outletId),
    queryFn: async () =>
      (
        await api.get('/reports/sales-summary', {
          params: { outletId, from: startOfDay(today).toISOString(), to: endOfDay(today).toISOString() },
        })
      ).data,
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.lg }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Text style={styles.greeting}>{staffName ? `Hi, ${staffName.split(' ')[0]}` : 'Welcome back'}</Text>
      <Text style={styles.businessName}>{businessName ?? 'My Business'}</Text>

      <SectionHeader title="Quick actions" />
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map((a) => (
          <Pressable key={a.label} style={styles.actionCard} onPress={() => router.push(a.route as any)}>
            <View style={[styles.actionIconWrap, { backgroundColor: `${a.tone}1A` }]}>
              <Ionicons name={a.icon} size={22} color={a.tone} />
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Today's overview" />
      {isLoading ? (
        <LoadingState label="Fetching today's numbers…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : (
        <View style={styles.overviewRow}>
          <Card style={styles.overviewCard}>
            <Text style={typography.caption}>SALES</Text>
            <Text style={styles.overviewValue}>{formatCurrency(summary?.totalSales)}</Text>
          </Card>
          <Card style={styles.overviewCard}>
            <Text style={typography.caption}>ORDERS</Text>
            <Text style={styles.overviewValue}>{summary?.orderCount ?? 0}</Text>
          </Card>
        </View>
      )}

      <SectionHeader
        title="Top sellers today"
        action={
          <Pressable onPress={() => router.push('/(tabs)/reports')}>
            <Text style={styles.link}>See reports</Text>
          </Pressable>
        }
      />
      <Card>
        {!summary || summary.topItems.length === 0 ? (
          <Text style={typography.bodyMuted}>No sales recorded yet today.</Text>
        ) : (
          summary.topItems.slice(0, 5).map((item, i) => (
            <View key={item.name} style={[styles.topItemRow, i > 0 && styles.topItemDivider]}>
              <View style={{ flex: 1 }}>
                <Text style={typography.body}>{item.name}</Text>
                <Text style={typography.bodyMuted}>{item.qty} sold</Text>
              </View>
              <Badge label={formatCurrency(item.revenue)} tone="success" />
            </View>
          ))
        )}
      </Card>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  greeting: { ...typography.bodyMuted },
  businessName: { ...typography.h1, marginBottom: spacing.sm },

  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconWrap: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionLabel: { ...typography.h3, fontSize: 14 },

  overviewRow: { flexDirection: 'row', gap: spacing.sm },
  overviewCard: { flex: 1 },
  overviewValue: { ...typography.h2, marginTop: spacing.xs },

  topItemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  topItemDivider: { borderTopWidth: 1, borderTopColor: colors.border },

  link: { color: colors.primary, fontWeight: '600', fontSize: 13 },
});
