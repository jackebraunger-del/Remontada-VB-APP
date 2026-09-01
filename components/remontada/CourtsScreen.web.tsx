// Browser alternative: importing react-native-maps here would prevent web builds.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Linking, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RButton, RButtonOutline, RCard, RScreen } from '@/components/remontada/primitives';
import { onlineStyles as s } from '@/components/remontada/OnlineScreens';
import { useAppData } from '@/lib/remontada-context';
import { errorMessage } from '@/lib/supabase';
import { RColors } from '@/constants/remontada-colors';

export default function WebCourtsScreen() {
  const { customCourts, addCustomCourt, setPendingLocationPick } = useAppData();
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const choose = (court: { name: string; lat: number; lng: number }) => {
    setPendingLocationPick(court);
    router.back();
  };
  async function save() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(null);
    try {
      const latitude = Number(lat); const longitude = Number(lng);
      if (!name.trim() || !lat.trim() || !lng.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) throw new Error('Enter a court name and valid latitude / longitude.');
      await addCustomCourt(name.trim(), latitude, longitude);
      if (pick === '1') choose({ name: name.trim(), lat: latitude, lng: longitude });
      setName(''); setLat(''); setLng('');
    } catch (e) { setError(errorMessage(e)); }
    finally { lock.current = false; setBusy(false); }
  }
  return <RScreen><ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, gap: 18 }}>
    <Text style={s.title}>COURTS</Text>
    <Text style={s.body}>The interactive map is available in the mobile app. Here you can use saved courts or add one by coordinates.</Text>
    {pick === '1' && <RButtonOutline label="Back to match creation" onPress={() => router.back()} />}
    {customCourts.length === 0 && <Text style={s.muted}>No saved courts yet. You can also enter a meeting point directly when creating a match.</Text>}
    {customCourts.map((court) => <RCard key={court.id} contentStyle={s.card}>
      <Text style={s.heading}>{court.name}</Text>
      <Text style={s.muted}>{court.lat}, {court.lng}</Text>
      {pick === '1' ? <RButton label="Use this court" onPress={() => choose(court)} /> : <RButtonOutline label="Open map" onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${court.lat},${court.lng}`).catch((e) => setError(errorMessage(e)))} />}
    </RCard>)}
    <View style={{ gap: 12 }}>
      <Text style={s.heading}>Add a court</Text>
      <TextInput accessibilityLabel="Court name" value={name} onChangeText={setName} editable={!busy} maxLength={120} placeholder="Court name" placeholderTextColor={RColors.text9} style={s.input} />
      <TextInput accessibilityLabel="Latitude" value={lat} onChangeText={setLat} editable={!busy} placeholder="Latitude, e.g. 28.13" placeholderTextColor={RColors.text9} style={s.input} />
      <TextInput accessibilityLabel="Longitude" value={lng} onChangeText={setLng} editable={!busy} placeholder="Longitude, e.g. -15.43" placeholderTextColor={RColors.text9} style={s.input} />
      {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <RButton label={busy ? 'Saving…' : 'Save court'} disabled={busy} onPress={() => void save()} />
    </View>
  </ScrollView></RScreen>;
}
