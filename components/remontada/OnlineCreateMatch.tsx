import { randomUUID } from 'expo-crypto';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useOnlineData } from '@/lib/online-context';
import { useAppData } from '@/lib/remontada-context';
import { errorMessage } from '@/lib/supabase';
import { RButton, RButtonOutline, RChip } from './primitives';
import { OnlinePage, onlineStyles as s } from './OnlineScreens';
import { RColors } from '@/constants/remontada-colors';

function tomorrowDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function OnlineCreateMatch() {
  const online = useOnlineData()!;
  const { pendingLocationPick, setPendingLocationPick } = useAppData();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(tomorrowDate);
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

  async function create() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true); setError(null);
    try {
      if (!location.trim()) throw new Error('Choose a court or enter a location.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error('Use YYYY-MM-DD and HH:MM.');
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const start = new Date(year, month - 1, day, hour, minute);
      if (start.getFullYear() !== year || start.getMonth() !== month - 1 || start.getDate() !== day || start.getHours() !== hour || start.getMinutes() !== minute) throw new Error('Choose a valid local date and time.');
      if (start.getTime() <= Date.now()) throw new Error('Choose a time in the future.');
      requestId.current ??= randomUUID();
      const id = await online.createMatch({ location: location.trim(), startsAt: start.toISOString(), category, skill, requestId: requestId.current });
      router.replace({ pathname: '/match-room', params: { id } });
    } catch (e) { setError(errorMessage(e)); }
    finally { lock.current = false; setBusy(false); }
  }

  return <OnlinePage title="CREATE MATCH">
    <Text style={s.body}>Create a casual 2v2 match. You join team A as the organizer.</Text>
    <Text style={s.muted}>Ranked matches and club sessions are not active in the online beta yet.</Text>
    <Text style={s.heading}>Location</Text>
    <TextInput accessibilityLabel="Match location" value={location} onChangeText={setLocation} maxLength={120} editable={!busy} placeholder="Court name and meeting point" placeholderTextColor={RColors.text9} style={s.input} />
    <RButtonOutline label="Choose on map" disabled={busy} onPress={() => router.push({ pathname: '/map', params: { pick: '1' } })} />
    <Text style={s.heading}>Date and time</Text>
    <TextInput accessibilityLabel="Date YYYY-MM-DD" value={date} onChangeText={setDate} maxLength={10} editable={!busy} placeholder="YYYY-MM-DD" placeholderTextColor={RColors.text9} style={s.input} />
    <TextInput accessibilityLabel="Time HH:MM" value={time} onChangeText={setTime} maxLength={5} editable={!busy} placeholder="HH:MM" placeholderTextColor={RColors.text9} style={s.input} />
    <Text style={s.muted}>Your device&apos;s local time. Other players see the same moment in their own time zone.</Text>
    <Text style={s.heading}>Category</Text>
    <View style={s.wrap}>{['Open', 'Mixed', online.profile?.gender === 'Male' ? 'Men' : 'Women'].map((c) => <RChip key={c} label={c} active={category === c} onPress={() => { if (!busy) setCategory(c); }} />)}</View>
    <Text style={s.heading}>Level</Text>
    <View style={s.wrap}>{['Beginner', 'Intermediate', 'Advanced'].map((level) => <RChip key={level} label={level} active={skill === level} onPress={() => { if (!busy) setSkill(level); }} />)}</View>
    {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <RButton label={busy ? 'Creating…' : 'Create match'} disabled={busy || !location.trim()} onPress={() => void create()} />
    <RButtonOutline label="Cancel" disabled={busy} onPress={() => router.back()} />
  </OnlinePage>;
}
