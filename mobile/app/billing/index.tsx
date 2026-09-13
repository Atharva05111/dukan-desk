import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, ErrorState, LoadingState, SectionHeader } from '../../components/ui';
import { api, DineTable, Order } from '../../lib/api';
import { colors, formatCurrency, radius, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function BillingHomeScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const businessType = useAuthStore((s) => s.businessType);
  const queryClient = useQueryClient();
  const isRetail = businessType === 'RETAIL';

  // TODO backend: CatalogController/BillingController don't yet expose
  // GET /catalog/tables or GET /orders?outletId=&status=OPEN — add both so
  // this screen can show real tables and resume in-progress orders.
  const tablesQuery = useQuery<DineTable[]>({
    queryKey: ['tables', outletId],
    enabled: Boolean(outletId) && !isRetail,
    queryFn: async () => (await api.get('/catalog/tables', { params: { outletId } })).data,
    retry: false,
  });

  const openOrdersQuery = useQuery<Order[]>({
    queryKey: ['orders', outletId, 'open'],
    enabled: Boolean(outletId),
    queryFn: async () => (await api.get('/orders', { params: { outletId, status: 'OPEN' } })).data,
    retry: false,
  });

  const createOrder = useMutation({
    mutationFn: async (tableId?: string) => (await api.post('/orders', { outletId, tableId })).data as Order,
    onSuccess: async (order) => {
      await queryClient.invalidateQueries({ queryKey: ['orders', outletId] });
      router.push(`/billing/${order.id}`);
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: isRetail ? 'New Sale' : 'Billing', headerBackTitle: 'Home' }} />

      {isRetail ? (
        <Card style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
          <Ionicons name="cart-outline" size={32} color={colors.primary} style={{ marginBottom: spacing.sm }} />
          <Text style={typography.h3}>Start a new sale</Text>
          <Text style={[typography.bodyMuted, { textAlign: 'center', marginVertical: spacing.sm }]}>
            Opens an empty cart you can add products to and check out.
          </Text>
          <Button title="New sale" onPress={() => createOrder.mutate(undefined)} loading={createOrder.isPending} />
        </Card>
      ) : (
        <>
          <SectionHeader title="Tables" />
          {tablesQuery.isLoading ? (
            <LoadingState label="Loading tables…" />
          ) : tablesQuery.isError || !tablesQuery.data?.length ? (
            <EmptyState
              title="No tables set up yet"
              subtitle="Add tables from Settings, or start a walk-in order without a table."
              action={
                <Button
                  title="New walk-in order"
                  variant="secondary"
                  onPress={() => createOrder.mutate(undefined)}
                  style={{ marginTop: spacing.md }}
                />
              }
            />
          ) : (
            <View style={styles.tableGrid}>
              {tablesQuery.data.map((t) => {
                const openOrder = openOrdersQuery.data?.find((o) => o.tableId === t.id);
                return (
                  <Pressable
                    key={t.id}
                    style={[styles.tableCard, openOrder && styles.tableCardOccupied]}
                    onPress={() => (openOrder ? router.push(`/billing/${openOrder.id}`) : createOrder.mutate(t.id))}
                  >
                    <Text style={styles.tableLabel}>{t.label}</Text>
                    <Text style={openOrder ? styles.tableStatusOccupied : styles.tableStatusFree}>
                      {openOrder ? formatCurrency(openOrder.totalAmount) : 'Free'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </>
      )}

      <SectionHeader title="Open orders" />
      {openOrdersQuery.isLoading ? (
        <LoadingState />
      ) : openOrdersQuery.isError ? (
        <ErrorState message={(openOrdersQuery.error as Error).message} onRetry={openOrdersQuery.refetch} />
      ) : !openOrdersQuery.data?.length ? (
        <Text style={typography.bodyMuted}>No orders in progress.</Text>
      ) : (
        openOrdersQuery.data.map((o) => (
          <Pressable key={o.id} onPress={() => router.push(`/billing/${o.id}`)}>
            <Card style={styles.orderRow}>
              <View>
                <Text style={typography.h3}>{o.tableId ? 'Table order' : 'Walk-in order'}</Text>
                <Text style={typography.bodyMuted}>{new Date(o.createdAt).toLocaleTimeString('en-IN')}</Text>
              </View>
              <Text style={typography.h3}>{formatCurrency(o.totalAmount)}</Text>
            </Card>
          </Pressable>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tableCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCardOccupied: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
  tableLabel: { ...typography.h3 },
  tableStatusFree: { ...typography.caption, color: colors.success, marginTop: 4 },
  tableStatusOccupied: { ...typography.caption, color: colors.accent, marginTop: 4, fontWeight: '700' },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
});
