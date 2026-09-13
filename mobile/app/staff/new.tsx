import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Screen } from '../../components/ui';
import { api, Staff } from '../../lib/api';
import { colors, spacing, typography } from '../../lib/theme';
import { useAuthStore } from '../../lib/store';

const ROLES: Staff['role'][] = ['MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'];

export default function NewStaffScreen() {
  const businessId = useAuthStore((s) => s.businessId);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Staff['role']>('CASHIER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (!name.trim() || phone.trim().length < 10 || password.length < 4) {
      setError('Enter a name, valid phone number, and a password (4+ characters).');
      return;
    }
    setLoading(true);
    try {
      // TODO backend: add POST /staff { businessId, name, phone, role, password }.
      await api.post('/staff', { businessId, name: name.trim(), phone: phone.trim(), role, password });
      await queryClient.invalidateQueries({ queryKey: ['staff', businessId] });
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Could not add this staff member.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Add staff</Text>

      <Field label="Name" placeholder="Full name" value={name} onChangeText={setName} />
      <Field label="Phone number" placeholder="10-digit mobile number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
      <Field label="Password" placeholder="They'll use this to log in" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.fieldLabel}>Role</Text>
      <View style={styles.roleRow}>
        {ROLES.map((r) => (
          <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleChip, role === r && styles.roleChipActive]}>
            <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button title="Add staff" onPress={handleSave} loading={loading} style={{ marginTop: spacing.sm }} />
      <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h1, marginTop: spacing.lg, marginBottom: spacing.lg },
  fieldLabel: { ...typography.label, marginBottom: spacing.xs },
  roleRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.md },
  roleChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleChipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  roleChipTextActive: { color: colors.white },
  error: { color: colors.danger, marginBottom: spacing.md },
});
