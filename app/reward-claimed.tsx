import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RScreen } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';

export default function RewardClaimedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <RScreen style={{ paddingTop: insets.top + 10 }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={18} color={RColors.text7} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Reward</Text>
        <View style={{ width: 18 }} />
      </View>

      <View style={styles.subRow}>
        <Text style={styles.subText}>
          You won as <Text style={{ color: RColors.win, fontWeight: '600' }}>Team A</Text> · Ranked ·{' '}
          <Text style={{ color: RColors.win, fontWeight: '600' }}>+19 Rating</Text>
        </Text>
      </View>

      <View style={styles.center}>
        <MaterialCommunityIcons name="gift-outline" size={34} color={RColors.text9} style={{ opacity: 0.4 }} />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.claimedTitle}>Daily Reward Claimed</Text>
          <Text style={styles.caption}>You already claimed today&apos;s reward. One per day, resets at midnight.</Text>
          <Text style={styles.countdown}>14h 22m</Text>
          <Text style={styles.countdownLabel}>Until next reward</Text>
        </View>
      </View>

      <Text style={styles.backLink} onPress={() => router.back()}>
        Back to Match Room
      </Text>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: RColors.text7 },
  subRow: { paddingTop: 22, paddingHorizontal: 20, alignItems: 'center' },
  subText: { fontSize: 13, color: RColors.text8, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  claimedTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text5 },
  caption: { fontSize: 12, color: RColors.text9, textAlign: 'center', maxWidth: 260 },
  countdown: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: RColors.amberIcon, marginTop: 8 },
  countdownLabel: { fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text10 },
  backLink: { textAlign: 'center', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.accentLink, paddingBottom: 34 },
});
