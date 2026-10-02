import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { RButton, RScreen } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';

// Übrig gebliebene Expo-Vorlagenseite (Route bleibt bestehen, falls
// irgendwo darauf verlinkt wird) – im Remontada-Look statt der
// generischen Vorlagenoptik.
export default function ModalScreen() {
  return (
    <RScreen style={styles.container}>
      <Text style={styles.title}>Das ist ein Modal-Fenster</Text>
      <Link href="/" dismissTo asChild>
        <RButton label="Zur Startseite" style={{ marginTop: 15 }} />
      </Link>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 22,
    color: RColors.textPrimary,
  },
});
