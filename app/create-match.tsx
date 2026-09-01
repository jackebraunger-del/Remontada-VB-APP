import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineCreateMatch } from '@/components/remontada/OnlineCreateMatch';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RChip, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

const CATEGORIES = ['Men', 'Women', 'Mixed', 'Open'];
const SKILLS = ['Beginner', 'Intermediate', 'Advanced'];
const DAYS = ['Today', 'Tomorrow', 'In 2 days', 'In 3 days'];
const TIMES = ['07:00', '08:00', '09:00', '17:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

type MatchType = 'Unranked' | 'Ranked' | 'Club';

const MATCH_TYPES: { key: MatchType; title: string; blurb: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[] = [
  { key: 'Unranked', title: 'Unranked', blurb: 'Just for fun, no rating change.', icon: 'volleyball' },
  { key: 'Ranked', title: 'Ranked', blurb: 'Counts toward your category rank.', icon: 'trophy-outline' },
  { key: 'Club', title: 'Club', blurb: 'Open to everyone — a public club session.', icon: 'account-group-outline' },
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
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={22} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Match</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={{ gap: 10 }}>
          <Text style={styles.label}>Play</Text>
          {MATCH_TYPES.map((mt) => (
            <Pressable key={mt.key} onPress={() => setMatchType(mt.key)}>
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
              <Text style={styles.label}>Location</Text>
              <Pressable onPress={() => router.push({ pathname: '/map', params: { pick: '1' } })}>
                <RCard contentStyle={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color={locationName ? RColors.accent : RColors.text9} />
                  <Text style={[styles.locationText, !locationName && { color: RColors.text9 }]} numberOfLines={1}>
                    {locationName || 'Choose on map'}
                  </Text>
                  <Text style={styles.linkText}>{locationName ? 'Change' : 'Pick'}</Text>
                </RCard>
              </Pressable>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Day</Text>
              <View style={styles.chipWrap}>
                {DAYS.map((d) => (
                  <RChip key={d} label={d} active={day === d} onPress={() => setDay(d)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Time</Text>
              <View style={styles.chipWrap}>
                {TIMES.map((t) => (
                  <RChip key={t} label={t} active={time === t} onPress={() => setTime(t)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.chipWrap}>
                {CATEGORIES.map((c) => (
                  <RChip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
                ))}
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>Skill Level</Text>
              <View style={styles.chipWrap}>
                {SKILLS.map((s) => (
                  <RChip key={s} label={s} active={skill === s} onPress={() => setSkill(s)} />
                ))}
              </View>
            </View>
          </>
        )}

        {matchType === 'Club' && (
          <RCard contentStyle={{ padding: 16, gap: 4 }}>
            <Text style={styles.matchTypeTitle}>Opens the Club Session</Text>
            <Text style={styles.mutedSmall}>A public, organized meetup — who brings a net, who brings a ball, and where to play. Anyone can join, and ranked games can start spontaneously once you&apos;re there.</Text>
          </RCard>
        )}

        <RButton
          label={matchType === 'Club' ? 'Open Club Session' : 'Create Match'}
          onPress={onSubmit}
          disabled={!canSubmit}
          style={{ marginTop: 4 }}
        />
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  matchTypeRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchTypeTitle: { fontSize: 15, fontWeight: '700', color: RColors.text3 },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  locationRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationText: { flex: 1, fontSize: 14, fontWeight: '600', color: RColors.textPrimary },
  linkText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: RColors.accentLink },
  chipWrap: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
});
