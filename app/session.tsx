import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RHeader, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { SKILL_LABELS } from '@/constants/remontada-labels';
import { useAppData } from '@/lib/remontada-context';
import { SESSION_NETS } from '@/lib/remontada-mock-data';

const SKILL_COLOR: Record<string, string> = {
  Beginner: RColors.win,
  Intermediate: RColors.gold,
  Advanced: RColors.legendaryRed,
};

export default function SessionScreen() {
  const insets = useSafeAreaInsets();
  const {
    hasActiveSession,
    scheduleSession,
    bringingNet,
    bringingBall,
    toggleBringingNet,
    toggleBringingBall,
    joinRequest,
    castVote,
    sessionGoing,
    sessionCantMakeIt,
  } = useAppData();
  const votePct = joinRequest ? Math.min(100, (joinRequest.votesYes / joinRequest.votesTotal) * 100) : 0;

  if (!hasActiveSession) {
    return (
      <RScreen>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16, flexGrow: 1 }}>
          <RHeader title="Vereinstreffen" />

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={RColors.text9} />
            <Text style={styles.eventTitle}>Noch kein Vereinstreffen</Text>
            <Text style={[styles.mutedSmall, { textAlign: 'center' }]}>
              Noch niemand hat ein Vereinstreffen angelegt. Richte eines ein — andere können zusagen, über
              Beitrittsanfragen abstimmen und sehen, wer Netz oder Ball mitbringt.
            </Text>
            <RButton label="Treffen planen" onPress={scheduleSession} style={{ marginTop: 8 }} />
          </View>
        </ScrollView>
      </RScreen>
    );
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <RHeader title="Vereinstreffen" right={<Ionicons name="heart-outline" size={18} color={RColors.text5} />} />

        <View style={{ gap: 2 }}>
          <Text style={styles.eventTitle}>Las Canteras · Community</Text>
          <Text style={styles.eventSubtitle}>Samstag · Ball ab 18:00</Text>
        </View>

        <RCard contentStyle={{ padding: 16, gap: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Netze · 4 bestätigt</Text>
            <View style={styles.ballChip}>
              <MaterialCommunityIcons name="volleyball" size={15} color={RColors.text5} />
              <Text style={styles.ballChipText}>
                <Text style={{ fontWeight: '700', color: RColors.textPrimary }}>4</Text> Bälle
              </Text>
            </View>
          </View>

          {SESSION_NETS.map((net) => (
            <View key={net.id} style={styles.netRow}>
              <View style={styles.netTopRow}>
                <Text style={styles.netLabel}>Netz {net.id}</Text>
                <Text style={[styles.netSkill, { color: SKILL_COLOR[net.skill] }]}>{SKILL_LABELS[net.skill] ?? net.skill}</Text>
                <Text style={styles.netCapacity}>
                  {net.min}–{net.max} Spieler
                </Text>
              </View>
              <Text style={styles.netNote}>{net.note}</Text>
            </View>
          ))}

          <Text style={styles.generalNote}>
            Auf ein niedrigeres Netz zu wechseln geht immer ohne Anfrage. Auf ein höheres Netz zu wechseln braucht eine
            Anfrage — die Spieler dieses Netzes stimmen darüber ab, ob du aufgenommen wirst. Einmal aufgenommen, bleibst
            du für die ganze Session dabei.
          </Text>
        </RCard>

        {joinRequest && (
          <RCard borderColor={withAlpha(RColors.amber, 0.5)} contentStyle={{ padding: 16, gap: 10 }}>
            <View style={styles.rowStart}>
              <Ionicons name="heart-outline" size={16} color={RColors.amber} />
              <Text style={styles.requestTitle}>Beitrittsanfrage · Netz {joinRequest.targetNet}</Text>
            </View>
            <Text style={styles.requestBody}>
              <Text style={{ fontWeight: '700' }}>{joinRequest.playerName}</Text>{' '}
              <Text style={{ color: RColors.win }}>({SKILL_LABELS[joinRequest.playerSkill] ?? joinRequest.playerSkill})</Text> möchte in
              dein Fortgeschrittenen-Netz aufsteigen.
            </Text>
            <View style={{ gap: 5 }}>
              <View style={styles.voteTrack}>
                <View style={[styles.voteFill, { width: `${votePct}%` }]} />
              </View>
              <Text style={styles.mutedSmall}>
                {joinRequest.votesYes} von {joinRequest.votesTotal} haben zugestimmt · braucht die Hälfte von Netz{' '}
                {joinRequest.targetNet}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={[styles.voteBtn, joinRequest.myVote === 'yes' ? styles.voteBtnOn : styles.voteBtnOff]}
                onPress={() => castVote('yes')}
                accessibilityRole="button"
                accessibilityLabel="Zustimmen"
                accessibilityState={{ selected: joinRequest.myVote === 'yes' }}>
                <Text style={[styles.voteBtnText, joinRequest.myVote === 'yes' && { color: RColors.white }]}>Ja</Text>
              </Pressable>
              <Pressable
                style={[styles.voteBtn, joinRequest.myVote === 'no' ? styles.voteBtnOnMuted : styles.voteBtnOff]}
                onPress={() => castVote('no')}
                accessibilityRole="button"
                accessibilityLabel="Ablehnen"
                accessibilityState={{ selected: joinRequest.myVote === 'no' }}>
                <Text style={styles.voteBtnText}>Nein</Text>
              </Pressable>
            </View>
          </RCard>
        )}

        <RCard contentStyle={{ padding: 16, gap: 12 }}>
          <View style={styles.rowStart}>
            <Ionicons name="checkmark-circle" size={18} color={RColors.win} />
            <Text style={[styles.requestTitle, { color: RColors.win }]}>Du bist dabei</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={[styles.toggleChip, bringingNet ? styles.voteBtnOn : styles.voteBtnOff]}
              onPress={toggleBringingNet}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: bringingNet }}
              accessibilityLabel="Netz mitbringen">
              <MaterialCommunityIcons name="grid" size={14} color={bringingNet ? RColors.white : RColors.text7} />
              <Text style={[styles.toggleText, bringingNet && { color: RColors.white }]}>Netz mitbringen</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleChip, bringingBall ? styles.voteBtnOn : styles.voteBtnOff]}
              onPress={toggleBringingBall}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: bringingBall }}
              accessibilityLabel="Ball mitbringen">
              <MaterialCommunityIcons name="volleyball" size={14} color={bringingBall ? RColors.white : RColors.text7} />
              <Text style={[styles.toggleText, bringingBall && { color: RColors.white }]}>Ball mitbringen</Text>
            </Pressable>
          </View>
        </RCard>

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Zugesagt · {sessionGoing.length}</Text>
          {sessionGoing.length === 0 && <Text style={styles.mutedSmall}>Noch niemand hat zugesagt.</Text>}
          {sessionGoing.map((p) => (
            <View key={p.id} style={styles.personRow}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>
                  {p.name} {p.isYou && <Text style={{ color: RColors.text9, fontWeight: '400' }}>(Du)</Text>}
                </Text>
                <Text style={[styles.personMeta, { color: SKILL_COLOR[p.skill] }]}>
                  {SKILL_LABELS[p.skill] ?? p.skill} · Netz {p.net}
                </Text>
              </View>
              {p.equipment && (
                <View style={styles.equipmentTag}>
                  <MaterialCommunityIcons name={p.equipment === 'Net' ? 'grid' : 'volleyball'} size={12} color={RColors.text5} />
                  <Text style={styles.equipmentText}>{p.equipment === 'Net' ? 'Netz' : 'Ball'}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.cantMakeItTitle}>Abgemeldet · {sessionCantMakeIt.length}</Text>
          {sessionCantMakeIt.map((p) => (
            <View key={p.id} style={[styles.personRow, { opacity: 0.5 }]}>
              <View style={styles.avatar} />
              <Text style={[styles.personName, { flex: 1, textDecorationLine: 'line-through' }]}>{p.name}</Text>
              <Text style={styles.cancelledTag}>Abgesagt</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: RColors.text7 },
  eventTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: RColors.textPrimary },
  eventSubtitle: { fontSize: 13, fontWeight: '600', color: RColors.amber },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowStart: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  ballChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ballChipText: { fontSize: 12, color: RColors.text5 },
  netRow: { gap: 2, padding: 8, backgroundColor: RColors.chip2 },
  netTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  netLabel: { fontFamily: 'Rajdhani_700Bold', fontSize: 12, color: RColors.text5, width: 44 },
  netSkill: { flex: 1, fontSize: 12, fontWeight: '600' },
  netCapacity: { fontSize: 11, color: RColors.text8 },
  netNote: { fontSize: 10, color: RColors.text10, paddingLeft: 54 },
  generalNote: { fontSize: 11, color: RColors.text9 },
  requestTitle: { fontSize: 13, fontWeight: '700', color: RColors.amber },
  requestBody: { fontSize: 12, color: RColors.text3 },
  voteTrack: { height: 5, backgroundColor: RColors.cardBorder, width: '100%' },
  voteFill: { height: '100%', backgroundColor: RColors.amber },
  mutedSmall: { fontSize: 11, color: RColors.text9 },
  voteBtn: { flex: 1, alignItems: 'center', paddingVertical: 9 },
  voteBtnOn: { backgroundColor: RColors.accent, borderWidth: 1, borderColor: RColors.accent },
  voteBtnOnMuted: { backgroundColor: RColors.chip3, borderWidth: 1, borderColor: RColors.outline },
  voteBtnOff: { backgroundColor: 'transparent', borderWidth: 1, borderColor: RColors.divider },
  voteBtnText: { fontSize: 12, fontWeight: '700', color: RColors.text7 },
  toggleChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9 },
  toggleText: { fontSize: 12, fontWeight: '700', color: RColors.text7 },
  sectionTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 14, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.textPrimary },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: RColors.avatarBg },
  personName: { fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  personMeta: { fontSize: 10 },
  equipmentTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  equipmentText: { fontSize: 10, fontWeight: '600', color: RColors.text5 },
  cantMakeItTitle: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  cancelledTag: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase', color: RColors.lossRed },
});
