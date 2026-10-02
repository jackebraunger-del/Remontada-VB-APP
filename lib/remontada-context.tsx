// Remontada – kleiner globaler App-State. Kein Backend/Server (kommt erst
// ganz am Schluss) – aber der Zustand wird per AsyncStorage lokal auf dem
// Gerät gespeichert, damit er einen App-Neustart überlebt. Bündelt Coins,
// Daily-Reward-Status, Locker/Shop-Besitz, Matches, Ranking,
// Profil-Statistiken und den Club-Session-Zustand, damit die einzelnen
// Screens interaktiv wirken, auch ohne echten Server.
//
// WICHTIG: Beim allerersten Start (nichts gespeichert) ist alles
// Demo-Ausgangszustand (die Beispielmatches mit Maria/Carlos/Laura usw.).
// Über resetDemoData() lässt sich der komplette Zustand – inklusive des
// gespeicherten Stands – auf "frisch, echter Start" zurücksetzen, für den
// Tag, an dem die App wirklich losgeht und die Beispieldaten weg sollen.

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RColors } from '@/constants/remontada-colors';
import { CATEGORY_LABELS, SKILL_LABELS } from '@/constants/remontada-labels';
import {
  CATEGORY_RATINGS,
  LEADERBOARD,
  OPEN_MATCHES,
  PROFILE,
  RECENT_RESULT,
  SESSION_CANT_MAKE_IT,
  SESSION_GOING,
  SKINS,
} from './remontada-mock-data';
import {
  Category,
  CategoryRating,
  CustomCourt,
  Gender,
  LeaderboardEntry,
  OpenMatch,
  PreferredSide,
  RankTier,
  RecentResult,
  SessionPlayer,
  Skin,
  SkillLevel,
} from './remontada-types';

// Neue Spieler/innen brauchen erst 10 gewertete Matches pro Kategorie
// ("Placement Matches"), bevor ihr Rang überhaupt angezeigt wird – wie bei
// vielen Wettkampf-Apps üblich.
export const PLACEMENT_MATCHES_REQUIRED = 10;

const BASE_WIN_DELTA = 24;
const BASE_LOSS_DELTA = 16;

function tierForRating(rating: number): RankTier {
  if (rating >= 1800) return 'Diamond';
  if (rating >= 1500) return 'Gold';
  if (rating >= 1200) return 'Silver';
  return 'Bronze';
}

function skillForRating(rating: number): SkillLevel {
  if (rating >= 1800) return 'Advanced';
  if (rating >= 1500) return 'Intermediate';
  return 'Beginner';
}

export type RewardOutcome = 'coins' | 'skin';

interface JoinRequest {
  playerName: string;
  playerSkill: string;
  targetNet: number;
  votesYes: number;
  votesTotal: number;
  myVote: 'yes' | 'no' | null;
}

export interface NewMatchInput {
  location: string;
  timeLabel: string;
  category: string;
  skill: string;
  ranked: boolean;
}

const DEMO_JOIN_REQUEST: JoinRequest = {
  playerName: 'Elena T.',
  playerSkill: 'Beginner',
  targetNet: 1,
  votesYes: 3,
  votesTotal: 6,
  myVote: null,
};

// Welche Kategorien ein Spieler/eine Spielerin überhaupt haben kann: Mixed
// und Open sind für alle offen, Men/Women sind ans Geschlecht gekoppelt –
// so bekommt niemand einen Rang in einer Kategorie, die nicht passt.
function categoriesForGender(gender: Gender): Category[] {
  return gender === 'Male' ? ['Men', 'Mixed', 'Open'] : ['Women', 'Mixed', 'Open'];
}

function zeroCategoryRatingsFor(gender: Gender): CategoryRating[] {
  return categoriesForGender(gender).map((category) => ({
    category,
    skill: 'Beginner',
    tier: 'Bronze',
    rating: 1000,
    clubRank: 0,
    matches: 0,
    wins: 0,
    losses: 0,
  }));
}

