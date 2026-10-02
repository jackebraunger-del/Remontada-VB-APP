import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineMatchesScreen } from '@/components/remontada/OnlineScreens';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinIcon } from '@/components/remontada/icons';
import { RButton, RCard, RScreen, RTag } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

export default function HomeScreen() {
  const online = useOnlineData();
  return online ? <OnlineMatchesScreen home /> : <DemoHomeScreen />;
}

function DemoHomeScreen() {
  const insets = useSafeAreaInsets();
  const { coins, dailyRewardClaimedToday, claimDailyReward, matches, recentResult, categoryRatings } = useAppData();
  const openRank = categoryRatings.find((c) => c.category === 'Open') ?? categoryRatings[0];
  const progress = Math.min(1, (openRank.rating % 500) / 500);

  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withTiming(progress, { duration: 900 });
  }, [barWidth, progress]);
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value * 100}%` }));

  function onDailyRewardPress() {
    if (dailyRewardClaimedToday) {
      router.push('/reward-claimed');
      return;
    }
    const outcome = claimDailyReward();
    router.push(outcome === 'skin' ? '/reward-skin' : '/reward');
  }

  const openMatches = matches.filter((m) => !m.faded);

  return (
    <RScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24, gap: 20 }}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>REMONTADA</Text>
          <View style={styles.headerRight}>
            <View style={styles.coinBadge}>
              <CoinIcon size={14} />
              <Text style={styles.coinText}>{coins}</Text>
            </View>
            <Ionicons name="notifications-outline" size={20} color={RColors.text5} accessibilityLabel="Benachrichtigungen" />
            <Pressable
              hitSlop={10}
              onPress={() => router.push('/locker')}
              accessibilityRole="button"
              accessibilityLabel="Spind öffnen">
              <View style={styles.avatarSmall} />
            </Pressable>
          </View>
        </View>

        <RCard contentStyle={{ padding: 18, gap: 12 }}>
          <View style={styles.rankHeaderRow}>
            <Text style={styles.eyebrow}>Dein Rang · Offen</Text>
            <Text style={[styles.ratingValue, { color: RColors.diamondBlue }]}>{openRank.rating}</Text>
          </View>
          <View style={styles.rankRow}>
            <MaterialCommunityIcons name="shield-check" size={28} color={RColors.diamondBlue} />
            <Text style={styles.rankTitle}>
              {openRank.skill} {openRank.tier}
            </Text>
          </View>
          <View style={{ gap: 6 }}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { backgroundColor: RColors.diamondBlue }, barStyle]} />
            </View>
            <Text style={styles.mutedSmall}>Spiele weiter, um in der Rangliste aufzusteigen.</Text>
          </View>
        </RCard>

        <Pressable
          onPress={onDailyRewardPress}
          accessibilityRole="button"
          accessibilityLabel={dailyRewardClaimedToday ? 'Tages-Belohnung bereits abgeholt' : 'Tages-Belohnung freischalten'}>
          <RCard contentStyle={styles.dailyRewardRow}>
            <View style={styles.giftGlowWrap}>
              <View style={styles.giftGlow} />
              <MaterialCommunityIcons name="gift-outline" size={20} color={RColors.amberIcon} />
            </View>
            <Text style={styles.dailyRewardText}>
              {dailyRewardClaimedToday ? (
                'Tages-Belohnung abgeholt — bis morgen'
              ) : (
                <>
                  Gewinne heute ein Match, um deine <Text style={{ fontWeight: '700', color: RColors.white }}>Tages-Belohnung</Text> freizuschalten
                </>
              )}
            </Text>
            <Text style={styles.mutedTiny}>{dailyRewardClaimedToday ? '1/1' : '0/1'}</Text>
          </RCard>
        </Pressable>

        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Offene Matches in der Nähe</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Alle Matches anzeigen" onPress={() => router.push('/play')} hitSlop={6}>
              <Text style={styles.linkText}>Alle anzeigen</Text>
            </Pressable>
          </View>

          {openMatches.length === 0 && (
            <RCard contentStyle={{ padding: 20, alignItems: 'center', gap: 6 }}>
              <Text style={styles.emptyTitle}>Noch keine offenen Matches</Text>
              <Text style={styles.mutedSmall}>Erstelle das erste Match weiter unten.</Text>
            </RCard>
          )}

          {openMatches.map((match) => (
            <RCard key={match.id} contentStyle={{ padding: 16, gap: 10 }}>
              <View style={styles.matchTopRow}>
                <Text style={styles.matchLocation}>{match.location}</Text>
                <Text style={styles.matchTime}>{match.timeLabel}</Text>
              </View>
              <View style={styles.tagRow}>
                {match.tags.map((t) => (
                  <RTag key={t} label={t} color={RColors.text3} bg={RColors.chip3} />
                ))}
                {match.ranked && <RTag label="Gewertet" color={RColors.rareOrange} bg={withAlpha(RColors.accent, 0.3)} />}
              </View>
              <View style={styles.matchBottomRow}>
                <Text style={styles.mutedSmall}>
                  {match.playersJoined}/{match.playersJoined + match.playersNeeded} Spieler
                  {match.needsWoman ? ' · noch 1 Frau gesucht' : ` · noch ${match.playersNeeded} gesucht`}
                </Text>
                <RButton label="Beitreten" onPress={() => router.push('/match-room')} />
              </View>
            </RCard>
          ))}
        </View>

        {recentResult && (
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Letztes Ergebnis</Text>
            <Pressable onPress={() => router.push('/match-room')} accessibilityRole="button" accessibilityLabel="Letztes Ergebnis ansehen">
              <RCard contentStyle={{ padding: 16, gap: 8 }}>
                <Text style={styles.resultTitle}>
                  {recentResult.teamA.join(' & ')} gewann gegen {recentResult.teamB.join(' & ')}
                </Text>
                <Text style={styles.resultSets}>{recentResult.sets}</Text>
                <View style={styles.matchBottomRow}>
                  <Text style={styles.mutedSmall}>{recentResult.category}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {recentResult.ratingDeltas.map((d) => (
                      <Text key={d.name} style={styles.deltaText}>
                        {d.name} +{d.delta}
                      </Text>
                    ))}
                  </View>
                </View>
              </RCard>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.createMatchBar}>
        <RButton label="+ Match erstellen" style={{ width: '100%' }} onPress={() => router.push('/create-match')} />
      </View>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, letterSpacing: 1.5, color: RColors.textPrimary },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: RColors.chip,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  coinText: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: RColors.textPrimary },
  avatarSmall: { width: 30, height: 30, borderRadius: 15, backgroundColor: RColors.avatarBg, borderWidth: 1.5, borderColor: RColors.outline },
  rankHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: RColors.text7 },
  ratingValue: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 15 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: RColors.textPrimary },
  progressTrack: { height: 6, backgroundColor: RColors.cardBorder, width: '100%' },
  progressFill: { position: 'absolute', left: 0, top: 0, height: '100%' },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  mutedTiny: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.text9 },
  emptyTitle: { fontSize: 13, fontWeight: '600', color: RColors.text3 },
  dailyRewardRow: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  giftGlowWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  giftGlow: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: withAlpha(RColors.amberIcon, 0.35) },
  dailyRewardText: { flex: 1, fontSize: 12, color: RColors.text5 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  linkText: { fontSize: 12, fontWeight: '600', color: RColors.accentLink },
  matchTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchLocation: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 16, color: RColors.textPrimary },
  matchTime: { fontSize: 12, fontWeight: '600', color: RColors.amber },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  matchBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  resultTitle: { fontSize: 14, fontWeight: '600', color: RColors.textPrimary },
  resultSets: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 15, color: RColors.win },
  deltaText: { fontSize: 11, fontWeight: '700', color: RColors.win },
  createMatchBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: RColors.divider,
    backgroundColor: RColors.bgApp,
  },
});
