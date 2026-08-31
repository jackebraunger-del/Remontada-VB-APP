import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';
import { Category } from '@/lib/remontada-types';

// Ergebnis melden – bewusst simpel gehalten (große Buttons, kein
// Score-Eintippen), damit auch weniger technikaffine Spieler das schnell
// bedienen können.
export default function ReportResultScreen() {
  const insets = useSafeAreaInsets();
  const { categoryRatings, recordMatchResult } = useAppData();

  const [category, setCategory] = useState<Category>(categoryRatings[0]?.category ?? 'Open');
  const [opponentName, setOpponentName] = useState('');

  const canSubmit = opponentName.trim().length > 0;

  function onReport(won: boolean) {
    if (!canSubmit) return;
    recordMatchResult(category, opponentName, won);
    Alert.alert(
      won ? 'Nice win! 🎉' : 'Result recorded',
      won ? `Recorded a win vs ${opponentName.trim()} in ${category}.` : `Recorded a loss vs ${opponentName.trim()} in ${category}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32, gap: 22 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Report Result</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryWrap}>
            {categoryRatings.map((c) => (
              <Pressable key={c.category} style={{ flex: 1 }} onPress={() => setCategory(c.category)}>
                <RCard
                  borderColor={category === c.category ? RColors.accent : RColors.cardBorder}
                  contentStyle={[styles.categoryCard, category === c.category && { backgroundColor: withAlpha(RColors.accent, 0.14) }]}>
                  <Text style={[styles.categoryLabel, category === c.category && { color: RColors.textPrimary }]}>{c.category}</Text>
                </RCard>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.label}>Who did you play against?</Text>
          <RCard contentStyle={{ paddingHorizontal: 4 }}>
            <TextInput
              value={opponentName}
              onChangeText={setOpponentName}
              placeholder="Opponent's name"
              placeholderTextColor={RColors.text9}
              style={styles.textInput}
            />
          </RCard>
          <Text style={styles.mutedSmall}>Playing the same opponent over and over earns fewer points from the 3rd match in a row.</Text>
        </View>

        <View style={{ gap: 12, marginTop: 8 }}>
          <Text style={styles.label}>How did it go?</Text>
          <Pressable onPress={() => onReport(true)} disabled={!canSubmit}>
            <RCard borderColor={withAlpha(RColors.win, 0.6)} contentStyle={[styles.resultRow, !canSubmit && { opacity: 0.5 }]}>
              <Ionicons name="trophy" size={26} color={RColors.win} />
              <Text style={[styles.resultLabel, { color: RColors.win }]}>I Won</Text>
            </RCard>
          </Pressable>
          <Pressable onPress={() => onReport(false)} disabled={!canSubmit}>
            <RCard borderColor={withAlpha(RColors.lossRed, 0.6)} contentStyle={[styles.resultRow, !canSubmit && { opacity: 0.5 }]}>
              <Ionicons name="close-circle" size={26} color={RColors.lossRed} />
              <Text style={[styles.resultLabel, { color: RColors.lossRed }]}>I Lost</Text>
            </RCard>
          </Pressable>
        </View>

        <RButton label="Cancel" onPress={() => router.back()} style={{ marginTop: 4 }} />
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  categoryWrap: { flexDirection: 'row', gap: 8 },
  categoryCard: { paddingVertical: 12, alignItems: 'center' },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: RColors.text5 },
  textInput: { paddingVertical: 13, paddingHorizontal: 12, fontSize: 14, color: RColors.textPrimary },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  resultRow: { paddingVertical: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  resultLabel: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, letterSpacing: 0.5, textTransform: 'uppercase' },
});
