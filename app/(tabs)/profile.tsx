import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineProfileScreen } from '@/components/remontada/OnlineScreens';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinIcon, FrameRing } from '@/components/remontada/icons';
import { RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { PLACEMENT_MATCHES_REQUIRED, useAppData } from '@/lib/remontada-context';
import { PROFILE } from '@/lib/remontada-mock-data';

const TIER_COLOR: Record<string, string> = {
  Bronze: RColors.bronze,
  Silver: RColors.text3,
  Gold: RColors.gold,
  Diamond: RColors.diamondBlue,
};

export default function ProfileScreen() {
  const online = useOnlineData();
  return online ? <OnlineProfileScreen /> : <DemoProfileScreen />;
}

function DemoProfileScreen() {
  const insets = useSafeAreaInsets();
  const { coins, skins, categoryRatings, profileVerified, playerName } = useAppData();
  const equipped = skins.find((s) => s.equipped) ?? skins.find((s) => s.id === 'sunset-court')!;

  const totalMatches = categoryRatings.reduce((sum, c) => sum + c.matches, 0);
  const totalWins = categoryRatings.reduce((sum, c) => sum + c.wins, 0);
  const totalLosses = categoryRatings.reduce((sum, c) => sum + c.losses, 0);
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24, gap: 20 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>PROFILE</Text>
          <View style={styles.headerRight}>
            <View style={styles.coinBadge}>
              <CoinIcon size={14} />
              <Text style={styles.coinText}>{coins}</Text>
            </View>
            <Pressable hitSlop={10} onPress={() => router.push('/settings')}>
              <Ionicons name="settings-outline" size={22} color={RColors.text5} />
            </Pressable>
          </View>
        </View>

        <View style={styles.avatarBlock}>
          <FrameRing size={82} gradientFrom={equipped.gradientFrom} gradientTo={equipped.gradientTo} />
          <View style={styles.nameRow}>
            <Text style={styles.name}>{(playerName || PROFILE.name).toUpperCase()}</Text>
            {profileVerified && <MaterialCommunityIcons name="check-decagram" size={16} color={RColors.diamondBlue} />}
          </View>
          <Text style={styles.mutedSmall}>{profileVerified ? 'Verified Player' : 'Unverified'} · {PROFILE.club}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/locker')}>
            <RCard contentStyle={styles.linkRow}>
              <MaterialCommunityIcons name="treasure-chest" size={18} color={RColors.rareOrange} />
              <Text style={styles.linkLabel}>Locker</Text>
              <Ionicons name="chevron-forward" size={13} color={RColors.text9} />
            </RCard>
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => router.push('/shop')}>
            <RCard contentStyle={styles.linkRow}>
              <CoinIcon size={16} />
              <Text style={styles.linkLabel}>Shop</Text>
              <Ionicons name="chevron-forward" size={13} color={RColors.text9} />
            </RCard>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/coach')}>
          <RCard borderColor={withAlpha(RColors.diamondBlue, 0.4)} contentStyle={styles.linkRow}>
            <MaterialCommunityIcons name="robot-excited-outline" size={18} color={RColors.diamondBlue} />
            <Text style={styles.linkLabel}>Ask your AI Coach</Text>
            <Ionicons name="chevron-forward" size={13} color={RColors.text9} />
          </RCard>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {categoryRatings.map((c) => {
            const inPlacement = c.matches < PLACEMENT_MATCHES_REQUIRED;
            return (
              <Pressable
                key={c.category}
                style={{ flex: 1 }}
                onPress={() => router.push({ pathname: '/rank-tiers', params: { current: inPlacement ? '' : c.tier } })}>
                <RCard contentStyle={styles.ratingCard}>
                  <Text style={styles.ratingCategory}>{c.category}</Text>
                  {inPlacement ? (
                    <Text style={[styles.ratingTier, { color: RColors.text5 }]}>
                      Placement {c.matches}/{PLACEMENT_MATCHES_REQUIRED}
                    </Text>
                  ) : (
                    <Text style={[styles.ratingTier, { color: TIER_COLOR[c.tier] }]}>
                      {c.skill === 'Intermediate' ? 'Int.' : c.skill === 'Advanced' ? 'Adv.' : c.skill} {c.tier}
                    </Text>
                  )}
                  <Text style={styles.mutedSmall}>{inPlacement ? `${c.matches} played` : `${c.rating} · #${c.clubRank}`}</Text>
                </RCard>
              </Pressable>
            );
          })}
        </View>

        <Pressable onPress={() => router.push('/stats')}>
          <RCard contentStyle={styles.statsRow}>
            <Stat value={String(totalMatches)} label="Matches" />
            <Stat value={String(totalWins)} label="Wins" color={RColors.win} />
            <Stat value={String(totalLosses)} label="Losses" color={RColors.lossRed} />
            <Stat value={`${winRate}%`} label="Win Rate" />
          </RCard>
        </Pressable>

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {totalMatches === 0 ? (
            <RCard contentStyle={{ padding: 16, alignItems: 'center', gap: 4 }}>
              <Text style={styles.matchTitle}>No matches yet</Text>
              <Text style={styles.mutedSmall}>Play your first match to see results here.</Text>
            </RCard>
          ) : (
            <>
              <RCard contentStyle={styles.matchRow}>
                <View>
                  <Text style={styles.matchTitle}>vs Carlos & Laura</Text>
                  <Text style={styles.mutedSmall}>Mixed · Ranked</Text>
                </View>
                <Text style={[styles.matchDelta, { color: RColors.win }]}>Won +24</Text>
              </RCard>
              <RCard contentStyle={styles.matchRow}>
                <View>
                  <Text style={styles.matchTitle}>vs Pedro & Ana</Text>
                  <Text style={styles.mutedSmall}>Open · Ranked</Text>
                </View>
                <Text style={[styles.matchDelta, { color: RColors.lossRed }]}>Lost −16</Text>
              </RCard>
            </>
          )}
        </View>
      </ScrollView>
    </RScreen>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: RColors.textPrimary },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: RColors.chip, paddingVertical: 5, paddingHorizontal: 9 },
  coinText: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: RColors.textPrimary },
  avatarBlock: { alignItems: 'center', gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: RColors.textPrimary },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  linkRow: { padding: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  linkLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  ratingCard: { paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 4 },
  ratingCategory: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.text9 },
  ratingTier: { fontFamily: 'Rajdhani_700Bold', fontSize: 14 },
  statsRow: { paddingVertical: 14, flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 19, color: RColors.textPrimary },
  statLabel: { fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.text9 },
  sectionTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 15, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  matchRow: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchTitle: { fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  matchDelta: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13 },
});
