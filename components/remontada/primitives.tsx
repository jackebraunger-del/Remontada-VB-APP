// Remontada – gemeinsame UI-Bausteine im eckigen, dunklen Design.
//
// Diese Datei ist die einzige Quelle für Karten, Buttons, Texte, Eingabefelder,
// Kopfzeilen sowie Lade-/Leer-/Fehlerzustände. Screens sollen keine eigenen
// Abstände, Schriftgrößen oder Button-Stile mehr erfinden, sondern diese
// Bausteine (zusammen mit den Tokens aus remontada-tokens.ts) verwenden.

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { RColors } from '@/constants/remontada-colors';
import { RRadius, RSize, RSpacing, RType } from '@/constants/remontada-tokens';
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
      cut={RRadius.lg}
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
      cut={RRadius.md}
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
      cut={RRadius.xl}
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
  accessibilityHint?: string;
  /** Kurzes haptisches Feedback beim Antippen (nur nativ, nie im Web). */
  haptic?: boolean;
};

// Web bekommt einen sichtbaren Fokusring (Tastatur-Navigation); auf
// Mobilgeräten ist `focused` immer false und ändert nichts.
function webFocusStyle(focused: boolean): ViewStyle {
  if (Platform.OS !== 'web' || !focused) return {};
  return { outlineWidth: 2, outlineColor: RColors.focusRing, outlineOffset: 2, outlineStyle: 'solid' } as ViewStyle;
}

/**
 * Kurzes, dezentes haptisches Feedback für wichtige Aktionen (Buttons,
 * Bestätigungen). Auf Web und wenn das Gerät keine Haptik unterstützt,
 * passiert einfach nichts – nie ein Absturz, nie eine spürbare Verzögerung.
 */
function triggerHaptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS === 'web') return;
  Haptics.impactAsync(style).catch(() => {});
}

export function RButton({ label, onPress, style, textStyle, disabled, small, accessibilityHint, haptic = true }: RButtonProps) {
  return (
    <Pressable
      onPress={() => {
        if (haptic) triggerHaptic();
        onPress?.();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        { opacity: pressed ? 0.85 : 1 },
        webFocusStyle(!!focused),
        style,
      ]}>
      <CutCornerView
        cut={small ? RRadius.sm : RRadius.md}
        backgroundColor={disabled ? RColors.disabledBg : RColors.accent}
        contentStyle={[styles.btnContent, small ? styles.btnContentSmall : { minHeight: RSize.buttonHeight }]}>
        <Text style={[styles.btnText, small && { fontSize: 13 }, disabled && { color: RColors.disabledText }, textStyle]}>
          {label}
        </Text>
      </CutCornerView>
    </Pressable>
  );
}

export function RButtonOutline({ label, onPress, style, textStyle, disabled, small, accessibilityHint, haptic = false }: RButtonProps) {
  return (
    <Pressable
      onPress={() => {
        if (haptic) triggerHaptic();
        onPress?.();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={6}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        { opacity: pressed ? 0.85 : 1 },
        webFocusStyle(!!focused),
        style,
      ]}>
      <CutCornerView
        cut={small ? RRadius.sm : RRadius.md}
        backgroundColor="transparent"
        borderColor={disabled ? RColors.cardBorder : RColors.outline}
        borderWidth={1}
        contentStyle={[styles.btnContent, small ? styles.btnContentSmall : { minHeight: RSize.buttonHeight }]}>
        <Text style={[styles.btnTextOutline, small && { fontSize: 13 }, disabled && { color: RColors.disabledText }, textStyle]}>
          {label}
        </Text>
      </CutCornerView>
    </Pressable>
  );
}

/**
 * Destruktive/schwer rückgängig zu machende Aktion: erster Tap fragt nach,
 * erst der zweite Tap führt die Aktion aus. Ersetzt die bisher pro Screen
 * einzeln gebaute "Tippe erneut zum Bestätigen"-Logik (z.B. Reset in den
 * Einstellungen, Match stornieren).
 */
