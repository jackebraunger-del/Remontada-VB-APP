import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RButton, RButtonOutline, RCard, RErrorBanner, RInput, RScreen } from './primitives';
import { RColors } from '@/constants/remontada-colors';
import { RSpacing } from '@/constants/remontada-tokens';
import { signInWithGoogle as startGoogleSignIn } from '@/lib/google-auth';
import { backendConfigured, errorMessage, requireBackend } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { error: sessionError } = useAuth();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const requestInFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function signInWithGoogle() {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await startGoogleSignIn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      requestInFlight.current = false;
      setBusy(false);
    }
  }

  async function submit(verify: boolean) {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const client = requireBackend();
      const address = (sentTo ?? email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Gib eine gültige E-Mail-Adresse ein.');
      if (verify) {
        const { error } = await client.auth.verifyOtp({ email: address, token: code.trim(), type: 'email' });
        if (error) throw error;
      } else {
        const { error } = await client.auth.signInWithOtp({ email: address, options: { shouldCreateUser: true } });
        if (error) throw error;
        setSentTo(address);
        setCode('');
        setCooldown(60);
      }
    } catch (e) { setError(errorMessage(e)); }
    finally { requestInFlight.current = false; setBusy(false); }
  }

  const shownError = error || sessionError;

  return (
    <RScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: RSpacing.lg }}>
          <Text style={styles.brand}>REMONTADA</Text>
          <Text style={styles.title}>{backendConfigured ? 'Dein nächstes Match wartet.' : 'Einrichtung erforderlich'}</Text>
          {!backendConfigured ? (
            <RCard contentStyle={{ padding: 20, gap: 12 }}>
              <Text style={styles.body}>
                Die Online-App braucht ein Supabase-Projekt. Trage dessen URL und den öffentlichen Publishable Key in
                .env.local ein, führe die Datenbank-Migration aus und starte Expo neu.
              </Text>
              <Text style={styles.body}>Details stehen in docs/SUPABASE_SETUP.md. Verwende niemals einen geheimen Schlüssel oder Service-Role-Key in der App.</Text>
              <Text style={styles.body}>Deine vorhandenen Demo-Daten bleiben unverändert. Um den lokalen Prototyp zu öffnen, setze EXPO_PUBLIC_DEMO_MODE=true.</Text>
            </RCard>
          ) : (
            <>
              {!sentTo && <>
                <Text style={styles.body}>Melde dich mit Google an oder erstelle ein Konto.</Text>
                <RButton label={busy ? 'Einen Moment…' : 'Mit Google fortfahren'} onPress={() => void signInWithGoogle()} disabled={busy} />
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>ODER PER E-MAIL-CODE</Text>
                  <View style={styles.divider} />
                </View>
              </>}
              <Text style={styles.body}>{sentTo ? `Gib den Code ein, der an ${sentTo} gesendet wurde. Schau notfalls auch im Spam-Ordner nach.` : 'Gib deine E-Mail-Adresse ein, um dich alternativ per Code anzumelden.'}</Text>
              <RInput
                accessibilityLabel={sentTo ? 'E-Mail-Code' : 'E-Mail-Adresse'}
                value={sentTo ? code : email}
                onChangeText={sentTo ? (v) => setCode(v.replace(/\D/g, '')) : setEmail}
                placeholder={sentTo ? 'E-Mail-Code' : 'du@beispiel.de'}
                keyboardType={sentTo ? 'number-pad' : 'email-address'}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={sentTo ? 'one-time-code' : 'email'}
                maxLength={sentTo ? 10 : 254}
                editable={!busy}
              />
              {shownError && <RErrorBanner message={shownError} />}
              <RButton
                label={busy ? 'Einen Moment…' : sentTo ? 'Code bestätigen & anmelden' : 'Code per E-Mail senden'}
                onPress={() => void submit(!!sentTo)}
                disabled={busy || (sentTo ? code.length < 6 : !email.trim())}
              />
              {sentTo && <View style={{ gap: RSpacing.md }}>
                <RButtonOutline label={cooldown ? `Erneut senden in ${cooldown}s` : 'Code erneut senden'} disabled={busy || cooldown > 0} onPress={() => void submit(false)} />
                <RButtonOutline label="Andere E-Mail verwenden" disabled={busy} onPress={() => { setSentTo(null); setCode(''); setError(null); }} />
              </View>}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  brand: { color: RColors.accent, fontFamily: 'Rajdhani_700Bold', fontSize: 22, letterSpacing: 3 },
  title: { color: RColors.textPrimary, fontFamily: 'Rajdhani_700Bold', fontSize: 32 },
  body: { color: RColors.text5, fontFamily: 'Barlow_400Regular', fontSize: 15, lineHeight: 22 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: RSpacing.sm },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: RColors.cardBorder },
  dividerText: { color: RColors.text9, fontFamily: 'Barlow_500Medium', fontSize: 11, letterSpacing: 1 },
});
