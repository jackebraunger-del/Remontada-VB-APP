import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { PLACEMENT_MATCHES_REQUIRED, useAppData } from '@/lib/remontada-context';
import { PreferredSide } from '@/lib/remontada-types';

const TIER_COLOR: Record<string, string> = {
  Bronze: RColors.bronze,
  Silver: RColors.text3,
  Gold: RColors.gold,
  Diamond: RColors.diamondBlue,
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { categoryRatings, preferredSide, setPreferredSide } = useAppData();

  const withMatches = categoryRatings.filter((c) => c.matches > 0);
  const best =
    withMatches.length > 0
      ? withMatches.reduce((a, b) => (b.wins / b.matches > a.wins / a.matches ? b : a))
      : null;

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 18 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Your Stats</Text>
          <View style={{ width: 22 }} />
        </View>

        {best ? (
          <RCard borderColor={withAlpha(RColors.diamondBlue, 0.5)} contentStyle={{ padding: 16, gap: 4 }}>
            <View style={styles.rowStart}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={RColors.diamondBlue} />
              <Text style={styles.bestLabel}>Strongest Category</Text>
            </View>
            <Text style={styles.bestValue}>{best.category}</Text>
            <Text style={styles.mutedSmall}>
              {best.wins}-{best.losses} · {Math.round((best.wins / best.matches) * 100)}% win rate
            </Text>
          </RCard>
        ) : (
          <RCard contentStyle={{ padding: 16, alignItems: 'center', gap: 4 }}>
            <Text style={styles.bestValue}>No matches yet</Text>
            <Text style={styles.mutedSmall}>Play a few matches to see where you&apos;re strongest.</Text>
          </RCard>
        )}

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>By Category</Text>
          {categoryRatings.map((c) => {
            const winRate = c.matches > 0 ? Math.round((c.wins / c.matches) * 100) : 0;
            const inPlacement = c.matches < PLACEMENT_MATCHES_REQUIRED;
            return (
              <RCard key={c.category} contentStyle={{ padding: 16, gap: 10 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.categoryName}>{c.category}</Text>
                  {inPlacement ? (
                    <Text style={[styles.categoryTier, { color: RColors.text5 }]}>
                      Placement {c.matches}/{PLACEMENT_MATCHES_REQUIRED}
                    </Text>
                  ) : (
                    <Text style={[styles.categoryTier, { color: TIER_COLOR[c.tier] }]}>
                      {c.skill} {c.tier}
                    </Text>
                  )}
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${winRate}%`, backgroundColor: RColors.diamondBlue }]} />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.mutedSmall}>
                    {c.matches} matches · {c.wins}W {c.losses}L
                  </Text>
                  <Text style={styles.mutedSmall}>{winRate}% win rate</Text>
                </View>
                {inPlacement ? (
                  <Text style={styles.mutedSmall}>Play {PLACEMENT_MATCHES_REQUIRED - c.matches} more to unlock your rank.</Text>
                ) : (
                  <Text style={styles.mutedSmall}>
                    Rating {c.rating} · Club rank {c.clubRank > 0 ? `#${c.clubRank}` : '—'}
                  </Text>
                )}
              </RCard>
            );
          })}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Preferred Side</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SideOption
              label="Left"
              icon="arrow-left-bold"
              active={preferredSide === 'Left'}
              onPress={() => setPreferredSide('Left' as PreferredSide)}
            />
            <SideOption
              label="Right"
              icon="arrow-right-bold"
              active={preferredSide === 'Right'}
              onPress={() => setPreferredSide('Right' as PreferredSide)}
            />
          </View>
          <Text style={styles.mutedSmall}>Helps teammates know how to line up before a match.</Text>
        </View>
      </ScrollView>
    </RScreen>
  );
}

function SideOption({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <RCard
        borderColor={active ? RColors.accent : RColors.cardBorder}
        contentStyle={[styles.sideOption, active && { backgroundColor: withAlpha(RColors.accent, 0.16) }]}>
        <MaterialCommunityIcons name={icon} size={20} color={active ? RColors.accent : RColors.text5} />
        <Text style={[styles.sideLabel, active && { color: RColors.textPrimary }]}>{label}</Text>
      </RCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bestLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.diamondBlue },
  bestValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: RColors.textPrimary },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  sectionTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 14, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  categoryName: { fontFamily: 'Rajdhani_700Bold', fontSize: 17, color: RColors.textPrimary },
  categoryTier: { fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 6, backgroundColor: RColors.cardBorder, width: '100%' },
  progressFill: { height: '100%' },
  sideOption: { paddingVertical: 16, alignItems: 'center', gap: 6 },
  sideLabel: { fontSize: 13, fontWeight: '600', color: RColors.text5 },
});