export function RConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  disabled,
  style,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <View style={{ gap: RSpacing.sm }}>
      <RButtonOutline
        label={confirming ? confirmLabel : label}
        disabled={disabled}
        style={style}
        haptic={false}
        onPress={() => {
          if (confirming) {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
            setConfirming(false);
            onConfirm();
          } else {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            setConfirming(true);
          }
        }}
      />
      {confirming && (
        <Text accessibilityRole="button" onPress={() => setConfirming(false)} style={styles.confirmCancel}>
          Abbrechen
        </Text>
      )}
    </View>
  );
}

export function RChip({
  label,
  active,
  onPress,
  style,
  accessibilityLabel,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!active }}
      hitSlop={4}
      style={({ focused }: { pressed: boolean; focused?: boolean }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        webFocusStyle(!!focused),
        style,
      ]}>
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
  return (
    <View style={[styles.screen, style]}>
      <View style={styles.contentClamp}>{children}</View>
    </View>
  );
}

/**
 * Zentrale Kopfzeile: Zurück-Pfeil links, Titel mittig, optionaler Inhalt
 * rechts (z.B. ein Icon oder Badge). Ersetzt die auf jedem Screen leicht
 * unterschiedlich nachgebaute Kopfzeile.
 */
export function RHeader({
  title,
  onBack,
  right,
  eyebrow,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <View style={styles.headerRow}>
      <Pressable
        onPress={onBack ?? (() => router.back())}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Zurück"
        style={styles.headerBackBtn}>
        <Ionicons name="chevron-back" size={RSize.iconMd} color={RColors.text2} />
      </Pressable>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {eyebrow && <Text style={styles.headerEyebrow}>{eyebrow}</Text>}
        <Text style={styles.headerTitleText} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.headerRight}>{right ?? <View style={{ width: RSize.iconMd }} />}</View>
    </View>
  );
}

/** Großer, markanter Bildschirmtitel für Tab-Startseiten (kein Zurück-Pfeil). */
export function RScreenTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={styles.screenTitleRow}>
      <Text style={styles.screenTitleText}>{children}</Text>
      {right}
    </View>
  );
}

type TextVariant = 'body' | 'bodyStrong' | 'small' | 'smallStrong' | 'caption' | 'cardTitle';

/** Fließtext/Beschriftungen nach der Barlow-Skala, mit fester Textfarbe je Rolle. */
export function RText({
  children,
  variant = 'body',
  color,
  style,
  ...rest
}: {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
} & React.ComponentProps<typeof Text>) {
  const base = RType[variant];
  const defaultColor =
    variant === 'caption' ? RColors.text9 : variant === 'small' ? RColors.text7 : RColors.text3;
  return (
    <Text style={[{ fontFamily: base.fontFamily, fontSize: base.fontSize, lineHeight: base.lineHeight, color: color ?? defaultColor, letterSpacing: base.letterSpacing }, style]} {...rest}>
      {children}
    </Text>
  );
}

/**
 * Einheitliches Eingabefeld: Label, optionaler Hilfetext, Fehlertext und ein
 * sichtbarer Fokusring im Web. Ersetzt die bisher pro Screen einzeln
 * gestylten TextInput-Felder.
 */
