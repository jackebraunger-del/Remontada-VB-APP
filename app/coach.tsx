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
import { CATEGORY_LABELS } from '@/constants/remontada-labels';
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
      text: 'Hi! Ich bin dein KI-Coach (Demo). Frag mich zum Beispiel „Wie kann ich mich verbessern?“ oder „Gegen wen war ich am schlechtesten?“ und ich schaue mir deine Statistiken an.',
    },
  ]);

  function answerFor(question: string): string {
    const q = question.toLowerCase();
    const withMatches = categoryRatings.filter((c) => c.matches > 0);

    if (withMatches.length === 0) {
      return 'Du hast noch keine gespeicherten Matches, daher kann ich noch keine Muster erkennen. Spiele ein paar Spiele und frag mich dann erneut!';
    }

    if (q.includes('schlecht') || q.includes('worst') || q.includes('gegner') || q.includes('opponent') || q.includes('trouble')) {
      const worst = withMatches.reduce((a, b) => (b.wins / b.matches < a.wins / a.matches ? b : a));
      const rate = Math.round((worst.wins / worst.matches) * 100);
      const categoryLabel = CATEGORY_LABELS[worst.category] ?? worst.category;
      return `Deine schwierigste Kategorie scheint ${categoryLabel} zu sein — eine Sieg-Quote von ${rate}% über ${worst.matches} Matches. ${
        recentResult ? `Dein letztes Ergebnis dort war ${recentResult.sets}. ` : ''
      }Übe gezielt Spiele in der Kategorie ${categoryLabel}.`;
    }

    if (q.includes('stärk') || q.includes('best') || q.includes('strong')) {
      const best = withMatches.reduce((a, b) => (b.wins / b.matches > a.wins / a.matches ? b : a));
      const rate = Math.round((best.wins / best.matches) * 100);
      const categoryLabel = CATEGORY_LABELS[best.category] ?? best.category;
      return `Du bist am stärksten in der Kategorie ${categoryLabel} — ${rate}% Sieg-Quote über ${best.matches} Matches. Nutze diese Kategorie weiter für gewertete Punkte.`;
    }

    if (q.includes('verbess') || q.includes('improve') || q.includes('tip')) {
      const lowest = withMatches.reduce((a, b) => (b.rating < a.rating ? b : a));
      const categoryLabel = CATEGORY_LABELS[lowest.category] ?? lowest.category;
      return `Ein konkreter Schritt: Deine Wertung ist am niedrigsten in der Kategorie ${categoryLabel} (${lowest.rating}). Spiele diese Woche ein paar gewertete Matches in dieser Kategorie und achte auf eine gleichmäßige Aufschlag-Platzierung — das ist meist der schnellste Weg nach oben.`;
    }

    return 'Ich kann aktuell Fragen zu deiner Leistung in den Kategorien beantworten — frag mich zum Beispiel, welche Kategorie deine stärkste oder schwächste ist, oder wie du dich verbessern kannst.';
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
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Zurück">
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <View style={styles.headerCenter}>
            <MaterialCommunityIcons name="robot-excited-outline" size={16} color={RColors.diamondBlue} />
            <Text style={styles.headerTitle}>KI-Coach</Text>
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
                <Pressable key={s} style={styles.suggestionChip} onPress={() => send(s)} accessibilityRole="button" accessibilityLabel={s}>
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
            placeholder="Frag deinen Coach…"
            placeholderTextColor={RColors.text9}
            style={styles.input}
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
            accessibilityLabel="Nachricht an den Coach"
          />
          <Pressable style={styles.sendBtn} onPress={() => send(input)} accessibilityRole="button" accessibilityLabel="Nachricht senden">
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
