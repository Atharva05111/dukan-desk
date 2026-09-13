import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, ErrorState, LoadingState } from '../../components/ui';
import { api, MenuItem, Order, PaymentMode } from '../../lib/api';
import { colors, formatCurrency, radius, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

const PAYMENT_MODES: PaymentMode[] = ['CASH', 'UPI', 'CARD', 'OTHER'];

export default function OrderScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const outletId = useAuthStore((s) => s.outletId);
  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');

  // TODO backend: BillingController has no GET /orders/:id — add one that
  // includes { items: { include: { menuItem: true } }, table: true }.
  const orderQuery = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => (await api.get(`/orders/${orderId}`)).data,
    retry: false,
  });

  const menuQuery = useQuery<MenuItem[]>({
    queryKey: ['menu-items', outletId],
    enabled: Boolean(outletId),
    queryFn: async () => (await api.get('/catalog/items', { params: { outletId } })).data,
  });

  const addItem = useMutation({
    mutationFn: async (menuItemId: string) =>
      (await api.post(`/orders/${orderId}/items`, { menuItemId, quantity: 1 })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
  });

  const sendKot = useMutation({
    mutationFn: async () => (await api.post(`/orders/${orderId}/kot`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', orderId] }),
  });

  const closeOrder = useMutation({
    mutationFn: async () =>
      (
        await api.post(`/orders/${orderId}/close`, {
          mode: paymentMode,
          amount: Number(orderQuery.data?.totalAmount ?? 0),
        })
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders', outletId] });
      router.replace('/billing');
    },
  });

  if (orderQuery.isLoading) return <LoadingState label="Loading order…" />;
  if (orderQuery.isError) return <ErrorState message={(orderQuery.error as Error).message} onRetry={orderQuery.refetch} />;

  const order = orderQuery.data;
  const items = order?.items ?? [];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: order?.tableId ? 'Table order' : 'Walk-in order' }} />

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 0 }}
        ListEmptyComponent={
          <Card>
            <Text style={typography.bodyMuted}>No items added yet. Tap "Add items" below.</Text>
          </Card>
        }
        renderItem={({ item }) => (
          <View style={styles.cartRow}>
            <View style={{ flex: 1 }}>
              <Text style={typography.body}>{item.menuItem?.name ?? 'Item'}</Text>
              <Text style={typography.bodyMuted}>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </Text>
            </View>
            <Text style={typography.h3}>{formatCurrency(item.lineTotal)}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={typography.h3}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(order?.totalAmount)}</Text>
        </View>

        <View style={styles.footerButtons}>
          <Button title="Add items" variant="secondary" onPress={() => setPickerOpen((v) => !v)} style={{ flex: 1 }} />
          <Button
            title="Send KOT"
            variant="ghost"
            onPress={() => sendKot.mutate()}
            loading={sendKot.isPending}
            disabled={items.length === 0}
            style={{ flex: 1 }}
          />
        </View>

        <View style={styles.paymentRow}>
          {PAYMENT_MODES.map((m) => (
            <Pressable key={m} onPress={() => setPaymentMode(m)} style={[styles.modeChip, paymentMode === m && styles.modeChipActive]}>
              <Text style={[styles.modeChipText, paymentMode === m && styles.modeChipTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          title={`Close bill · ${formatCurrency(order?.totalAmount)}`}
          onPress={() => closeOrder.mutate()}
          loading={closeOrder.isPending}
          disabled={items.length === 0}
        />
      </View>

      {pickerOpen && (
        <View style={styles.pickerSheet}>
          <View style={styles.pickerHeader}>
            <Text style={typography.h3}>Add an item</Text>
            <Pressable onPress={() => setPickerOpen(false)}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>
          <FlatList
            data={menuQuery.data ?? []}
            keyExtractor={(i) => i.id}
            style={{ maxHeight: 320 }}
            renderItem={({ item }) => (
              <Pressable style={styles.pickerRow} onPress={() => addItem.mutate(item.id)}>
                <Text style={typography.body}>{item.name}</Text>
                <View style={styles.pickerRowRight}>
                  <Text style={typography.bodyMuted}>{formatCurrency(item.price)}</Text>
                  <Ionicons name="add-circle" size={22} color={colors.primary} />
                </View>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={typography.bodyMuted}>No items in your catalog yet.</Text>}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalValue: { ...typography.h1, fontSize: 22 },
  footerButtons: { flexDirection: 'row', gap: spacing.sm },
  paymentRow: { flexDirection: 'row', gap: spacing.sm },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeChipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  modeChipTextActive: { color: colors.white },

  pickerSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerRowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
