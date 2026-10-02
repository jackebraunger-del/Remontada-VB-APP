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
import { Slot, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { OnlineDataProvider } from '@/lib/online-context';
import { demoMode } from '@/lib/supabase';
import { AuthScreen } from '@/components/remontada/AuthScreen';
import { RLoading, RScreen } from '@/components/remontada/primitives';

import { RColors } from '@/constants/remontada-colors';
import { AppDataProvider, useAppData } from '@/lib/remontada-context';

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
  const pathname = usePathname();
  const [fontsLoaded] = useFonts({
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
  });

  // This isolated, public prototype has no account or backend data dependencies.
  if (pathname === '/understanding') {
    return <GestureHandlerRootView style={{ flex: 1 }}><Slot /></GestureHandlerRootView>;
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider value={RemontadaTheme}>
          <AccountBoundary />
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function AccountBoundary() {
  const { loading, session } = useAuth();
  if (demoMode) return <AppDataProvider><AppNavigator /></AppDataProvider>;
  if (loading) return <RScreen><RLoading label="Wird geladen…" /></RScreen>;
  if (!session) return <AuthScreen />;
  // Remount all state on account changes: no previous account's data remains in memory.
  return <OnlineDataProvider key={session.user.id}><AppNavigator /></OnlineDataProvider>;
}

function AppNavigator() {
  const { onboardingComplete } = useAppData();
  return (
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: RColors.bgApp } }}>
            <Stack.Protected guard={!onboardingComplete}>
              <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            </Stack.Protected>
            <Stack.Protected guard={onboardingComplete}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="match-room" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="create-match" />
            <Stack.Screen name="report-result" />
            <Stack.Protected guard={demoMode}>
            <Stack.Screen name="locker" />
            <Stack.Screen name="shop" />
            <Stack.Screen name="session" />
            <Stack.Screen name="reward" />
            <Stack.Screen name="reward-skin" />
            <Stack.Screen name="reward-claimed" />
            <Stack.Screen name="stats" />
            <Stack.Screen name="rank-tiers" />
            <Stack.Screen name="coach" />
            <Stack.Screen name="dev-n8n-test" options={{ headerShown: true, title: 'n8n Verbindungstest' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
            </Stack.Protected>
            </Stack.Protected>
          </Stack>
  );
}