export function RInput({
  label,
  helperText,
  errorText,
  containerStyle,
  ...rest
}: TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: RSpacing.xs }, containerStyle]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <CutCornerView
        cut={RRadius.md}
        backgroundColor={RColors.chip2}
        borderColor={errorText ? RColors.danger : focused ? RColors.focusRing : RColors.cardBorder}
        borderWidth={1}
        contentStyle={{ paddingHorizontal: RSpacing.md, minHeight: RSize.inputHeight, justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={RColors.text9}
          accessibilityLabel={label}
          {...rest}
          style={[styles.inputText, rest.style]}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
      </CutCornerView>
      {errorText ? (
        <Text accessibilityRole="alert" style={styles.inputError}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text style={styles.inputHelper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

/** Inline-Fehlerbanner mit optionalem "Erneut versuchen"-Button. */
export function RErrorBanner({
  message,
  onRetry,
  retryLabel = 'Erneut versuchen',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <RCard borderColor={RColors.danger} contentStyle={styles.errorBanner}>
      <Ionicons name="alert-circle-outline" size={RSize.iconMd} color={RColors.danger} />
      <Text accessibilityRole="alert" style={styles.errorBannerText}>
        {message}
      </Text>
      {onRetry && <RButtonOutline small label={retryLabel} onPress={onRetry} />}
    </RCard>
  );
}

/** Zentrierter Ladezustand mit optionaler Beschriftung – für ganze Screens oder Sektionen. */
export function RLoading({ label }: { label?: string }) {
  return (
    <View style={styles.loadingWrap}>
      <ActivityIndicator color={RColors.accent} />
      {label && <Text style={styles.loadingLabel}>{label}</Text>}
    </View>
  );
}

/** Leerer Zustand: Icon, Titel, kurze Erklärung, optionale Aktion. */
export function REmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <RCard contentStyle={styles.emptyState}>
      <Ionicons name={icon} size={28} color={RColors.text8} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
      {actionLabel && onAction && <RButton small label={actionLabel} onPress={onAction} style={{ marginTop: RSpacing.xs }} />}
    </RCard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: RColors.bgApp,
  },
  // Auf breiten Web-Fenstern soll Remontada nicht wie ein extrem breiter
  // Handy-Screen aussehen: Inhalte werden auf eine lesbare Spaltenbreite
  // begrenzt und zentriert. Auf Mobilgeräten (und schmalen Fenstern) ist
  // das ein No-Op, weil die volle Breite ohnehin unter dem Limit liegt.
  contentClamp: Platform.select({
    web: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' as const },
    default: { flex: 1 },
  }),
  btnContent: {
    paddingVertical: 13,
    paddingHorizontal: RSpacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContentSmall: {
    paddingVertical: 9,
    paddingHorizontal: RSpacing.md,
    minHeight: RSize.buttonHeightSmall,
  },
  btnText: {
    fontFamily: RType.button.fontFamily,
    fontSize: RType.button.fontSize,
    letterSpacing: RType.button.letterSpacing,
    textTransform: 'uppercase',
    color: RColors.white,
  },
  btnTextOutline: {
    fontFamily: RType.button.fontFamily,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: RColors.text2,
  },
  confirmCancel: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: RColors.text9,
    paddingVertical: RSpacing.xs,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: RSpacing.md,
    minHeight: 36,
    justifyContent: 'center',
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
    paddingHorizontal: RSpacing.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: RSize.minTouch },
  headerBackBtn: { width: RSize.minTouch, height: RSize.minTouch, alignItems: 'flex-start', justifyContent: 'center' },
  headerRight: { width: RSize.minTouch, alignItems: 'flex-end', justifyContent: 'center' },
  headerEyebrow: { fontFamily: RType.caption.fontFamily, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: RColors.text9 },
  headerTitleText: {
    fontFamily: RType.headerTitle.fontFamily,
    fontSize: RType.headerTitle.fontSize,
    letterSpacing: RType.headerTitle.letterSpacing,
    textTransform: 'uppercase',
    color: RColors.textPrimary,
  },
  screenTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  screenTitleText: {
    fontFamily: RType.screenTitle.fontFamily,
    fontSize: RType.screenTitle.fontSize,
    color: RColors.textPrimary,
  },
  inputLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', color: RColors.text9 },
  inputText: { fontFamily: RType.body.fontFamily, fontSize: 15, color: RColors.textPrimary, paddingVertical: RSpacing.sm },
  inputHelper: { fontFamily: RType.caption.fontFamily, fontSize: 11, color: RColors.text9 },
  inputError: { fontFamily: RType.caption.fontFamily, fontSize: 11, color: RColors.danger },
  errorBanner: { padding: RSpacing.md, flexDirection: 'row', alignItems: 'center', gap: RSpacing.sm },
  errorBannerText: { flex: 1, fontFamily: RType.small.fontFamily, fontSize: 13, lineHeight: 18, color: RColors.text2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: RSpacing.md },
  loadingLabel: { fontFamily: RType.small.fontFamily, fontSize: 13, color: RColors.text7 },
  emptyState: { padding: RSpacing.xl, alignItems: 'center', gap: RSpacing.xs },
  emptyTitle: { fontFamily: RType.cardTitle.fontFamily, fontSize: 15, color: RColors.text3, textAlign: 'center' },
  emptyDescription: { fontFamily: RType.small.fontFamily, fontSize: 12, color: RColors.text9, textAlign: 'center' },
});
