import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, EmptyState, Screen } from '../components/ui';
import { api } from '../lib/api';
import { colors, formatCurrency, radius, spacing, typography } from '../lib/theme';
import { useAuthStore } from '../lib/store';

type DraftItem = { name: string; price: number; category?: string };

export default function ScanMenuScreen() {
  const outletId = useAuthStore((s) => s.outletId);
  const queryClient = useQueryClient();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickAndScan() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library access is needed to pick a menu photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled) return;

    setImageUri(result.assets[0].uri);
    setDraftItems([]);
    setScanning(true);
    try {
      // TODO: upload the image to S3 first and pass the resulting URL — see
      // backend ai-scan.service.ts TODO about inlineData bytes vs. a public URL.
      const { data } = await api.post('/ai-scan/menu', { imageUrl: result.assets[0].uri });
      setDraftItems(data ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Could not scan this menu.');
    } finally {
      setScanning(false);
    }
  }

  function updateDraft(index: number, patch: Partial<DraftItem>) {
    setDraftItems((items) => items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function removeDraft(index: number) {
    setDraftItems((items) => items.filter((_, i) => i !== index));
  }

  async function confirmSave() {
    setError(null);
    setSaving(true);
    try {
      await api.post('/catalog/items/bulk', { outletId, items: draftItems });
      await queryClient.invalidateQueries({ queryKey: ['menu-items', outletId] });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not save these items.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: 'Scan Menu with AI' }} />
      <Text style={styles.subtitle}>
        Take a photo of your physical menu and Dukan Desk will draft items for you to review before saving.
      </Text>

      <Button
        title={imageUri ? 'Choose a different photo' : 'Take / choose menu photo'}
        variant="secondary"
        onPress={pickAndScan}
        icon={<Ionicons name="camera-outline" size={18} color={colors.primary} />}
      />

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {scanning && (
        <View style={styles.scanningRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={typography.bodyMuted}>Reading your menu…</Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {!scanning && imageUri && draftItems.length === 0 && !error && (
        <EmptyState title="No items detected" subtitle="Try a clearer, well-lit photo of the menu." />
      )}

      {draftItems.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={typography.h3}>Review before saving ({draftItems.length})</Text>
          {draftItems.map((item, i) => (
            <View key={i} style={styles.draftRow}>
              <TextInput
                style={styles.draftName}
                value={item.name}
                onChangeText={(v) => updateDraft(i, { name: v })}
              />
              <View style={styles.draftPriceWrap}>
                <Text style={typography.bodyMuted}>₹</Text>
                <TextInput
                  style={styles.draftPrice}
                  keyboardType="decimal-pad"
                  value={String(item.price)}
                  onChangeText={(v) => updateDraft(i, { price: Number(v) || 0 })}
                />
              </View>
              <Pressable onPress={() => removeDraft(i)} hitSlop={8}>
                <Ionicons name="close-circle" size={20} color={colors.textFaint} />
              </Pressable>
            </View>
          ))}

          <Button title="Confirm & save all" onPress={confirmSave} loading={saving} style={{ marginTop: spacing.lg }} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { ...typography.bodyMuted, marginTop: spacing.md, marginBottom: spacing.lg },
  preview: { width: '100%', height: 200, marginTop: spacing.lg, borderRadius: radius.lg },
  scanningRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  error: { color: colors.danger, marginTop: spacing.md },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  draftName: { flex: 1, paddingVertical: 10, fontSize: 15, color: colors.text },
  draftPriceWrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  draftPrice: { width: 56, paddingVertical: 10, fontSize: 15, color: colors.text, textAlign: 'right' },
});
