import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from '@expo-google-fonts/barlow';
import {
  Rajdhani_500Medium,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { RColors } from '@/constants/remontada-colors';
import { AppDataProvider } from '@/lib/remontada-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Dunkles Navigations-Theme, exakt auf die Remontada-Palette abgestimmt
// (relevant z.B. für den Hintergrund während Screen-Übergängen).
const RemontadaTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: RColors.accent,
    background: RColors.bgApp,
    card: RColors.card,
    text: RColors.textPrimary,
    border: RColors.cardBorder,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppDataProvider>
        <ThemeProvider value={RemontadaTheme}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: RColors.bgApp } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="match-room" />
            <Stack.Screen name="locker" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="session" />
            <Stack.Screen name="reward" />
            <Stack.Screen name="reward-skin" />
            <Stack.Screen name="reward-claimed" />
            <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
            <Stack.Screen name="settings" />
            <Stack.Screen name="stats" />
            <Stack.Screen name="rank-tiers" />
            <Stack.Screen name="coach" />
            <Stack.Screen name="create-match" />
            <Stack.Screen name="report-result" />
            <Stack.Screen name="dev-n8n-test" options={{ headerShown: true, title: 'n8n Verbindungstest' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </AppDataProvider>
    </GestureHandlerRootView>
  );
}
