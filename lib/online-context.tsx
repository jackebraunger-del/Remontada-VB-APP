import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import { useAuth } from './auth-context';
import { AppDataContext, type AppDataApi } from './remontada-context';
import type { CustomCourt, Gender } from './remontada-types';
import type { CreateOnlineMatch, OnlineMatch, OnlineProfile } from './online-types';
import { errorMessage, requireBackend } from './supabase';
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
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const client = requireBackend();
        const [own, games, locations] = await Promise.all([
          client.from('profiles').select('id,display_name,gender,preferred_side').eq('id', userId).abortSignal(controller.signal).maybeSingle(),
          client.from('matches').select('*,match_members(user_id,team,profiles(display_name)),match_results(*)')
            .order('starts_at', { ascending: false }).order('id').limit(200).abortSignal(controller.signal),
          client.from('courts').select('id,name,lat,lng').order('created_at', { ascending: false }).limit(500).abortSignal(controller.signal),
        ]);
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
        clearTimeout(timeout);
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
    const { data, error } = await requireBackend().rpc(name, args);
    if (error) throw error;
    await afterWrite();
    return data;
  }
  async function saveProfile(name: string, gender: Gender) {
    const input = { id: userId, display_name: name.trim(), gender };
    const client = requireBackend();
    const { error } = profile
      ? await client.from('profiles').update({ display_name: input.display_name, gender }).eq('id', userId)
      : await client.from('profiles').insert(input);
    if (error) throw error;
    if (mounted.current) setProfile({ ...input, preferred_side: profile?.preferred_side ?? null });
    await afterWrite();
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
      const { error } = await requireBackend().from('courts').insert({ created_by: userId, name: name.trim(), lat, lng });
      if (error) throw error;
      await afterWrite();
    },
    pendingLocationPick, setPendingLocationPick,
    profileVerified: false, preferredSide: profile?.preferred_side ?? null,
    categoryRatings: [], leaderboard: [], setPreferredSide: unavailable, recordMatchResult: unavailable,
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
