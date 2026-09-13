import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

type MenuRow = { label: string; subtitle?: string; icon: keyof typeof Ionicons.glyphMap; route: string };

const ROWS: MenuRow[] = [
  { label: 'Ask Your Business', subtitle: 'AI assistant for sales, stock & P&L questions', icon: 'sparkles-outline', route: '/assistant' },
  { label: 'Inventory', subtitle: 'Stock levels, stock-in, wastage', icon: 'cube-outline', route: '/inventory' },
  { label: 'Staff', subtitle: 'Manage who can log in', icon: 'people-outline', route: '/staff' },
  { label: 'Scan Menu with AI', subtitle: 'Turn a photo of your menu into items', icon: 'camera-outline', route: '/scan-menu' },
  { label: 'Settings', subtitle: 'Business, outlet & account', icon: 'settings-outline', route: '/settings' },
];

export default function MoreScreen() {
  const businessName = useAuthStore((s) => s.businessName);
  const staff = useAuthStore((s) => s.staff);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={typography.h1}>More</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(staff?.name ?? businessName ?? 'D').charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={typography.h3}>{staff?.name ?? 'Owner'}</Text>
          <Text style={typography.bodyMuted}>{businessName ?? 'My Business'}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {ROWS.map((row) => (
          <Pressable key={row.label} style={styles.row} onPress={() => router.push(row.route as any)}>
            <View style={styles.rowIconWrap}>
              <Ionicons name={row.icon} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.body}>{row.label}</Text>
              {row.subtitle && <Text style={typography.bodyMuted}>{row.subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h2, color: colors.primary },

  list: { marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIconWrap: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
});
