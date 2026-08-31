import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RScreen } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

const CATEGORIES = ['Men', 'Women', 'Open', 'Mixed'];

const RANK_COLORS: Record<number, string> = {
  1: RColors.gold,
  2: RColors.text3,
  3: RColors.bronze,
};

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('Open');
  const { leaderboard } = useAppData();
  const you = leaderboard.find((e) => e.isYou);

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>RANKING</Text>
          <RButton small label="Play a Match" onPress={() => router.push('/create-match')} />
        </View>

        <View style={styles.categoryRow}>
          {CATEGORIES.map((c) => (
            <Text
              key={c}
              onPress={() => setCategory(c)}
              style={[styles.categoryTab, category === c && styles.categoryTabActive]}>
              {c}
            </Text>
          ))}
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.mutedSmall}>Las Canteras ▾</Text>
          <Text style={styles.linkText}>Change scope</Text>
        </View>

        {you && (
          <RCard contentStyle={styles.youCard}>
            <MaterialCommunityIcons name="shield-check" size={30} color={RColors.diamondBlue} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.youTitle}>{you.skillTier}</Text>
              <Text style={styles.mutedSmall}>
                Rating {you.rating} · #{you.rank} Las Canteras
              </Text>
            </View>
            <Text style={styles.youLabel}>You</Text>
          </RCard>
        )}

        <View>
          {leaderboard.map((entry) => (
            <View key={entry.rank} style={[styles.row, entry.isYou && styles.rowYou, !entry.isYou && styles.rowDivider]}>
              <View style={styles.rankCell}>
                {entry.rank === 1 && <MaterialCommunityIcons name="crown" size={14} color={RColors.gold} style={{ marginBottom: 1 }} />}
                <Text style={[styles.rankNumber, { color: RANK_COLORS[entry.rank] ?? RColors.text5 }]}>{entry.rank}</Text>
              </View>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Text style={[styles.name, entry.isYou && { fontWeight: '700' }]}>{entry.name}</Text>
                  {entry.verified && <MaterialCommunityIcons name="check-decagram" size={13} color={RColors.diamondBlue} />}
                </View>
                <Text style={styles.mutedSmall}>{entry.skillTier}</Text>
              </View>
              <Text style={styles.ratingValue}>{entry.rating}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: RColors.textPrimary },
  categoryRow: { flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: RColors.cardBorder },
  categoryTab: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: RColors.text9,
    paddingBottom: 10,
  },
  categoryTabActive: { color: RColors.textPrimary, borderBottomWidth: 2, borderBottomColor: RColors.accentLink },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  linkText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.accentLink },
  youCard: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  youTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 17, color: RColors.textPrimary },
  youLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.accentLink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: RColors.divider },
  rowYou: { backgroundColor: 'rgba(190,34,42,0.14)' },
  rankCell: { width: 22, alignItems: 'center' },
  rankNumber: { fontFamily: 'Rajdhani_700Bold', fontSize: 15 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: RColors.avatarBg },
  name: { fontSize: 14, fontWeight: '600', color: RColors.textPrimary },
  ratingValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 15, color: RColors.textPrimary },
});
