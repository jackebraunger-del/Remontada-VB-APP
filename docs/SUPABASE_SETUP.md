# Remontada: Anmeldung und gemeinsame Spieldaten aktivieren

Die App ist für Supabase vorbereitet. Ohne Projektkonfiguration zeigt sie einen Einrichtungshinweis; sie fällt nicht still auf Demo-Konten zurück. Das Cloud-Projekt wird im Supabase-Dashboard eingerichtet; die unten beschriebene Datenbankmigration muss dort separat angewendet werden.

## 1. Supabase-Projekt anlegen

Öffne https://supabase.com/dashboard und erstelle ein Projekt. Wähle die gewünschte Region und bewahre das Datenbankpasswort privat auf. Kosten oder kostenpflichtige Tarife nur bewusst aktivieren.

Im Projekt unter **Connect** findest du die **Project URL** und den **Publishable Key** (`sb_publishable_…`). Nur diese beiden Werte gehören in die App. Kein `sb_secret_…`, kein `service_role`-Schlüssel, kein Datenbankpasswort.

## 2. Datenbank einrichten

Öffne im neuen Projekt den **SQL Editor**. Kopiere den vollständigen Inhalt von `supabase/migrations/202608310001_shared_volleyball.sql` hinein und führe ihn einmal aus. Alternativ lässt sich dieselbe Migration über die Supabase CLI anwenden.

Sie erstellt Profile, Spielfelder, Matches, Teilnehmer und Ergebnisse einschließlich Zugriffsregeln. Ist schon eine produktive Datenbank vorhanden, zuerst Tabellen und Namen vergleichen; dieses Skript ist für ein neues Projekt gedacht. Kein bestehendes Schema löschen.

## 3. E-Mail-Codes einrichten

Die App verwendet einen einmaligen E-Mail-Code für Registrierung und Anmeldung, keine Passwörter und keine Weiterleitungslinks.

- E-Mail-Anmeldung und neue Registrierungen unter **Authentication → Sign In / Providers** erlauben.
- Unter **Authentication → Email Templates → Magic Link** eine Vorlage mit `{{ .Token }}` eintragen. Beispiel: `<p>Dein Remontada-Anmeldecode: <strong>{{ .Token }}</strong></p>`.
- Prüfen, dass auch ein neuer Nutzer einen Code erhält. Falls die Projektkonfiguration eine separate Bestätigungsmail für neue Nutzer verwendet, auch deren Vorlage prüfen.
- Für Tests mit anderen Personen einen eigenen SMTP-Versand einrichten. Der Standardversand von Supabase ist eingeschränkt und kann auf Team-Adressen begrenzt sein. Sonst kann eine korrekte App trotzdem keine Codes an deine Freunde senden.
- Rate Limits, kurze Code-Gültigkeit und vor einem öffentlichen Start einen Schutz vor automatisierten Anfragen konfigurieren. CAPTCHA erfordert zusätzlich einen passenden Client-Ablauf; diesen nicht ohne Umsetzung aktivieren.

