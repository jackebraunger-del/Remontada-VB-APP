import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineCreateMatch } from '@/components/remontada/OnlineCreateMatch';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RChip, RHeader, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { CATEGORY_LABELS, SKILL_LABELS } from '@/constants/remontada-labels';
import { useAppData } from '@/lib/remontada-context';

const CATEGORIES = ['Men', 'Women', 'Mixed', 'Open'];
const SKILLS = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS = ['Heute', 'Morgen', 'In 2 Tagen', 'In 3 Tagen'];
const TIMES = ['07:00', '08:00', '09:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

type MatchType = 'Unranked' | 'Ranked' | 'Club';

const MATCH_TYPES: { key: MatchType; title: string; blurb: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { key: 'Unranked', title: 'Ohne Wertung', blurb: 'Nur zum Spaß, keine Auswirkung auf deine Wertung.', icon: 'volleyball' },
  { key: 'Ranked', title: 'Gewertet', blurb: 'Zählt für deinen Kategorie-Rang.', icon: 'trophy-outline' },
  { key: 'Club', title: 'Vereinstreffen', blurb: 'Offen für alle — ein öffentliches Vereinstreffen.', icon: 'account-group-outline' },
];

export default function CreateMatchScreen() {
  const online = useOnlineData();
  return online ? <OnlineCreateMatch /> : <DemoCreateMatchScreen />;
}

function DemoCreateMatchScreen() {
  const insets = useSafeAreaInsets();
  const { addMatch, scheduleSession, pendingLocationPick, setPendingLocationPick } = useAppData();

  const [matchType, setMatchType] = useState<MatchType>('Unranked');
  const [locationName, setLocationName] = useState('');
  const [day, setDay] = useState(DAYS[0]);
  const [time, setTime] = useState(TIMES[3]);
  const [category, setCategory] = useState('Mixed');
  const [skill, setSkill] = useState('Intermediate');

  // Wenn man von der Karte zurückkommt, steht der gewählte Ort hier bereit.
  useEffect(() => {
    if (pendingLocationPick) {
      setLocationName(pendingLocationPick.name);
      setPendingLocationPick(null);
    }
  }, [pendingLocationPick, setPendingLocationPick]);

  const canSubmit = matchType === 'Club' || locationName.trim().length > 0;

  function onSubmit() {
    if (!canSubmit) return;
    if (matchType === 'Club') {
      scheduleSession();
      router.replace('/session');
      return;
    }
    addMatch({
      location: locationName.trim(),
      timeLabel: `${day} ${time}`,
      category,
      skill,
      ranked: matchType === 'Ranked',
    });
    router.back();
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32, gap: 20 }}>
        <RHeader title="Match erstellen" />

        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Spielart</Text>
          {MATCH_TYPES.map((mt) => (
            <Pressable
              key={mt.key}
              onPress={() => setMatchType(mt.key)}
              accessibilityRole="radio"
              accessibilityLabel={mt.title}
              accessibilityState={{ selected: matchType === mt.key }}>
              <RCard
                borderColor={matchType === mt.key ? RColors.accent : RColors.cardBorder}
                contentStyle={[styles.matchTypeRow, matchType === mt.key && { backgroundColor: withAlpha(RColors.accent, 0.12) }]}>
                <MaterialCommunityIcons name={mt.icon} size={24} color={matchType === mt.key ? RColors.accent : RColors.text6} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.matchTypeTitle, matchType === mt.key && { color: RColors.textPrimary }]}>{mt.title}</Text>
                  <Text style={styles.mutedSmall}>{mt.blurb}</Text>
                </View>
                <Ionicons
                  name={matchType === mt.key ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={matchType === mt.key ? RColors.accent : RColors.text9}
                />
              </RCard>
            </Pressable>
          ))}
        </View>

        {matchType !== 'Club' && (
          <>
            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Ort</Text>
              <Pressable
                onPress={() => router.push({ pathname: '/map', params: { pick: '1' } })}
                accessibilityRole="button"
                accessibilityLabel={locationName ? `Ort ändern, aktuell ${locationName}` : 'Ort auf der Karte wählen'}>
                <RCard contentStyle={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color={locationName ? RColors.accent : RColors.text9} />
                  <Text style={[styles.locationText, !locationName && { color: RColors.text9 }]} numberOfLines={1}>
                    {locationName || 'Auf der Karte wählen'}
                  </Text>
                  <Text style={styles.linkText}>{locationName ? 'Ändern' : 'Wählen'}</Text>
                </RCard>
              </Pressable>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Tag</Text>
              <View style={styles.chipWrap}>
                {DAYS.map((d) => (
                  <RChip key={d} label={d} active={day === d} onPress={() => setDay(d)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Uhrzeit</Text>
              <View style={styles.chipWrap}>
                {TIMES.map((t) => (
                  <RChip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Kategorie</Text>
              <View style={styles.chipWrap}>
                {CATEGORIES.map((c) => (
                  <RChip key={c} label={CATEGORY_LABELS[c]} active={category === c} onPress={() => setCategory(c)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Spielstärke</Text>
              <View style={styles.chipWrap}>
                {SKILLS.map((sk) => (
                  <RChip key={sk} label={SKILL_LABELS[sk]} active={skill === sk} onPress={() => setSkill(sk)} />
                ))}
              </View>
            </View>
          </>
        )}

        {matchType === 'Club' && (
          <RCard contentStyle={{ padding: 16, gap: 4 }}>
            <Text style={styles.matchTypeTitle}>Öffnet das Vereinstreffen</Text>
            <Text style={styles.mutedSmall}>Ein öffentliches, organisiertes Treffen — wer bringt ein Netz, wer bringt einen Ball, und wo wird gespielt. Jeder kann beitreten, und gewertete Matches können spontan starten, sobald ihr vor Ort seid.</Text>
          </RCard>
        )}

        <RButton
          label={matchType === 'Club' ? 'Vereinstreffen öffnen' : 'Match erstellen'}
          onPress={onSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  matchTypeRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchTypeTitle: { fontSize: 15, fontWeight: '700', color: RColors.text3 },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  locationRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationText: { flex: 1, fontSize: 14, fontWeight: '600', color: RColors.textPrimary },
  linkText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: RColors.accentLink },
  chipWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
