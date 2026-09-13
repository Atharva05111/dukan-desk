import { Stack, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../../components/ui';
import { colors, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

export default function SettingsScreen() {
  const businessName = useAuthStore((s) => s.businessName);
  const businessType = useAuthStore((s) => s.businessType);
  const outletName = useAuthStore((s) => s.outletName);
  const staff = useAuthStore((s) => s.staff);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Settings' }} />

      <Card style={{ marginBottom: spacing.md }}>
        <Row label="Business" value={businessName ?? '—'} />
        <Row label="Type" value={businessType ?? '—'} />
        <Row label="Outlet" value={outletName ?? '—'} />
      </Card>

      <Card style={{ marginBottom: spacing.md }}>
        <Row label="Logged in as" value={staff?.name ?? '—'} />
        <Row label="Role" value={staff?.role ?? '—'} />
        <Row label="Phone" value={staff?.phone ?? '—'} last />
      </Card>

      <Button title="Log out" variant="danger" onPress={handleLogout} />
    </View>
  );
}

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <Text style={typography.bodyMuted}>{label}</Text>
      <Text style={typography.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
});
