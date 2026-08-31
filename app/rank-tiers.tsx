import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';

const TIERS = [
  {
    name: 'Bronze',
    color: RColors.bronze,
    range: '1000 – 1199',
    icon: 'shield-outline' as const,
    blurb: 'Everyone starts here. Play matches to climb.',
  },
  {
    name: 'Silver',
    color: RColors.text3,
    range: '1200 – 1499',
    icon: 'shield-half-full' as const,
    blurb: 'You know your way around the court.',
  },
  {
    name: 'Gold',
    color: RColors.gold,
    range: '1500 – 1799',
    icon: 'shield' as const,
    blurb: 'Solid, consistent play — most club players never see higher.',
  },
  {
    name: 'Diamond',
    color: RColors.diamondBlue,
    range: '1800+',
    icon: 'shield-star' as const,
    blurb: 'The top of the club ladder.',
  },
];

function TierRow({ tier, index, isCurrent }: { tier: (typeof TIERS)[number]; index: number; isCurrent: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(index * 110, withTiming(1, { duration: 420 }));
  }, [progress, index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 18 }],
  }));

  return (
    <Animated.View style={animStyle}>
      <RCard
        borderColor={isCurrent ? tier.color : RColors.cardBorder}
        contentStyle={[styles.tierRow, isCurrent && { backgroundColor: withAlpha(tier.color, 0.12) }]}>
        <View style={[styles.iconWrap, { backgroundColor: withAlpha(tier.color, 0.18) }]}>
          <MaterialCommunityIcons name={tier.icon} size={26} color={tier.color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.rowBetween}>
            <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
            {isCurrent && (
              <View style={[styles.currentTag, { backgroundColor: withAlpha(tier.color, 0.25) }]}>
                <Text style={[styles.currentTagText, { color: tier.color }]}>You are here</Text>
              </View>
            )}
          </View>
          <Text style={styles.tierRange}>{tier.range} rating</Text>
          <Text style={styles.tierBlurb}>{tier.blurb}</Text>
        </View>
      </RCard>
    </Animated.View>
  );
}

export default function RankTiersScreen() {
  const insets = useSafeAreaInsets();
  const { current } = useLocalSearchParams<{ current?: string }>();

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Rank Tiers</Text>
          <View style={{ width: 22 }} />
        </View>

        <Text style={styles.subtitle}>Four tiers, from Bronze to Diamond. Win matches to climb, in any category.</Text>

        <View style={{ gap: 12 }}>
          {TIERS.slice()
            .reverse()
            .map((tier, i) => (
              <TierRow key={tier.name} tier={tier} index={i} isCurrent={tier.name === current} />
            ))}
        </View>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  subtitle: { fontSize: 12, color: RColors.text7, lineHeight: 17 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tierRow: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tierName: { fontFamily: 'Rajdhani_700Bold', fontSize: 19 },
  tierRange: { fontSize: 11, fontWeight: '600', color: RColors.text8 },
  tierBlurb: { fontSize: 11, color: RColors.text9, marginTop: 2 },
  currentTag: { paddingVertical: 3, paddingHorizontal: 8 },
  currentTagText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
});
