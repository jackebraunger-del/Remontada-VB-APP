import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth-context';
import { useOnlineData } from '@/lib/online-context';
import { errorMessage } from '@/lib/supabase';
import { RButton, RButtonOutline, RCard, RChip, REmptyState, RErrorBanner, RInput, RScreen } from './primitives';
import { RColors } from '@/constants/remontada-colors';
import { CATEGORY_LABELS, GENDER_LABELS, MATCH_STATUS_LABELS, RESULT_STATUS_LABELS, SKILL_LABELS } from '@/constants/remontada-labels';
import type { Gender, PreferredSide } from '@/lib/remontada-types';

export { CATEGORY_LABELS, MATCH_STATUS_LABELS, RESULT_STATUS_LABELS, SKILL_LABELS };

function statusLabel(map: Record<string, string>, value: string): string {
  return map[value] ?? value.replaceAll('_', ' ');
}

export function OnlinePage({ title, children }: { title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const online = useOnlineData()!;
  return (
    <RScreen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={online.refreshing} onRefresh={() => void online.refresh()} tintColor={RColors.accent} />}
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, gap: 18 }}>
        <Text style={onlineStyles.title}>{title}</Text>
        <View style={{ gap: 6 }}>
          <Text style={onlineStyles.muted}>ONLINE-BETA · Aktualisiert alle 15 Sekunden</Text>
          {online.syncError ? (
            <RErrorBanner
              message={`Aktualisierung fehlgeschlagen: ${online.syncError}${online.lastSynced ? ' Die zuvor geladenen Daten werden weiter angezeigt.' : ''}`}
              onRetry={() => void online.refresh()}
            />
          ) : (
            <Text style={onlineStyles.muted}>
              {online.lastSynced ? `Zuletzt aktualisiert: ${online.lastSynced.toLocaleTimeString()}` : 'Wird geladen…'}
            </Text>
          )}
        </View>
        {children}
      </ScrollView>
    </RScreen>
  );
}

