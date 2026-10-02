import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineMatchRoom } from '@/components/remontada/OnlineMatchRoom';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RHeader, RInput, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { CATEGORY_LABELS } from '@/constants/remontada-labels';
import { useAppData } from '@/lib/remontada-context';
import { Category } from '@/lib/remontada-types';

// Ergebnis melden – bewusst simpel gehalten (große Buttons, kein
// Score-Eintippen), damit auch weniger technikaffine Spieler das schnell
// bedienen können.
export default function ReportResultScreen() {
  const online = useOnlineData();
  return online ? <OnlineMatchRoom /> : <DemoReportResultScreen />;
}

function DemoReportResultScreen() {
  const insets = useSafeAreaInsets();
  const { categoryRatings, recordMatchResult } = useAppData();

  const [category, setCategory] = useState<Category>(categoryRatings[0]?.category ?? 'Open');
  const [opponentName, setOpponentName] = useState('');

  const canSubmit = opponentName.trim().length > 0;

  function onReport(won: boolean) {
    if (!canSubmit) return;
    recordMatchResult(category, opponentName, won);
    const categoryLabel = CATEGORY_LABELS[category] ?? category;
    Alert.alert(
      won ? 'Toller Sieg! 🎉' : 'Ergebnis gespeichert',
      won
        ? `Sieg gegen ${opponentName.trim()} in der Kategorie ${categoryLabel} gespeichert.`
        : `Niederlage gegen ${opponentName.trim()} in der Kategorie ${categoryLabel} gespeichert.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32, gap: 22 }}>
        <RHeader title="Ergebnis melden" />

        <View style={{ gap: 8 }}>
          <Text style={styles.label}>Kategorie</Text>
          <View style={styles.categoryWrap}>
            {categoryRatings.map((c) => (
              <Pressable
                key={c.category}
                style={{ flex: 1 }}
                onPress={() => setCategory(c.category)}
                accessibilityRole="radio"
                accessibilityLabel={CATEGORY_LABELS[c.category] ?? c.category}
                accessibilityState={{ selected: category === c.category }}>
                <RCard
                  borderColor={category === c.category ? RColors.accent : RColors.cardBorder}
                  contentStyle={[styles.categoryCard, category === c.category && { backgroundColor: withAlpha(RColors.accent, 0.14) }]}>
                  <Text style={[styles.categoryLabel, category === c.category && { color: RColors.textPrimary }]}>
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </Text>
                </RCard>
              </Pressable>
            ))}
          </View>
        </View>

        <RInput
          label="Gegen wen hast du gespielt?"
          value={opponentName}
          onChangeText={setOpponentName}
          placeholder="Name des Gegners"
          helperText="Gegen dieselbe Person wiederholt zu spielen bringt ab dem 3. Mal in Folge weniger Punkte."
        />

        <View style={{ gap: 12, marginTop: 8 }}>
          <Text style={styles.label}>Wie ist es gelaufen?</Text>
          <Pressable
            onPress={() => onReport(true)}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Ich habe gewonnen"
            accessibilityState={{ disabled: !canSubmit }}>
            <RCard borderColor={withAlpha(RColors.win, 0.6)} contentStyle={[styles.resultRow, !canSubmit && { opacity: 0.5 }]}>
              <Ionicons name="trophy" size={26} color={RColors.win} />
              <Text style={[styles.resultLabel, { color: RColors.win }]}>Gewonnen</Text>
            </RCard>
          </Pressable>
          <Pressable
            onPress={() => onReport(false)}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Ich habe verloren"
            accessibilityState={{ disabled: !canSubmit }}>
            <RCard borderColor={withAlpha(RColors.lossRed, 0.6)} contentStyle={[styles.resultRow, !canSubmit && { opacity: 0.5 }]}>
              <Ionicons name="close-circle" size={26} color={RColors.lossRed} />
              <Text style={[styles.resultLabel, { color: RColors.lossRed }]}>Verloren</Text>
            </RCard>
          </Pressable>
        </View>

        <RButton label="Abbrechen" onPress={() => router.back()} style={{ marginTop: 4 }} />
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  categoryWrap: { flexDirection: 'row', gap: 8 },
  categoryCard: { paddingVertical: 12, alignItems: 'center' },
  categoryLabel: { fontSize: 13, fontWeight: '700', color: RColors.text5 },
  resultRow: { paddingVertical: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  resultLabel: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, letterSpacing: 0.5, textTransform: 'uppercase' },
});
