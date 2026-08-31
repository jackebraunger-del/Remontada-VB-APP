import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

interface ChatMessage {
  id: string;
  from: 'you' | 'coach';
  text: string;
}

const SUGGESTIONS = ['Wie kann ich mich verbessern?', 'Gegen wen war ich am schlechtesten?', 'Wo bin ich am stärksten?'];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg${idCounter}`;
}

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { categoryRatings, recentResult } = useAppData();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      from: 'coach',
      text: "Hi! I'm your AI Coach (demo). Ask me things like \"how can I improve\" or \"which opponent gave me the most trouble\" and I'll look at your stats.",
    },
  ]);

  function answerFor(question: string): string {
    const q = question.toLowerCase();
    const withMatches = categoryRatings.filter((c) => c.matches > 0);

    if (withMatches.length === 0) {
      return "You don't have any recorded matches yet, so I can't spot patterns. Play a few games and ask me again!";
    }

    if (q.includes('schlecht') || q.includes('worst') || q.includes('gegner') || q.includes('opponent') || q.includes('trouble')) {
      const worst = withMatches.reduce((a, b) => (b.wins / b.matches < a.wins / a.matches ? b : a));
      const rate = Math.round((worst.wins / worst.matches) * 100);
      return `Your toughest category looks like ${worst.category} — a ${rate}% win rate over ${worst.matches} matches. ${
        recentResult ? `Your last result there was ${recentResult.sets}.` : ''
      } Try drilling ${worst.category.toLowerCase()} matchups specifically.`;
    }

    if (q.includes('stärk') || q.includes('best') || q.includes('strong')) {
      const best = withMatches.reduce((a, b) => (b.wins / b.matches > a.wins / a.matches ? b : a));
      const rate = Math.round((best.wins / best.matches) * 100);
      return `You're strongest in ${best.category} — ${rate}% win rate across ${best.matches} matches. Keep leaning into that category for ranked points.`;
    }

    if (q.includes('verbess') || q.includes('improve') || q.includes('tip')) {
      const lowest = withMatches.reduce((a, b) => (b.rating < a.rating ? b : a));
      return `One concrete step: your rating is lowest in ${lowest.category} (${lowest.rating}). Play a few ranked ${lowest.category} matches this week and focus on consistent serve placement — that's usually the fastest way to climb.`;
    }

    return "I can currently answer questions about your category performance — try asking which category is your strongest or weakest, or how to improve.";
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: nextId(), from: 'you', text: trimmed };
    const coachMsg: ChatMessage = { id: nextId(), from: 'coach', text: answerFor(trimmed) };
    setMessages((prev) => [...prev, userMsg, coachMsg]);
    setInput('');
  }

  return (
    <RScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.headerRow, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="robot-excited-outline" size={16} color={RColors.diamondBlue} />
            <Text style={styles.headerTitle}>AI Coach</Text>
          </View>
          <View style={styles.demoTag}>
            <Text style={styles.demoTagText}>Demo</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}>
          {messages.map((m) => (
            <View key={m.id} style={[styles.bubbleRow, m.from === 'you' && styles.bubbleRowYou]}>
              <View style={[styles.bubble, m.from === 'you' ? styles.bubbleYou : styles.bubbleCoach]}>
                <Text style={[styles.bubbleText, m.from === 'you' && { color: RColors.white }]}>{m.text}</Text>
              </View>
            </View>
          ))}

          {messages.length <= 1 && (
            <View style={{ gap: 8, marginTop: 4 }}>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} style={styles.suggestionChip} onPress={() => send(s)}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 12 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach…"
            placeholderTextColor={RColors.text9}
            style={styles.input}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <Pressable style={styles.sendBtn} onPress={() => send(input)}>
            <Ionicons name="send" size={16} color={RColors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: RColors.cardBorder,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  demoTag: { backgroundColor: withAlpha(RColors.amber, 0.25), paddingVertical: 3, paddingHorizontal: 8 },
  demoTagText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.amber },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowYou: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14 },
  bubbleCoach: { backgroundColor: RColors.chip2 },
  bubbleYou: { backgroundColor: RColors.accent },
  bubbleText: { fontSize: 13, lineHeight: 18, color: RColors.text3 },
  suggestionChip: {
    alignSelf: 'flex-start',
    backgroundColor: RColors.chip,
    borderWidth: 1,
    borderColor: RColors.divider,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  suggestionText: { fontSize: 12, fontWeight: '600', color: RColors.text3 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: RColors.cardBorder,
  },
  input: {
    flex: 1,
    backgroundColor: RColors.chip2,
    color: RColors.textPrimary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: RColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
