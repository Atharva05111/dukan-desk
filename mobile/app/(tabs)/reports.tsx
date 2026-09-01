import { Text, View, StyleSheet } from 'react-native';

// TODO: wire to GET /api/reports/sales-summary and /api/reports/profit-loss
export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports</Text>
      <Text>Sales summary, top items, and Profit & Loss go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
});
