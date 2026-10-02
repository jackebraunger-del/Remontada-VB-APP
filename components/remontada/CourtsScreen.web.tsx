// Browser alternative: importing react-native-maps here would prevent web builds.
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RButton, RButtonOutline, RCard, REmptyState, RErrorBanner, RInput, RScreen } from '@/components/remontada/primitives';
import { onlineStyles as s } from '@/components/remontada/OnlineScreens';
import { useAppData } from '@/lib/remontada-context';
import { errorMessage } from '@/lib/supabase';

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
    lock.current = true;
    setBusy(true);
    setError(null);
    try {
      const latitude = Number(lat);
      const longitude = Number(lng);
      if (!name.trim() || !lat.trim() || !lng.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        throw new Error('Gib einen Platznamen sowie einen gültigen Breiten- und Längengrad ein.');
      }
      await addCustomCourt(name.trim(), latitude, longitude);
      if (pick === '1') choose({ name: name.trim(), lat: latitude, lng: longitude });
      setName('');
      setLat('');
      setLng('');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: 32, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 560, gap: 18 }}>
          <Text style={s.title}>SPIELFELDER</Text>
          <Text style={s.body}>Die interaktive Karte gibt es in der mobilen App. Hier kannst du gespeicherte Plätze nutzen oder einen per Koordinaten hinzufügen.</Text>
          {pick === '1' && <RButtonOutline label="Zurück zur Match-Erstellung" onPress={() => router.back()} />}
          {customCourts.length === 0 && (
            <REmptyState
              icon="location-outline"
              title="Noch keine gespeicherten Plätze"
              description="Du kannst beim Erstellen eines Matches auch direkt einen Treffpunkt eingeben."
            />
          )}
          {customCourts.map((court) => (
            <RCard key={court.id} contentStyle={s.card}>
              <Text style={s.heading}>{court.name}</Text>
              <Text style={s.muted}>
                {court.lat}, {court.lng}
              </Text>
              {pick === '1' ? (
                <RButton label="Diesen Platz verwenden" onPress={() => choose(court)} />
              ) : (
                <RButtonOutline
                  label="Karte öffnen"
                  onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${court.lat},${court.lng}`).catch((e) => setError(errorMessage(e)))}
                />
              )}
            </RCard>
          ))}
          <View style={{ gap: 12 }}>
            <Text style={s.heading}>Platz hinzufügen</Text>
            <RInput label="Platzname" value={name} onChangeText={setName} editable={!busy} maxLength={120} placeholder="Name des Platzes" />
            <RInput label="Breitengrad" value={lat} onChangeText={setLat} editable={!busy} placeholder="z.B. 28.13" keyboardType="numbers-and-punctuation" />
            <RInput label="Längengrad" value={lng} onChangeText={setLng} editable={!busy} placeholder="z.B. -15.43" keyboardType="numbers-and-punctuation" />
            {error && <RErrorBanner message={error} />}
            <RButton label={busy ? 'Wird gespeichert…' : 'Platz speichern'} disabled={busy} onPress={() => void save()} />
          </View>
        </View>
      </ScrollView>
    </RScreen>
  );
}
