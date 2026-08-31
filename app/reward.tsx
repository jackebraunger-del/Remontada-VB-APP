import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinIcon } from '@/components/remontada/icons';
import { RButton, RScreen } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

export default function RewardScreen() {
  const insets = useSafeAreaInsets();
  const { lastRewardCoins } = useAppData();
  const spin = useSharedValue(0);
  const scale = useSharedValue(0.3);

  React.useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 26000 }), -1, false);
    scale.value = withSequence(withTiming(1.15, { duration: 420 }), withTiming(1, { duration: 220 }));
  }, [spin, scale]);

  const rayStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const coinStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
        <Animated.View style={coinStyle}>
          <CoinIcon size={84} />
        </Animated.View>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.amount}>+{lastRewardCoins || 95} Coins</Text>
          <Text style={styles.caption}>Added to your balance · 1 reward per day</Text>
        </View>
        <Text style={styles.hint}>Small chance of a skin instead — save up coins and get one from the Shop.</Text>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  rays: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    borderColor: 'rgba(224,175,59,0.18)',
    borderStyle: 'dashed',
  },
  amount: { fontFamily: 'Rajdhani_700Bold', fontSize: 30, color: RColors.gold },
  caption: { fontSize: 12, color: RColors.text9, textAlign: 'center', maxWidth: 260 },
  hint: { fontSize: 11, color: RColors.text10, textAlign: 'center', maxWidth: 250 },
});
