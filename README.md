# Welcome to your Expo app 👋

## Remontada Online-Beta

Google-Anmeldung mit PKCE, gemeinsame Matches und Ergebnisbestätigung sind für Supabase vorbereitet.
Die Einrichtung steht in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
Ohne Konfiguration erscheint ein Einrichtungshinweis. Die bisherige lokale Demo
ist mit `EXPO_PUBLIC_DEMO_MODE=true` weiterhin verfügbar und lädt keine Daten hoch.

Prüfungen: `npm run typecheck`, `npm run lint`, `npm run test:database`.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Lokal starten (Windows)

1. Abhängigkeiten nach einem neuen Clone einmal installieren:

   ```powershell
   npm.cmd install
   ```

2. Den Entwicklungsserver für die installierte Remontada-Test-App starten:

   ```powershell
   npx.cmd expo start --dev-client
   ```

`npm.cmd` und `npx.cmd` funktionieren auch dann, wenn Windows die PowerShell-Dateien `npm.ps1` und `npx.ps1` blockiert. Dafür muss die PowerShell Execution Policy nicht geändert werden.

Für den Browser kann im laufenden Terminal `w` gedrückt werden. Google OAuth auf einem echten Handy muss mit dem [Development Build](https://docs.expo.dev/develop/development-builds/introduction/) getestet werden. Expo Go kann unter SDK 54 das benötigte Projektschema `wolki://` nicht registrieren und ist deshalb für diese Anmeldung ungeeignet.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
