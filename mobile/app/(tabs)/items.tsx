import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { api, MenuItem } from '../../lib/api';
import { colors, formatCurrency, radius, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function ItemsScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const [search, setSearch] = useState('');

  const {
    data: items,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<MenuItem[]>({
    queryKey: ['menu-items', outletId],
    enabled: Boolean(outletId),
    queryFn: async () => (await api.get('/catalog/items', { params: { outletId } })).data,
  });

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h1}>Items</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton} onPress={() => router.push('/scan-menu')}>
            <Ionicons name="camera-outline" size={20} color={colors.primary} />
          </Pressable>
          <Pressable style={[styles.iconButton, styles.iconButtonPrimary]} onPress={() => router.push('/item/new')}>
            <Ionicons name="add" size={22} color={colors.white} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items"
          placeholderTextColor={colors.textFaint}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <LoadingState label="Loading items…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No items match your search' : 'No items yet'}
          subtitle={search ? undefined : 'Add items manually or scan your menu with AI to get started.'}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <Pressable style={styles.itemCard} onPress={() => router.push(`/item/${item.id}`)}>
              <View style={styles.itemImagePlaceholder}>
                <Ionicons name="fast-food-outline" size={26} color={colors.textFaint} />
              </View>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPrimary: { backgroundColor: colors.primary },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text },

  itemCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImagePlaceholder: {
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  itemName: { ...typography.h3, fontSize: 14 },
  itemPrice: { ...typography.bodyMuted, marginTop: 2 },
});
