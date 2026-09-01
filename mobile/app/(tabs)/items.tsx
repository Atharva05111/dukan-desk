import { useQuery } from '@tanstack/react-query';
import { FlatList, Text, View, StyleSheet, Button } from 'react-native';
import { api } from '../../lib/api';
import { router } from 'expo-router';

// Items grid — mirrors the "Get Started" menu screen in the reference screenshots.
export default function ItemsScreen() {
  const outletId = 'REPLACE_WITH_ACTIVE_OUTLET_ID';

  const { data: items } = useQuery({
    queryKey: ['menu-items', outletId],
    queryFn: async () => (await api.get('/catalog/items', { params: { outletId } })).data,
  });

  return (
    <View style={styles.container}>
      <Button title="Scan Menu with AI" onPress={() => router.push('/scan-menu')} />
      <FlatList
        data={items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>₹{item.price}</Text>
          </View>
        )}
        numColumns={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  card: { flex: 1, margin: 4, padding: 12, backgroundColor: '#eef1f7', borderRadius: 10 },
  name: { fontWeight: '600' },
});
