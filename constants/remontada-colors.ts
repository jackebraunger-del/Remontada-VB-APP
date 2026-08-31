// Remontada – Farbpalette
//
// Die Design-Mockups nutzen CSS `oklch(...)`-Farben. React Native kann damit
// nichts anfangen, also sind hier die exakt umgerechneten Hex-Werte (per
// culori/OKLCH->sRGB) hinterlegt. `withAlpha` baut daraus bei Bedarf ein
// transparentes `rgba(...)`, genau wie im Design die `/ 0.x`-Varianten.

export const RColors = {
  // Hintergründe
  bgApp: '#090b0e',
  bgAppDeep: '#05080a', // etwas dunklerer Vollbild-Hintergrund (Reward-Screens)
  bgSheet: '#0a0e11',

  // Karten / Kacheln
  card: '#101418',
  cardBorder: '#25292f',

  // Chips / Avatare / Trennlinien
  chip: '#161b20',
  chip2: '#1b2025',
  chip3: '#20252a',
  avatarBg: '#222f3c',
  avatarBorder: '#2c3947',
  divider: '#292e34',
  outline: '#404952',

  // Text-Graustufen (hell -> dunkel)
  textPrimary: '#f0f2f4',
  text2: '#c8ced5',
  text3: '#b8bec5',
  text4: '#a8afb5',
  text5: '#9fa5ac',
  text6: '#81878d',
  text7: '#7b8187',
  text8: '#757b81',
  text9: '#6c7278',
  text10: '#5e646a',
  text11: '#595e64',

  // Akzent (Buttons, Ranked-Badge, Fehler/Verlust)
  accent: '#be222a',
  accentLink: '#e9504d',
  accentHover: '#ff6a65',
  lossRed: '#d55753',

  // Gold / Coins / Rank-Info
  gold: '#e0af3b',
  goldStroke: '#9a6418',
  amber: '#dca331',
  amberIcon: '#eb8656',
  bronze: '#a7694c',

  // Status- & Rarity-Farben
  win: '#54b05a',
  cyan: '#14bbc2',
  diamondBlue: '#65c6e4',
  epicPurple: '#9867e1',
  legendaryRed: '#e24947',
  legendaryGlow: '#f6922e',
  rareOrange: '#ed835e',

  // Gradient-Stops (Sunset-Court-Skin, Shop-Featured-Karte)
  sunsetTop: '#e48233',
  sunsetBottom: '#d64651',
  shopGradTop: '#f65b72',
  shopGradBottom: '#cc2a1b',

  white: '#ffffff',
} as const;

export type RColorName = keyof typeof RColors;

/** Hex-Farbe (z.B. "#be222a") in ein rgba(...) mit gewünschter Deckkraft umwandeln. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
