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
        <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Schließen">
          <Ionicons name="close" size={18} color={RColors.text7} />
        </Pressable>
        <Text style={styles.headerTitle}>Tages-Belohnung</Text>
        <View style={{ width: 18 }} />
      </View>

      <View style={styles.subRow}>
        <Text style={styles.subText}>
          Du hast als <Text style={{ color: RColors.win, fontWeight: '600' }}>Team A</Text> gewonnen · Gewertet ·{' '}
          <Text style={{ color: RColors.win, fontWeight: '600' }}>+19 Wertung</Text>
        </Text>
      </View>

      <View style={styles.center}>
        <MaterialCommunityIcons name="gift-outline" size={34} color={RColors.text9} style={{ opacity: 0.4 }} />
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={styles.claimedTitle}>Tages-Belohnung abgeholt</Text>
          <Text style={styles.caption}>Du hast die heutige Belohnung bereits abgeholt. Eine pro Tag, Reset um Mitternacht.</Text>
          <Text style={styles.countdown}>14 Std 22 Min</Text>
          <Text style={styles.countdownLabel}>Bis zur nächsten Belohnung</Text>
        </View>
      </View>

      <Text style={styles.backLink} onPress={() => router.back()} accessibilityRole="button">
        Zurück zum Match-Raum
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
