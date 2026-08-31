import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { resetDemoData } = useAppData();
  const [confirming, setConfirming] = useState(false);
  const [justReset, setJustReset] = useState(false);

  function onResetPress() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resetDemoData();
    setConfirming(false);
    setJustReset(true);
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>App</Text>
          <RCard contentStyle={styles.rowItem}>
            <Ionicons name="notifications-outline" size={18} color={RColors.text5} />
            <Text style={styles.rowLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={RColors.text9} />
          </RCard>
          <RCard contentStyle={styles.rowItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color={RColors.text5} />
            <Text style={styles.rowLabel}>Privacy</Text>
            <Ionicons name="chevron-forward" size={16} color={RColors.text9} />
          </RCard>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Demo Data</Text>
          <RCard borderColor={withAlpha(RColors.legendaryRed, 0.5)} contentStyle={{ padding: 16, gap: 10 }}>
            <View style={styles.rowStart}>
              <MaterialCommunityIcons name="restart-alert" size={18} color={RColors.legendaryRed} />
              <Text style={styles.warningTitle}>Reset to Zero</Text>
            </View>
            <Text style={styles.warningBody}>
              Right now this app is filled with example players and matches (Maria, Carlos, Laura…) so you can see
              what everything looks like. Once you&apos;re ready to go live, use this to wipe all of that and start
              from a completely empty state — 0 coins, no matches, no rank history.
            </Text>
            {justReset ? (
              <Text style={styles.doneText}>Done — everything is back to zero.</Text>
            ) : (
              <RButton
                label={confirming ? 'Tap again to confirm' : 'Reset Demo Data'}
                onPress={onResetPress}
                style={confirming ? { opacity: 1 } : undefined}
              />
            )}
            {confirming && !justReset && (
              <Pressable onPress={() => setConfirming(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </RCard>
        </View>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  sectionTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  rowItem: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warningTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 15, color: RColors.legendaryRed },
  warningBody: { fontSize: 12, lineHeight: 17, color: RColors.text5 },
  doneText: { fontSize: 13, fontWeight: '600', color: RColors.win, textAlign: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 12, fontWeight: '600', color: RColors.text9, textAlign: 'center' },
});
