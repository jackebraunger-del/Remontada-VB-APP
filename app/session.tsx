import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RCard, RScreen } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
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
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color={RColors.text2} />
            </Pressable>
            <Text style={styles.headerTitle}>Club Session</Text>
            <View style={{ width: 18 }} />
          </View>

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 }}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={32} color={RColors.text9} />
            <Text style={styles.eventTitle}>No Club Session yet</Text>
            <Text style={[styles.mutedSmall, { textAlign: 'center' }]}>
              Nobody has scheduled a club session yet. Set one up and people can RSVP, vote on join requests and see
              who&apos;s bringing the net/ball.
            </Text>
            <RButton label="Schedule a Session" onPress={scheduleSession} style={{ marginTop: 8 }} />
          </View>
        </ScrollView>
      </RScreen>
    );
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Club Session</Text>
          <Ionicons name="heart-outline" size={18} color={RColors.text5} />
        </View>

        <View style={{ gap: 2 }}>
          <Text style={styles.eventTitle}>Las Canteras · Community</Text>
          <Text style={styles.eventSubtitle}>Saturday · Ball ab 18:00</Text>
        </View>

        <RCard contentStyle={{ padding: 16, gap: 10 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Nets · 4 confirmed</Text>
            <View style={styles.ballChip}>
              <MaterialCommunityIcons name="volleyball" size={15} color={RColors.text5} />
              <Text style={styles.ballChipText}>
                <Text style={{ fontWeight: '700', color: RColors.textPrimary }}>4</Text> Balls
              </Text>
            </View>
          </View>

          {SESSION_NETS.map((net) => (
            <View key={net.id} style={styles.netRow}>
              <View style={styles.netTopRow}>
                <Text style={styles.netLabel}>Net {net.id}</Text>
                <Text style={[styles.netSkill, { color: SKILL_COLOR[net.skill] }]}>{net.skill}</Text>
                <Text style={styles.netCapacity}>
                  {net.min}-{net.max} players
                </Text>
              </View>
              <Text style={styles.netNote}>{net.note}</Text>
            </View>
          ))}

          <Text style={styles.generalNote}>
            Playing down always works, no ask needed. Playing up needs a request — the higher net&apos;s own players
            vote to accept you. Once accepted, you&apos;re in for the whole session, no bumping.
          </Text>
        </RCard>

        {joinRequest && (
          <RCard borderColor={withAlpha(RColors.amber, 0.5)} contentStyle={{ padding: 16, gap: 10 }}>
            <View style={styles.rowStart}>
              <Ionicons name="heart-outline" size={16} color={RColors.amber} />
              <Text style={styles.requestTitle}>Join Request · Net {joinRequest.targetNet}</Text>
            </View>
            <Text style={styles.requestBody}>
              <Text style={{ fontWeight: '700' }}>{joinRequest.playerName}</Text>{' '}
              <Text style={{ color: RColors.win }}>({joinRequest.playerSkill})</Text> wants to play up into your
              Intermediate net.
            </Text>
            <View style={{ gap: 5 }}>
              <View style={styles.voteTrack}>
                <View style={[styles.voteFill, { width: `${votePct}%` }]} />
              </View>
              <Text style={styles.mutedSmall}>
                {joinRequest.votesYes} of {joinRequest.votesTotal} said yes · needs half of Net {joinRequest.targetNet} to
                agree
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                style={[styles.voteBtn, joinRequest.myVote === 'yes' ? styles.voteBtnOn : styles.voteBtnOff]}
                onPress={() => castVote('yes')}>
                <Text style={[styles.voteBtnText, joinRequest.myVote === 'yes' && { color: RColors.white }]}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.voteBtn, joinRequest.myVote === 'no' ? styles.voteBtnOnMuted : styles.voteBtnOff]}
                onPress={() => castVote('no')}>
                <Text style={styles.voteBtnText}>No</Text>
              </Pressable>
            </View>
          </RCard>
        )}

        <RCard contentStyle={{ padding: 16, gap: 12 }}>
          <View style={styles.rowStart}>
            <Ionicons name="checkmark-circle" size={18} color={RColors.win} />
            <Text style={[styles.requestTitle, { color: RColors.win }]}>You&apos;re In</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              style={[styles.toggleChip, bringingNet ? styles.voteBtnOn : styles.voteBtnOff]}
              onPress={toggleBringingNet}>
              <MaterialCommunityIcons name="grid" size={14} color={bringingNet ? RColors.white : RColors.text7} />
              <Text style={[styles.toggleText, bringingNet && { color: RColors.white }]}>Bringing Net</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleChip, bringingBall ? styles.voteBtnOn : styles.voteBtnOff]}
              onPress={toggleBringingBall}>
              <MaterialCommunityIcons name="volleyball" size={14} color={bringingBall ? RColors.white : RColors.text7} />
              <Text style={[styles.toggleText, bringingBall && { color: RColors.white }]}>Bring Ball</Text>
            </Pressable>
          </View>
        </RCard>

        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>Going · {sessionGoing.length}</Text>
          {sessionGoing.length === 0 && <Text style={styles.mutedSmall}>No one has RSVP&apos;d yet.</Text>}
          {sessionGoing.map((p) => (
            <View key={p.id} style={styles.personRow}>
              <View style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.personName}>
                  {p.name} {p.isYou && <Text style={{ color: RColors.text9, fontWeight: '400' }}>(You)</Text>}
                </Text>
                <Text style={[styles.personMeta, { color: SKILL_COLOR[p.skill] }]}>
                  {p.skill} · Net {p.net}
                </Text>
              </View>
              {p.equipment && (
                <View style={styles.equipmentTag}>
                  <MaterialCommunityIcons name={p.equipment === 'Net' ? 'grid' : 'volleyball'} size={12} color={RColors.text5} />
                  <Text style={styles.equipmentText}>{p.equipment}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={styles.cantMakeItTitle}>Can&apos;t Make It · {sessionCantMakeIt.length}</Text>
          {sessionCantMakeIt.map((p) => (
            <View key={p.id} style={[styles.personRow, { opacity: 0.5 }]}>
              <View style={styles.avatar} />
              <Text style={[styles.personName, { flex: 1, textDecorationLine: 'line-through' }]}>{p.name}</Text>
              <Text style={styles.cancelledTag}>Cancelled</Text>
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
