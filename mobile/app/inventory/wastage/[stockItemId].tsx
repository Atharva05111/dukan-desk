import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button, Field, Screen } from '../../../components/ui';
import { api } from '../../../lib/api';
import { colors, spacing, typography } from '../../../lib/theme';
import { useAuthStore } from '../../../lib/store';

const REASONS = ['Spoiled', 'Expired', 'Damaged', 'Other'];

export default function WastageScreen() {
  const { stockItemId } = useLocalSearchParams<{ stockItemId: string }>();
  const outletId = useAuthStore((s) => s.outletId);
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    const q = Number(quantity);
    if (!q || q <= 0) {
      setError('Enter a valid quantity.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/inventory/wastage', { stockItemId, quantity: q, reason });
      await queryClient.invalidateQueries({ queryKey: ['stock-items', outletId] });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not record this wastage.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Record wastage</Text>
      <Text style={styles.subtitle}>This deducts quantity at the item's average cost — it also feeds into P&L.</Text>

      <Field label="Quantity" placeholder="0" keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} />

      <Text style={styles.fieldLabel}>Reason</Text>
      <Field placeholder="Spoiled / Expired / Damaged" value={reason} onChangeText={setReason} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Record wastage" variant="danger" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginTop: spacing.lg, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.lg },
  fieldLabel: { ...typography.label, marginBottom: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.md },
});
