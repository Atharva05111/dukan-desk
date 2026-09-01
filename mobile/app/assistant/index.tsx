import { useState } from 'react';
import { Button, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { api } from '../../lib/api';

// RAG Business Assistant chat — see docs/04-flow-diagrams.md §5.
export default function AssistantScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);

  async function ask() {
    if (!question.trim()) return;
    const businessId = 'REPLACE_WITH_ACTIVE_BUSINESS_ID';
    setMessages((m) => [...m, { role: 'user', text: question }]);
    const q = question;
    setQuestion('');

    const { data } = await api.post('/assistant/query', { businessId, question: q });
    setMessages((m) => [...m, { role: 'assistant', text: data.answer }]);
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messages}>
        {messages.map((m, i) => (
          <Text key={i} style={m.role === 'user' ? styles.userMsg : styles.aiMsg}>
            {m.text}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="e.g. What's my profit this month?"
        />
        <Button title="Ask" onPress={ask} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  messages: { flex: 1, marginBottom: 12 },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#dbe6ff', padding: 10, borderRadius: 10, marginVertical: 4 },
  aiMsg: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, marginVertical: 4 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
});
