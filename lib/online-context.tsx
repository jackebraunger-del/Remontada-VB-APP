import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import { AppState, Text, View } from 'react-native';
import { useAuth } from './auth-context';
import { AppDataContext, type AppDataApi } from './remontada-context';
import type { CustomCourt, Gender, PreferredSide } from './remontada-types';
import type { CreateOnlineMatch, OnlineMatch, OnlineProfile, UpdateOnlineProfile } from './online-types';
import { errorMessage, requireBackend, withRequestTimeout } from './supabase';
import { RButton } from '@/components/remontada/primitives';
import { RColors } from '@/constants/remontada-colors';

interface OnlineData {
  userId: string;
  profile: OnlineProfile | null;
  matches: OnlineMatch[];
  refreshing: boolean;
  syncError: string | null;
  lastSynced: Date | null;
  refresh: () => Promise<void>;
  createMatch: (input: CreateOnlineMatch) => Promise<string>;
  joinMatch: (id: string, team: 1 | 2) => Promise<void>;
  leaveMatch: (id: string) => Promise<void>;
  cancelMatch: (id: string) => Promise<void>;
  reportResult: (id: string, winningTeam: 1 | 2, score: string) => Promise<void>;
  reviewResult: (id: string, confirm: boolean, reportedAt: string) => Promise<void>;
  updateProfile: (input: UpdateOnlineProfile) => Promise<void>;
  deleteAccount: () => Promise<void>;
}
const OnlineContext = createContext<OnlineData | null>(null);
export const useOnlineData = () => useContext(OnlineContext);
function unavailable(): never { throw new Error('This feature is not available in the online beta yet.'); }

