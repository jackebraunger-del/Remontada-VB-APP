// Remontada – Beispieldaten, 1:1 aus dem Design-Canvas übernommen
// (Las Canteras, Jakob B., 340 Coins, ...). Rein lokal, kein Backend.

import { RColors } from '@/constants/remontada-colors';
import {
  CategoryRating,
  LeaderboardEntry,
  OpenMatch,
  RecentResult,
  SessionNet,
  SessionPlayer,
  Skin,
} from './remontada-types';

export const PROFILE = {
  name: 'Jakob',
  club: 'Las Canteras',
  verified: true,
  matches: 87,
  wins: 54,
  losses: 33,
  winRate: 62,
};

export const CATEGORY_RATINGS: CategoryRating[] = [
  { category: 'Men', skill: 'Intermediate', tier: 'Gold', rating: 1487, clubRank: 34, matches: 28, wins: 15, losses: 13 },
  { category: 'Mixed', skill: 'Advanced', tier: 'Silver', rating: 1731, clubRank: 8, matches: 34, wins: 24, losses: 10 },
  { category: 'Open', skill: 'Intermediate', tier: 'Diamond', rating: 1612, clubRank: 21, matches: 25, wins: 15, losses: 10 },
];

export const OPEN_MATCHES: OpenMatch[] = [
  {
    id: 'm1',
    location: 'Las Canteras – Feld 4',
    timeLabel: 'Heute 18:00',
    tags: ['2 gegen 2', 'Mixed', 'Fortgeschritten'],
    ranked: true,
    playersJoined: 3,
    playersNeeded: 1,
  },
  {
    id: 'm2',
    location: 'Las Canteras',
    timeLabel: '18:00–20:00',
    tags: ['2 gegen 2', 'Mixed', 'Fortgeschritten'],
    ranked: false,
    playersJoined: 3,
    playersNeeded: 1,
    needsWoman: true,
  },
  {
    id: 'm3',
    location: 'Playa del Inglés – Feld 1',
    timeLabel: 'Morgen 09:00',
    tags: ['2 gegen 2', 'Offen', 'Erfahren'],
    ranked: false,
    playersJoined: 2,
    playersNeeded: 2,
    faded: true,
  },
];

export const RECENT_RESULT: RecentResult = {
  id: 'r1',
  teamA: ['Jakob', 'Maria'],
  teamB: ['Carlos', 'Laura'],
  winner: 'A',
  sets: '21–18 · 17–21 · 15–12',
  category: 'Mixed · Fortgeschritten · Gewertet',
  ratingDeltas: [
    { name: 'Jakob', delta: 24 },
    { name: 'Maria', delta: 27 },
  ],
};

export const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Sofia R.', verified: true, skillTier: 'Erfahren Diamond', rating: 2104 },
  { rank: 2, name: 'Carlos M.', skillTier: 'Erfahren Diamond', rating: 2041 },
  { rank: 3, name: 'Laura V.', skillTier: 'Erfahren Gold', rating: 1988 },
  { rank: 21, name: 'Jakob B.', skillTier: 'Fortgeschritten Diamond', rating: 1612, isYou: true },
];

export const SKINS: Skin[] = [
  {
    id: 'rookie',
    name: 'Rookie',
    rarity: 'Common',
    kind: 'Avatar Frame',
    gradientFrom: RColors.text6,
    gradientTo: RColors.text6,
    owned: true,
    priceCoins: 150,
  },
  {
    id: 'sunset-court',
    name: 'Sunset Court',
    rarity: 'Rare',
    kind: 'Avatar Frame',
    gradientFrom: RColors.sunsetTop,
    gradientTo: RColors.sunsetBottom,
    owned: true,
    equipped: true,
  },
  {
    id: 'storm-serve',
    name: 'Storm Serve',
    rarity: 'Epic',
    kind: 'Avatar Frame',
    gradientFrom: RColors.epicPurple,
    gradientTo: RColors.epicPurple,
    owned: false,
    achievementLabel: 'Gewinne 10 gewertete Matches',
    priceCoins: 900,
  },
  {
    id: 'diamond-ace',
    name: 'Diamond Ace',
    rarity: 'Legendary',
    kind: 'Avatar Frame',
    gradientFrom: RColors.legendaryRed,
    gradientTo: RColors.legendaryGlow,
    owned: false,
    achievementLabel: 'Erreiche Erfahren Diamond',
    priceCoins: 1900,
  },
  {
    id: 'season-1',
    name: 'Season 1',
    rarity: 'Rare',
    kind: 'Avatar Frame',
    gradientFrom: RColors.diamondBlue,
    gradientTo: RColors.diamondBlue,
    owned: false,
    seasonOnly: true,
  },
  {
    id: 'verified',
    name: 'Verified',
    rarity: 'Common',
    kind: 'Badge Style',
    gradientFrom: RColors.diamondBlue,
    gradientTo: RColors.diamondBlue,
    owned: true,
  },
];

export const SESSION_NETS: SessionNet[] = [
  {
    id: 1,
    skill: 'Intermediate',
    min: 6,
    max: 8,
    note: 'Erfahrene können jederzeit runter wechseln · Anfänger brauchen ein Ja zum Aufstieg',
  },
  {
    id: 2,
    skill: 'Beginner',
    min: 9,
    max: 12,
    note: 'Fortgeschrittene & Erfahrene können jederzeit runter wechseln',
  },
  {
    id: 3,
    skill: 'Advanced',
    min: 6,
    max: 8,
    note: 'Höchstes Niveau · Anfänger/Fortgeschrittene können den Aufstieg beantragen (braucht ein Ja)',
  },
  {
    id: 4,
    skill: 'Advanced',
    min: 6,
    max: 8,
    note: 'Höchstes Niveau · Anfänger/Fortgeschrittene können den Aufstieg beantragen (braucht ein Ja)',
  },
];

export const SESSION_GOING: SessionPlayer[] = [
  { id: 'p1', name: 'Jakob B.', isYou: true, skill: 'Intermediate', net: 1, equipment: 'Net' },
  { id: 'p2', name: 'Maria G.', skill: 'Advanced', net: 3, equipment: 'Ball' },
  { id: 'p3', name: 'Laura V.', skill: 'Beginner', net: 2, equipment: 'Net' },
  { id: 'p4', name: 'Carlos M.', skill: 'Advanced', net: 4 },
];

export const SESSION_CANT_MAKE_IT: SessionPlayer[] = [
  { id: 'p5', name: 'Pedro R.', skill: 'Beginner', net: 2, cancelled: true },
];
