// Dein ursprünglicher n8n-Verbindungstest – unverändert, nur umgezogen von
// app/(tabs)/index.tsx (das ist jetzt der echte "Home"-Screen von Remontada).
// Erreichbar über /dev-n8n-test, z.B. später zum Testen der Backend-Anbindung.

// Import: wir holen uns das Werkzeug "useState" aus der React-Bibliothek.
import { useState } from 'react';

// Import: wir holen uns vier Bausteine aus der React-Native-Bibliothek.
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Konstante: die feste Web-Adresse unseres n8n-Webhooks (Production URL).
const N8N_WEBHOOK_URL = 'https://jakobus.app.n8n.cloud/webhook/0a9c9144-df7d-4b98-b33b-7495a0457f8e';

// Haupt-Komponente: die Funktion, die unseren gesamten Bildschirm beschreibt.
export default function DevN8nTestScreen() {
  // State-Variable "status": aktueller Text, Startwert "Noch nicht verbunden".
  const [status, setStatus] = useState('Noch nicht verbunden');

  // State-Variable "reply": die Antwort von n8n, Startwert leerer Text.
  const [reply, setReply] = useState('');

  // Funktion, die ausgeführt wird, sobald der Button gedrückt wird.
  async function handlePress() {
    // Setzt den Status sofort auf "Verbinde...".
    setStatus('Verbinde...');

    // try { ... } -> "versuch, den folgenden Code auszuführen."
    try {
      // Die eigentliche Anfrage an n8n.
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hallo Wolki',
          source: 'mobile-app',
        }),
      });

      // NEU: Wir prüfen den Statuscode der Antwort, bevor wir sie
      // als Erfolg behandeln. response.ok ist "true" bei Codes 200-299
      // (Erfolg) und "false" bei z. B. 404 oder 500 (Fehler).
      if (!response.ok) {
        // throw new Error(...) -> löst absichtlich einen Fehler aus,
        // der dann unten im catch-Block landet.
        throw new Error('Server hat mit Fehlercode geantwortet: ' + response.status);
      }

      // Antwort-Text zurück in ein JavaScript-Objekt umwandeln.
      const data = await response.json();

      // Erfolg: Status und Antwort in den State eintragen.
      setStatus('Verbunden');
      setReply(data.reply);
    } catch (error) {
      // catch (error) { ... } -> läuft NUR, wenn im try-Block etwas
      // schiefgegangen ist (z. B. kein Internet, n8n nicht erreichbar,
      // ungültige Antwort). "error" enthält Infos zum Problem.

      // Zeig eine verständliche Fehlermeldung auf dem Bildschirm an,
      // statt dass die App einfach nichts mehr tut.
      setStatus('Verbindung fehlgeschlagen.');

      // Leert eine eventuell vorherige Antwort, damit keine alten
      // Daten stehen bleiben.
      setReply('');

      // console.error gibt den echten technischen Fehler im Terminal
      // aus - nützlich für uns zum Debuggen, sieht der Nutzer nicht.
      console.error('Fehler beim Verbinden mit n8n:', error);
    }
    // Ende von try/catch
  }

  // "return (...)" -> ab hier beschreiben wir, was auf dem Bildschirm
  // zu sehen sein soll (JSX).
  return (
    // Äußerster Container, der alles andere umschließt.
    <View style={styles.container}>
      {/* Zeigt den Text "Remontada" an, formatiert mit styles.title */}
      <Text style={styles.title}>Remontada</Text>

      {/* Zeigt den Text "Verbindungstest" an, formatiert mit styles.subtitle */}
      <Text style={styles.subtitle}>Verbindungstest</Text>

      {/* Ein anklickbares Element. onPress={handlePress} -> ruft die
          Funktion handlePress auf, sobald jemand draufdrückt. */}
      <Pressable style={styles.button} onPress={handlePress}>
        {/* Der sichtbare Text INNERHALB des Buttons */}
        <Text style={styles.buttonText}>Mit n8n verbinden</Text>
      </Pressable>

      {/* Feste Beschriftung "Status:" */}
      <Text style={styles.label}>Status:</Text>

      {/* Zeigt den AKTUELLEN WERT der Variable "status" an. */}
      <Text style={styles.status}>{status}</Text>

      {/* reply ? (...) : null -> zeig den Antwort-Bereich nur, wenn
          reply einen Wert hat. */}
      {reply ? (
        <>
          {/* Feste Beschriftung "Antwort:" */}
          <Text style={styles.label}>Antwort:</Text>

          {/* Zeigt den AKTUELLEN WERT der Variable "reply" an. */}
          <Text style={styles.status}>{reply}</Text>
        </>
      ) : null}
      {/* Ende des Containers */}
    </View>
  );
  // Ende der return-Anweisung
}

// StyleSheet.create({...}) -> definiert alle Formatierungen an einem
// zentralen Ort, wie ein verschachteltes Dictionary.
const styles = StyleSheet.create({
  // Formatierung für den äußeren Container.
  container: {
    flex: 1, // nimmt den kompletten verfügbaren Platz auf dem Bildschirm ein
    alignItems: 'center', // zentriert Inhalte horizontal
    justifyContent: 'center', // zentriert Inhalte vertikal
    padding: 24, // Innenabstand zum Rand des Containers, in Pixeln
    gap: 12, // Abstand zwischen den einzelnen Kind-Elementen, in Pixeln
    backgroundColor: '#000', // explizit Schwarz, unabhängig vom Geräte-Theme
  },

  // Formatierung für den Titel "WOLKI".
  title: {
    fontSize: 32, // Schriftgröße in Pixeln
    fontWeight: 'bold', // fette Schrift
    color: '#fff', // Textfarbe Weiß
  },

  // Formatierung für den Untertitel "Verbindungstest".
  subtitle: {
    fontSize: 18, // Schriftgröße in Pixeln
    marginBottom: 24, // Abstand nach unten, zum nächsten Element
    color: '#fff', // Textfarbe Weiß
  },

  // Formatierung für den Button selbst (die anklickbare Fläche).
  button: {
    backgroundColor: '#1D3D47', // Hintergrundfarbe des Buttons
    paddingVertical: 12, // Innenabstand oben/unten
    paddingHorizontal: 24, // Innenabstand links/rechts
    borderRadius: 8, // abgerundete Ecken, in Pixeln
  },

  // Formatierung für den Text INNERHALB des Buttons.
  buttonText: {
    color: 'white', // Textfarbe Weiß (Farbname statt Hex-Code, identisch zu '#fff')
    fontSize: 16, // Schriftgröße in Pixeln
  },

  // Formatierung für die Beschriftungen "Status:" und "Antwort:".
  label: {
    marginTop: 24, // Abstand nach oben, zum vorherigen Element
    fontSize: 14, // Schriftgröße in Pixeln
    color: '#aaa', // helleres Grau, gut lesbar auf Schwarz
  },

  // Formatierung für die eigentlichen Werte (Status-Text, Antwort-Text).
  status: {
    fontSize: 18, // Schriftgröße in Pixeln
    fontWeight: '600', // etwas fettere Schrift
    color: '#fff', // Textfarbe Weiß
  },
  // Ende von StyleSheet.create
});