export interface AppDataApi {
  // Economy / Locker
  coins: number;
  dailyRewardClaimedToday: boolean;
  lastRewardOutcome: RewardOutcome | null;
  lastRewardCoins: number;
  skins: Skin[];
  claimDailyReward: () => RewardOutcome;
  equipSkin: (id: string) => void;
  buySkin: (id: string) => boolean;

  // Club Session
  hasActiveSession: boolean;
  bringingNet: boolean;
  bringingBall: boolean;
  joinRequest: JoinRequest | null;
  sessionGoing: SessionPlayer[];
  sessionCantMakeIt: SessionPlayer[];
  toggleBringingNet: () => void;
  toggleBringingBall: () => void;
  castVote: (vote: 'yes' | 'no') => void;
  scheduleSession: () => void;

  // Matches / Play
  matches: OpenMatch[];
  recentResult: RecentResult | null;
  addMatch: (input: NewMatchInput) => void | Promise<void>;

  // Karte: von Nutzern selbst hinzugefügte Orte
  customCourts: CustomCourt[];
  addCustomCourt: (name: string, lat: number, lng: number) => void | Promise<void>;

  // Karte: kurzlebige Übergabe "auf der Karte gewählter Ort" zurück ans
  // Create-Match-Formular (wird NICHT gespeichert, nur zur Laufzeit).
  pendingLocationPick: { name: string; lat: number; lng: number } | null;
  setPendingLocationPick: (loc: { name: string; lat: number; lng: number } | null) => void;

  // Profil / Ranking
  profileVerified: boolean;
  preferredSide: PreferredSide | null;
  categoryRatings: CategoryRating[];
  leaderboard: LeaderboardEntry[];
  setPreferredSide: (side: PreferredSide) => void;
  // Ergebnis eines gewerteten Matches eintragen: aktualisiert Matches/Wins/
  // Losses/Rating/Tier für die Kategorie, inkl. Placement- und
  // Gegner-Wiederholungsregel (siehe recordMatchResult unten).
  recordMatchResult: (category: Category, opponentName: string, won: boolean) => void;

  // Onboarding (Name + Geschlecht bei Anmeldung, für passende Kategorien)
  onboardingComplete: boolean;
  playerName: string;
  gender: Gender | null;
  completeOnboarding: (name: string, gender: Gender) => void | Promise<void>;

  // Alles zurück auf "frischer Start, keine Demo-Daten" (inkl. Onboarding)
  resetDemoData: () => void;
}

export const AppDataContext = createContext<AppDataApi | null>(null);

const STORM_SERVE_UNLOCK_CHANCE = 0.12; // ~90% Coins, kleine Chance auf Skin

// Alles, was lokal auf dem Gerät gespeichert wird, damit es einen
// App-Neustart überlebt. Ein einzelner JSON-Blob unter einem Schlüssel –
// reicht für die Datenmenge hier locker aus.
const STORAGE_KEY = 'remontada:app-state:v1';

interface PersistedState {
  coins: number;
  dailyRewardClaimedToday: boolean;
  lastRewardOutcome: RewardOutcome | null;
  lastRewardCoins: number;
  skins: Skin[];
  hasActiveSession: boolean;
  bringingNet: boolean;
  bringingBall: boolean;
  joinRequest: JoinRequest | null;
  sessionGoing: SessionPlayer[];
  sessionCantMakeIt: SessionPlayer[];
  matches: OpenMatch[];
  customCourts: CustomCourt[];
  recentResult: RecentResult | null;
  profileVerified: boolean;
  preferredSide: PreferredSide | null;
  categoryRatings: CategoryRating[];
  leaderboard: LeaderboardEntry[];
  onboardingComplete: boolean;
  playerName: string;
  gender: Gender | null;
  opponentHistory: Record<string, string[]>;
}

