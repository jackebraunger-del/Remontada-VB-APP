import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Answer, Answers, Choice, exampleAnswers, hasAnswer, labelsFor, missing, nextStep, nonAnswers, questionsFor, reflection, safetyState, scorePHQ4, setAnswer, toggleChoice } from '@/lib/understanding';

const C = { bg: '#f6f5f9', ink: '#282333', muted: '#635b71', purple: '#6541a5', light: '#eee7fa', border: '#ded9e7', white: '#ffffff', red: '#9e324b', redBg: '#fff0f2', mint: '#e6f3ed' };
const KEY = 'wolki:understanding:prototype:v3';
const phases = ['Ankommen', 'Deine Situation', 'Dein Befinden', 'Dein nächster Schritt'];
type Screen = 'welcome' | 'question' | 'note' | 'result' | 'pause' | 'help' | 'sources' | 'premium' | 'review';
type Draft = { answers: Answers; index: number; note: string; savedAt: number };
function validDraft(value: unknown): value is Draft {
  if (!value || typeof value !== 'object') return false;
  const d = value as Draft;
  return !!d.answers && typeof d.answers === 'object' && !Array.isArray(d.answers) && Object.values(d.answers).every(a => typeof a === 'string' || (Array.isArray(a) && a.every(x => typeof x === 'string'))) && Number.isInteger(d.index) && d.index >= 0 && typeof d.note === 'string' && typeof d.savedAt === 'number' && Date.now() - d.savedAt < 7 * 86400000;
}
function Button({ label, onPress, secondary = false, disabled = false }: { label: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, disabled && { opacity: 0.45 }, pressed && { opacity: 0.75 }]}><Text style={[s.buttonText, secondary && { color: C.purple }]}>{label}</Text></Pressable>;
}
function SmallButton({ label, onPress, red = false }: { label: string; onPress: () => void; red?: boolean }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [s.smallButton, pressed && { backgroundColor: C.light }]}><Text style={[s.smallText, red && { color: C.red }]}>{label}</Text></Pressable>;
}
function LinkButton({ label, url }: { label: string; url: string }) {
  const [failed, setFailed] = useState(false);
  return <View><SmallButton label={`${label} ↗`} onPress={() => { setFailed(false); void Linking.openURL(url).catch(() => setFailed(true)); }} />{failed && <Text selectable style={s.small}>Link konnte nicht geöffnet werden: {url}</Text>}</View>;
}
function WolkiMark() { return <View accessibilityElementsHidden style={s.mark}><Text style={s.markText}>w.</Text></View>; }

