import { Text, View, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push('/assistant')} style={styles.row}>
        <Text style={styles.rowText}>Ask Your Business (AI Assistant)</Text>
      </Pressable>
      <Pressable style={styles.row}>
        <Text style={styles.rowText}>Add Staff</Text>
      </Pressable>
      <Pressable style={styles.row}>
        <Text style={styles.rowText}>Inventory</Text>
      </Pressable>
      <Pressable style={styles.row}>
        <Text style={styles.rowText}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { fontSize: 16 },
});
