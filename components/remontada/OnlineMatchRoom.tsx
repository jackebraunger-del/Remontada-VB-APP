import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useOnlineData } from '@/lib/online-context';
import { errorMessage } from '@/lib/supabase';
import { RButton, RButtonOutline, RCard, RChip, RErrorBanner, RInput } from './primitives';
import { OnlinePage, onlineStyles as s } from './OnlineScreens';
import { RSpacing } from '@/constants/remontada-tokens';
import { CATEGORY_LABELS, MATCH_STATUS_LABELS, SKILL_LABELS } from '@/constants/remontada-labels';

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
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(success);
      setConfirmCancel(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (!match) {
    return (
      <OnlinePage title="MATCH-RAUM">
        <Text style={s.body}>
          {id ? 'Dieses Match ist nicht in der geladenen Liste. Aktualisiere und versuche es erneut.' : 'Wähle unter „Spielen“ ein Match, um beizutreten oder ein Ergebnis zu melden.'}
        </Text>
        <RButton label="Zu den Matches" onPress={() => router.replace('/play')} />
      </OnlinePage>
    );
  }

  const me = match.match_members.find((p) => p.user_id === online.userId);
  const result = match.match_results;
  const reporter = match.match_members.find((p) => p.user_id === result?.reporter_id);
  const canJoin = !me && match.status === 'open' && new Date(match.starts_at).getTime() > Date.now();
  const canReport = !!me && (match.status === 'open' || result?.status === 'disputed') && match.match_members.length === 4 && new Date(match.starts_at).getTime() <= Date.now();
  const canReview = !!me && !!reporter && me.team !== reporter.team && result?.status === 'pending';

  return (
    <OnlinePage title="MATCH-RAUM">
      <RButtonOutline label="Zurück zu den Matches" onPress={() => router.replace('/play')} />
      <Text style={s.heading}>{match.location}</Text>
      <Text style={s.body}>
        {new Date(match.starts_at).toLocaleString('de-DE')} · {CATEGORY_LABELS[match.category] ?? match.category} · {SKILL_LABELS[match.skill] ?? match.skill}
      </Text>
      <Text style={s.muted}>2 gegen 2 · {MATCH_STATUS_LABELS[match.status] ?? match.status} · Lockeres Match</Text>
      {match.category === 'Mixed' && <Text style={s.muted}>Jedes Team braucht einen männlichen und einen weiblichen Spieler.</Text>}
      {([1, 2] as const).map((team) => (
        <RCard key={team} contentStyle={s.card}>
          <Text style={s.heading}>Team {team === 1 ? 'A' : 'B'}</Text>
          {match.match_members
            .filter((p) => p.team === team)
            .map((p) => (
              <Text key={p.user_id} style={s.body}>
                {p.profiles.display_name}
                {p.user_id === online.userId ? ' (du)' : ''}
                {p.user_id === match.creator_id ? ' · Organisator' : ''}
              </Text>
            ))}
          <Text style={s.muted}>{2 - match.match_members.filter((p) => p.team === team).length} Plätze frei</Text>
          {canJoin && (
            <RButton
              label={`Team ${team === 1 ? 'A' : 'B'} beitreten`}
              disabled={busy || match.match_members.filter((p) => p.team === team).length >= 2}
              onPress={() => void run(() => online.joinMatch(match.id, team), 'Du bist dem Match beigetreten.')}
            />
          )}
        </RCard>
      ))}
      {me &&
        match.status === 'open' &&
        (match.creator_id === online.userId ? (
          <View style={{ gap: RSpacing.sm }}>
            <RButtonOutline
              label={confirmCancel ? 'Absage für alle Spieler bestätigen' : 'Match absagen'}
              disabled={busy}
              onPress={() => (confirmCancel ? void run(() => online.cancelMatch(match.id), 'Match abgesagt.') : setConfirmCancel(true))}
            />
            {confirmCancel && <RButtonOutline label="Match behalten" disabled={busy} onPress={() => setConfirmCancel(false)} />}
          </View>
        ) : (
          <RButtonOutline label="Match verlassen" disabled={busy} onPress={() => void run(() => online.leaveMatch(match.id), 'Du hast das Match verlassen.')} />
        ))}
      {result && (
        <RCard contentStyle={s.card}>
          <Text style={s.heading}>
            {result.status === 'confirmed'
              ? 'Bestätigtes Ergebnis'
              : result.status === 'disputed'
                ? 'Ergebnis angefochten — reiche eine Korrektur ein'
                : 'Wartet auf Bestätigung durch das Gegner-Team'}
          </Text>
          <Text style={s.body}>
            Team {result.winning_team === 1 ? 'A' : 'B'} hat gewonnen · {result.score}
          </Text>
          {canReview && (
            <>
              <Text style={s.muted}>Prüfe das Gewinner-Team und den Spielstand, bevor du bestätigst.</Text>
              <RButton label="Ergebnis bestätigen" disabled={busy} onPress={() => void run(() => online.reviewResult(match.id, true, result.reported_at), 'Ergebnis bestätigt.')} />
              <RButtonOutline
                label="Ergebnis anfechten"
                disabled={busy}
                onPress={() => void run(() => online.reviewResult(match.id, false, result.reported_at), 'Ergebnis angefochten. Ein Teilnehmer kann eine Korrektur einreichen.')}
              />
            </>
          )}
        </RCard>
      )}
      {canReport && (
        <RCard contentStyle={s.card}>
          <Text style={s.heading}>Ergebnis melden</Text>
          <Text style={s.muted}>Wähle das Gewinner-Team. Schreibe die Satzstände in der Reihenfolge Team A–Team B, z.B. 21–18, 21–19. Das Gegner-Team muss bestätigen.</Text>
          <View style={s.wrap}>
            {([1, 2] as const).map((team) => (
              <RChip key={team} label={`Team ${team === 1 ? 'A' : 'B'} hat gewonnen`} active={winner === team} onPress={() => { if (!busy) setWinner(team); }} />
            ))}
          </View>
          <RInput
            label="Satzstände"
            value={score}
            onChangeText={setScore}
            editable={!busy}
            maxLength={100}
            placeholder="21–18, 21–19"
          />
          <RButton
            label={busy ? 'Wird gespeichert…' : 'Zur Bestätigung einreichen'}
            disabled={busy || !score.trim()}
            onPress={() => void run(() => online.reportResult(match.id, winner, score.trim()), 'Ergebnis zur Bestätigung eingereicht.')}
          />
        </RCard>
      )}
      {me && match.status === 'open' && !canReport && (
        <Text style={s.muted}>Ergebnisse können gemeldet werden, sobald alle vier Spieler beigetreten sind und der geplante Startzeitpunkt vorbei ist.</Text>
      )}
      {error && <RErrorBanner message={error} />}
      {notice && <Text accessibilityRole="alert" style={s.body}>{notice}</Text>}
    </OnlinePage>
  );
}
