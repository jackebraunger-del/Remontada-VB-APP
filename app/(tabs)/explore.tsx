// Dieser Screen war Teil des Standard-Expo-Templates und wird von Remontada
// nicht mehr genutzt (ersetzt durch Home/Map/Play/Ranking/Profile). Die Datei
// lässt sich von hier aus nicht löschen, deshalb leitet sie nur harmlos auf
// Home weiter, falls doch mal jemand darauf verlinkt. Du kannst
// `app/(tabs)/explore.tsx` bei dir lokal einfach löschen.

import { Redirect } from 'expo-router';

export default function ExploreRedirect() {
  return <Redirect href="/" />;
}
