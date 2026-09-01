import Ionicons from '@expo/vector-icons/Ionicons';
import { useOnlineData } from '@/lib/online-context';
import { OnlineMatchRoom } from '@/components/remontada/OnlineMatchRoom';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RButton, RButtonOutline, RCard, RChip, RScreen, RTag } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';
import { RECENT_RESULT } from '@/lib/remontada-mock-data';

const REPORT_REASONS = ['Wrong score', 'Player didn’t show up', 'Suspected cheating', 'Other'];

export default function MatchRoomScreen() {
  const online = useOnlineData();
  return online ? <OnlineMatchRoom /> : <DemoMatchRoomScreen />;
}

function DemoMatchRoomScreen() {
  const insets = useSafeAreaInsets();
  const { dailyRewardClaimedToday, claimDailyReward } = useAppData();
  const [supportVisible, setSupportVisible] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [note, setNote] = useState('');

  function onViewReward() {
    if (dailyRewardClaimedToday) {
      router.push('/reward-claimed');
      return;
    }
    const outcome = claimDailyReward();
    router.push(outcome === 'skin' ? '/reward-skin' : '/reward');
  }

  function onSubmitReport() {
    setSupportVisible(false);
    setNote('');
    Alert.alert('Report sent', 'Thanks — our team will take a look at this match.');
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 32, gap: 18 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={RColors.text2} />
          </Pressable>
          <Text style={styles.headerTitle}>Match Room</Text>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Ionicons name="heart-outline" size={18} color={RColors.text5} />
            <Ionicons name="chatbubble-outline" size={18} color={RColors.text5} />
            <Pressable hitSlop={10} onPress={() => setSupportVisible(true)}>
              <Ionicons name="flag-outline" size={18} color={RColors.text5} />
            </Pressable>
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={styles.locationTitle}>Las Canteras · Court 4</Text>
          <View style={styles.tagRow}>
            <RTag label="Intermediate" color={RColors.text3} bg={RColors.chip3} />
            <RTag label="Mixed" color={RColors.text3} bg={RColors.chip3} />
            <RTag label="Ranked" color={RColors.rareOrange} bg={withAlpha(RColors.accent, 0.3)} />
          </View>
        </View>

        <RCard contentStyle={{ padding: 18, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[styles.teamLabel, { color: RColors.win }]}>Team A</Text>
              <Text style={styles.playerName}>
                Jakob <Text style={{ color: RColors.gold, fontSize: 11 }}>Gold</Text>
              </Text>
              <Text style={styles.playerName}>
                Maria <Text style={{ color: RColors.text3, fontSize: 11 }}>Silver</Text>
              </Text>
            </View>
            <Text style={styles.vs}>VS</Text>
            <View style={{ flex: 1, gap: 6, alignItems: 'flex-end' }}>
              <Text style={[styles.teamLabel, { color: RColors.text7 }]}>Team B</Text>
              <Text style={[styles.playerName, { textAlign: 'right' }]}>
                Carlos <Text style={{ color: RColors.gold, fontSize: 11 }}>Gold</Text>
              </Text>
              <Text style={[styles.playerName, { textAlign: 'right' }]}>
                Laura <Text style={{ color: RColors.gold, fontSize: 11 }}>Gold</Text>
              </Text>
            </View>
          </View>

          <View style={styles.setsRow}>
            <Text style={styles.setScore}>21–18</Text>
            <Text style={[styles.setScore, { color: RColors.text9 }]}>17–21</Text>
            <Text style={styles.setScore}>15–12</Text>
          </View>

          <Text style={styles.winnerText}>Team A Wins</Text>
        </RCard>

        <View style={styles.verifiedRow}>
          <MaterialCommunityIcons name="check-decagram" size={16} color={RColors.diamondBlue} />
          <Text style={styles.verifiedText}>Verified Match</Text>
          <View style={{ flex: 1 }} />
          {RECENT_RESULT.ratingDeltas.map((d) => (
            <Text key={d.name} style={styles.deltaText}>
              {d.name} +{d.delta}
            </Text>
          ))}
        </View>

        <Pressable onPress={onViewReward}>
          <RCard borderColor={withAlpha(RColors.amberIcon, 0.5)} contentStyle={styles.rewardRow}>
            <MaterialCommunityIcons name="gift-outline" size={22} color={RColors.amberIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardTitle}>{dailyRewardClaimedToday ? 'Daily Reward Claimed' : 'Daily Reward Unlocked'}</Text>
              <Text style={styles.mutedTiny}>1 per day · today&apos;s win counts</Text>
            </View>
            <Text style={styles.viewLabel}>View</Text>
          </RCard>
        </Pressable>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={styles.countRow}>
              <Ionicons name="heart" size={16} color={RColors.accentLink} />
              <Text style={styles.countText}>18</Text>
            </View>
            <View style={styles.countRow}>
              <Ionicons name="chatbubble-outline" size={16} color={RColors.text5} />
              <Text style={styles.countText}>4</Text>
            </View>
          </View>
          <RCard contentStyle={{ padding: 14, gap: 8 }}>
            <Text style={styles.comment}>
              <Text style={{ fontWeight: '700' }}>Carlos:</Text> <Text style={{ color: RColors.text3 }}>&quot;Great game!&quot;</Text>
            </Text>
            <Text style={styles.comment}>
              <Text style={{ fontWeight: '700' }}>Maria:</Text> <Text style={{ color: RColors.text3 }}>&quot;Rematch tomorrow?&quot;</Text>
            </Text>
          </RCard>
        </View>

        <RButton label="Rematch" />
        <RButtonOutline label="Report an Issue" onPress={() => setSupportVisible(true)} />
      </ScrollView>

      <Modal visible={supportVisible} transparent animationType="fade" onRequestClose={() => setSupportVisible(false)}>
        <View style={styles.modalBackdrop}>
          <RCard style={{ width: '100%' }} contentStyle={{ padding: 20, gap: 14 }}>
            <Text style={styles.modalTitle}>Report an Issue</Text>
            <Text style={styles.mutedTiny}>Wrong score, a no-show, or something that felt off — let us know.</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {REPORT_REASONS.map((r) => (
                <RChip key={r} label={r} active={reason === r} onPress={() => setReason(r)} />
              ))}
            </View>
            <RCard contentStyle={{ paddingHorizontal: 4 }}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Add details (optional)"
                placeholderTextColor={RColors.text9}
                style={styles.modalInput}
                multiline
              />
            </RCard>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <RButtonOutline label="Cancel" style={{ flex: 1 }} onPress={() => setSupportVisible(false)} />
              <RButton label="Send Report" style={{ flex: 1 }} onPress={onSubmitReport} />
            </View>
          </RCard>
        </View>
      </Modal>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: RColors.text7 },
  locationTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 19, color: RColors.textPrimary },
  tagRow: { flexDirection: 'row', gap: 6 },
  teamLabel: { fontFamily: 'Rajdhani_700Bold', fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase' },
  playerName: { fontSize: 14, fontWeight: '600', color: RColors.textPrimary },
  vs: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, color: RColors.text9, paddingHorizontal: 10 },
  setsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: RColors.cardBorder,
  },
  setScore: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, color: RColors.textPrimary },
  winnerText: { textAlign: 'center', fontFamily: 'Rajdhani_700Bold', fontSize: 15, letterSpacing: 1.2, textTransform: 'uppercase', color: RColors.win },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: RColors.diamondBlue },
  deltaText: { fontSize: 11, fontWeight: '700', color: RColors.win },
  rewardRow: { padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rewardTitle: { fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  mutedTiny: { fontSize: 10, color: RColors.text9 },
  viewLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.amberIcon },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countText: { fontSize: 13, fontWeight: '600', color: RColors.textPrimary },
  comment: { fontSize: 13, color: RColors.textPrimary },
  modalBackdrop: { flex: 1, backgroundColor: withAlpha(RColors.bgApp, 0.75), alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 17, color: RColors.textPrimary },
  modalInput: { backgroundColor: RColors.chip2, color: RColors.textPrimary, paddingVertical: 12, paddingHorizontal: 12, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
});
