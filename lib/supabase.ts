import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
export const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';
// Accept only the public publishable key. A service-role key must never enter an app bundle.
export const backendConfigured = !!url && /^https:\/\/[^/]+\/?$/.test(url) && !!key?.startsWith('sb_publishable_');
export const supabase = backendConfigured && !demoMode
  ? createClient(url!, key!, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
        storageKey: 'remontada:auth:v1',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    })
  : null;

export function requireBackend() {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.');
  return supabase;
}

export const NETWORK_TIMEOUT_MS = 15000;

/** Abort the underlying Supabase request so a screen cannot stay busy forever. */
export async function withRequestTimeout<T>(
  operation: (signal: AbortSignal) => PromiseLike<T>,
  timeoutMs = NETWORK_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await operation(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('Die Anfrage hat zu lange gedauert. Prüfe deine Verbindung und versuche es erneut.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The request failed. Please check your connection and try again.';
}
