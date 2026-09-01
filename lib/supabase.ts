import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
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
        lock: processLock,
      },
    })
  : null;

export function requireBackend() {
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.');
  return supabase;
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'The request failed. Please check your connection and try again.';
}
