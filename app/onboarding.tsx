import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RButtonOutline, RCard, RErrorBanner, RInput, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { RSize, RSpacing } from '@/constants/remontada-tokens';
import { useAppData } from '@/lib/remontada-context';
import { Gender } from '@/lib/remontada-types';
import { demoMode, errorMessage } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

// Einmaliger Profil-Schritt nach dem Anmelden. Der geschützte Navigator öffnet
// die restliche App erst, sobald das Profil gespeichert ist.
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useAppData();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);

  const canSubmit = name.trim().length > 0 && gender !== null;

  async function onSubmit() {
    if (busy || !gender || name.trim().length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await completeOnboarding(name, gender);
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  }

  return (
    <RScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
            justifyContent: 'center',
            gap: RSpacing.xl,
          }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={styles.brand}>REMONTADA</Text>
            <Text style={styles.title}>Willkommen!</Text>
            <Text style={styles.subtitle}>Richte dein Profil ein, damit die Rangliste für dich korrekt funktioniert.</Text>
          </View>

          <RInput
            label="Dein Name"
            value={name}
            onChangeText={setName}
            placeholder="z.B. Jakob"
            autoCapitalize="words"
            autoFocus
            maxLength={60}
            editable={!busy}
            returnKeyType="done"
          />

          <View style={{ gap: RSpacing.sm }}>
            <Text style={styles.label}>Geschlecht</Text>
            <Text style={styles.helperText}>
              Wird nur genutzt, um dir die passende Kategorie in der Rangliste zu zeigen (Männer / Frauen / Mixed / Offen).
            </Text>
            <View style={{ flexDirection: 'row', gap: RSpacing.md }}>
              <GenderOption
                label="Männlich"
                icon="gender-male"
                active={gender === 'Male'}
                disabled={busy}
                onPress={() => setGender('Male')}
              />
              <GenderOption
                label="Weiblich"
                icon="gender-female"
                active={gender === 'Female'}
                disabled={busy}
                onPress={() => setGender('Female')}
              />
            </View>
          </View>

          {error && <RErrorBanner message={error} />}

          <RButton
            label={busy ? 'Wird gespeichert…' : 'Profil speichern'}
            onPress={() => void onSubmit()}
            disabled={!canSubmit || busy}
            style={{ marginTop: RSpacing.xs }}
          />
          {!demoMode && (
            <RButtonOutline
              label="Abmelden"
              disabled={busy}
              onPress={() => void signOut().catch((e) => setError(errorMessage(e)))}
            />
          )}

          <Text style={styles.demoNote}>
            {demoMode
              ? 'Nur lokale Demo. Beispiel-Matches bleiben bestehen, bis du sie in den Einstellungen zurücksetzt.'
              : 'Dein Anzeigename und deine Kategorie sind für angemeldete Spieler sichtbar. Deine E-Mail-Adresse wird nicht geteilt.'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </RScreen>
  );
}

function GenderOption({
  label,
  icon,
  active,
  disabled,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled: !!disabled }}
      hitSlop={4}>
      <RCard
        borderColor={active ? RColors.accent : RColors.cardBorder}
        contentStyle={[styles.genderOption, active && { backgroundColor: withAlpha(RColors.accent, 0.16) }]}>
        <MaterialCommunityIcons name={icon} size={RSize.iconLg} color={active ? RColors.accent : RColors.text5} />
        <Text style={[styles.genderLabel, active && { color: RColors.textPrimary }]}>{label}</Text>
      </RCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brand: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 2, color: RColors.accentLink },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 28, color: RColors.textPrimary },
  subtitle: { fontFamily: 'Barlow_400Regular', fontSize: 14, color: RColors.text7, textAlign: 'center', paddingHorizontal: 12 },
  label: { fontFamily: 'Barlow_600SemiBold', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  helperText: { fontFamily: 'Barlow_400Regular', fontSize: 12, color: RColors.text9, marginTop: -2 },
  genderOption: { paddingVertical: 18, alignItems: 'center', gap: RSpacing.sm, minHeight: RSize.minTouch },
  genderLabel: { fontFamily: 'Barlow_600SemiBold', fontSize: 13, color: RColors.text5 },
  demoNote: { fontFamily: 'Barlow_400Regular', fontSize: 11, lineHeight: 15, color: RColors.text9, textAlign: 'center', paddingHorizontal: 8 },
});
