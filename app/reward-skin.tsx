import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FrameRing } from '@/components/remontada/icons';
import { RButton, RScreen, RTile } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';
import { SKINS } from '@/lib/remontada-mock-data';

const stormServe = SKINS.find((s) => s.id === 'storm-serve')!;

export default function RewardSkinScreen() {
  const skin = stormServe;
  const insets = useSafeAreaInsets();
  const spin = useSharedValue(0);
  const scale = useSharedValue(0.5);

  React.useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 26000 }), -1, false);
    scale.value = withSequence(withTiming(1.08, { duration: 380 }), withTiming(1, { duration: 220 }));
  }, [spin, scale]);

  const rayStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <RScreen style={{ paddingTop: insets.top + 10 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily Reward</Text>
      </View>

      <View style={styles.subRow}>
        <Text style={styles.subText}>
          You won as <Text style={{ color: RColors.win, fontWeight: '600' }}>Team A</Text> · Ranked ·{' '}
          <Text style={{ color: RColors.win, fontWeight: '600' }}>+24 Rating</Text>
        </Text>
      </View>

      <View style={styles.center}>
        <Animated.View style={[styles.rays, rayStyle]} />
        <Text style={styles.rareLabel}>Rare Drop</Text>
        <Animated.View style={cardStyle}>
          <RTile
            style={{ width: 150 }}
            borderColor="rgba(152,103,225,0.6)"
            contentStyle={{ paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center', gap: 10 }}>
            <FrameRing size={64} gradientFrom={skin.gradientFrom} gradientTo={skin.gradientTo} />
            <Text style={styles.skinName}>{skin.name}</Text>
            <Text style={styles.skinRarity}>{skin.rarity} · {skin.kind}</Text>
          </RTile>
        </Animated.View>
        <Text style={styles.hint}>Added to your Locker — most days you&apos;ll get coins instead.</Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
        <RButton label="Continue" style={{ width: '100%' }} onPress={() => router.back()} />
      </View>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: 6 },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: RColors.text7 },
  subRow: { paddingTop: 22, paddingHorizontal: 20, alignItems: 'center' },
  subText: { fontSize: 13, color: RColors.text8, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  rays: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(152,103,225,0.18)',
    borderStyle: 'dashed',
  },
  rareLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: RColors.epicPurple },
  skinName: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, color: RColors.textPrimary },
  skinRarity: { fontSize: 11, fontWeight: '600', color: RColors.epicPurple },
  hint: { fontSize: 12, color: RColors.text9, textAlign: 'center', maxWidth: 260 },
});
