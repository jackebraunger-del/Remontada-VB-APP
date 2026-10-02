import { makeRedirectUri } from 'expo-auth-session';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { requireBackend } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type GoogleSignInResult = 'signed-in' | 'cancelled';

export class GoogleSignInError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleSignInError';
  }
}

function callbackParameter(callbackUrl: string, name: string): string | null {
  const url = new URL(callbackUrl);
  const queryValue = url.searchParams.get(name);
  if (queryValue) return queryValue;

  // OAuth errors can also be returned in a URL fragment. PKCE success uses
  // the query string, but reading both forms keeps error handling reliable.
  const fragment = url.hash.startsWith('#') ? url.hash.slice(1) : url.hash;
  return new URLSearchParams(fragment).get(name);
}

function googleError(error: unknown): GoogleSignInError {
  const detail = error instanceof Error ? error.message : String(error ?? '');
  const normalized = detail.toLowerCase();

  if (normalized.includes('provider is not enabled')) {
    return new GoogleSignInError('Google ist in Supabase noch nicht aktiviert. Prüfe Authentication → Sign In / Providers → Google.');
  }
  if (normalized.includes('oauth configuration is incomplete') || normalized.includes('branding')) {
    return new GoogleSignInError('Die Google-OAuth-Einrichtung ist noch unvollständig. Ergänze in Google Cloud die Branding-Pflichtfelder.');
  }
  if (normalized.includes('redirect') || normalized.includes('localhost')) {
    return new GoogleSignInError('Die Rücksprungadresse ist noch nicht freigegeben. Prüfe die Redirect URLs in Supabase und die Callback URL in Google Cloud.');
  }
  if (
    normalized.includes('network') ||
    normalized.includes('fetch') ||
    normalized.includes('connection') ||
    normalized.includes('timeout')
  ) {
    return new GoogleSignInError('Supabase oder Google ist gerade nicht erreichbar. Prüfe die Verbindung und versuche es erneut.');
  }
  if (normalized.includes('code verifier') || normalized.includes('pkce')) {
    return new GoogleSignInError('Die sichere Anmeldung ist abgelaufen. Schließe das Browserfenster und starte die Google-Anmeldung erneut.');
  }

  return new GoogleSignInError('Die Google-Anmeldung ist fehlgeschlagen. Bitte versuche es erneut.');
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (Platform.OS !== 'web' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new GoogleSignInError(
      'Google-Anmeldung funktioniert mit Expo SDK 54 nicht in Expo Go. Teste sie am PC im Browser oder installiere einen Development Build auf dem Handy.',
    );
  }

  const client = requireBackend();
  const redirectTo = makeRedirectUri({ scheme: 'wolki', path: 'auth/callback' });

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: 'select_account' },
    },
  });

  if (error) throw googleError(error);
  if (!data.url) throw new GoogleSignInError('Die Google-Anmeldung konnte nicht gestartet werden.');

  const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') return 'cancelled';
  if (browserResult.type !== 'success') throw new GoogleSignInError('Die Google-Anmeldung wurde nicht abgeschlossen.');

  try {
    const callbackError = callbackParameter(browserResult.url, 'error_description')
      ?? callbackParameter(browserResult.url, 'error');
    if (callbackError) throw googleError(callbackError);

    const code = callbackParameter(browserResult.url, 'code');
    if (!code) throw new GoogleSignInError('Google hat keinen gültigen Anmeldecode zurückgegeben.');

    // signInWithOAuth returns the PKCE flow ID. Passing it back guarantees
    // that the one-time code is paired with the verifier from this request.
    const { error: exchangeError } = await client.auth.exchangeCodeForSession(
      code,
      data.flowId ? { flowId: data.flowId } : undefined,
    );
    if (exchangeError) throw googleError(exchangeError);
    return 'signed-in';
  } catch (error) {
    if (error instanceof GoogleSignInError) throw error;
    throw googleError(error);
  }
}