Offizielle Anleitungen: [E-Mail-Code](https://supabase.com/docs/guides/auth/auth-email-passwordless), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

## 4. App verbinden

Kopiere `.env.example` nach `.env.local` und trage die zwei öffentlichen Projektwerte ein:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://DEIN-PROJEKT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_DEIN_OEFFENTLICHER_SCHLUESSEL
EXPO_PUBLIC_DEMO_MODE=false
```

Starte Expo danach neu: `npx expo start --clear`.

`.env.local` wird von Git ausgeschlossen. Trotzdem sind **alle** `EXPO_PUBLIC_`-Werte später aus der App auslesbar. Die Sicherheit entsteht durch Datenbankrechte und Nutzeranmeldung, nicht durch Verstecken des öffentlichen Schlüssels.

Für einen späteren EAS-Build dieselben öffentlichen Variablen in der verwendeten Build-Umgebung konfigurieren. Die Online-Funktion benötigt Internet. Nicht ohne Konfiguration veröffentlichen.

## 5. Mit vier Testkonten prüfen

1. Konto A: Code anfordern, eingeben, Profil anlegen. App schließen und neu öffnen: Anmeldung bleibt bestehen.
2. Konto B auf einem zweiten Gerät anmelden: kein Profil und keine Demo-Daten von A übernehmen.
3. A erstellt ein **Open**-Match mit einem Starttermin in der nahen Zukunft; A ist automatisch in Team A.
4. B tritt Team A bei; C und D treten Team B bei. Spätestens nach 15 Sekunden oder manuellem Aktualisieren sehen alle dieselben Teilnehmer. Ein fünfter Spieler darf nicht beitreten.
5. Vor der Startzeit darf noch kein Ergebnis gemeldet werden. Danach meldet A das Ergebnis.
6. A, B und Nichtteilnehmer dürfen nicht bestätigen. C oder D kann bestätigen oder widersprechen.
7. Bei Widerspruch ein korrigiertes Ergebnis melden und von der anderen Mannschaft bestätigen lassen. Bestätigte Ergebnisse sind unveränderlich.
8. Ein weiteres Match testen: B sagt ab; A storniert. Fremde Spieler dürfen es nicht stornieren.
9. Internet unterbrechen: fehlgeschlagene Schreibvorgänge dürfen nicht als erfolgreich erscheinen. Bei fehlgeschlagener Aktualisierung bleibt ein sichtbarer Hinweis auf möglicherweise veraltete Daten.
10. Abmelden und anderes Konto verwenden: alle Ansichten müssen zum neuen Konto gehören.

Die Datenbankregeln lassen sich lokal mit `npm run test:database` prüfen. Diese Prüfung ersetzt keinen Test von E-Mail-Versand, Sitzungswiederherstellung, Mobilgerät und echter Supabase-API.

## Umfang dieser ersten Online-Version

- Anmeldung/Registrierung per E-Mail-Code, bestehende Sitzung laden, Abmeldung auf diesem Gerät.
- Gemeinsame Profile und selbst eingetragene Spielfelder.
- Auf Mobilgeräten eine interaktive Karte; im Browser eine Liste gespeicherter Spielfelder mit Koordinateneingabe.
- Casual 2v2-Matches mit echter Zeitangabe, Teams, Kapazitätsprüfung, Beitreten/Absagen und Stornierung durch den Organisator.
- Ergebnisvorschläge, Widerspruch und Bestätigung durch die gegnerische Mannschaft.
- Aktualisierung alle 15 Sekunden im Vordergrund, bei Rückkehr zur App und manuell. Kein Realtime-Abonnement erforderlich.
- Angezeigt werden die letzten 200 nach Startzeit sortierten Matches und 500 neue Spielfelder. Profilzahlen beziehen sich ausdrücklich auf die geladenen Spiele. Vor größerem Betrieb serverseitige Suche und Seitenwechsel ergänzen.
- Profile (Anzeigename, Geschlechtskategorie, bevorzugte Seite), Spielteilnahmen und Ergebnisse sind für angemeldete Nutzer lesbar. E-Mails und Sitzungen liegen nicht in diesen öffentlichen Tabellen.

Die bisherige Demo bleibt mit `EXPO_PUBLIC_DEMO_MODE=true` separat erreichbar. Ihre gespeicherten Beispieldaten werden weder migriert noch hochgeladen. Ranglistenpunkte, Club-Sessions, Coins, Skins, Coach und Demo-Testwebhook sind im Online-Modus nicht freigeschaltet.

Vor einer öffentlichen Veröffentlichung fehlen außerdem Kontolöschung, Profilbearbeitung, Moderation/Spam-Schutz, die fertigen Datenschutztexte, vollständige mobile Tests und eine Prüfung der bestehenden Paket-Sicherheitswarnungen. Native Anmeldesitzungen werden derzeit gemäß Supabase-React-Native-Quickstart in AsyncStorage gespeichert; für erhöhte Anforderungen einen verschlüsselten Sitzungsspeicher ergänzen.

Technische Referenzen: [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/), [Supabase mit React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native), [Datenbankzugriffsschutz](https://supabase.com/docs/guides/database/postgres/row-level-security).
