import { ScrollView, Text, View, StyleSheet } from 'react-native';

// Home dashboard — mirrors reference: Quick Actions + Business Overview cards.
// TODO: wire to GET /api/reports/sales-summary for today's numbers.
export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Business</Text>

      <Text style={styles.section}>Quick Actions</Text>
      <View style={styles.row}>
        <Text>Closed Orders</Text>
        <Text>On Hold Orders</Text>
        <Text>Add Items</Text>
      </View>

      <Text style={styles.section}>Business Overview</Text>
      <View style={styles.card}>
        <Text>Today's sales: ₹0.00</Text>
        <Text>Today's orders: 0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  card: { backgroundColor: '#f2f4f8', borderRadius: 12, padding: 16 },
});