let matchIdCounter = 100;

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [coins, setCoins] = useState(340);
  const [dailyRewardClaimedToday, setDailyRewardClaimedToday] = useState(false);
  const [lastRewardOutcome, setLastRewardOutcome] = useState<RewardOutcome | null>(null);
  const [lastRewardCoins, setLastRewardCoins] = useState(0);
  const [skins, setSkins] = useState<Skin[]>(SKINS);

  const [hasActiveSession, setHasActiveSession] = useState(true);
  const [bringingNet, setBringingNet] = useState(true);
  const [bringingBall, setBringingBall] = useState(false);
  const [joinRequest, setJoinRequest] = useState<JoinRequest | null>(DEMO_JOIN_REQUEST);
  const [sessionGoing, setSessionGoing] = useState<SessionPlayer[]>(SESSION_GOING);
  const [sessionCantMakeIt, setSessionCantMakeIt] = useState<SessionPlayer[]>(SESSION_CANT_MAKE_IT);

  const [matches, setMatches] = useState<OpenMatch[]>(OPEN_MATCHES);
  const [recentResult, setRecentResult] = useState<RecentResult | null>(RECENT_RESULT);
  const [customCourts, setCustomCourts] = useState<CustomCourt[]>([]);

  const [profileVerified, setProfileVerified] = useState(PROFILE.verified);
  const [preferredSide, setPreferredSideState] = useState<PreferredSide | null>(null);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>(CATEGORY_RATINGS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(LEADERBOARD);
  // Letzte (bis zu 2) Gegner pro Kategorie, für die "nicht immer gegen
  // dieselbe Person"-Regel. Nicht über die App-Neustarts hinweg kritisch,
  // wird aber trotzdem gespeichert, damit die Regel konsistent bleibt.
  const [opponentHistory, setOpponentHistory] = useState<Record<string, string[]>>({});
  // Nur zur Laufzeit: "auf der Karte gewählter Ort", wird NICHT gespeichert.
  const [pendingLocationPick, setPendingLocationPick] = useState<{ name: string; lat: number; lng: number } | null>(null);

  // Onboarding startet IMMER als "nicht erledigt" (echtes Verhalten einer
  // frisch installierten App) – erst nach dem Laden des gespeicherten
  // Zustands unten kann das auf true springen, falls schon mal ausgefüllt.
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gender, setGenderState] = useState<Gender | null>(null);

  // Beim ersten Start: gespeicherten Zustand laden (falls vorhanden) und
  // damit die Demo-Werte oben überschreiben. Bis das erledigt ist, zeigen
  // wir nur einen leeren, passend eingefärbten Screen – so blitzen nie
  // kurz die Demo-Werte auf, bevor der echte gespeicherte Stand da ist.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const data = JSON.parse(raw) as Partial<PersistedState>;
          if (typeof data.coins === 'number') setCoins(data.coins);
          if (typeof data.dailyRewardClaimedToday === 'boolean') setDailyRewardClaimedToday(data.dailyRewardClaimedToday);
          if (data.lastRewardOutcome === 'coins' || data.lastRewardOutcome === 'skin' || data.lastRewardOutcome === null) {
            setLastRewardOutcome(data.lastRewardOutcome);
          }
          if (typeof data.lastRewardCoins === 'number') setLastRewardCoins(data.lastRewardCoins);
          if (Array.isArray(data.skins)) setSkins(data.skins);
          if (typeof data.hasActiveSession === 'boolean') setHasActiveSession(data.hasActiveSession);
          if (typeof data.bringingNet === 'boolean') setBringingNet(data.bringingNet);
          if (typeof data.bringingBall === 'boolean') setBringingBall(data.bringingBall);
          if (data.joinRequest !== undefined) setJoinRequest(data.joinRequest);
          if (Array.isArray(data.sessionGoing)) setSessionGoing(data.sessionGoing);
          if (Array.isArray(data.sessionCantMakeIt)) setSessionCantMakeIt(data.sessionCantMakeIt);
          if (Array.isArray(data.matches)) setMatches(data.matches);
          if (Array.isArray(data.customCourts)) setCustomCourts(data.customCourts);
          if (data.recentResult !== undefined) setRecentResult(data.recentResult);
          if (typeof data.profileVerified === 'boolean') setProfileVerified(data.profileVerified);
          if (data.preferredSide !== undefined) setPreferredSideState(data.preferredSide);
          if (Array.isArray(data.categoryRatings)) setCategoryRatings(data.categoryRatings);
          if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
          if (typeof data.onboardingComplete === 'boolean') setOnboardingComplete(data.onboardingComplete);
          if (typeof data.playerName === 'string') setPlayerName(data.playerName);
          if (data.gender === 'Male' || data.gender === 'Female' || data.gender === null) setGenderState(data.gender);
          if (data.opponentHistory && typeof data.opponentHistory === 'object') setOpponentHistory(data.opponentHistory);
        }
      } catch (e) {
        // Kaputte/unlesbare Daten -> einfach bei den Demo-Startwerten bleiben.
        console.warn('Remontada: gespeicherter Zustand konnte nicht geladen werden', e);
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- läuft absichtlich nur einmal beim Mount
  }, []);

  // Jede Änderung an den unten aufgelisteten Werten wird (nach dem initialen
  // Laden) automatisch wieder gespeichert.
  const skipFirstSave = useRef(true);
  useEffect(() => {
    if (!isHydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const payload: PersistedState = {
      coins,
      dailyRewardClaimedToday,
      lastRewardOutcome,
      lastRewardCoins,
      skins,
      hasActiveSession,
      bringingNet,
      bringingBall,
      joinRequest,
      sessionGoing,
      sessionCantMakeIt,
      matches,
      customCourts,
      recentResult,
      profileVerified,
      preferredSide,
      categoryRatings,
      leaderboard,
      onboardingComplete,
      playerName,
      gender,
      opponentHistory,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch((e) => {
      console.warn('Remontada: Zustand konnte nicht gespeichert werden', e);
    });
  }, [
    isHydrated,
    coins,
    dailyRewardClaimedToday,
    lastRewardOutcome,
    lastRewardCoins,
    skins,
    hasActiveSession,
    bringingNet,
    bringingBall,
    joinRequest,
    sessionGoing,
    sessionCantMakeIt,
    matches,
    customCourts,
    recentResult,
    profileVerified,
    preferredSide,
    categoryRatings,
    leaderboard,
    onboardingComplete,
    playerName,
    gender,
    opponentHistory,
  ]);

  const claimDailyReward = useCallback((): RewardOutcome => {
    if (dailyRewardClaimedToday) return lastRewardOutcome ?? 'coins';

    const stormServe = skins.find((s) => s.id === 'storm-serve');
    const canWinSkin = !!stormServe && !stormServe.owned && Math.random() < STORM_SERVE_UNLOCK_CHANCE;

    setDailyRewardClaimedToday(true);

    if (canWinSkin) {
      setSkins((prev) => prev.map((s) => (s.id === 'storm-serve' ? { ...s, owned: true } : s)));
      setLastRewardOutcome('skin');
      return 'skin';
    }

    const amount = 80 + Math.floor(Math.random() * 30); // 80-109 Coins, ~95 im Schnitt
    setCoins((c) => c + amount);
    setLastRewardCoins(amount);
    setLastRewardOutcome('coins');
    return 'coins';
  }, [dailyRewardClaimedToday, lastRewardOutcome, skins]);

  const equipSkin = useCallback((id: string) => {
    setSkins((prev) => prev.map((s) => (s.owned ? { ...s, equipped: s.id === id } : s)));
  }, []);

  const buySkin = useCallback(
    (id: string): boolean => {
      const skin = skins.find((s) => s.id === id);
      if (!skin || skin.owned || !skin.priceCoins || coins < skin.priceCoins) return false;
      setCoins((c) => c - (skin.priceCoins ?? 0));
      setSkins((prev) => prev.map((s) => (s.id === id ? { ...s, owned: true } : s)));
      return true;
    },
    [coins, skins]
  );

  const toggleBringingNet = useCallback(() => setBringingNet((v) => !v), []);
  const toggleBringingBall = useCallback(() => setBringingBall((v) => !v), []);

  // Einfacher Platzhalter, bis es einen echten "Session anlegen"-Flow gibt:
  // markiert nur, dass wieder eine Club Session existiert. Bestehende
  // RSVPs/Vote-Anfragen bleiben unangetastet (nach einem Reset also leer,
  // bis echte Leute sich eintragen).
  const scheduleSession = useCallback(() => {
    setHasActiveSession(true);
  }, []);

  const castVote = useCallback((vote: 'yes' | 'no') => {
    setJoinRequest((prev) => {
      if (!prev || prev.myVote === vote) return prev;
      const undoPrevious = prev.myVote === 'yes' ? -1 : 0;
      const addNew = vote === 'yes' ? 1 : 0;
      return {
        ...prev,
        myVote: vote,
        votesYes: prev.votesYes + undoPrevious + addNew,
      };
    });
  }, []);

  const addMatch = useCallback((input: NewMatchInput) => {
    matchIdCounter += 1;
    const newMatch: OpenMatch = {
      id: `m${matchIdCounter}`,
      location: input.location,
      timeLabel: input.timeLabel,
      tags: ['2 gegen 2', CATEGORY_LABELS[input.category] ?? input.category, SKILL_LABELS[input.skill] ?? input.skill],
      ranked: input.ranked,
      playersJoined: 1,
      playersNeeded: 3,
    };
    setMatches((prev) => [newMatch, ...prev]);
  }, []);

  const setPreferredSide = useCallback((side: PreferredSide) => setPreferredSideState(side), []);

  const addCustomCourt = useCallback((name: string, lat: number, lng: number) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomCourts((prev) => [...prev, { id: `court-${Date.now()}`, name: trimmed, lat, lng }]);
  }, []);

  // Ein gewertetes Ergebnis eintragen. Regeln:
  // - Placement: die ersten 10 Matches pro Kategorie zählen für
  //   Matches/Wins/Losses/Rating wie gewohnt, nur wird der Rang erst ab dem
  //   10. Match überhaupt angezeigt (siehe PLACEMENT_MATCHES_REQUIRED in den
  //   Screens).
  // - Gegner-Wiederholung: 2x hintereinander gegen dieselbe Person ist ok
  //   (volle Punkte). Erst beim 3. Mal in Folge gibt's beim Sieg nur noch
  //   25% der Punkte (Farmen soll sich nicht lohnen) – eine Niederlage
  //   kostet dann aber auch nur die Hälfte der üblichen Punkte.
  const recordMatchResult = useCallback(
    (category: Category, opponentNameRaw: string, won: boolean) => {
      const opponent = opponentNameRaw.trim().toLowerCase();
      if (!opponent) return;

      const prevForCategory = opponentHistory[category] ?? [];
      const isThirdInRowVsSameOpponent =
        prevForCategory.length === 2 && prevForCategory[0] === opponent && prevForCategory[1] === opponent;

      setCategoryRatings((prev) =>
        prev.map((c) => {
          if (c.category !== category) return c;
          const baseDelta = won ? BASE_WIN_DELTA : -BASE_LOSS_DELTA;
          const scale = isThirdInRowVsSameOpponent ? (won ? 0.25 : 0.5) : 1;
          const delta = Math.round(baseDelta * scale);
          const newRating = Math.max(0, c.rating + delta);
          return {
            ...c,
            rating: newRating,
            tier: tierForRating(newRating),
            skill: skillForRating(newRating),
            matches: c.matches + 1,
            wins: c.wins + (won ? 1 : 0),
            losses: c.losses + (won ? 0 : 1),
          };
        })
      );

      setOpponentHistory((prev) => ({
        ...prev,
        [category]: [opponent, ...(prev[category] ?? [])].slice(0, 2),
      }));
    },
    [opponentHistory]
  );

  const completeOnboarding = useCallback((name: string, selectedGender: Gender) => {
    const trimmed = name.trim();
    setPlayerName(trimmed);
    setGenderState(selectedGender);
    // Frischer, zum Geschlecht passender Kategorie-Start (0 Matches, Beginner) –
    // damit z.B. eine Spielerin nie einen "Men"-Rang bekommt.
    setCategoryRatings(zeroCategoryRatingsFor(selectedGender));
    setLeaderboard([{ rank: 1, name: trimmed, skillTier: 'Anfänger Bronze', rating: 1000, isYou: true }]);
    setOnboardingComplete(true);
  }, []);

  const resetDemoData = useCallback(() => {
    setCoins(0);
    setDailyRewardClaimedToday(false);
    setLastRewardOutcome(null);
    setLastRewardCoins(0);
    setSkins((prev) =>
      prev.map((s) => ({
        ...s,
        owned: s.id === 'rookie',
        equipped: s.id === 'rookie',
      }))
    );

    setHasActiveSession(false);
    setBringingNet(false);
    setBringingBall(false);
    setJoinRequest(null);
    setSessionGoing([]);
    setSessionCantMakeIt([]);

    setMatches([]);
    setCustomCourts([]);
    setRecentResult(null);

    setProfileVerified(false);
    setPreferredSideState(null);
    setCategoryRatings([]);
    setLeaderboard([]);
    setOpponentHistory({});

    // Onboarding auch zurücksetzen -> beim nächsten Start wird wieder nach
    // Name/Geschlecht gefragt, wie bei einer echten Neuinstallation.
    setOnboardingComplete(false);
    setPlayerName('');
    setGenderState(null);
  }, []);

  const value = useMemo<AppDataApi>(
    () => ({
      coins,
      dailyRewardClaimedToday,
      lastRewardOutcome,
      lastRewardCoins,
      skins,
      claimDailyReward,
      equipSkin,
      buySkin,
      hasActiveSession,
      bringingNet,
      bringingBall,
      joinRequest,
      sessionGoing,
      sessionCantMakeIt,
      toggleBringingNet,
      toggleBringingBall,
      castVote,
      scheduleSession,
      matches,
      recentResult,
      addMatch,
      customCourts,
      addCustomCourt,
      pendingLocationPick,
      setPendingLocationPick,
      profileVerified,
      preferredSide,
      categoryRatings,
      leaderboard,
      setPreferredSide,
      recordMatchResult,
      onboardingComplete,
      playerName,
      gender,
      completeOnboarding,
      resetDemoData,
    }),
    [
      coins,
      dailyRewardClaimedToday,
      lastRewardOutcome,
      lastRewardCoins,
      skins,
      claimDailyReward,
      equipSkin,
      buySkin,
      hasActiveSession,
      bringingNet,
      bringingBall,
      joinRequest,
      sessionGoing,
      sessionCantMakeIt,
      toggleBringingNet,
      toggleBringingBall,
      castVote,
      scheduleSession,
      matches,
      recentResult,
      addMatch,
      customCourts,
      addCustomCourt,
      pendingLocationPick,
      setPendingLocationPick,
      profileVerified,
      preferredSide,
      categoryRatings,
      leaderboard,
      setPreferredSide,
      recordMatchResult,
      onboardingComplete,
      playerName,
      gender,
      completeOnboarding,
      resetDemoData,
    ]
  );

  if (!isHydrated) {
    // Kurzer Moment beim Start, während der gespeicherte Zustand geladen
    // wird – lieber ein leerer, passend eingefärbter Screen als ein
    // Aufblitzen der Demo-Werte.
    return <View style={styles.loadingScreen} />;
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

const styles = StyleSheet.create({
  loadingScreen: { flex: 1, backgroundColor: RColors.bgApp },
});

export function useAppData(): AppDataApi {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData() muss innerhalb von <AppDataProvider> verwendet werden.');
  return ctx;
}
