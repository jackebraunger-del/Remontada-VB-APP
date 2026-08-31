import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { LatLng, LongPressEvent, Marker, Region } from 'react-native-maps';

import { RButton, RButtonOutline, RCard, RScreen, RSheet, RTag } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

interface CourtLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  openMatches: number;
  checkedIn: number;
  intermediate: number;
  advanced: number;
  hasSession?: boolean;
  custom?: boolean;
}

// Echte Koordinaten auf Gran Canaria (ungefähr die Strand-Mitte).
const LOCATIONS: CourtLocation[] = [
  { id: 'las-canteras', name: 'Las Canteras', lat: 28.1465, lng: -15.4363, openMatches: 3, checkedIn: 14, intermediate: 6, advanced: 3, hasSession: true },
  { id: 'agaete', name: 'Agaete', lat: 28.1004, lng: -15.7003, openMatches: 0, checkedIn: 2, intermediate: 1, advanced: 0 },
  { id: 'puerto-rico', name: 'Puerto Rico', lat: 27.7969, lng: -15.7228, openMatches: 1, checkedIn: 5, intermediate: 3, advanced: 1 },
  { id: 'maspalomas', name: 'Maspalomas', lat: 27.7606, lng: -15.586, openMatches: 2, checkedIn: 9, intermediate: 4, advanced: 2 },
  { id: 'playa-del-ingles', name: 'Playa del Inglés', lat: 27.7597, lng: -15.5719, openMatches: 1, checkedIn: 4, intermediate: 2, advanced: 1 },
];

const GRAN_CANARIA_REGION: Region = {
  latitude: 27.96,
  longitude: -15.585,
  latitudeDelta: 0.85,
  longitudeDelta: 0.85,
};

function directionsUrl(loc: { lat: number; lng: number }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
}

