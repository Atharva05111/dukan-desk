import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Field, Screen } from '../components/ui';
import { api } from '../lib/api';
import { colors, spacing, typography } from '../lib/theme';
import { useAuthStore, BusinessType } from '../lib/store';

const BUSINESS_TYPES: { value: BusinessType; label: string }[] = [
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'CAFE', label: 'Cafe' },
  { value: 'RETAIL', label: 'Retail shop' },
];

export default function SignupScreen() {
  const setSession = useAuthStore((s) => s.setSession);

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('RESTAURANT');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
    setError(null);
    if (!businessName.trim() || phone.trim().length < 10 || password.length < 4) {
      setError('Fill in your business name, a valid phone number, and a password (4+ characters).');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', {
        businessName: businessName.trim(),
        businessType,
        phone: phone.trim(),
        password,
      });
      await setSession({
        token: data.accessToken ?? data.token,
        businessId: data.business?.id ?? data.businessId,
        businessName: data.business?.name ?? businessName.trim(),
        businessType,
        outletId: data.outlet?.id ?? data.outletId,
        outletName: data.outlet?.name ?? 'Main outlet',
        staff: data.staff ?? null,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Set up your business</Text>
      <Text style={styles.subtitle}>Takes under a minute — you can add outlets and staff later.</Text>

      <Field label="Business name" placeholder="e.g. Shree Krishna Restaurant" value={businessName} onChangeText={setBusinessName} />

      <Text style={styles.fieldLabel}>Business type</Text>
      <View style={styles.typeRow}>
        {BUSINESS_TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setBusinessType(t.value)}
            style={[styles.typeChip, businessType === t.value && styles.typeChipActive]}
          >
            <Text style={[styles.typeChipText, businessType === t.value && styles.typeChipTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <Field
        label="Phone number"
        placeholder="10-digit mobile number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Field
        label="Password"
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Create business" onPress={handleSignup} loading={loading} style={{ marginTop: spacing.sm }} />

      <View style={styles.footerRow}>
        <Text style={typography.bodyMuted}>Already have an account?</Text>
        <Link href="/login" replace style={styles.link}>
          Log in
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginTop: spacing.xl, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.xl },
  fieldLabel: { ...typography.label, marginBottom: spacing.xs },
  typeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  typeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  typeChipTextActive: { color: colors.white },
  error: { color: colors.danger, marginBottom: spacing.md },
  footerRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.xl },
  link: { color: colors.primary, fontWeight: '600' },
});
