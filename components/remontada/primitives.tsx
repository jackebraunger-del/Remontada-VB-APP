// Remontada – kleine wiederverwendbare UI-Bausteine (Karten, Buttons, Chips)
// im eckigen, dunklen Valorant-artigen Stil aus dem Design.

import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { RColors } from '@/constants/remontada-colors';
import { CutCornerView } from './CutCorner';

export function RCard({
  children,
  style,
  contentStyle,
  borderColor = RColors.cardBorder,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
}) {
  return (
    <CutCornerView
      cut={14}
      backgroundColor={RColors.card}
      borderColor={borderColor}
      borderWidth={1}
      style={style}
      contentStyle={contentStyle}>
      {children}
    </CutCornerView>
  );
}

export function RTile({
  children,
  style,
  contentStyle,
  borderColor,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderColor?: string;
}) {
  return (
    <CutCornerView
      cut={10}
      backgroundColor={RColors.card}
      borderColor={borderColor}
      borderWidth={borderColor ? 1.5 : 0}
      style={style}
      contentStyle={contentStyle}>
      {children}
    </CutCornerView>
  );
}

export function RSheet({
  children,
  style,
  contentStyle,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <CutCornerView
      cut={18}
      corners="top-both"
      backgroundColor={RColors.bgSheet}
      style={style}
      contentStyle={contentStyle}>
      {children}
    </CutCornerView>
  );
}

type RButtonProps = {
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  small?: boolean;
};

export function RButton({ label, onPress, style, textStyle, disabled, small }: RButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}>
      <CutCornerView
        cut={small ? 6 : 10}
        backgroundColor={disabled ? RColors.chip3 : RColors.accent}
        contentStyle={[styles.btnContent, small && styles.btnContentSmall]}>
        <Text style={[styles.btnText, small && { fontSize: 13 }, textStyle]}>{label}</Text>
      </CutCornerView>
    </Pressable>
  );
}

export function RButtonOutline({ label, onPress, style, textStyle, disabled }: RButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}>
      <CutCornerView
        cut={10}
        backgroundColor="transparent"
        borderColor={RColors.outline}
        borderWidth={1}
        contentStyle={styles.btnContent}>
        <Text style={[styles.btnTextOutline, textStyle]}>{label}</Text>
      </CutCornerView>
    </Pressable>
  );
}

export function RChip({
  label,
  active,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipInactive, style]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function RTag({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={[styles.tag, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

export function RScreen({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: RColors.bgApp,
  },
  btnContent: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContentSmall: {
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  btnText: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: RColors.white,
  },
  btnTextOutline: {
    fontFamily: 'Rajdhani_700Bold',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: RColors.text2,
  },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: RColors.accent,
  },
  chipInactive: {
    backgroundColor: RColors.chip,
    borderWidth: 1,
    borderColor: RColors.divider,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: RColors.text5,
  },
  chipTextActive: {
    color: RColors.white,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
