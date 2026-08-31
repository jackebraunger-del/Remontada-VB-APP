import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Reanimated, { useAnimatedStyle, useSharedValue, withDecay } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinIcon, FrameRing } from '@/components/remontada/icons';
import { RCard, RScreen, RTag, RTile } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';
import { Skin } from '@/lib/remontada-types';

const TABS = ['Avatar Frames', 'Card Themes', 'Badge Styles'];

const RARITY_COLOR: Record<string, string> = {
  Common: RColors.text6,
  Rare: RColors.rareOrange,
  Epic: RColors.epicPurple,
  Legendary: RColors.legendaryRed,
};

export default function LockerScreen() {
  const insets = useSafeAreaInsets();
  const { skins, equipSkin } = useAppData();
  const [tab, setTab] = useState('Avatar Frames');
  const equipped = skins.find((s) => s.equipped) ?? skins.find((s) => s.id === 'sunset-court')!;
  const frames = skins.filter((s) => s.kind === (tab === 'Avatar Frames' ? 'Avatar Frame' : tab === 'Card Themes' ? 'Card Theme' : 'Badge Style'));

  // Manuelles Drehen des großen Vorschau-Rings per Wischen – zusätzlich zur
  // automatischen Drehung des Rings selbst.
  const dragRotation = useSharedValue(0);
  const dragGesture = Gesture.Pan()
    .onChange((e) => {
      dragRotation.value += e.changeX * 0.6;
    })
    .onEnd((e) => {
      dragRotation.value = withDecay({ velocity: e.velocityX * 0.4 });
    });
  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dragRotation.value}deg` }],
  }));

  function onTilePress(skin: Skin) {
    if (!skin.owned) {
      Alert.alert(
        skin.name,
        skin.seasonOnly
          ? 'Nur als Season-Belohnung erhältlich.'
          : `${skin.achievementLabel ?? ''}${skin.achievementLabel && skin.priceCoins ? ' oder ' : ''}${
              skin.priceCoins ? `${skin.priceCoins} Coins im Shop` : ''
            }`
      );
      return;
    }
    equipSkin(skin.id);
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 18 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={RColors.text2} />
          </Pressable>
          <Text style={styles.title}>LOCKER</Text>
          <RTag label="Season 1" color={RColors.rareOrange} bg={withAlpha(RColors.accent, 0.3)} />
        </View>

        <RCard contentStyle={styles.equippedRow}>
          <GestureDetector gesture={dragGesture}>
            <Reanimated.View style={dragStyle}>
              <FrameRing size={58} gradientFrom={equipped.gradientFrom} gradientTo={equipped.gradientTo} />
            </Reanimated.View>
          </GestureDetector>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.eyebrow}>Equipped Frame</Text>
            <Text style={styles.equippedName}>{equipped.name}</Text>
            <Text style={[styles.rarityText, { color: RARITY_COLOR[equipped.rarity] }]}>{equipped.rarity}</Text>
            <Text style={styles.dragHint}>Swipe the ring to spin it</Text>
          </View>
        </RCard>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
          {TABS.map((t) => (
            <Text key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              {t}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {frames.map((skin) => (
            <Pressable key={skin.id} style={styles.gridItem} onPress={() => onTilePress(skin)}>
              <RTile
                borderColor={
                  skin.rarity === 'Epic'
                    ? withAlpha(RColors.epicPurple, 0.5)
                    : skin.rarity === 'Legendary'
                      ? withAlpha(RColors.legendaryRed, 0.5)
                      : skin.equipped
                        ? withAlpha(RColors.rareOrange, 0.5)
                        : undefined
                }
                contentStyle={[styles.tileContent, !skin.owned && { opacity: 0.55 }]}>
                <FrameRing size={50} gradientFrom={skin.gradientFrom} gradientTo={skin.gradientTo} spin={skin.owned} />
                <Text style={styles.skinName}>{skin.name}</Text>
                <Text style={[styles.rarityText, { color: RARITY_COLOR[skin.rarity] }]}>{skin.rarity}</Text>
                {skin.equipped && <Text style={styles.equippedBadge}>Equipped</Text>}
              </RTile>
              {skin.owned && !skin.equipped && (
                <View style={styles.ownedBadge}>
                  <Ionicons name="checkmark" size={9} color="#0d1a12" />
                </View>
              )}
              {!skin.owned && (
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed-outline" size={15} color={RColors.text2} />
                  {skin.achievementLabel && <Text style={styles.lockText}>{skin.achievementLabel}</Text>}
                  {skin.priceCoins && (
                    <View style={styles.priceRow}>
                      {skin.achievementLabel && <Text style={styles.orText}>or</Text>}
                      <CoinIcon size={10} />
                      <Text style={styles.priceText}>{skin.priceCoins}</Text>
                    </View>
                  )}
                  {skin.seasonOnly && <Text style={styles.lockText}>Season Reward</Text>}
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, letterSpacing: 0.8, color: RColors.textPrimary },
  equippedRow: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', color: RColors.text8 },
  equippedName: { fontFamily: 'Rajdhani_700Bold', fontSize: 18, color: RColors.textPrimary },
  rarityText: { fontSize: 11, fontWeight: '600' },
  dragHint: { fontSize: 9, color: RColors.text10, marginTop: 2 },
  tabScroll: { borderBottomWidth: 1, borderBottomColor: RColors.cardBorder },
  tabRow: { flexDirection: 'row', gap: 20 },
  tab: {
    fontFamily: 'Rajdhani_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: RColors.text9,
    paddingBottom: 10,
    paddingHorizontal: 2,
  },
  tabActive: { color: RColors.textPrimary, borderBottomWidth: 2, borderBottomColor: RColors.accentLink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '31%', position: 'relative' },
  tileContent: { paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', gap: 8 },
  skinName: { fontSize: 12, fontWeight: '600', color: RColors.textPrimary, textAlign: 'center' },
  equippedBadge: { position: 'absolute', top: 8, right: 8, fontSize: 9, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: RColors.accentLink },
  ownedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: RColors.win,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: 'rgba(8,10,12,0.55)',
  },
  lockText: { fontSize: 8, fontWeight: '600', color: RColors.text5, textAlign: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  orText: { fontSize: 8, color: RColors.text9 },
  priceText: { fontSize: 9, fontWeight: '700', color: RColors.text2 },
});