function viewUrl(loc: { lat: number; lng: number }) {
  return `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
}

function CourtPin({ checkedIn, custom }: { checkedIn: number; custom?: boolean }) {
  return (
    <View style={styles.pinOuter}>
      <View style={[styles.pinDot, custom && { backgroundColor: RColors.diamondBlue }]} />
      {checkedIn > 0 && (
        <View style={styles.pinBadge}>
          <Text style={styles.pinBadgeText}>{checkedIn}</Text>
        </View>
      )}
    </View>
  );
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { customCourts, addCustomCourt, hasActiveSession, setPendingLocationPick } = useAppData();
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const pickMode = pick === '1';
  const [selected, setSelected] = useState<CourtLocation | null>(null);
  const [pendingPin, setPendingPin] = useState<LatLng | null>(null);
  const [newCourtName, setNewCourtName] = useState('');

  const allLocations: CourtLocation[] = [
    ...LOCATIONS,
    ...customCourts.map((c) => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      openMatches: 0,
      checkedIn: 0,
      intermediate: 0,
      advanced: 0,
      custom: true,
    })),
  ];

  function onMarkerPress(loc: CourtLocation) {
    if (pickMode) {
      setPendingLocationPick({ name: loc.name, lat: loc.lat, lng: loc.lng });
      router.back();
      return;
    }
    setSelected(loc);
  }

  function onLongPress(e: LongPressEvent) {
    setPendingPin(e.nativeEvent.coordinate);
    setNewCourtName('');
  }

  function confirmNewCourt() {
    if (!pendingPin || !newCourtName.trim()) return;
    const name = newCourtName.trim();
    addCustomCourt(name, pendingPin.latitude, pendingPin.longitude);
    if (pickMode) {
      setPendingLocationPick({ name, lat: pendingPin.latitude, lng: pendingPin.longitude });
      setPendingPin(null);
      setNewCourtName('');
      router.back();
      return;
    }
    setPendingPin(null);
    setNewCourtName('');
  }

  return (
    <RScreen>
      <MapView
        style={{ flex: 1 }}
        initialRegion={GRAN_CANARIA_REGION}
        onLongPress={onLongPress}
        onPress={() => setSelected(null)}>
        {allLocations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.lat, longitude: loc.lng }}
            onPress={() => onMarkerPress(loc)}
            tracksViewChanges={false}>
            <CourtPin checkedIn={loc.checkedIn} custom={loc.custom} />
          </Marker>
        ))}
      </MapView>

      {pickMode ? (
        <View style={[styles.pickBar, { top: insets.top + 12 }]}>
          <Pressable hitSlop={10} onPress={() => router.back()} style={styles.pickBackBtn}>
            <Ionicons name="chevron-back" size={18} color={RColors.text2} />
          </Pressable>
          <Text style={styles.searchText}>Tap a court to pick it · long-press to mark a new one</Text>
        </View>
      ) : (
        <View style={[styles.searchBar, { top: insets.top + 12 }]} pointerEvents="none">
          <Ionicons name="search" size={17} color={RColors.text7} />
          <Text style={styles.searchText}>Tap a pin · long-press to mark your own court</Text>
        </View>
      )}

      {selected && (
        <RSheet contentStyle={{ padding: 20, paddingTop: 22, gap: 14 }}>
          <View style={styles.grabber} />

          <View style={styles.rowBetween}>
            <Text style={styles.sheetTitle}>{selected.name}</Text>
            <Pressable hitSlop={10} onPress={() => setSelected(null)}>
              <Ionicons name="close" size={18} color={RColors.text7} />
            </Pressable>
          </View>

          {!selected.custom && (
            <>
              <View style={styles.rowBetween}>
                <RTag
                  label={`${selected.openMatches} Open Match${selected.openMatches === 1 ? '' : 'es'}`}
                  color={RColors.rareOrange}
                  bg={withAlpha(RColors.accent, 0.3)}
                />
              </View>
              <RCard contentStyle={styles.statsRow}>
                <Stat value={String(selected.checkedIn)} label="Checked In" color={RColors.win} />
                <Stat value={String(selected.intermediate)} label="Intermediate" />
                <Stat value={String(selected.advanced)} label="Advanced" />
              </RCard>
            </>
          )}
          {selected.custom && <Text style={styles.mutedSmall}>Community-marked spot.</Text>}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <RButton label="Get Directions" style={{ flex: 1 }} onPress={() => Linking.openURL(directionsUrl(selected))} />
            <RButtonOutline label="Open in Maps" style={{ flex: 1 }} onPress={() => Linking.openURL(viewUrl(selected))} />
          </View>

          {selected.hasSession && hasActiveSession && (
            <Pressable onPress={() => router.push('/session')}>
              <RCard borderColor={withAlpha(RColors.rareOrange, 0.4)} contentStyle={styles.sessionRow}>
                <Ionicons name="calendar-outline" size={18} color={RColors.rareOrange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTitle}>Club Session</Text>
                  <Text style={styles.mutedSmall}>{selected.name} Community</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={RColors.text9} />
              </RCard>
            </Pressable>
          )}
        </RSheet>
      )}

      <Modal visible={pendingPin !== null} transparent animationType="fade" onRequestClose={() => setPendingPin(null)}>
        <View style={styles.modalBackdrop}>
          <RCard style={{ width: '100%' }} contentStyle={{ padding: 20, gap: 14 }}>
            <Text style={styles.modalTitle}>Name this court</Text>
            <TextInput
              value={newCourtName}
              onChangeText={setNewCourtName}
              placeholder="e.g. Playa de Amadores"
              placeholderTextColor={RColors.text9}
              style={styles.modalInput}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <RButtonOutline label="Cancel" style={{ flex: 1 }} onPress={() => setPendingPin(null)} />
              <RButton label={pickMode ? 'Add & Pick' : 'Add'} style={{ flex: 1 }} onPress={confirmNewCourt} disabled={!newCourtName.trim()} />
            </View>
          </RCard>
        </View>
      </Modal>
    </RScreen>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: withAlpha(RColors.card, 0.92),
    borderWidth: 1,
    borderColor: RColors.divider,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchText: { fontSize: 12, color: RColors.text7, flex: 1 },
  pickBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: withAlpha(RColors.card, 0.95),
    borderWidth: 1,
    borderColor: RColors.accent,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pickBackBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  pinOuter: { alignItems: 'center', justifyContent: 'center' },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: RColors.accent,
    borderWidth: 2,
    borderColor: RColors.white,
  },
  pinBadge: {
    position: 'absolute',
    top: -8,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    backgroundColor: RColors.win,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RColors.bgApp,
  },
  pinBadgeText: { fontSize: 10, fontWeight: '700', color: RColors.bgApp },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: RColors.outline, alignSelf: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: RColors.textPrimary },
  statsRow: { padding: 14, flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: RColors.textPrimary },
  statLabel: { fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text7 },
  sessionRow: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sessionTitle: { fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  modalBackdrop: { flex: 1, backgroundColor: withAlpha(RColors.bgApp, 0.75), alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 17, color: RColors.textPrimary },
  modalInput: { backgroundColor: RColors.chip2, color: RColors.textPrimary, paddingVertical: 12, paddingHorizontal: 12, fontSize: 14 },
});
