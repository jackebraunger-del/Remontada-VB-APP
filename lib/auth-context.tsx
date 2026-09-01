import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { demoMode, errorMessage, requireBackend, supabase } from './supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase && !demoMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    let active = true;
    let receivedAuthEvent = false;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => {
      receivedAuthEvent = true;
      if (!active) return;
      setSession(next);
      setError(null);
      setLoading(false);
    });
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active || receivedAuthEvent) return;
      if (sessionError) setError(errorMessage(sessionError));
      setSession(data.session);
      setLoading(false);
    }).catch((e) => {
      if (active) { setError(errorMessage(e)); setLoading(false); }
    });
    const refresh = (state: string) => {
      if (state === 'active') client.auth.startAutoRefresh();
      else client.auth.stopAutoRefresh();
    };
    if (Platform.OS !== 'web') refresh(AppState.currentState);
    const listener = Platform.OS !== 'web' ? AppState.addEventListener('change', refresh) : null;
    return () => {
      active = false;
      subscription.unsubscribe();
      listener?.remove();
      if (Platform.OS !== 'web') client.auth.stopAutoRefresh();
    };
  }, []);

  async function signOut() {
    const { error: signOutError } = await requireBackend().auth.signOut({ scope: 'local' });
    if (signOutError) throw signOutError;
    setSession(null);
  }

  return <AuthContext.Provider value={{ session, loading, error, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing.');
  return value;
}
