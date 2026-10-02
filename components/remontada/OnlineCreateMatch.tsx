import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useOnlineData } from '@/lib/online-context';
import { useAppData } from '@/lib/remontada-context';
import { errorMessage } from '@/lib/supabase';
import { RButton, RButtonOutline, RChip, RErrorBanner, RInput } from './primitives';
import { OnlinePage, onlineStyles as s } from './OnlineScreens';
import { RSpacing } from '@/constants/remontada-tokens';
import { CATEGORY_LABELS, SKILL_LABELS } from '@/constants/remontada-labels';

// Tage als Versatz in Kalendertagen ab heute – vermeidet Zeitzonen-Fallstricke
// beim Rechtschreiben eines Datums von Hand (siehe Chip-Auswahl unten).
const DAY_OPTIONS = [
  { label: 'Heute', offset: 0 },
  { label: 'Morgen', offset: 1 },
  { label: 'In 2 Tagen', offset: 2 },
  { label: 'In 3 Tagen', offset: 3 },
];
const TIME_OPTIONS = ['07:00', '08:00', '09:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];
const SKILL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

export function OnlineCreateMatch() {
  const online = useOnlineData()!;
  const { pendingLocationPick, setPendingLocationPick } = useAppData();
  const [location, setLocation] = useState('');
  const [dayOffset, setDayOffset] = useState(1);
  const [time, setTime] = useState('18:00');
  const [category, setCategory] = useState('Open');
  const [skill, setSkill] = useState('Intermediate');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef<string | null>(null);
  const lock = useRef(false);

  useEffect(() => {
    if (!pendingLocationPick) return;
    setLocation(pendingLocationPick.name);
    setPendingLocationPick(null);
  }, [pendingLocationPick, setPendingLocationPick]);

  const categoryOptions = ['Open', 'Mixed', online.profile?.gender === 'Male' ? 'Men' : 'Women'];

  async function create() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      if (!location.trim()) throw new Error('Wähle einen Platz oder gib einen Ort ein.');
      const [hour, minute] = time.split(':').map(Number);
      const start = new Date();
      start.setDate(start.getDate() + dayOffset);
      start.setHours(hour, minute, 0, 0);
      if (start.getTime() <= Date.now()) throw new Error('Wähle einen Zeitpunkt in der Zukunft.');
      requestId.current ??= randomUUID();
      const id = await online.createMatch({ location: location.trim(), startsAt: start.toISOString(), category, skill, requestId: requestId.current });
      router.replace({ pathname: '/match-room', params: { id } });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <OnlinePage title="MATCH ERSTELLEN">
      <Text style={s.body}>Erstelle ein lockeres 2-gegen-2-Match. Du trittst als Organisator Team A bei.</Text>
      <Text style={s.muted}>Gewertete Matches und Trainings-Sessions sind in der Online-Beta noch nicht aktiv.</Text>

      <RInput
        label="Ort"
        value={location}
        onChangeText={setLocation}
        maxLength={120}
        editable={!busy}
        placeholder="Platzname und Treffpunkt"
      />
      <RButtonOutline label="Auf der Karte wählen" disabled={busy} onPress={() => router.push({ pathname: '/map', params: { pick: '1' } })} />

      <Text style={s.heading}>Tag</Text>
      <View style={s.wrap}>
        {DAY_OPTIONS.map((d) => (
          <RChip key={d.label} label={d.label} active={dayOffset === d.offset} onPress={() => !busy && setDayOffset(d.offset)} />
        ))}
      </View>

      <Text style={s.heading}>Uhrzeit</Text>
      <View style={s.wrap}>
        {TIME_OPTIONS.map((t) => (
          <RChip key={t} label={t} active={time === t} onPress={() => !busy && setTime(t)} />
        ))}
      </View>
      <Text style={s.muted}>Uhrzeit in deiner Zeitzone. Andere Spieler sehen denselben Zeitpunkt in ihrer eigenen Zeitzone.</Text>

      <Text style={s.heading}>Kategorie</Text>
      <View style={s.wrap}>
        {categoryOptions.map((c) => (
          <RChip key={c} label={CATEGORY_LABELS[c] ?? c} active={category === c} onPress={() => !busy && setCategory(c)} />
        ))}
      </View>

      <Text style={s.heading}>Spielstärke</Text>
      <View style={s.wrap}>
        {SKILL_OPTIONS.map((level) => (
          <RChip key={level} label={SKILL_LABELS[level] ?? level} active={skill === level} onPress={() => !busy && setSkill(level)} />
        ))}
      </View>

      {error && <RErrorBanner message={error} />}
      <RButton label={busy ? 'Wird erstellt…' : 'Match erstellen'} disabled={busy || !location.trim()} onPress={() => void create()} style={{ marginTop: RSpacing.xs }} />
      <RButtonOutline label="Abbrechen" disabled={busy} onPress={() => router.back()} />
    </OnlinePage>
  );
}
