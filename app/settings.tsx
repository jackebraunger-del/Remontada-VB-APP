import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineProfileScreen } from '@/components/remontada/OnlineScreens';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RCard, RConfirmButton, RHeader, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

export default function SettingsScreen() {
  const online = useOnlineData();
  return online ? <OnlineProfileScreen settings /> : <DemoSettingsScreen />;
}

function DemoSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { resetDemoData } = useAppData();
  const [justReset, setJustReset] = useState(false);

  function onReset() {
    resetDemoData();
    setJustReset(true);
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <RHeader title="Einstellungen" />

        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>App</Text>
          <RCard contentStyle={styles.rowItem}>
            <Ionicons name="notifications-outline" size={18} color={RColors.text5} />
            <Text style={styles.rowLabel}>Benachrichtigungen</Text>
            <Ionicons name="chevron-forward" size={16} color={RColors.text9} />
          </RCard>
          <RCard contentStyle={styles.rowItem}>
            <Ionicons name="shield-checkmark-outline" size={18} color={RColors.text5} />
            <Text style={styles.rowLabel}>Datenschutz</Text>
            <Ionicons name="chevron-forward" size={16} color={RColors.text9} />
          </RCard>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.sectionTitle}>Demo-Daten</Text>
          <RCard borderColor={withAlpha(RColors.legendaryRed, 0.5)} contentStyle={{ padding: 16, gap: 10 }}>
            <View style={styles.rowStart}>
              <MaterialCommunityIcons name="restart-alert" size={18} color={RColors.legendaryRed} />
              <Text style={styles.warningTitle}>Auf Null zurücksetzen</Text>
            </View>
            <Text style={styles.warningBody}>
              Diese App ist aktuell mit Beispiel-Spielern und -Matches gefüllt (Maria, Carlos, Laura …), damit du sehen
              kannst, wie alles aussieht. Sobald du bereit für den echten Einsatz bist, kannst du damit alles löschen
              und komplett bei null anfangen — 0 Coins, keine Matches, keine Rang-Historie.
            </Text>
            {justReset ? (
              <Text style={styles.doneText}>Erledigt — alles ist wieder auf null.</Text>
            ) : (
              <RConfirmButton label="Demo-Daten zurücksetzen" confirmLabel="Wirklich zurücksetzen?" onConfirm={onReset} />
            )}
          </RCard>
        </View>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  rowItem: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warningTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 15, color: RColors.legendaryRed },
  warningBody: { fontSize: 12, lineHeight: 17, color: RColors.text5 },
  doneText: { fontSize: 13, fontWeight: '600', color: RColors.win, textAlign: 'center', paddingVertical: 8 },
  cancelText: { fontSize: 12, fontWeight: '600', color: RColors.text9, textAlign: 'center' },
});
