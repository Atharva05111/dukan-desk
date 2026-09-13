import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { api, StockItem } from '../../lib/api';
import { colors, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function InventoryScreen() {
  const outletId = useAuthStore((s) => s.outletId);

  const { data, isLoading, isError, error, refetch } = useQuery<StockItem[]>({
    queryKey: ['stock-items', outletId],
    enabled: Boolean(outletId),
    queryFn: async () => (await api.get('/inventory/stock-items', { params: { outletId } })).data,
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Inventory',
          headerRight: () => (
            <Pressable onPress={() => router.push('/inventory/stock-in')} style={{ padding: 4 }}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <LoadingState label="Loading stock…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title="No stock items yet"
          subtitle="Record your first stock-in entry to start tracking quantities and cost."
        />
      ) : (
        data.map((item) => {
          const qty = Number(item.currentQty);
          const threshold = Number(item.lowStockThreshold);
          const isLow = threshold > 0 && qty <= threshold;
          return (
            <Pressable key={item.id} onPress={() => router.push(`/inventory/wastage/${item.id}`)}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={typography.h3}>{item.name}</Text>
                  <Text style={typography.bodyMuted}>
                    {qty} {item.unit} · avg ₹{Number(item.avgCostPerUnit).toFixed(2)}/{item.unit}
                  </Text>
                </View>
                {isLow && <Badge label="Low stock" tone="danger" />}
              </Card>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
