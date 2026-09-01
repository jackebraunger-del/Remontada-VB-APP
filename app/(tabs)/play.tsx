import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineMatchesScreen } from '@/components/remontada/OnlineScreens';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CutCornerView } from '@/components/remontada/CutCorner';
import { RButton, RButtonOutline, RCard, RChip, RScreen, RTag } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

const FILTERS = ['All', 'Men', 'Women', 'Mixed'];

export default function PlayScreen() {
  const online = useOnlineData();
  return online ? <OnlineMatchesScreen /> : <DemoPlayScreen />;
}

function DemoPlayScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('All');
  const { matches } = useAppData();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000 }), -1, false);
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.5 }],
    opacity: 0.55 * (1 - pulse.value),
  }));

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>PLAY</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Pressable hitSlop={10} onPress={() => router.push('/report-result')} style={styles.reportRow}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={19} color={RColors.text3} />
              <Text style={styles.reportLabel}>Report Result</Text>
            </Pressable>
            <Ionicons name="options-outline" size={20} color={RColors.text5} />
          </View>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <RChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </View>

        {matches.length === 0 && (
          <RCard contentStyle={{ padding: 20, alignItems: 'center', gap: 6 }}>
            <Text style={styles.matchLocation}>No open matches yet</Text>
            <Text style={styles.mutedSmall}>Tap the + button to create the first one.</Text>
          </RCard>
        )}

        <View style={{ gap: 12 }}>
          {matches.map((match) => (
            <RCard key={match.id} style={match.faded ? { opacity: 0.55 } : undefined} contentStyle={{ padding: 16, gap: 10 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.matchLocation}>{match.location}</Text>
                <Text style={[styles.matchTime, match.faded && { color: RColors.text9 }]}>{match.timeLabel}</Text>
              </View>
              <View style={styles.tagRow}>
                {match.tags.map((t) => (
                  <RTag key={t} label={t} color={RColors.text3} bg={RColors.chip3} />
                ))}
                {match.ranked && <RTag label="Ranked" color={RColors.rareOrange} bg={withAlpha(RColors.accent, 0.3)} />}
              </View>
              <View style={styles.rowBetween}>
                <Text style={styles.mutedSmall}>
                  {match.playersJoined}/{match.playersJoined + match.playersNeeded}
                  {match.needsWoman ? ' · 1 woman needed' : ` · ${match.playersNeeded} needed`}
                </Text>
                {match.faded ? (
                  <RButtonOutline label="Join" onPress={() => router.push('/match-room')} />
                ) : (
                  <RButton label="Join" onPress={() => router.push('/match-room')} />
                )}
              </View>
            </RCard>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.fabWrap, { bottom: 22 }]}>
        <Animated.View style={[styles.fabGlow, pulseStyle]} />
        <Pressable onPress={() => router.push('/create-match')} hitSlop={8}>
          <CutCornerView
            cut={12}
            backgroundColor={RColors.accent}
            contentStyle={styles.fabContent}
            style={styles.fabShadow}>
            <Ionicons name="add" size={22} color={RColors.white} />
          </CutCornerView>
        </Pressable>
      </View>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: RColors.textPrimary },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reportLabel: { fontSize: 11, fontWeight: '600', color: RColors.text3 },
  filterRow: { flexDirection: 'row', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matchLocation: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 16, color: RColors.textPrimary },
  matchTime: { fontSize: 12, fontWeight: '600', color: RColors.amber },
  tagRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  mutedSmall: { fontSize: 12, color: RColors.text7 },
  fabWrap: { position: 'absolute', right: 20, width: 52, height: 52 },
  fabGlow: { position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: withAlpha(RColors.accent, 0.6) },
  fabContent: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  fabShadow: { shadowColor: RColors.accent, shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
});
