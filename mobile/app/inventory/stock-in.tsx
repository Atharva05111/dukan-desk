import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Field, Screen } from '../../components/ui';
import { api } from '../../lib/api';
import { colors, formatCurrency, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function StockInScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [ratePerUnit, setRatePerUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalCost = useMemo(() => {
    const q = Number(quantity);
    const r = Number(ratePerUnit);
    return Number.isFinite(q) && Number.isFinite(r) ? q * r : 0;
  }, [quantity, ratePerUnit]);

  async function handleSave() {
    setError(null);
    const q = Number(quantity);
    const r = Number(ratePerUnit);
    if (!name.trim() || !q || q <= 0 || !r || r <= 0) {
      setError('Enter an item name, quantity, and rate per unit.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/inventory/stock-in', {
        outletId,
        name: name.trim(),
        quantity: q,
        unit: unit.trim() || 'pcs',
        ratePerUnit: r,
      });
      await queryClient.invalidateQueries({ queryKey: ['stock-items', outletId] });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not record this stock-in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Stock in</Text>
      <Text style={styles.subtitle}>Adding stock updates the running quantity and weighted-average cost.</Text>

      <Field label="Item name" placeholder="e.g. Mutton, Rice, Cooking Oil" value={name} onChangeText={setName} />
      <Field label="Quantity" placeholder="0" keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} />
      <Field label="Unit" placeholder="kg / g / litre / pcs" value={unit} onChangeText={setUnit} />
      <Field label="Rate per unit (₹)" placeholder="0.00" keyboardType="decimal-pad" value={ratePerUnit} onChangeText={setRatePerUnit} />

      <Text style={styles.total}>Total cost: {formatCurrency(totalCost)}</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Record stock-in" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginTop: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.lg },
  total: { ...typography.h3, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.md },
});
