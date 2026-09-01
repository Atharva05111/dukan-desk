import { useState } from 'react';
import { Button, Image, Text, View, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../lib/api';

// AI Menu Scan review screen — see docs/04-flow-diagrams.md §2.
// Flow: pick photo -> upload -> POST /api/ai-scan/menu -> show editable draft list -> confirm -> bulk save.
export default function ScanMenuScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<{ name: string; price: number; category?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function pickAndScan() {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (result.canceled) return;
    setImageUri(result.assets[0].uri);
    setLoading(true);
    try {
      // TODO: upload the image to S3 first and pass the resulting URL —
      // see backend ai-scan.service.ts TODO about inlineData bytes.
      const { data } = await api.post('/ai-scan/menu', { imageUrl: result.assets[0].uri });
      setDraftItems(data);
    } finally {
      setLoading(false);
    }
  }

  async function confirmSave() {
    const outletId = 'REPLACE_WITH_ACTIVE_OUTLET_ID';
    await api.post('/catalog/items/bulk', { outletId, items: draftItems });
  }

  return (
    <View style={styles.container}>
      <Button title="Take/Choose Menu Photo" onPress={pickAndScan} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

      <FlatList
        data={draftItems}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.name}</Text>
            <Text>₹{item.price}</Text>
          </View>
        )}
      />

      {draftItems.length > 0 && <Button title="Confirm & Save All" onPress={confirmSave} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  preview: { width: '100%', height: 200, marginVertical: 12, borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
});