export default function UnderstandingDialog() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [helpReturn, setHelpReturn] = useState<Screen>('welcome');
  const [pauseReturn, setPauseReturn] = useState<Screen>('welcome');
  const [sourcesReturn, setSourcesReturn] = useState<Screen>('welcome');
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [remember, setRemember] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [example, setExample] = useState('');
  const [editing, setEditing] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const heading = useRef<Text>(null);
  const qs = questionsFor(answers);
  const q = qs[Math.min(index, qs.length - 1)];
  const score = scorePHQ4(answers);
  const safety = safetyState(answers);
  const step = nextStep(answers);
  const current = answers[q.id];
  const storageQueue = useRef(Promise.resolve());
  const enqueueStorage = (write: () => Promise<void>) => {
    storageQueue.current = storageQueue.current.then(write).catch(() => setStorageError('Speichern oder Löschen hat nicht geklappt. Dein Stand ist nur in diesem geöffneten Dialog verfügbar.'));
  };
  useEffect(() => {
    void AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      try { const parsed: unknown = JSON.parse(raw); if (validDraft(parsed)) setDraft(parsed); else void AsyncStorage.removeItem(KEY); }
      catch { void AsyncStorage.removeItem(KEY); }
    }).catch(() => setStorageError('Der gespeicherte Stand konnte nicht geladen werden.'));
  }, []);
  useEffect(() => {
    if (!remember) return;
    const saved = { answers, index, note, savedAt: Date.now() };
    storageQueue.current = storageQueue.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(saved))).catch(() => setStorageError('Dein neuer Stand konnte nicht gespeichert werden. Lass den Dialog geöffnet, wenn du fortsetzen möchtest.'));
  }, [answers, index, note, remember]);
  useEffect(() => {
    scroll.current?.scrollTo({ y: 0, animated: false });
    if (Platform.OS === 'web') {
      const h = heading.current as unknown as { focus?: (options?: { preventScroll: boolean }) => void };
      h?.focus?.({ preventScroll: true });
    }
  }, [screen, index]);

  function go(s: Screen) { setScreen(s); }
  function openHelp() { if (screen !== 'help') setHelpReturn(screen); go('help'); }
  function openSources() { setSourcesReturn(screen); go('sources'); }
  function clearSaved() { setRemember(false); setDraft(null); enqueueStorage(() => AsyncStorage.removeItem(KEY)); }
  function fresh() { clearSaved(); setAnswers({}); setNote(''); setIndex(0); setReply(''); setExample(''); setEditing(false); go('question'); }
  function resume() {
    if (!draft) return;
    setAnswers(draft.answers); setNote(draft.note); setIndex(Math.min(draft.index, questionsFor(draft.answers).length - 1)); setRemember(true); setReply('Willkommen zurück. Schau kurz, ob deine letzte Antwort noch passt. Du kannst alles ändern.'); go('question');
  }
  function loadExample(name: 'eating' | 'bullying') {
    clearSaved(); setAnswers({ ...exampleAnswers[name] }); setIndex(0); setNote(''); setExample(name === 'eating' ? 'Fiktives Beispiel: Schwester mit bekannter Essstörung' : 'Fiktives Beispiel: Bruder erlebt Mobbing'); go('result');
  }
  function advance(value: Answer) {
    const updated = setAnswer(answers, q.id, value);
    setAnswers(updated);
    const requiresHelp = (['selfSafety', 'otherSafety'].includes(q.id) && (value === 'yes' || value === 'unknown')) || hasAnswer(value, 'urgent');
    if (requiresHelp) {
      setReply('');
      setIndex(Math.min(index + 1, questionsFor(updated).length - 1));
      setHelpReturn(editing ? 'review' : index + 1 >= questionsFor(updated).length ? 'note' : 'question');
      setEditing(false); go('help'); return;
    }
    setReply(q.clinical && q.id !== 'phq4' ? '' : q.id === 'phq4' ? 'Danke. Jetzt schauen wir darauf, was die Situation in deinem Alltag bedeutet.' : reflection(q, value));
    if (editing) { setEditing(false); go('review'); return; }
    if (index + 1 >= questionsFor(updated).length) go('note'); else setIndex(index + 1);
  }
  function choose(choice: Choice) {
    if (!q.multi || missing.includes(choice.id)) return advance(choice.id);
    const selected = toggleChoice(current, choice, q.choices);
    if (choice.id === 'urgent' && selected.includes('urgent')) return advance(selected);
    setAnswers(setAnswer(answers, q.id, selected));
  }
  function editQuestion(i: number) { setIndex(i); setReply(''); setEditing(true); go('question'); }
  function back() {
    setReply('');
    if (editing) { setEditing(false); go('review'); }
    else if (index > 0) setIndex(index - 1);
    else go('welcome');
  }
  const Heading = ({ children }: { children: string }) => <Text ref={heading} accessibilityRole="header" {...(Platform.OS === 'web' ? { tabIndex: -1 } : {})} style={s.title}>{children}</Text>;
  const chosenLabel = (id: string) => {
    const value = answers[id];
    if (!value || (Array.isArray(value) && !value.length)) return 'Noch offen';
    if (value === 'skipped') return 'Übersprungen';
    return nonAnswers.find(n => n.id === value)?.label ?? labelsFor(answers, id).join(' · ');
  };
  return <SafeAreaView style={s.safe}>
    <StatusBar style="dark" />
    <View style={s.shell}>
      <View style={s.header}>
        <View style={s.brand}><WolkiMark /><View><Text style={s.brandName}>wolki</Text><Text style={s.brandSub}>Ein bisschen klarer.</Text></View></View>
        <Pressable accessibilityRole="button" accessibilityLabel="SOS – sofort Hilfe finden" onPress={openHelp} style={s.sos}><Text style={s.sosText}>SOS</Text></Pressable>
      </View>
      <View style={s.prototype}><Text style={s.prototypeText}>UNDERSTANDING · TESTVERSION · 18+</Text>{screen !== 'welcome' && screen !== 'pause' && <SmallButton label="Pause" onPress={() => { setPauseReturn(screen); go('pause'); }} />}</View>
      {example !== '' && <View style={s.example}><Text style={s.small}>{example}</Text></View>}
      <ScrollView ref={scroll} style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        {screen === 'welcome' && <>
          <Text style={s.eyebrow}>RAUM FÜR DICH</Text>
          <Heading>Hallo, ich bin Wolki.</Heading>
          <Text style={s.lead}>Wenn dich die Situation eines anderen Menschen beschäftigt, zählt auch, wie es dir damit geht.</Text>
          <View style={s.softCard}><Text style={s.body}>Wir sortieren gemeinsam dein Befinden, deine Sorgen und einen möglichen nächsten Schritt.</Text><Text style={s.small}>Ungefähr 4–5 Minuten · 12–13 kurze Fragen · Alles ist freiwillig.</Text></View>
          <Button label="Lass uns anfangen" onPress={fresh} />
          {draft && <View style={s.card}><Text style={s.body}>Hier liegt noch ein gespeicherter Entwurf vom {new Date(draft.savedAt).toLocaleDateString('de-DE')}.</Text><Button label="Meinen Dialog fortsetzen" secondary onPress={resume} /><SmallButton label="Gespeicherten Entwurf löschen" onPress={clearSaved} /></View>}
          <Text style={s.small}>Diese Vorschau ist zum Ausprobieren mit erfundenen Angaben gedacht. Antworten bleiben zunächst nur im geöffneten Dialog. Sie werden nicht an einen Server geschickt.</Text>
          <Text style={s.small}>Wolki stellt keine Diagnose. Der vollständige Dialog wurde noch nicht klinisch geprüft. Hilfe ist jederzeit über SOS erreichbar.</Text>
          <View style={s.divider} />
          <Text style={s.eyebrow}>SO KÖNNTE SICH EIN ERGEBNIS ANFÜHLEN</Text>
          <Button label="Beispiel: Schwester & Essstörung" secondary onPress={() => loadExample('eating')} />
          <Button label="Beispiel: Bruder & Mobbing" secondary onPress={() => loadExample('bullying')} />
          <SmallButton label="Wissenschaft & Grenzen ansehen" onPress={openSources} />
        </>}
        {screen === 'question' && <>
          <View style={s.progressTrack}><View style={[s.progressFill, { width: `${(index / qs.length) * 100}%` }]} /></View>
          <Text style={s.eyebrow}>{phases[q.phase]} · Frage {index + 1} von {qs.length}{answers.situation === undefined ? '–13' : ''}</Text>
          {reply !== '' && <View accessibilityLiveRegion="polite" style={s.reflection}><Text style={s.reflectionText}>{reply}</Text></View>}
          {q.intro && <Text style={s.body}>{q.intro}</Text>}
          {q.clinical && <Text style={s.clinicalLabel}>DEIN BEFINDEN · PHQ-4 · {q.id.slice(-1)} / 4</Text>}
          {q.clinical && <Text style={s.body}>{q.hint}</Text>}
          <Heading>{q.title}</Heading>
          {!q.clinical && q.hint && <Text style={s.small}>{q.hint}</Text>}
          <View style={s.choices}>
            {[...q.choices, ...nonAnswers].map(choice => {
              const selected = hasAnswer(current, choice.id);
              return <Pressable key={choice.id} accessibilityRole={q.multi && !missing.includes(choice.id) ? 'checkbox' : 'button'} accessibilityState={q.multi && !missing.includes(choice.id) ? { checked: selected } : { selected }} accessibilityLabel={choice.label} onPress={() => choose(choice)} style={({ pressed }) => [s.choice, selected && s.choiceSelected, missing.includes(choice.id) && s.nonAnswer, pressed && { backgroundColor: C.light }]}>
                <Text style={[s.choiceText, missing.includes(choice.id) && { color: C.muted }]}>{choice.label}</Text><Text accessibilityElementsHidden style={s.choiceIcon}>{selected ? '✓' : q.multi && !missing.includes(choice.id) ? '+' : '›'}</Text>
              </Pressable>;
            })}
          </View>
          {q.clinical && <Text style={s.tiny}>PHQ-4 · Deutsche Version: © Prof. Dr. Bernd Löwe, 2015, UKE. Auswertung erst nach vier gültigen Antworten.</Text>}
        </>}
        {screen === 'note' && <>
          <Text style={s.eyebrow}>ZUM ABSCHLUSS · FREIWILLIG</Text>
          <Heading>Gibt es noch etwas, das dir wichtig ist?</Heading>
          <Text style={s.body}>Du kannst etwas in eigenen Worten ergänzen oder direkt zu deinem Überblick gehen.</Text>
          <Text style={s.small}>Diese Notiz wird nicht automatisch ausgewertet oder von jemandem mitgelesen. Wenn du Hilfe brauchst, nutze SOS. Bitte keine Namen oder Kontaktdaten eintragen.</Text>
          <TextInput accessibilityLabel="Deine freiwillige Ergänzung" multiline value={note} maxLength={1000} onChangeText={setNote} placeholder="Was noch Platz haben soll …" placeholderTextColor={C.muted} style={s.input} />
          <Text style={s.tiny}>{note.length} / 1000 Zeichen</Text>
          <Button label="Meinen Überblick ansehen" onPress={() => go('result')} />
          <SmallButton label="Zurück zur letzten Frage" onPress={() => { setIndex(qs.length - 1); go('question'); }} />
        </>}
        {screen === 'result' && <>
          <Text style={s.eyebrow}>DEIN MOMENTANER ÜBERBLICK</Text>
          <Heading>Auch du darfst Unterstützung bekommen.</Heading>
          <Text style={s.lead}>Danke, dass du dir Zeit genommen hast. So habe ich deine Angaben verstanden.</Text>
          {safety === 'urgent' || safety === 'concern' ? <View style={s.alert}><Text style={s.cardTitle}>Hilfe hat jetzt Vorrang</Text><Text style={s.body}>Du hast etwas angegeben, das Unterstützung durch Menschen vor Ort braucht. Ein Fragebogenwert kann diese Angabe nicht entkräften.</Text><Button label="Hilfe ansehen" onPress={openHelp} /></View> : safety === 'unanswered' ? <View style={s.softCard}><Text style={s.body}>Zur Sicherheit sind Angaben offen. Daraus lässt sich keine Entwarnung ableiten. Falls du unsicher bist, kannst du dir Unterstützung holen.</Text><SmallButton label="Hilfe und Kontakte" onPress={openHelp} /></View> : null}
          <View style={s.card}><Text style={s.cardTitle}>Was dich beschäftigt</Text><Text style={s.body}>{labelsFor(answers, 'situation')[0] ?? 'Du hast dein Thema noch offengelassen.'}</Text>{labelsFor(answers, 'relationship').length > 0 && <Text style={s.small}>Es geht um: {labelsFor(answers, 'relationship')[0]}.</Text>}{['eatingDetail', 'bullyingDetail'].map(id => labelsFor(answers, id).length > 0 && <Text key={id} style={s.small}>Nach deiner Angabe: {labelsFor(answers, id).join(' · ')}.</Text>)}<Text style={s.tiny}>Das beschreibt deine Angaben über die Situation, keine Diagnose der anderen Person.</Text></View>
          <View style={s.card}><Text style={s.cardTitle}>Was es gerade mit dir macht</Text><Text style={s.body}>Deine aktuelle Stimmung: {chosenLabel('mood')}.</Text>{labelsFor(answers, 'impact').map(label => <Text key={label} style={s.bullet}>• {label}</Text>)}{!labelsFor(answers, 'impact').length && <Text style={s.small}>Was du dabei erlebst, bleibt noch offen.</Text>}<Text style={s.small}>Unterstützung für dich: {chosenLabel('support')}.</Text><Text style={s.tiny}>Diese Momentaufnahme legt nicht fest, wer du als Mensch bist.</Text></View>
          <View style={s.card}><Text style={s.cardTitle}>Dein Befinden der letzten zwei Wochen</Text>{score ? <><View style={s.scoreRow}><Text style={s.score}>{score.total}<Text style={s.scoreOf}> / 12</Text></Text><Text style={s.scoreLabel}>PHQ-4{ '\n' }Beschwerdewert</Text></View><Text style={s.body}>Deine Antworten ergeben eine {score.burden} Ausprägung der hier erfragten Beschwerden.</Text><Text style={s.small}>Ein Punktwert ist keine Wahrscheinlichkeit, an einer Depression zu leiden. Er erklärt auch nicht, wodurch Beschwerden entstehen.</Text>{score.followUp ? <View style={s.softCard}><Text style={s.body}>Eine der beiden Kurzskalen liegt im Bereich, für den eine weitere Abklärung empfohlen wird. Ein Gespräch mit einer ärztlichen oder psychotherapeutischen Fachperson ist ein sinnvoller nächster Schritt.</Text></View> : <Text style={s.small}>Auch ein niedriger Wert schließt Probleme nicht aus. Wenn du dich belastet fühlst, darfst du unabhängig vom Punktwert Hilfe suchen.</Text>}<Text style={s.tiny}>Niedergeschlagenheit / Freudeverlust: {score.depression}/6 · Angst / Sorgen: {score.anxiety}/6. Der PHQ-4 prüft weder alle Beschwerden noch akute Gefahr.</Text></> : <><Text style={s.body}>Noch kein vollständiger Fragebogenwert.</Text><Text style={s.small}>Mindestens eine der vier Aussagen ist offen. Wolki ergänzt keine fehlenden Antworten und errechnet daraus keinen Wert. Dein übriger Überblick bleibt nutzbar.</Text></>}<SmallButton label="Woher kommt diese Einordnung?" onPress={openSources} /></View>
          {note !== '' && <View style={s.card}><Text style={s.cardTitle}>Deine Ergänzung</Text><Text selectable style={s.body}>{note}</Text><Text style={s.tiny}>Unverändert übernommen, nicht ausgewertet.</Text></View>}
          <Button label="Angaben prüfen oder ändern" secondary onPress={() => go('review')} />
          {safety !== 'urgent' && safety !== 'concern' && <View style={s.nextStep}><Text style={s.eyebrow}>EIN ERSTER SCHRITT · KOSTENLOS</Text><Text style={s.cardTitle}>{step.title}</Text><Text style={s.body}>{step.text}</Text>{answers.situation === 'eating' && <LinkButton label="Beratung für Angehörige finden" url="https://www.bzga-essstoerungen.de/hilfe-finden/welche-beratung-gibt-es/" />}{answers.situation === 'bullying' && <LinkButton label="Fachinformationen zu Mobbing (Englisch)" url="https://www.stopbullying.gov/prevention/support-the-children-involved" />}</View>}
          {safety === 'no-disclosure' && <View style={s.card}><Text style={s.eyebrow}>WENN DU WEITERGEHEN MÖCHTEST</Text><Text style={s.cardTitle}>Üben mit Wolki</Text><Text style={s.body}>Ein Gespräch vorbereiten, Grenzen üben oder kleine Pausen gestalten.</Text><Text style={s.small}>Geplantes Premium-Angebot. Dein Überblick, dieser erste Schritt und SOS bleiben kostenlos.</Text><Button label="Premium-Vorschau ansehen" secondary onPress={() => go('premium')} /></View>}
          <SmallButton label="Zum Anfang" onPress={() => go('welcome')} />
        </>}
        {screen === 'review' && <>
          <Text style={s.eyebrow}>DEINE WORTE ZÄHLEN</Text><Heading>Stimmt das für dich?</Heading><Text style={s.body}>Hier kannst du jede Antwort korrigieren. Dein Überblick wird danach neu zusammengesetzt.</Text>
          {qs.map((question, i) => <Pressable key={question.id} accessibilityRole="button" accessibilityLabel={`Frage ${i + 1} ändern: ${question.title}`} onPress={() => editQuestion(i)} style={s.card}><Text style={s.small}>{i + 1}. {question.title}</Text><Text style={s.body}>{chosenLabel(question.id)}</Text><Text style={s.linkText}>Ändern →</Text></Pressable>)}
          <Button label="Zurück zu meinem Überblick" onPress={() => go('result')} />
        </>}
        {screen === 'help' && <>
          <Text style={[s.eyebrow, { color: C.red }]}>HILFE · JEDERZEIT KOSTENLOS ERREICHBAR</Text><Heading>Du musst das nicht allein klären.</Heading>
          <Text style={s.body}>{safety === 'urgent' ? 'Du hast eine mögliche unmittelbare Gefahr angegeben. Hol bitte jetzt Hilfe vor Ort.' : safety === 'concern' ? 'Danke, dass du das angegeben hast. Gedanken, nicht mehr leben zu wollen, verdienen Unterstützung durch einen Menschen. Aus deiner Antwort allein kann Wolki die Dringlichkeit nicht feststellen.' : 'Auch wenn du nicht sicher weißt, wie ernst die Situation ist, darfst du Unterstützung holen.'}</Text>
          <View style={s.alert}><Text style={s.cardTitle}>Unmittelbare Gefahr oder medizinischer Notfall</Text><Text style={s.body}>In Deutschland und der EU: 112. Zum Beispiel bei Bewusstlosigkeit, einer schweren Verletzung oder wenn jemand sich unmittelbar etwas antun könnte.</Text><LinkButton label="112 anrufen" url="tel:112" /><Text style={s.small}>Bei einem laufenden Angriff in Deutschland erreichst du die Polizei unter 110. Bring dich selbst nicht in Gefahr.</Text><LinkButton label="110 anrufen" url="tel:110" /></View>
          <View style={s.card}><Text style={s.cardTitle}>Mit jemandem sprechen</Text><Text style={s.body}>TelefonSeelsorge in Deutschland: 116 123. Kostenlos, anonym und Tag und Nacht erreichbar. Wenn belegt ist, versuche es erneut.</Text><LinkButton label="116 123 anrufen" url="tel:116123" /><LinkButton label="TelefonSeelsorge online öffnen" url="https://www.telefonseelsorge.de/telefon/" /><Text style={s.small}>Bei dringenden medizinischen Fragen ohne unmittelbare Lebensgefahr: 116 117. Bei aktuellen Suizidgedanken wende dich zeitnah an eine Fachperson oder einen Krisendienst. Wenn du kannst, hole eine vertraute Person dazu.</Text><LinkButton label="116 117 anrufen" url="tel:116117" /></View>
          <Text style={s.small}>Diese Kontakte gelten für Deutschland; 112 gilt EU-weit. Außerhalb Deutschlands nutze passende örtliche Krisenangebote. Wolki löst keinen Notruf aus und überwacht deine Antworten nicht.</Text>
          <Button label="Zum Dialog zurück" secondary onPress={() => go(helpReturn)} />
        </>}
        {screen === 'pause' && <>
          <Text style={s.eyebrow}>DEIN TEMPO</Text><Heading>Eine Pause ist okay.</Heading><Text style={s.lead}>Solange dieser Dialog geöffnet bleibt, bleibt auch dein Stand erhalten.</Text>
          <View style={s.card}><Text style={s.cardTitle}>Später auf diesem Gerät weitermachen?</Text><Text style={s.body}>Du kannst deinen Stand zusätzlich auf diesem Gerät speichern. Andere mit Zugriff auf dieses Browserprofil oder diese App können ihn dann sehen. Die Ablage ist nicht verschlüsselt.</Text><Text style={s.small}>Der Entwurf wird beim nächsten Öffnen nach spätestens sieben Tagen verworfen. Du kannst ihn vorher jederzeit löschen.</Text><Button label={remember ? 'Speichern ist eingeschaltet' : 'Stand auf diesem Gerät speichern'} disabled={remember} onPress={() => { setStorageError(''); setRemember(true); }} secondary />{remember && <SmallButton label="Gespeicherten Stand löschen" onPress={clearSaved} />}</View>
          <Button label="Jetzt fortsetzen" onPress={() => go(pauseReturn)} /><SmallButton label="Zum Startbildschirm" onPress={() => go('welcome')} />
        </>}
        {screen === 'premium' && <>
          <Text style={s.eyebrow}>PREMIUM · KONZEPTVORSCHAU</Text><Heading>Den nächsten Schritt gemeinsam üben.</Heading><Text style={s.lead}>Hier könnte Wolki dich nach dem kostenlosen Überblick weiter begleiten.</Text>
          {[['Act', 'Gespräche vorbereiten und Hilfe organisieren.'], ['Stabilise', 'Kleine Übungen für Erholung und den Umgang mit Anspannung.'], ['Grow', 'Eigene Grenzen und hilfreiche Gewohnheiten vertiefen.']].map(([title, text]) => <View style={s.card} key={title}><Text style={s.cardTitle}>{title}</Text><Text style={s.body}>{text}</Text></View>)}
          <Text style={s.small}>Die Module sind hier noch nicht umgesetzt. Es gibt in dieser Vorschau keinen Kauf und kein Abonnement. Preis, Laufzeit und Kündigung müssten vor einem späteren Kauf klar angezeigt werden.</Text><Button label="Beim kostenlosen Überblick bleiben" onPress={() => go('result')} />
        </>}
        {screen === 'sources' && <>
          <Text style={s.eyebrow}>WISSENSCHAFT & GRENZEN</Text><Heading>Was dieser Dialog aussagen kann.</Heading>
          <Text style={s.body}>Die vier Aussagen zum eigenen Befinden stammen aus dem PHQ-4. Die übrigen Fragen und Gesprächswege sind ein WOLKI-Entwurf. Der gesamte Dialog ist kein validiertes medizinisches Instrument.</Text>
          <View style={s.card}><Text style={s.cardTitle}>PHQ-4: kurze Orientierung</Text><Text style={s.body}>Vier Antworten von 0 bis 3 ergeben 0 bis 12 Punkte. Die ersten zwei Aussagen bilden den PHQ-2, die letzten zwei den GAD-2. Ab 3 Punkten in einer Teilskala wird eine weitere Abklärung empfohlen. Fehlende Angaben werden nicht ersetzt.</Text><Text style={s.small}>Die Punktbereiche beschreiben Beschwerden. Sie sind keine Diagnose, keine Depressionswahrscheinlichkeit und keine Persönlichkeitsanalyse. Die Darstellung als Chat und die Zielgruppe dieses Prototyps sind nicht eigenständig validiert.</Text><LinkButton label="UKE: deutsche Fragebogenfassung" url="https://www.uke.de/dateien/institute/institut-und-poliklinik-f%C3%BCr-psychosomatische-medizin-und-psychotherapie/downloads/gesundheitsfragebogen-phq-4.pdf" /><LinkButton label="Löwe et al.: deutsche Validierung" url="https://pubmed.ncbi.nlm.nih.gov/19616305/" /></View>
          <View style={s.card}><Text style={s.cardTitle}>Angehörige haben eigene Bedürfnisse</Text><Text style={s.body}>NICE nennt bei Essstörungen ausdrücklich auch die emotionale, soziale und praktische Unterstützung von Angehörigen. Daraus leiten wir unsere Fragen nach Erleben und Unterstützung ab; diese Fragen selbst sind keine klinische Skala.</Text><LinkButton label="NICE: Unterstützung für Angehörige" url="https://www.nice.org.uk/guidance/ng69/ifp/chapter/Supporting-parents-family-members-and-carers" /></View>
          <View style={s.card}><Text style={s.cardTitle}>Sicherheit bleibt ein eigener Weg</Text><Text style={s.body}>Direktes Fragen nach Suizidgedanken ist möglich. Eine einzelne Antwort kann jedoch weder Sicherheit bestätigen noch eine verlässliche Risikostufe bestimmen. Die Hilfewege im Prototyp brauchen vor dem Einsatz mit echten Nutzenden eine fachliche Prüfung.</Text><LinkButton label="NIMH: direkt fragen und unterstützen" url="https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide" /><LinkButton label="Deutsche Leitlinie: Diagnostik" url="https://www.leitlinien.de/themen/depression/version-3/kapitel-2" /></View>
          <Text style={s.small}>Quellen geprüft am 3. September 2026. Grundlage sind veröffentlichte Forschung und Leitlinien; keine persönliche Begutachtung oder Freigabe durch die genannten Fachleute.</Text><Button label="Zurück" onPress={() => go(sourcesReturn)} />
        </>}
        {storageError !== '' && <Text accessibilityRole="alert" style={[s.small, { color: C.red }]}>{storageError}</Text>}
      </ScrollView>
      {screen === 'question' && <View style={s.footer}>
        <View style={s.footerNav}><SmallButton label="← Zurück" onPress={back} /><SmallButton label="Überspringen" onPress={() => advance('skipped')} /></View>
        {q.multi && <Button label="Mit meiner Auswahl weiter" disabled={!Array.isArray(current) || current.length === 0} onPress={() => current && advance(current)} />}
      </View>}
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg }, shell: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: C.bg },
  header: { paddingHorizontal: 22, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: C.border, backgroundColor: C.white },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, mark: { width: 43, height: 43, borderRadius: 16, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center' }, markText: { color: C.white, fontWeight: '800', fontSize: 26 },
  brandName: { fontSize: 24, color: C.ink, fontWeight: '800', letterSpacing: -0.8 }, brandSub: { fontSize: 12, color: C.muted }, sos: { minHeight: 44, minWidth: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: C.redBg, borderWidth: 1, borderColor: '#e5b7c1' }, sosText: { fontWeight: '700', color: C.red, fontSize: 14 },
  prototype: { minHeight: 38, paddingHorizontal: 22, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }, prototypeText: { color: C.muted, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  scroll: { flex: 1 }, content: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 32, gap: 18 },
  eyebrow: { fontSize: 11, letterSpacing: 1.4, fontWeight: '700', color: C.purple, lineHeight: 18 }, title: { fontSize: 29, lineHeight: 36, letterSpacing: -0.7, color: C.ink, fontWeight: '700' }, lead: { fontSize: 18, lineHeight: 28, color: C.muted }, body: { fontSize: 16, lineHeight: 25, color: C.ink }, small: { fontSize: 14, lineHeight: 22, color: C.muted }, tiny: { fontSize: 12, lineHeight: 19, color: C.muted },
  softCard: { padding: 18, gap: 12, backgroundColor: C.light, borderRadius: 18 }, card: { backgroundColor: C.white, borderRadius: 18, padding: 20, gap: 12, borderWidth: 1, borderColor: C.border }, cardTitle: { fontSize: 20, fontWeight: '700', lineHeight: 27, color: C.ink },
  button: { minHeight: 52, paddingHorizontal: 18, paddingVertical: 15, borderRadius: 15, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center' }, buttonText: { fontSize: 16, fontWeight: '700', color: C.white, textAlign: 'center', lineHeight: 23 }, secondary: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  smallButton: { minHeight: 44, paddingHorizontal: 8, paddingVertical: 11, justifyContent: 'center', borderRadius: 10 }, smallText: { fontSize: 14, lineHeight: 22, fontWeight: '600', color: C.purple },
  choices: { gap: 10 }, choice: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 17, backgroundColor: C.white, borderRadius: 15, borderWidth: 1, borderColor: C.border, gap: 10 }, choiceSelected: { backgroundColor: C.light, borderColor: C.purple, borderWidth: 2 }, choiceText: { fontSize: 16, lineHeight: 23, color: C.ink, flex: 1 }, choiceIcon: { fontSize: 23, color: C.purple, width: 20, textAlign: 'center' }, nonAnswer: { backgroundColor: 'transparent', borderStyle: 'dashed' },
  reflection: { backgroundColor: C.light, borderRadius: 18, borderTopLeftRadius: 4, padding: 17 }, reflectionText: { fontSize: 15, color: '#4b3670', lineHeight: 24 }, clinicalLabel: { fontSize: 11, color: C.muted, letterSpacing: 1, fontWeight: '700' },
  progressTrack: { height: 4, backgroundColor: C.border, borderRadius: 4 }, progressFill: { height: 4, backgroundColor: C.purple, borderRadius: 4 },
  footer: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 5, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.white, gap: 5 }, footerNav: { flexDirection: 'row', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 4 }, input: { minHeight: 145, textAlignVertical: 'top', backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, fontSize: 16, lineHeight: 25, color: C.ink },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 22, flexWrap: 'wrap' }, score: { fontSize: 48, color: C.purple, fontWeight: '700' }, scoreOf: { fontSize: 22, color: C.muted }, scoreLabel: { fontSize: 14, color: C.muted, lineHeight: 23 }, bullet: { fontSize: 16, color: C.ink, lineHeight: 25 }, nextStep: { backgroundColor: C.mint, padding: 20, borderRadius: 20, gap: 14 }, alert: { padding: 20, gap: 14, borderRadius: 18, backgroundColor: C.redBg, borderWidth: 1, borderColor: '#e5b7c1' },
  example: { backgroundColor: '#f5ebcb', paddingHorizontal: 22, paddingVertical: 10 }, linkText: { color: C.purple, fontWeight: '600', fontSize: 14 },
});
