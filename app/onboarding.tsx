import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';
import { Gender } from '@/lib/remontada-types';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAppData();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  const canSubmit = name.trim().length > 0 && gender !== null;

  function onSubmit() {
    if (!gender || name.trim().length === 0) return;
    completeOnboarding(name, gender);
    router.replace('/(tabs)');
  }

  return (
    <RScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
            justifyContent: 'center',
            gap: 24,
          }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={styles.brand}>REMONTADA</Text>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Let&apos;s set up your profile so rankings work correctly for you.</Text>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Your Name</Text>
            <RCard contentStyle={{ paddingHorizontal: 4 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Jakob"
                placeholderTextColor={RColors.text9}
                style={styles.textInput}
                autoCapitalize="words"
                autoFocus
              />
            </RCard>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.helperText}>
              Used only to show you the right category ranks (Men / Women / Mixed / Open).
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <GenderOption
                label="Male"
                icon="gender-male"
                active={gender === 'Male'}
                onPress={() => setGender('Male')}
              />
              <GenderOption
                label="Female"
                icon="gender-female"
                active={gender === 'Female'}
                onPress={() => setGender('Female')}
              />
            </View>
          </View>

          <RButton label="Continue" onPress={onSubmit} disabled={!canSubmit} style={{ marginTop: 8 }} />

          <View style={styles.demoNoteRow}>
            <Ionicons name="information-circle-outline" size={14} color={RColors.text9} />
            <Text style={styles.demoNote}>You can change this later. Demo matches stay until you reset from Settings.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </RScreen>
  );
}

function GenderOption({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      <RCard
        borderColor={active ? RColors.accent : RColors.cardBorder}
        contentStyle={[styles.genderOption, active && { backgroundColor: withAlpha(RColors.accent, 0.16) }]}>
        <MaterialCommunityIcons name={icon} size={24} color={active ? RColors.accent : RColors.text5} />
        <Text style={[styles.genderLabel, active && { color: RColors.textPrimary }]}>{label}</Text>
      </RCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 2, color: RColors.accentLink },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 28, color: RColors.textPrimary },
  subtitle: { fontSize: 13, color: RColors.text7, textAlign: 'center', paddingHorizontal: 12 },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  helperText: { fontSize: 11, color: RColors.text9, marginTop: -4 },
  textInput: { paddingVertical: 13, paddingHorizontal: 12, fontSize: 14, color: RColors.textPrimary },
  genderOption: { paddingVertical: 18, alignItems: 'center', gap: 8 },
  genderLabel: { fontSize: 13, fontWeight: '600', color: RColors.text5 },
  demoNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, paddingHorizontal: 4 },
  demoNote: { flex: 1, fontSize: 10, color: RColors.text9, lineHeight: 14 },
});
