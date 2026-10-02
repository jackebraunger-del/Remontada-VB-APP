// Remontada – Design-Tokens: Abstände, Radien/Cuts, Typografie-Skala und
// feste Maße (Icon-Größen, Mindest-Tapzielgröße). Ergänzt `remontada-colors.ts`
// (Farben) um alles andere, damit kein Screen mehr eigene Zahlen erfindet.
//
// Schriftregel: Rajdhani für markante Überschriften, Zahlen/Spielstände und
// kurze sportliche Labels (Großbuchstaben, Letter-Spacing). Barlow für
// Fließtext, Formulare, Erklärungen und alles, was in normalem Satzbau
// gelesen wird.

export const RSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

// Angeschnittene Ecke (siehe CutCornerView) – wie stark geschnitten wird.
export const RRadius = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 18,
} as const;

// Mindestgröße für Touch-Ziele (Apple/Material-Richtwert ~44x48pt) und
// gängige Icon-Größen, damit nicht jeder Screen eigene Werte nutzt.
export const RSize = {
  minTouch: 44,
  iconXs: 14,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  buttonHeight: 48,
  buttonHeightSmall: 38,
  inputHeight: 48,
  avatarSm: 32,
  avatarMd: 44,
  avatarLg: 82,
} as const;

interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

// Rajdhani-Skala: Marken-Schriftzug, Bildschirmtitel, Zwischenüberschriften,
// große Zahlen/Spielstände, kurze Eyebrow-Labels.
export const RType = {
  brand: { fontFamily: 'Rajdhani_700Bold', fontSize: 20, lineHeight: 24, letterSpacing: 2 } as TypeStyle,
  screenTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 24, lineHeight: 28 } as TypeStyle,
  headerTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 16, lineHeight: 20, letterSpacing: 0.6 } as TypeStyle,
  cardTitle: { fontFamily: 'Rajdhani_700Bold', fontSize: 18, lineHeight: 22 } as TypeStyle,
  statValue: { fontFamily: 'Rajdhani_700Bold', fontSize: 22, lineHeight: 26 } as TypeStyle,
  eyebrow: { fontFamily: 'Rajdhani_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 1 } as TypeStyle,
  // Barlow-Skala: Fließtext, Formulare, Erklärtexte.
  body: { fontFamily: 'Barlow_400Regular', fontSize: 15, lineHeight: 21 } as TypeStyle,
  bodyStrong: { fontFamily: 'Barlow_600SemiBold', fontSize: 15, lineHeight: 21 } as TypeStyle,
  small: { fontFamily: 'Barlow_400Regular', fontSize: 13, lineHeight: 18 } as TypeStyle,
  smallStrong: { fontFamily: 'Barlow_600SemiBold', fontSize: 13, lineHeight: 18 } as TypeStyle,
  caption: { fontFamily: 'Barlow_500Medium', fontSize: 11, lineHeight: 15, letterSpacing: 0.3 } as TypeStyle,
  button: { fontFamily: 'Rajdhani_700Bold', fontSize: 15, lineHeight: 18, letterSpacing: 1 } as TypeStyle,
} as const;
