import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Field, LoadingState, Screen } from '../../components/ui';
import { api, MenuItem } from '../../lib/api';
import { colors, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const outletId = useAuthStore((s) => s.outletId);
  const queryClient = useQueryClient();

  // The catalog module doesn't expose GET /catalog/items/:id yet — fall back to
  // whatever is already cached from the Items list so this screen still works.
  const cached = queryClient
    .getQueryData<MenuItem[]>(['menu-items', outletId])
    ?.find((i) => i.id === id);

  const { data: item, isLoading } = useQuery<MenuItem>({
    queryKey: ['menu-item', id],
    initialData: cached,
    queryFn: async () => (await api.get(`/catalog/items/${id}`)).data,
    retry: false,
  });

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(String(item.price));
    }
  }, [item]);

  async function handleSave() {
    setError(null);
    const priceNum = Number(price);
    if (!name.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Enter a valid name and price.');
      return;
    }
    setLoading(true);
    try {
      // TODO backend: add PATCH /catalog/items/:id (CatalogController only has
      // create + bulk-create today). Until then this call will 404.
      await api.patch(`/catalog/items/${id}`, { name: name.trim(), price: priceNum });
      await queryClient.invalidateQueries({ queryKey: ['menu-items', outletId] });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not update this item.');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading && !item) return <LoadingState label="Loading item…" />;

  return (
    <Screen>
      <Text style={styles.title}>Edit item</Text>

      <Field label="Name" value={name} onChangeText={setName} />
      <Field label="Price (₹)" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Save changes" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginTop: spacing.lg, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
});
