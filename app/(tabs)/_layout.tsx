import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { RColors } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

// Kleiner aktiver Indikator-Balken über dem Icon, im Valorant-artigen
// eckigen Stil — statt der Standard-Punkt/Pill-Indikatoren.
function TabIconFrame({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.indicator, focused && styles.indicatorActive]} />
      {children}
    </View>
  );
}

export default function TabLayout() {
  const { onboardingComplete } = useAppData();

  // Ohne abgeschlossenes Onboarding (Name + Geschlecht) landet niemand in
  // den eigentlichen App-Tabs – so ergeben Kategorie-Ränge immer Sinn.
  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: RColors.accentLink,
        tabBarInactiveTintColor: RColors.text8,
        tabBarStyle: {
          backgroundColor: RColors.card,
          borderTopColor: RColors.cardBorder,
          borderTopWidth: 1,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'Rajdhani_600SemiBold',
          fontSize: 11,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen
        name="play"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <MaterialCommunityIcons name="volleyball" size={23} color={color} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <Ionicons name={focused ? 'podium' : 'podium-outline'} size={22} color={color} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIconFrame focused={focused}>
              <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={23} color={color} />
            </TabIconFrame>
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconFrame: { alignItems: 'center', justifyContent: 'flex-start', width: 30, paddingTop: 3 },
  indicator: { width: 18, height: 2.5, backgroundColor: 'transparent', marginBottom: 4 },
  indicatorActive: { backgroundColor: RColors.accentLink },
});
