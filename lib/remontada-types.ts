// Remontada – zentrale Typen für die Mock-Daten.
// (Backend/n8n-Anbindung kommt später – aktuell rein lokale Beispieldaten.)

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type Category = 'Men' | 'Women' | 'Mixed' | 'Open';
export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface CategoryRating {
  category: Category;
  skill: SkillLevel;
  tier: RankTier;
  rating: number;
  clubRank: number;
  matches: number;
  wins: number;
  losses: number;
}

export type PreferredSide = 'Left' | 'Right';

// Bei der Anmeldung abgefragt, damit Kategorie-Ränge Sinn ergeben (eine
// Spielerin bekommt keinen "Men"-Rang, ein Spieler keinen "Women"-Rang).
export type Gender = 'Male' | 'Female';

// Ein von einem Nutzer selbst auf der Karte markierter Ort (z.B. ein Feld,
// das noch nicht in der Standard-Liste ist).
export interface CustomCourt {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface OpenMatch {
  id: string;
  location: string;
  timeLabel: string;
  tags: string[];
  ranked: boolean;
  playersJoined: number;
  playersNeeded: number;
  needsWoman?: boolean;
  faded?: boolean;
}

export interface RecentResult {
  id: string;
  teamA: string[];
  teamB: string[];
  winner: 'A' | 'B';
  sets: string;
  category: string;
  ratingDeltas: { name: string; delta: number }[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  verified?: boolean;
  skillTier: string;
  rating: number;
  isYou?: boolean;
}

export interface Skin {
  id: string;
  name: string;
  rarity: Rarity;
  kind: 'Avatar Frame' | 'Card Theme' | 'Badge Style';
  gradientFrom: string;
  gradientTo: string;
  owned: boolean;
  equipped?: boolean;
  seasonOnly?: boolean;
  achievementLabel?: string;
  priceCoins?: number;
}

export interface SessionNet {
  id: number;
  skill: SkillLevel;
  min: number;
  max: number;
  note: string;
}

export interface SessionPlayer {
  id: string;
  name: string;
  isYou?: boolean;
  skill: SkillLevel;
  net: number;
  equipment?: 'Net' | 'Ball';
  cancelled?: boolean;
}
