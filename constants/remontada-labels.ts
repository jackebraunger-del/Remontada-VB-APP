// Remontada – deutsche Anzeige-Beschriftungen für Werte, die technisch aus
// der Datenbank/den Mock-Daten kommen (Kategorie, Spielstärke, Match- und
// Ergebnis-Status). Die zugrunde liegenden Werte selbst bleiben unverändert
// (siehe lib/remontada-types.ts und lib/online-types.ts) – nur wie sie dem
// Nutzer angezeigt werden, wird hier an einer Stelle auf Deutsch gepflegt,
// damit kein Screen eigene Übersetzungen erfindet.

export const CATEGORY_LABELS: Record<string, string> = {
  All: 'Alle',
  Men: 'Männer',
  Women: 'Frauen',
  Mixed: 'Mixed',
  Open: 'Offen',
};

export const SKILL_LABELS: Record<string, string> = {
  Beginner: 'Anfänger',
  Intermediate: 'Fortgeschritten',
  Advanced: 'Erfahren',
};

// Status-Werte aus supabase/migrations (match_status, match_results.status) –
// siehe lib/online-types.ts für die genaue Werte-Vereinigung.
export const MATCH_STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  awaiting_confirmation: 'Ergebnis wartet auf Bestätigung',
  completed: 'Abgeschlossen',
  cancelled: 'Abgesagt',
};

export const RESULT_STATUS_LABELS: Record<string, string> = {
  pending: 'Bestätigung ausstehend',
  confirmed: 'Bestätigt',
  disputed: 'Ergebnis angefochten',
};

export const GENDER_LABELS: Record<string, string> = {
  Male: 'Männlich',
  Female: 'Weiblich',
};

export const RARITY_LABELS: Record<string, string> = {
  Common: 'Standard',
  Rare: 'Selten',
  Epic: 'Episch',
  Legendary: 'Legendär',
};

export const SKIN_KIND_LABELS: Record<string, string> = {
  'Avatar Frames': 'Rahmen',
  'Card Themes': 'Karten-Designs',
  'Badge Styles': 'Abzeichen',
  'Avatar Frame': 'Rahmen',
  'Card Theme': 'Karten-Design',
  'Badge Style': 'Abzeichen-Stil',
};
