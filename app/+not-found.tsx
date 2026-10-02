import Ionicons from '@expo/vector-icons/Ionicons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RScreen } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';
import { RSpacing } from '@/constants/remontada-tokens';

// Unbekannte Route (z.B. ein alter oder falscher Link). Zeigt eine ruhige,
// markengerechte Seite statt eines nackten Systemfehlers.
export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <RScreen>
        <View style={[styles.center, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <Ionicons name="compass-outline" size={40} color={RColors.text8} />
          <Text style={styles.title}>Seite nicht gefunden</Text>
          <Text style={styles.body}>Diese Seite gibt es nicht oder der Link ist veraltet.</Text>
          <Link href="/" asChild>
            <RButton label="Zur Startseite" style={{ marginTop: RSpacing.lg }} />
          </Link>
        </View>
      </RScreen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RSpacing.sm, paddingHorizontal: 32 },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: RColors.textPrimary, marginTop: RSpacing.sm },
  body: { fontFamily: 'Barlow_400Regular', fontSize: 14, color: RColors.text7, textAlign: 'center' },
});
