import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Button, Field, Screen } from '../components/ui';
import { api } from '../lib/api';
import { colors, spacing, typography } from '../lib/theme';
import { useAuthStore } from '../lib/store';

export default function LoginScreen() {
  const setSession = useAuthStore((s) => s.setSession);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!phone.trim() || !password) {
      setError('Enter your phone number and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { phone: phone.trim(), password });
      await setSession({
        token: data.accessToken ?? data.token,
        businessId: data.business?.id ?? data.businessId,
        businessName: data.business?.name ?? null,
        businessType: data.business?.businessType ?? data.businessType ?? null,
        outletId: data.outlet?.id ?? data.outletId,
        outletName: data.outlet?.name ?? null,
        staff: data.staff ?? null,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message ?? 'Could not log in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.brandBlock}>
        <View style={styles.logoDot} />
        <Text style={styles.brand}>Dukan Desk</Text>
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in to manage today's business.</Text>

      <Field
        label="Phone number"
        placeholder="10-digit mobile number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <Field label="Password" placeholder="Your password" secureTextEntry value={password} onChangeText={setPassword} />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Log in" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

      <View style={styles.footerRow}>
        <Text style={typography.bodyMuted}>New here?</Text>
        <Link href="/signup" replace style={styles.link}>
          Set up your business
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xxl, marginBottom: spacing.xxl },
  logoDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  brand: { ...typography.h3, color: colors.primary },
  title: { ...typography.h1, marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMuted, marginBottom: spacing.xl },
  error: { color: colors.danger, marginBottom: spacing.md },
  footerRow: { flexDirection: 'row', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.xl },
  link: { color: colors.primary, fontWeight: '600' },
});