export function OnlineDataProvider({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useAuth();
  const userId = session!.user.id;
  const [profile, setProfile] = useState<OnlineProfile | null>(null);
  const [matches, setMatches] = useState<OnlineMatch[]>([]);
  const [courts, setCourts] = useState<CustomCourt[]>([]);
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [pendingLocationPick, setPendingLocationPick] = useState<AppDataApi['pendingLocationPick']>(null);
  const mounted = useRef(true);
  const revision = useRef(0);
  const inFlight = useRef<Promise<void> | null>(null);
  const inFlightRevision = useRef(0);
  const courtRequest = useRef<{ key: string; id: string } | null>(null);

  const refresh = useCallback((): Promise<void> => {
    if (inFlight.current) {
      // A prior request may belong to a Strict Mode effect or precede a write.
      if (inFlightRevision.current !== revision.current) return inFlight.current.then(() => { if (mounted.current) return refresh(); });
      return inFlight.current;
    }
    const requestedRevision = revision.current;
    inFlightRevision.current = requestedRevision;
    setRefreshing(true);
    const request = (async () => {
      try {
        const client = requireBackend();
        const [own, games, locations] = await withRequestTimeout((signal) => Promise.all([
          client.from('profiles').select('id,display_name,gender,preferred_side').eq('id', userId).abortSignal(signal).maybeSingle(),
          client.from('matches').select('*,match_members(user_id,team,profiles(display_name)),match_results(*)')
            .order('starts_at', { ascending: false }).order('id').limit(200).abortSignal(signal),
          client.from('courts').select('id,name,lat,lng').order('created_at', { ascending: false }).limit(500).abortSignal(signal),
        ]));
        for (const result of [own, games, locations]) if (result.error) throw result.error;
        if (!mounted.current || requestedRevision !== revision.current) return;
        setProfile(own.data as OnlineProfile | null);
        setMatches((games.data ?? []) as unknown as OnlineMatch[]);
        setCourts((locations.data ?? []) as CustomCourt[]);
        setReady(true);
        setLastSynced(new Date());
        setSyncError(null);
      } catch (e) {
        if (mounted.current && requestedRevision === revision.current) setSyncError(errorMessage(e));
      } finally {
        if (mounted.current) setRefreshing(false);
      }
    })();
    inFlight.current = request.finally(() => { inFlight.current = null; });
    return inFlight.current;
  }, [userId]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = setInterval(() => { if (AppState.currentState === 'active') void refresh(); }, 15000);
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    return () => { mounted.current = false; revision.current += 1; clearInterval(timer); listener.remove(); };
  }, [refresh]);

  async function afterWrite() {
    if (!mounted.current) return;
    revision.current += 1;
    if (inFlight.current) await inFlight.current;
    if (!mounted.current) return;
    await refresh();
    // A successful write stays successful even if the subsequent read loses connectivity.
    // syncError explicitly tells the user that the displayed snapshot may be stale.
  }
  async function rpc(name: string, args: Record<string, unknown>) {
    const { data, error } = await withRequestTimeout((signal) => requireBackend().rpc(name, args).abortSignal(signal));
    if (error) throw error;
    await afterWrite();
    return data;
  }
  async function saveProfile(name: string, gender: Gender, preferredSide: PreferredSide | null = profile?.preferred_side ?? null) {
    const displayName = name.trim();
    if (displayName.length < 1 || displayName.length > 60) throw new Error('Der Anzeigename muss zwischen 1 und 60 Zeichen lang sein.');
    if (gender !== 'Male' && gender !== 'Female') throw new Error('Wähle ein gültiges Geschlecht.');
    if (preferredSide !== null && preferredSide !== 'Left' && preferredSide !== 'Right') throw new Error('Wähle eine gültige Spielfeldseite.');
    const input = { id: userId, display_name: displayName, gender, preferred_side: preferredSide };
    const client = requireBackend();
    const { error } = await withRequestTimeout((signal) => profile
      ? client.from('profiles').update({ display_name: displayName, gender, preferred_side: preferredSide }).eq('id', userId).abortSignal(signal)
      : client.from('profiles').insert({ id: userId, display_name: displayName, gender }).abortSignal(signal));
    if (error) throw error;
    if (mounted.current) setProfile(input);
    await afterWrite();
  }
  async function deleteAccount() {
    const { error } = await withRequestTimeout((signal) => requireBackend().rpc('delete_my_account', { p_confirmation: 'DELETE' }).abortSignal(signal));
    if (error) throw error;
    await signOut();
  }
  const value: OnlineData = {
    userId, profile, matches, refreshing, syncError, lastSynced, refresh,
    createMatch: async (input) => rpc('create_match', {
      p_location: input.location, p_starts_at: input.startsAt, p_category: input.category,
      p_skill: input.skill, p_request_id: input.requestId,
    }) as Promise<string>,
    joinMatch: async (id, team) => { await rpc('join_match', { p_match_id: id, p_team: team }); },
    leaveMatch: async (id) => { await rpc('leave_match', { p_match_id: id }); },
    cancelMatch: async (id) => { await rpc('cancel_match', { p_match_id: id }); },
    reportResult: async (id, team, score) => { await rpc('report_result', { p_match_id: id, p_winning_team: team, p_score: score }); },
    reviewResult: async (id, confirm, reportedAt) => { await rpc('review_result', { p_match_id: id, p_confirm: confirm, p_reported_at: reportedAt }); },
    updateProfile: async ({ displayName, gender, preferredSide }) => { await saveProfile(displayName, gender, preferredSide); },
    deleteAccount,
  };
  const adapter: AppDataApi = {
    // No prototype rewards, ratings or demo identities leak into authenticated accounts.
    coins: 0, dailyRewardClaimedToday: false, lastRewardOutcome: null, lastRewardCoins: 0, skins: [],
    claimDailyReward: unavailable, equipSkin: unavailable, buySkin: unavailable,
    hasActiveSession: false, bringingNet: false, bringingBall: false, joinRequest: null,
    sessionGoing: [], sessionCantMakeIt: [], toggleBringingNet: unavailable,
    toggleBringingBall: unavailable, castVote: unavailable, scheduleSession: unavailable,
    matches: matches.filter((m) => m.status === 'open').map((m) => ({
      id: m.id, location: m.location, timeLabel: new Date(m.starts_at).toLocaleString(),
      tags: ['2v2', m.category, m.skill], ranked: false,
      playersJoined: m.match_members.length, playersNeeded: 4 - m.match_members.length,
    })),
    recentResult: null, addMatch: unavailable,
    customCourts: courts,
    addCustomCourt: async (name, lat, lng) => {
      const cleanName = name.trim();
      if (cleanName.length < 1 || cleanName.length > 120) throw new Error('Der Platzname muss zwischen 1 und 120 Zeichen lang sein.');
      if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
        throw new Error('Die Koordinaten des Platzes sind ungültig.');
      }
      const key = `${cleanName}\u0000${lat}\u0000${lng}`;
      if (!courtRequest.current || courtRequest.current.key !== key) courtRequest.current = { key, id: randomUUID() };
      await rpc('create_court', { p_name: cleanName, p_lat: lat, p_lng: lng, p_request_id: courtRequest.current.id });
      courtRequest.current = null;
    },
    pendingLocationPick, setPendingLocationPick,
    profileVerified: false, preferredSide: profile?.preferred_side ?? null,
    categoryRatings: [], leaderboard: [],
    setPreferredSide: async (side) => {
      if (!profile) throw new Error('Complete your profile first.');
      await saveProfile(profile.display_name, profile.gender, side);
    },
    recordMatchResult: unavailable,
    onboardingComplete: !!profile, playerName: profile?.display_name ?? '', gender: profile?.gender ?? null,
    completeOnboarding: saveProfile, resetDemoData: unavailable,
  };

  if (!ready) return (
    <View style={{ flex: 1, backgroundColor: RColors.bgApp, justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text style={{ color: RColors.textPrimary }}>{syncError ?? 'Loading your account…'}</Text>
      {syncError && <>
        <RButton label={refreshing ? 'Loading…' : 'Try again'} disabled={refreshing} onPress={() => void refresh()} />
        <RButton label="Sign out" onPress={() => void signOut().catch((e) => setSyncError(errorMessage(e)))} />
      </>}
    </View>
  );
  return <OnlineContext.Provider value={value}><AppDataContext.Provider value={adapter}>{children}</AppDataContext.Provider></OnlineContext.Provider>;
}
