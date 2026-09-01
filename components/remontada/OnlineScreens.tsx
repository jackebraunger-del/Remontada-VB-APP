import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { useOnlineData } from '@/lib/online-context';
import { errorMessage } from '@/lib/supabase';
import { RButton, RButtonOutline, RCard, RChip, RScreen } from './primitives';
import { RColors } from '@/constants/remontada-colors';

export function OnlinePage({ title, children }: { title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const online = useOnlineData()!;
  return <RScreen><ScrollView
    refreshControl={<RefreshControl refreshing={online.refreshing} onRefresh={() => void online.refresh()} tintColor={RColors.accent} />}
    contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, gap: 18 }}>
    <Text style={onlineStyles.title}>{title}</Text>
    <View style={{ gap: 6 }}>
      <Text style={onlineStyles.muted}>ONLINE BETA · Refreshes every 15 seconds</Text>
      {online.syncError ? <Text accessibilityRole="alert" style={onlineStyles.error}>Could not refresh: {online.syncError}{online.lastSynced ? ' Previously loaded data is still shown.' : ''}</Text>
        : <Text style={onlineStyles.muted}>Last updated: {online.lastSynced?.toLocaleTimeString() ?? 'Loading…'}</Text>}
    </View>
    {children}
  </ScrollView></RScreen>;
}

export function OnlineMatchesScreen({ home = false }: { home?: boolean }) {
  const online = useOnlineData()!;
  const [filter, setFilter] = useState('Open matches');
  const [category, setCategory] = useState('All');
  const now = Date.now();
  const visible = online.matches.filter((m) => {
    if (category !== 'All' && m.category !== category) return false;
    if (filter === 'My matches') return m.match_members.some((p) => p.user_id === online.userId);
    if (filter === 'Results') return m.status === 'completed';
    return m.status === 'open' && new Date(m.starts_at).getTime() > now;
  }).sort((a, b) => filter === 'Open matches'
    ? a.starts_at.localeCompare(b.starts_at) : b.starts_at.localeCompare(a.starts_at));

  return <OnlinePage title={home ? `Hi, ${online.profile?.display_name ?? 'player'}!` : 'PLAY'}>
    <Text style={onlineStyles.body}>{home ? 'Find four players, meet on court, and confirm the result together.' : 'Choose a match to view teams and join.'}</Text>
    <RButton label="+ Create match" onPress={() => router.push('/create-match')} />
    <View style={onlineStyles.wrap}>{['Open matches', 'My matches', 'Results'].map((f) => <RChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}</View>
    <View style={onlineStyles.wrap}>{['All', 'Men', 'Women', 'Mixed', 'Open'].map((c) => <RChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />)}</View>
    {visible.length === 0 && <RCard contentStyle={onlineStyles.card}><Text style={onlineStyles.body}>No matches in this view yet.</Text></RCard>}
    {visible.map((m) => <RCard key={m.id} contentStyle={onlineStyles.card}>
      <Text style={onlineStyles.heading}>{m.location}</Text>
      <Text style={onlineStyles.body}>{new Date(m.starts_at).toLocaleString()}</Text>
      <Text style={onlineStyles.muted}>2v2 · {m.category} · {m.skill} · {m.match_members.length}/4 players</Text>
      <Text style={onlineStyles.body}>{m.status.replaceAll('_', ' ')}{m.match_results ? ` · ${m.match_results.status}` : ''}</Text>
      <RButtonOutline label="View match" onPress={() => router.push({ pathname: '/match-room', params: { id: m.id } })} />
    </RCard>)}
    <Text style={onlineStyles.muted}>Showing matches from the latest 200 scheduled games. All times use your device&apos;s time zone.</Text>
  </OnlinePage>;
}

export function OnlineProfileScreen({ settings = false }: { settings?: boolean }) {
  const online = useOnlineData()!;
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const results = online.matches.filter((m) => m.match_results?.status === 'confirmed' && m.match_members.some((p) => p.user_id === online.userId));
  const wins = results.filter((m) => m.match_members.find((p) => p.user_id === online.userId)?.team === m.match_results?.winning_team).length;

  async function leave() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try { await signOut(); }
    catch (e) { setError(errorMessage(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <OnlinePage title={settings ? 'ACCOUNT SETTINGS' : 'YOUR PROFILE'}>
    <RCard contentStyle={onlineStyles.card}>
      <Text style={onlineStyles.heading}>{online.profile?.display_name}</Text>
      <Text style={onlineStyles.body}>{session?.user.email}</Text>
      <Text style={onlineStyles.muted}>Your email is visible only to you. Your profile and match participation are visible to signed-in players.</Text>
    </RCard>
    <RCard contentStyle={onlineStyles.card}>
      <Text style={onlineStyles.heading}>Confirmed results</Text>
      <Text style={onlineStyles.body}>{results.length} matches · {wins} wins · {results.length - wins} losses</Text>
      <Text style={onlineStyles.muted}>From the loaded games. Only results confirmed by the opposing team count here.</Text>
    </RCard>
    {results.map((m) => <RCard key={m.id} contentStyle={onlineStyles.card}>
      <Text style={onlineStyles.body}>{m.location} · {m.match_results?.score}</Text>
      <RButtonOutline label="View result" onPress={() => router.push({ pathname: '/match-room', params: { id: m.id } })} />
    </RCard>)}
    <Text style={onlineStyles.muted}>Ranked ratings, club sessions, coins and skins are not active in this online beta. Your local demo is kept separate.</Text>
    {error && <Text accessibilityRole="alert" style={onlineStyles.error}>{error}</Text>}
    <RButton label={busy ? 'Signing out…' : 'Sign out on this device'} disabled={busy} onPress={() => void leave()} />
  </OnlinePage>;
}

export function OnlineRankingScreen() {
  return <OnlinePage title="RANKING">
    <RCard contentStyle={onlineStyles.card}>
      <Text style={onlineStyles.heading}>First, play and confirm your matches.</Text>
      <Text style={onlineStyles.body}>Online ranked ratings are not active yet. Your confirmed wins and losses are available in your profile. Demo ranks are never used here.</Text>
      <RButton label="Find a match" onPress={() => router.push('/play')} />
    </RCard>
  </OnlinePage>;
}

export const onlineStyles = StyleSheet.create({
  title: { color: RColors.textPrimary, fontFamily: 'Rajdhani_700Bold', fontSize: 28 },
  heading: { color: RColors.textPrimary, fontFamily: 'Rajdhani_600SemiBold', fontSize: 20 },
  body: { color: RColors.text3, fontSize: 14, lineHeight: 21 },
  muted: { color: RColors.text7, fontSize: 12, lineHeight: 18 },
  error: { color: RColors.lossRed, fontSize: 14, lineHeight: 21 },
  card: { padding: 18, gap: 12 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  input: { backgroundColor: RColors.card, color: RColors.textPrimary, borderColor: RColors.cardBorder, borderWidth: 1, padding: 14, fontSize: 16 },
});