export function OnlineMatchesScreen({ home = false }: { home?: boolean }) {
  const online = useOnlineData()!;
  const [filter, setFilter] = useState('Offene Matches');
  const [category, setCategory] = useState('All');
  const now = Date.now();
  const visible = online.matches
    .filter((m) => {
      if (category !== 'All' && m.category !== category) return false;
      if (filter === 'Meine Matches') return m.match_members.some((p) => p.user_id === online.userId);
      if (filter === 'Ergebnisse') return m.status === 'completed';
      return m.status === 'open' && new Date(m.starts_at).getTime() > now;
    })
    .sort((a, b) => (filter === 'Offene Matches' ? a.starts_at.localeCompare(b.starts_at) : b.starts_at.localeCompare(a.starts_at)));

  return (
    <OnlinePage title={home ? `Hallo, ${online.profile?.display_name ?? 'Spieler'}!` : 'SPIELEN'}>
      <Text style={onlineStyles.body}>
        {home
          ? 'Findet vier Spieler, trefft euch auf dem Platz und bestätigt das Ergebnis gemeinsam.'
          : 'Wähle ein Match, um Teams zu sehen und beizutreten.'}
      </Text>
      <RButton label="+ Match erstellen" onPress={() => router.push('/create-match')} />
      <View style={onlineStyles.wrap} accessibilityRole="tablist">
        {['Offene Matches', 'Meine Matches', 'Ergebnisse'].map((f) => (
          <RChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      <View style={onlineStyles.wrap} accessibilityRole="tablist">
        {['All', 'Men', 'Women', 'Mixed', 'Open'].map((c) => (
          <RChip key={c} label={CATEGORY_LABELS[c]} accessibilityLabel={`Kategorie ${CATEGORY_LABELS[c]}`} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      {visible.length === 0 && (
        <REmptyState
          icon="tennisball-outline"
          title="Keine Matches in dieser Ansicht"
          description="Ändere die Filter oder erstelle ein neues Match."
        />
      )}
      {visible.map((m) => (
        <RCard key={m.id} contentStyle={onlineStyles.card}>
          <Text style={onlineStyles.heading}>{m.location}</Text>
          <Text style={onlineStyles.body}>{new Date(m.starts_at).toLocaleString('de-DE')}</Text>
          <Text style={onlineStyles.muted}>
            2 gegen 2 · {CATEGORY_LABELS[m.category] ?? m.category} · {SKILL_LABELS[m.skill] ?? m.skill} · {m.match_members.length}/4 Spieler
          </Text>
          <Text style={onlineStyles.body}>
            {statusLabel(MATCH_STATUS_LABELS, m.status)}
            {m.match_results ? ` · ${statusLabel(RESULT_STATUS_LABELS, m.match_results.status)}` : ''}
          </Text>
          <RButtonOutline label="Match ansehen" onPress={() => router.push({ pathname: '/match-room', params: { id: m.id } })} />
        </RCard>
      ))}
      <Text style={onlineStyles.muted}>Zeigt die letzten 200 angesetzten Matches. Alle Zeiten in deiner Zeitzone.</Text>
    </OnlinePage>
  );
}

export function OnlineProfileScreen({ settings = false }: { settings?: boolean }) {
  const online = useOnlineData()!;
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(online.profile?.display_name ?? '');
  const [gender, setGender] = useState<Gender>(online.profile?.gender ?? 'Male');
  const [preferredSide, setPreferredSide] = useState<PreferredSide | null>(online.profile?.preferred_side ?? null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const results = online.matches.filter((m) => m.match_results?.status === 'confirmed' && m.match_members.some((p) => p.user_id === online.userId));
  const wins = results.filter((m) => m.match_members.find((p) => p.user_id === online.userId)?.team === m.match_results?.winning_team).length;

  async function leave() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signOut();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function saveProfile() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await online.updateProfile({ displayName, gender, preferredSide });
      setNotice('Deine Profiländerungen wurden gespeichert.');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function deleteAccount() {
    if (lock.current || deleteConfirmation !== 'LÖSCHEN') return;
    lock.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await online.deleteAccount();
    } catch (e) {
      setError(errorMessage(e));
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <OnlinePage title={settings ? 'KONTO-EINSTELLUNGEN' : 'DEIN PROFIL'}>
      <RCard contentStyle={onlineStyles.card}>
        <Text style={onlineStyles.heading}>{online.profile?.display_name}</Text>
        <Text style={onlineStyles.body}>{session?.user.email}</Text>
        <Text style={onlineStyles.muted}>
          Deine E-Mail-Adresse ist nur für dich sichtbar. Dein Profil und deine Teilnahme an Matches sind für angemeldete Spieler sichtbar.
        </Text>
      </RCard>
      {settings && (
        <RCard contentStyle={onlineStyles.card}>
          <Text style={onlineStyles.heading}>Profil bearbeiten</Text>
          <RInput
            label="Anzeigename"
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={60}
            editable={!busy}
            autoCapitalize="words"
          />
          <Text style={onlineStyles.body}>Geschlecht</Text>
          <View style={onlineStyles.wrap}>
            {(['Male', 'Female'] as Gender[]).map((value) => (
              <RChip key={value} label={GENDER_LABELS[value]} active={gender === value} onPress={() => { if (!busy) setGender(value); }} />
            ))}
          </View>
          <Text style={onlineStyles.body}>Bevorzugte Spielfeldseite</Text>
          <View style={onlineStyles.wrap}>
            {(['Left', 'Right'] as PreferredSide[]).map((value) => (
              <RChip key={value} label={value === 'Left' ? 'Links' : 'Rechts'} active={preferredSide === value} onPress={() => { if (!busy) setPreferredSide(value); }} />
            ))}
          </View>
          <RButton label={busy ? 'Wird gespeichert…' : 'Profil speichern'} disabled={busy || !displayName.trim()} onPress={() => void saveProfile()} />
        </RCard>
      )}
      <RCard contentStyle={onlineStyles.card}>
        <Text style={onlineStyles.heading}>Bestätigte Ergebnisse</Text>
        <Text style={onlineStyles.body}>
          {results.length} Matches · {wins} Siege · {results.length - wins} Niederlagen
        </Text>
        <Text style={onlineStyles.muted}>Aus den geladenen Matches. Nur vom Gegner-Team bestätigte Ergebnisse zählen hier.</Text>
      </RCard>
      {results.map((m) => (
        <RCard key={m.id} contentStyle={onlineStyles.card}>
          <Text style={onlineStyles.body}>
            {m.location} · {m.match_results?.score}
          </Text>
          <RButtonOutline label="Ergebnis ansehen" onPress={() => router.push({ pathname: '/match-room', params: { id: m.id } })} />
        </RCard>
      ))}
      <Text style={onlineStyles.muted}>
        Wertungen, Trainings-Sessions, Coins und Skins sind in dieser Online-Beta noch nicht aktiv. Deine lokale Demo bleibt davon unabhängig.
      </Text>
      {error && <RErrorBanner message={error} />}
      {notice && <Text accessibilityRole="alert" style={onlineStyles.body}>{notice}</Text>}
      <RButtonOutline label={busy ? 'Wird abgemeldet…' : 'Auf diesem Gerät abmelden'} disabled={busy} onPress={() => void leave()} />
      {settings && (
        <RCard borderColor={RColors.lossRed} contentStyle={onlineStyles.card}>
          <Text style={onlineStyles.heading}>Konto dauerhaft löschen</Text>
          <Text style={onlineStyles.muted}>
            Dein Konto, dein Profil, deine Plätze und alle Matches, an denen du teilgenommen hast, werden endgültig entfernt. Diese Aktion lässt sich nicht rückgängig machen.
          </Text>
          <RInput
            label="Zur Bestätigung LÖSCHEN eingeben"
            value={deleteConfirmation}
            onChangeText={setDeleteConfirmation}
            editable={!busy}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <RButtonOutline
            label={busy ? 'Bitte warten…' : 'Konto endgültig löschen'}
            disabled={busy || deleteConfirmation !== 'LÖSCHEN'}
            onPress={() => void deleteAccount()}
          />
        </RCard>
      )}
    </OnlinePage>
  );
}

export function OnlineRankingScreen() {
  return (
    <OnlinePage title="RANGLISTE">
      <RCard contentStyle={onlineStyles.card}>
        <Text style={onlineStyles.heading}>Spielt zunächst Matches und lasst die Ergebnisse bestätigen.</Text>
        <Text style={onlineStyles.body}>
          Online-Wertungen sind noch nicht aktiv. Deine bestätigten Siege und Niederlagen findest du in deinem Profil. Demo-Ränge werden hier nicht verwendet.
        </Text>
        <RButton label="Match finden" onPress={() => router.push('/play')} />
      </RCard>
    </OnlinePage>
  );
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
