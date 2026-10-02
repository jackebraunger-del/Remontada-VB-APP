import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RCard, RHeader, REmptyState, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { CATEGORY_LABELS, SKILL_LABELS } from '@/constants/remontada-labels';
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
        <RHeader title="Deine Statistiken" />

        {best ? (
          <RCard borderColor={withAlpha(RColors.diamondBlue, 0.5)} contentStyle={{ padding: 16, gap: 4 }}>
            <View style={styles.rowStart}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={RColors.diamondBlue} />
              <Text style={styles.bestLabel}>Stärkste Kategorie</Text>
            </View>
            <Text style={styles.bestValue}>{CATEGORY_LABELS[best.category] ?? best.category}</Text>
            <Text style={styles.mutedSmall}>
              {best.wins}-{best.losses} · {Math.round((best.wins / best.matches) * 100)}% Sieg-Quote
            </Text>
          </RCard>
        ) : (
          <REmptyState title="Noch keine Matches" description="Spiele ein paar Matches, um zu sehen, wo du am stärksten bist." />
        )}

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Nach Kategorie</Text>
          {categoryRatings.map((c) => {
            const winRate = c.matches > 0 ? Math.round((c.wins / c.matches) * 100) : 0;
            const inPlacement = c.matches < PLACEMENT_MATCHES_REQUIRED;
            return (
              <RCard key={c.category} contentStyle={{ padding: 16, gap: 10 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.categoryName}>{CATEGORY_LABELS[c.category] ?? c.category}</Text>
                  {inPlacement ? (
                    <Text style={[styles.categoryTier, { color: RColors.text5 }]}>
                      Einstufung {c.matches}/{PLACEMENT_MATCHES_REQUIRED}
                    </Text>
                  ) : (
                    <Text style={[styles.categoryTier, { color: TIER_COLOR[c.tier] }]}>
                      {SKILL_LABELS[c.skill] ?? c.skill} {c.tier}
                    </Text>
                  )}
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${winRate}%`, backgroundColor: RColors.diamondBlue }]} />
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.mutedSmall}>
                    {c.matches} Matches · {c.wins}S {c.losses}N
                  </Text>
                  <Text style={styles.mutedSmall}>{winRate}% Sieg-Quote</Text>
                </View>
                {inPlacement ? (
                  <Text style={styles.mutedSmall}>Spiele noch {PLACEMENT_MATCHES_REQUIRED - c.matches}, um deinen Rang freizuschalten.</Text>
                ) : (
                  <Text style={styles.mutedSmall}>
                    Wertung {c.rating} · Vereins-Rang {c.clubRank > 0 ? `#${c.clubRank}` : '—'}
                  </Text>
                )}
              </RCard>
            );
          })}
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Bevorzugte Seite</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SideOption
              label="Links"
              icon="arrow-left-bold"
              active={preferredSide === 'Left'}
              onPress={() => setPreferredSide('Left' as PreferredSide)}
            />
            <SideOption
              label="Rechts"
              icon="arrow-right-bold"
              active={preferredSide === 'Right'}
              onPress={() => setPreferredSide('Right' as PreferredSide)}
            />
          </View>
          <Text style={styles.mutedSmall}>Hilft Teamkollegen, sich vor dem Match richtig aufzustellen.</Text>
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
    <Pressable style={{ flex: 1 }} onPress={onPress} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: active }}>
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
