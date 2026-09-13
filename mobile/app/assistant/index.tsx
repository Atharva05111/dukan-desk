import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { api } from '../../lib/api';
import { useAuthStore } from '../../lib/store';

type ChatMessage = { role: 'user' | 'assistant'; text: string };

const SUGGESTIONS = ["What's my profit this month?", "What are my top selling items?", "How much stock am I wasting?"];

export default function AssistantScreen() {
  const businessId = useAuthStore((s) => s.businessId);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hi! Ask me anything about your sales, stock, or profit — I'll pull the real numbers." },
  ]);
  const [asking, setAsking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  async function ask(text?: string) {
    const q = (text ?? question).trim();
    if (!q || asking) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuestion('');
    setAsking(true);
    try {
      const { data } = await api.post('/assistant/query', { businessId, question: q });
      setMessages((m) => [...m, { role: 'assistant', text: data.answer ?? "I couldn't find an answer to that." }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', text: e.message ?? 'Something went wrong answering that.' }]);
    } finally {
      setAsking(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: true, title: 'Ask Your Business' }} />

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={{ padding: spacing.lg }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={m.role === 'user' ? styles.userText : styles.aiText}>{m.text}</Text>
          </View>
        ))}
        {asking && (
          <View style={[styles.bubble, styles.aiBubble]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {messages.length === 1 && (
          <View style={styles.suggestionWrap}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} style={styles.suggestionChip} onPress={() => ask(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={question}
          onChangeText={setQuestion}
          placeholder="e.g. What's my profit this month?"
          placeholderTextColor={colors.textFaint}
          onSubmitEditing={() => ask()}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={() => ask()} disabled={asking}>
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  messages: { flex: 1 },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  userText: { color: colors.white, fontSize: 15 },
  aiText: { color: colors.text, fontSize: 15 },

  suggestionWrap: { gap: spacing.sm, marginTop: spacing.sm },
  suggestionChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  suggestionText: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
