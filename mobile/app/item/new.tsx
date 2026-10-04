import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Screen } from '../../components/ui';
import { api } from '../../lib/api';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function NewItemScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const businessType = useAuthStore((s) => s.businessType);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [sku, setSku] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRetail = businessType === 'RETAIL';

  async function handleSave() {
    setError(null);
    const priceNum = Number(price);
    if (!name.trim() || !price || Number.isNaN(priceNum) || priceNum <= 0) {
      setError('Enter an item name and a valid price.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/catalog/items', {
        outletId,
        name: name.trim(),
        price: priceNum,
        unit: isRetail ? unit.trim() || 'pcs' : undefined,
        sku: isRetail ? sku.trim() || undefined : undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ['menu-items', outletId] });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not save this item.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>{isRetail ? 'Add product' : 'Add menu item'}</Text>

      {/* replace (not push) so "back" after saving scanned items returns to the item list */}
      <Pressable style={styles.scanCard} onPress={() => router.replace('/scan-menu')}>
        <View style={styles.scanIcon}>
          <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h3}>Scan with Gemini</Text>
          <Text style={typography.bodyMuted}>
            {isRetail ? 'Snap a product packet — name and MRP filled in for you.' : 'Snap your menu — add many items at once.'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
      </Pressable>

      <Text style={styles.divider}>or add manually</Text>

      <Field label="Name" placeholder={isRetail ? 'e.g. Amul Milk 500ml' : 'e.g. Paneer Butter Masala'} value={name} onChangeText={setName} />
      <Field label="Price (₹)" placeholder="0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      {isRetail && (
        <>
          <Field label="Unit" placeholder="pcs / kg / litre" value={unit} onChangeText={setUnit} />
          <Field label="SKU (optional)" placeholder="Stock keeping unit" value={sku} onChangeText={setSku} />
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Save item" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginTop: spacing.lg, marginBottom: spacing.lg },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  scanIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  divider: { ...typography.caption, textAlign: 'center', marginVertical: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.md },
});
