import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui';
import { api, Staff } from '../../lib/api';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

const ROLE_TONE: Record<Staff['role'], 'primary' | 'success' | 'warning' | 'neutral'> = {
  OWNER: 'primary',
  MANAGER: 'success',
  CASHIER: 'neutral',
  WAITER: 'neutral',
  KITCHEN: 'warning',
};

export default function StaffListScreen() {
  const businessId = useAuthStore((s) => s.businessId);

  // TODO backend: no StaffController yet — add GET /staff?businessId= and
  // POST /staff (name, phone, role, password) alongside the auth module.
  const { data, isLoading, isError, error, refetch } = useQuery<Staff[]>({
    queryKey: ['staff', businessId],
    enabled: Boolean(businessId),
    queryFn: async () => (await api.get('/staff', { params: { businessId } })).data,
    retry: false,
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Staff',
          headerRight: () => (
            <Pressable onPress={() => router.push('/staff/new')} style={{ padding: 4 }}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </Pressable>
          ),
        }}
      />

      {isLoading ? (
        <LoadingState label="Loading staff…" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState title="No staff added yet" subtitle="Add cashiers, waiters, or kitchen staff so they can log in." />
      ) : (
        data.map((s) => (
          <Card key={s.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{s.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>{s.name}</Text>
              <Text style={typography.bodyMuted}>{s.phone}</Text>
            </View>
            <Badge label={s.role} tone={ROLE_TONE[s.role]} />
          </Card>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.h3, color: colors.primary },
});
