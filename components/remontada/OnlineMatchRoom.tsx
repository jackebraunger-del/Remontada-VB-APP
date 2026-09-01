import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useOnlineData } from '@/lib/online-context';
import { errorMessage } from '@/lib/supabase';
import { RButton, RButtonOutline, RCard, RChip } from './primitives';
import { OnlinePage, onlineStyles as s } from './OnlineScreens';
import { RColors } from '@/constants/remontada-colors';

export function OnlineMatchRoom() {
  const online = useOnlineData()!;
  const { id } = useLocalSearchParams<{ id?: string }>();
  const match = online.matches.find((m) => m.id === id);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [winner, setWinner] = useState<1 | 2>(1);
  const [score, setScore] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function run(action: () => Promise<void>, success: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(null); setNotice(null);
    try { await action(); setNotice(success); setConfirmCancel(false); }
    catch (e) { setError(errorMessage(e)); }
    finally { lock.current = false; setBusy(false); }
  }

  if (!match) return <OnlinePage title="MATCH ROOM">
    <Text style={s.body}>{id ? 'This match is not in the loaded list. Refresh to try again.' : 'Choose a match from Play to join or report a result.'}</Text>
    <RButton label="Go to matches" onPress={() => router.replace('/play')} />
  </OnlinePage>;

  const me = match.match_members.find((p) => p.user_id === online.userId);
  const result = match.match_results;
  const reporter = match.match_members.find((p) => p.user_id === result?.reporter_id);
  const canJoin = !me && match.status === 'open' && new Date(match.starts_at).getTime() > Date.now();
  const canReport = !!me && (match.status === 'open' || result?.status === 'disputed') && match.match_members.length === 4 && new Date(match.starts_at).getTime() <= Date.now();
  const canReview = !!me && !!reporter && me.team !== reporter.team && result?.status === 'pending';

  return <OnlinePage title="MATCH ROOM">
    <RButtonOutline label="Back to matches" onPress={() => router.replace('/play')} />
    <Text style={s.heading}>{match.location}</Text>
    <Text style={s.body}>{new Date(match.starts_at).toLocaleString()} · {match.category} · {match.skill}</Text>
    <Text style={s.muted}>2v2 · {match.status.replaceAll('_', ' ')} · Casual match</Text>
    {match.category === 'Mixed' && <Text style={s.muted}>Each team needs one male and one female player.</Text>}
    {([1, 2] as const).map((team) => <RCard key={team} contentStyle={s.card}>
      <Text style={s.heading}>Team {team === 1 ? 'A' : 'B'}</Text>
      {match.match_members.filter((p) => p.team === team).map((p) => <Text key={p.user_id} style={s.body}>
        {p.profiles.display_name}{p.user_id === online.userId ? ' (you)' : ''}{p.user_id === match.creator_id ? ' · organizer' : ''}
      </Text>)}
      <Text style={s.muted}>{2 - match.match_members.filter((p) => p.team === team).length} places available</Text>
      {canJoin && <RButton label={`Join team ${team === 1 ? 'A' : 'B'}`} disabled={busy || match.match_members.filter((p) => p.team === team).length >= 2}
        onPress={() => void run(() => online.joinMatch(match.id, team), 'You joined this match.')} />}
    </RCard>)}
    {me && match.status === 'open' && (match.creator_id === online.userId ? <View style={{ gap: 10 }}>
      <RButtonOutline label={confirmCancel ? 'Confirm cancellation for all players' : 'Cancel this match'} disabled={busy}
        onPress={() => confirmCancel ? void run(() => online.cancelMatch(match.id), 'Match cancelled.') : setConfirmCancel(true)} />
      {confirmCancel && <RButtonOutline label="Keep match" disabled={busy} onPress={() => setConfirmCancel(false)} />}
    </View> : <RButtonOutline label="Leave match" disabled={busy} onPress={() => void run(() => online.leaveMatch(match.id), 'You left this match.')} />)}
    {result && <RCard contentStyle={s.card}>
      <Text style={s.heading}>{result.status === 'confirmed' ? 'Confirmed result' : result.status === 'disputed' ? 'Result disputed — submit a correction' : 'Waiting for the opposing team'}</Text>
      <Text style={s.body}>Team {result.winning_team === 1 ? 'A' : 'B'} won · {result.score}</Text>
      {canReview && <>
        <Text style={s.muted}>Check the winning team and score before confirming.</Text>
        <RButton label="Confirm this result" disabled={busy} onPress={() => void run(() => online.reviewResult(match.id, true, result.reported_at), 'Result confirmed.')} />
        <RButtonOutline label="Dispute this result" disabled={busy} onPress={() => void run(() => online.reviewResult(match.id, false, result.reported_at), 'Result disputed. A participant can submit a correction.')} />
      </>}
    </RCard>}
    {canReport && <RCard contentStyle={s.card}>
      <Text style={s.heading}>Report result</Text>
      <Text style={s.muted}>Select the winning team. Write set scores in team A–team B order, e.g. 21–18, 21–19. The opposing team must confirm.</Text>
      <View style={s.wrap}>{([1, 2] as const).map((team) => <RChip key={team} label={`Team ${team === 1 ? 'A' : 'B'} won`} active={winner === team} onPress={() => { if (!busy) setWinner(team); }} />)}</View>
      <TextInput accessibilityLabel="Set scores" value={score} onChangeText={setScore} editable={!busy} maxLength={100} placeholder="21–18, 21–19" placeholderTextColor={RColors.text9} style={s.input} />
      <RButton label={busy ? 'Saving…' : 'Submit for confirmation'} disabled={busy || !score.trim()} onPress={() => void run(() => online.reportResult(match.id, winner, score.trim()), 'Result submitted for confirmation.')} />
    </RCard>}
    {me && match.status === 'open' && !canReport && <Text style={s.muted}>Results can be reported once all four players have joined and the scheduled start time has passed.</Text>}
    {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    {notice && <Text accessibilityRole="alert" style={s.body}>{notice}</Text>}
  </OnlinePage>;
}
