import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoinIcon, FrameRing } from '@/components/remontada/icons';
import { RCard, RScreen, RTile } from '@/components/remontada/primitives';
import { RColors, withAlpha } from '@/constants/remontada-colors';
import { useAppData } from '@/lib/remontada-context';

const TABS = ['Avatar Frames', 'Card Themes', 'Badge Styles'];

const RARITY_COLOR: Record<string, string> = {
  Common: RColors.text6,
  Rare: RColors.rareOrange,
  Epic: RColors.epicPurple,
  Legendary: RColors.legendaryRed,
};

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { coins, skins, buySkin } = useAppData();
  const [tab, setTab] = useState('Avatar Frames');
  const featured = skins.find((s) => s.id === 'diamond-ace')!;
  const frames = skins.filter((s) => s.kind === 'Avatar Frame' && tab === 'Avatar Frames');

  function onBuy(id: string, name: string, price?: number) {
    if (!price) return;
    const ok = buySkin(id);
    Alert.alert(ok ? 'Gekauft!' : 'Nicht genug Coins', ok ? `${name} ist jetzt in deinem Locker.` : `Du brauchst noch mehr Coins für ${name}.`);
  }

  return (
    <RScreen>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={20} color={RColors.text2} />
          </Pressable>
          <Text style={styles.title}>SHOP</Text>
          <View style={styles.coinBadge}>
            <CoinIcon size={16} />
            <Text style={styles.coinText}>{coins}</Text>
          </View>
        </View>

        <RCard borderColor={withAlpha(RColors.legendaryRed, 0.5)} contentStyle={styles.featuredRow}>
          <FrameRing size={52} gradientFrom={featured.gradientFrom} gradientTo={featured.gradientTo} spin={!featured.owned} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.featuredEyebrow}>Featured This Week</Text>
            <Text style={styles.featuredName}>{featured.name}</Text>
            <Text style={[styles.rarityText, { color: RColors.legendaryRed }]}>Legendary · Avatar Frame</Text>
          </View>
          <Pressable
            style={styles.buyBtnSm}
            onPress={() => onBuy(featured.id, featured.name, featured.priceCoins)}
            disabled={featured.owned}>
            <CoinIcon size={13} />
            <Text style={styles.buyPriceSm}>{featured.owned ? 'Owned' : featured.priceCoins}</Text>
          </Pressable>
        </RCard>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <Text key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
              {t}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {frames.map((skin) => (
            <RTile
              key={skin.id}
              style={styles.tileWrap}
              borderColor={
                skin.rarity === 'Epic'
                  ? withAlpha(RColors.epicPurple, 0.4)
                  : skin.rarity === 'Rare'
                    ? withAlpha(RColors.rareOrange, 0.4)
                    : skin.rarity === 'Legendary'
                      ? withAlpha(RColors.legendaryRed, 0.4)
                      : undefined
              }
              contentStyle={styles.tileContent}>
              <FrameRing size={46} gradientFrom={skin.gradientFrom} gradientTo={skin.gradientTo} spin={false} />
              <Text style={styles.skinName}>{skin.name}</Text>
              <Text style={[styles.rarityText, { color: RARITY_COLOR[skin.rarity] }]}>{skin.rarity}</Text>
              {skin.owned ? (
                <Text style={styles.ownedText}>Owned</Text>
              ) : skin.seasonOnly ? (
                <Text style={styles.seasonText}>Season Reward</Text>
              ) : (
                <Pressable style={styles.priceChip} onPress={() => onBuy(skin.id, skin.name, skin.priceCoins)}>
                  <CoinIcon size={12} />
                  <Text style={styles.priceText}>{skin.priceCoins}</Text>
                </Pressable>
              )}
            </RTile>
          ))}
        </View>

        <Text style={styles.footerNote}>
          Coins come from your Daily Reward or from topping up. A share of every purchase goes back into local courts
          and community tournaments.
        </Text>
        <Text style={styles.getCoins} onPress={() => Alert.alert('Get Coins', 'Coins aufladen kommt bald.')}>
          Get Coins
        </Text>
      </ScrollView>
    </RScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, color: RColors.textPrimary },
  coinBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: RColors.chip, paddingVertical: 6, paddingHorizontal: 10 },
  coinText: { fontFamily: 'Rajdhani_700Bold', fontSize: 14, color: RColors.textPrimary },
  featuredRow: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  featuredEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.legendaryRed },
  featuredName: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, color: RColors.textPrimary },
  rarityText: { fontSize: 11, fontWeight: '600' },
  buyBtnSm: { backgroundColor: RColors.accent, paddingVertical: 9, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  buyPriceSm: { fontFamily: 'Rajdhani_700Bold', fontSize: 13, color: RColors.white },
  tabRow: { flexDirection: 'row', gap: 20, borderBottomWidth: 1, borderBottomColor: RColors.cardBorder },
  tab: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9, paddingBottom: 10 },
  tabActive: { color: RColors.textPrimary, borderBottomWidth: 2, borderBottomColor: RColors.accentLink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tileWrap: { width: '47%' },
  tileContent: { paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center', gap: 8 },
  skinName: { fontSize: 12, fontWeight: '600', color: RColors.textPrimary, textAlign: 'center' },
  ownedText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: RColors.win },
  seasonText: { fontSize: 11, fontWeight: '600', color: RColors.text9, textAlign: 'center' },
  priceChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: RColors.chip3, paddingVertical: 6, paddingHorizontal: 10 },
  priceText: { fontFamily: 'Rajdhani_700Bold', fontSize: 12, color: RColors.textPrimary },
  footerNote: { textAlign: 'center', fontSize: 11, color: RColors.text10, lineHeight: 16, paddingHorizontal: 12 },
  getCoins: { textAlign: 'center', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: RColors.accentLink },
});
