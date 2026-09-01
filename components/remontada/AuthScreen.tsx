import React, { useEffect, useRef, useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RButton, RButtonOutline, RCard, RScreen } from './primitives';
import { RColors } from '@/constants/remontada-colors';
import { backendConfigured, errorMessage, requireBackend } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

WebBrowser.maybeCompleteAuthSession();

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
      const client = requireBackend();
      const redirectTo = makeRedirectUri({ scheme: 'wolki', path: 'auth/callback' });
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url) throw new Error('Google sign-in could not be started.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') return;

      const { params, errorCode } = QueryParams.getQueryParams(result.url);
      if (errorCode) throw new Error(String(params.error_description ?? errorCode));
      const accessToken = typeof params.access_token === 'string' ? params.access_token : null;
      const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : null;
      if (!accessToken || !refreshToken) throw new Error('Google did not return a valid sign-in session.');

      const { error: sessionError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) throw new Error('Enter a valid email address.');
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

  return (
    <RScreen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 20 }}>
          <Text style={styles.brand}>REMONTADA</Text>
          <Text style={styles.title}>{backendConfigured ? 'Your next match starts here.' : 'Online setup required'}</Text>
          {!backendConfigured ? (
            <RCard contentStyle={{ padding: 20, gap: 12 }}>
              <Text style={styles.body}>The online app needs a Supabase project. Add its URL and public publishable key to .env.local, apply the database migration, then restart Expo.</Text>
              <Text style={styles.body}>See docs/SUPABASE_SETUP.md. Never use a secret or service-role key in the app.</Text>
              <Text style={styles.body}>Your existing demo data is unchanged. To open the local prototype, explicitly set EXPO_PUBLIC_DEMO_MODE=true.</Text>
            </RCard>
          ) : (
            <>
              {!sentTo && <>
                <Text style={styles.body}>Sign in or create an account with Google.</Text>
                <RButton label={busy ? 'Please wait…' : 'Continue with Google'} onPress={() => void signInWithGoogle()} disabled={busy} />
                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR USE AN EMAIL CODE</Text>
                  <View style={styles.divider} />
                </View>
              </>}
              <Text style={styles.body}>{sentTo ? `Enter the code sent to ${sentTo}. Check your spam folder too.` : 'Enter your email address to use the fallback sign-in.'}</Text>
              <TextInput accessibilityLabel={sentTo ? 'Email code' : 'Email address'} style={styles.input}
                value={sentTo ? code : email} onChangeText={sentTo ? (v) => setCode(v.replace(/\D/g, '')) : setEmail}
                placeholder={sentTo ? 'Email code' : 'you@example.com'} placeholderTextColor={RColors.text9}
                keyboardType={sentTo ? 'number-pad' : 'email-address'} autoCapitalize="none" autoCorrect={false}
                autoComplete={sentTo ? 'one-time-code' : 'email'} maxLength={sentTo ? 10 : 254} editable={!busy} />
              {(error || sessionError) && <Text accessibilityRole="alert" style={styles.error}>{error || sessionError}</Text>}
              <RButton label={busy ? 'Please wait…' : sentTo ? 'Verify & sign in' : 'Send email code'} onPress={() => void submit(!!sentTo)} disabled={busy || (sentTo ? code.length < 6 : !email.trim())} />
              {sentTo && <View style={{ gap: 12 }}>
                <RButtonOutline label={cooldown ? `Resend in ${cooldown}s` : 'Resend code'} disabled={busy || cooldown > 0} onPress={() => void submit(false)} />
                <RButtonOutline label="Use another email" disabled={busy} onPress={() => { setSentTo(null); setCode(''); setError(null); }} />
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
  body: { color: RColors.text5, fontSize: 14, lineHeight: 21 },
  input: { backgroundColor: RColors.card, color: RColors.textPrimary, padding: 16, fontSize: 17, borderWidth: 1, borderColor: RColors.cardBorder },
  error: { color: RColors.lossRed, fontSize: 14 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: RColors.cardBorder },
  dividerText: { color: RColors.text9, fontSize: 11, letterSpacing: 1 },
});
