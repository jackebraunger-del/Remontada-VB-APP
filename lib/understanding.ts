/** WOLKI prototype. Context questions are design drafts, not validated scales. */
export type Answer = string | string[];
export type Answers = Record<string, Answer>;
export type Choice = { id: string; label: string; reply?: string; exclusive?: boolean };
export type Question = { id: string; phase: number; title: string; intro?: string; hint?: string; choices: Choice[]; multi?: boolean; clinical?: boolean };
export const missing = ['unknown', 'private', 'skipped'];
export const nonAnswers: Choice[] = [
  { id: 'unknown', label: 'Weiß ich nicht' },
  { id: 'private', label: 'Möchte ich nicht sagen' },
];
export const frequencies: Choice[] = [
  { id: '0', label: 'Überhaupt nicht' }, { id: '1', label: 'An einzelnen Tagen' },
  { id: '2', label: 'An mehr als der Hälfte der Tage' }, { id: '3', label: 'Beinahe jeden Tag' },
];
const phqStem = 'Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt?';
const base: Question[] = [
  { id: 'mood', phase: 0, title: 'Wie geht es dir gerade?', choices: [
    { id: 'good', label: 'Eigentlich ganz gut', reply: 'Schön, dass es dir gerade ganz gut geht. Auch dann darf hier Platz für deine Sorgen sein.' },
    { id: 'mixed', label: 'Es ist ein Auf und Ab', reply: 'Es schwankt gerade. Wir können gemeinsam sortieren, was dich beschäftigt.' },
    { id: 'low', label: 'Mir geht es nicht gut', reply: 'Das klingt gerade schwer. Wir gehen in deinem Tempo weiter.' },
    { id: 'overwhelmed', label: 'Mir wird gerade alles zu viel', reply: 'Gerade ist es viel. Du kannst jederzeit eine Pause machen oder über SOS direkt Hilfe finden.' },
  ] },
  { id: 'relationship', phase: 1, intro: 'Jetzt zu der Person, deren Situation dich beschäftigt. Du brauchst keinen Namen anzugeben.', title: 'Wer ist diese Person für dich?', choices: [
    { id: 'sibling', label: 'Mein Bruder / meine Schwester / Geschwister' }, { id: 'partner', label: 'Mein:e Partner:in' },
    { id: 'child', label: 'Mein Kind' }, { id: 'parent', label: 'Ein Elternteil' },
    { id: 'friend', label: 'Eine befreundete Person' }, { id: 'other', label: 'Eine andere Person' },
  ] },
  { id: 'situation', phase: 1, title: 'Worum machst du dir gerade am meisten Sorgen?', hint: 'Wähle einen Schwerpunkt. Du musst keine Diagnose kennen.', choices: [
    { id: 'eating', label: 'Essen, Gewicht oder eine bekannte Essstörung', reply: 'Das Thema Essen und Gewicht beschäftigt dich. Wir bleiben bei dem, was du selbst weißt oder beobachtet hast.' },
    { id: 'bullying', label: 'Ausgrenzung, Mobbing oder Demütigungen', reply: 'Ausgrenzung und Demütigungen können auch nahestehende Menschen belasten. Ich möchte verstehen, was bei dir ankommt.' },
    { id: 'withdrawal', label: 'Rückzug oder eine veränderte Stimmung', reply: 'Dir fällt eine Veränderung auf. Über die Ursache müssen wir hier nicht spekulieren.' },
    { id: 'substances', label: 'Alkohol, Drogen oder anderes Suchtverhalten', reply: 'Das beschäftigt dich. Dabei dürfen auch deine eigenen Grenzen eine Rolle spielen.' },
    { id: 'conflict', label: 'Konflikte oder verletzendes Verhalten', reply: 'Auch wie du in dieser Situation behandelt wirst, ist wichtig.' },
    { id: 'other', label: 'Etwas anderes / mehrere Dinge', reply: 'Du musst es noch nicht genau einordnen können. Wir schauen vor allem darauf, was es mit dir macht.' },
  ] },
  ...[
    'Wenig Interesse oder Freude an Ihren Tätigkeiten',
    'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit',
    'Nervosität, Ängstlichkeit oder Anspannung',
    'Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren',
  ].map((title, i): Question => ({
    id: `phq${i + 1}`, phase: 2, title, hint: phqStem, choices: frequencies, clinical: true,
    intro: i === 0 ? 'Jetzt geht es wieder um dich. Vier kurze Aussagen helfen, dein Befinden der letzten zwei Wochen einzuordnen. Ich verwende dafür die Originalformulierungen eines Fragebogens – deshalb steht hier „Sie“.' : undefined,
  })),
  { id: 'impact', phase: 2, intro: 'Wie du mit der Situation lebst, lässt sich nicht auf einen Fragebogenwert reduzieren.', title: 'Was erlebst du im Moment dabei?', hint: 'Mehrere Antworten sind möglich.', multi: true, choices: [
    { id: 'worry', label: 'Meine Gedanken kreisen oft darum' }, { id: 'guilt', label: 'Ich fühle mich schuldig oder verantwortlich' },
    { id: 'exhaustion', label: 'Mir fehlen Schlaf, Kraft oder Erholung' }, { id: 'anger', label: 'Ich bin wütend oder möchte Abstand' },
    { id: 'helpless', label: 'Ich weiß nicht, wie ich helfen kann' }, { id: 'daily', label: 'Mein eigener Alltag leidet darunter' },
    { id: 'manageable', label: 'Ich komme im Moment gut damit zurecht', exclusive: true },
  ] },
  { id: 'support', phase: 2, title: 'Wer unterstützt dich selbst gerade damit?', hint: 'Mehrere Antworten sind möglich.', multi: true, choices: [
    { id: 'trusted', label: 'Eine Person, der ich vertraue' }, { id: 'professional', label: 'Eine Beratungsstelle oder Fachperson' },
    { id: 'peers', label: 'Menschen in einer ähnlichen Situation' }, { id: 'alone', label: 'Bisher niemand', exclusive: true },
  ] },
  { id: 'need', phase: 3, title: 'Was würde dir als Nächstes am meisten helfen?', choices: [
    { id: 'understand', label: 'Meine Situation besser verstehen', reply: 'Dann soll dein Überblick dir zuerst helfen, die Situation zu sortieren.' },
    { id: 'calm', label: 'Selbst etwas zur Ruhe kommen', reply: 'Dann darf der nächste Schritt erst einmal dir selbst helfen.' },
    { id: 'talk', label: 'Ein Gespräch mit der Person vorbereiten', reply: 'Dann suchen wir einen kleinen, möglichen Gesprächseinstieg.' },
    { id: 'boundaries', label: 'Grenzen setzen, ohne mich schuldig zu fühlen', reply: 'Für jemanden da zu sein und eigene Grenzen zu haben, darf zusammenpassen.' },
    { id: 'help', label: 'Passende Hilfe finden', reply: 'Dann schauen wir auf erreichbare Unterstützung – auch für dich selbst.' },
  ] },
  { id: 'selfSafety', phase: 3, intro: 'Bevor wir abschließen, frage ich direkt nach Sicherheit. Deine Antworten werden hier von niemandem live mitgelesen.', title: 'Hast du gerade Gedanken, dir das Leben zu nehmen?', choices: [
    { id: 'yes', label: 'Ja' }, { id: 'no', label: 'Nein' },
  ] },
  { id: 'otherSafety', phase: 3, title: 'Hat die andere Person in den letzten zwei Wochen gesagt, dass sie nicht mehr leben möchte?', hint: 'Es geht um etwas, das sie gesagt hat. Du musst ihre Gedanken nicht einschätzen.', choices: [
    { id: 'yes', label: 'Ja' }, { id: 'no', label: 'Nein, nicht soweit ich weiß' },
  ] },
];
const branches: Record<string, Question> = {
  eating: { id: 'eatingDetail', phase: 1, title: 'Was hast du selbst mitbekommen?', hint: 'Mehrere Antworten sind möglich. Daraus leiten wir keine Diagnose ab.', multi: true, choices: [
    { id: 'diagnosed', label: 'Die Person hat von einer ärztlich festgestellten Essstörung erzählt' },
    { id: 'meals', label: 'Sie lässt Mahlzeiten aus oder meidet gemeinsames Essen' },
    { id: 'fear', label: 'Sie spricht häufig über Angst vor Essen oder Gewichtszunahme' },
    { id: 'change', label: 'Mir fallen Veränderungen auf, die ich nicht einordnen kann' },
    { id: 'urgent', label: 'Sie ist gerade bewusstlos oder reagiert kaum', exclusive: true },
  ] },
  bullying: { id: 'bullyingDetail', phase: 1, title: 'Was hast du selbst mitbekommen?', hint: 'Mehrere Antworten sind möglich.', multi: true, choices: [
    { id: 'told', label: 'Die Person hat mir von Ausgrenzung oder Angriffen erzählt' },
    { id: 'seen', label: 'Ich habe Beleidigungen, Ausgrenzung oder Nachrichten gesehen' },
    { id: 'avoidance', label: 'Sie meidet Schule, Arbeit oder bestimmte Kontakte' },
    { id: 'unsure', label: 'Ich vermute es, weiß aber noch wenig darüber' },
    { id: 'urgent', label: 'Es gibt gerade einen körperlichen Angriff oder eine unmittelbare Bedrohung', exclusive: true },
  ] },
};
export function questionsFor(answers: Answers): Question[] {
  const branch = typeof answers.situation === 'string' ? branches[answers.situation] : undefined;
  return branch ? [...base.slice(0, 3), branch, ...base.slice(3)] : base;
}
export function setAnswer(answers: Answers, id: string, value: Answer): Answers {
  const next = { ...answers, [id]: value };
  if (id === 'situation' && value !== answers.situation) {
    delete next.eatingDetail;
    delete next.bullyingDetail;
  }
  return next;
}
export function toggleChoice(current: Answer | undefined, choice: Choice, choices: Choice[]): string[] {
  const existing = Array.isArray(current) ? current : [];
  if (existing.includes(choice.id)) return existing.filter(id => id !== choice.id);
  if (choice.exclusive) return [choice.id];
  return [...existing.filter(id => !choices.find(c => c.id === id)?.exclusive), choice.id];
}
export function hasAnswer(a: Answer | undefined, id: string): boolean { return Array.isArray(a) ? a.includes(id) : a === id; }
export function scorePHQ4(answers: Answers) {
  const values = ['phq1', 'phq2', 'phq3', 'phq4'].map(id => answers[id]);
  if (!values.every(v => typeof v === 'string' && /^[0-3]$/.test(v))) return null;
  const n = values.map(Number);
  const total = n.reduce((a, b) => a + b, 0);
  return { total, depression: n[0] + n[1], anxiety: n[2] + n[3],
    burden: total <= 2 ? 'geringe' : total <= 5 ? 'leichte' : total <= 8 ? 'mittlere' : 'starke',
    followUp: n[0] + n[1] >= 3 || n[2] + n[3] >= 3 };
}
export function safetyState(answers: Answers): 'urgent' | 'concern' | 'unanswered' | 'no-disclosure' {
  if (hasAnswer(answers.eatingDetail, 'urgent') || hasAnswer(answers.bullyingDetail, 'urgent')) return 'urgent';
  if (answers.selfSafety === 'yes' || answers.otherSafety === 'yes') return 'concern';
  if (answers.selfSafety !== 'no' || answers.otherSafety !== 'no') return 'unanswered';
  return 'no-disclosure';
}
export function reflection(q: Question, answer: Answer): string {
  if (typeof answer === 'string' && missing.includes(answer)) return answer === 'unknown'
    ? 'Du musst es nicht sicher wissen. Diese Angabe bleibt offen.' : 'Das lassen wir offen. Du entscheidest, was du teilen möchtest.';
  const selected = q.choices.filter(c => hasAnswer(answer, c.id));
  if (q.id === 'support') return hasAnswer(answer, 'alone') ? 'Du hast damit bisher keine Unterstützung. Auch für dich darf es Hilfe geben.' : 'Es gibt bereits Unterstützung für dich. Wir können daran anknüpfen.';
  if (q.id === 'impact') {
    if (hasAnswer(answer, 'guilt')) return 'Du fühlst dich verantwortlich oder schuldig. Dieses Gefühl bedeutet nicht, dass du die Situation verursacht hast oder allein lösen musst.';
    if (hasAnswer(answer, 'anger')) return 'Auch Ärger und der Wunsch nach Abstand haben hier Platz.';
    if (hasAnswer(answer, 'manageable')) return 'Du kommst im Moment gut zurecht. Dein Wunsch nach Orientierung hat trotzdem Platz.';
    return 'Danke, dass du beschreibst, was die Situation bei dir auslöst. Das nehmen wir in deinen Überblick mit.';
  }
  return selected[0]?.reply ?? 'Danke. Ich nehme das für deinen Überblick mit.';
}
export function labelsFor(answers: Answers, id: string): string[] {
  const q = questionsFor(answers).find(question => question.id === id);
  return q?.choices.filter(c => hasAnswer(answers[id], c.id)).map(c => c.label) ?? [];
}
export function nextStep(answers: Answers): { title: string; text: string } {
  if (answers.need === 'calm') return { title: 'Ein kleiner Moment für dich', text: 'Wenn es für dich passt: Spüre den Boden unter deinen Füßen. Schau dich um und benenne drei Dinge, die du siehst. Du kannst jederzeit aufhören.' };
  if (answers.need === 'boundaries') return { title: 'Eine Grenze in eigenen Worten', text: 'Ein möglicher Satz: „Du bist mir wichtig. Heute kann ich dir eine Weile zuhören. Danach brauche ich Zeit für mich.“ Passe ihn so an, dass er sich für dich richtig anfühlt.' };
  if (answers.need === 'talk' && answers.situation === 'bullying') return { title: 'Zuhören, bevor ihr Lösungen sucht', text: 'Ein möglicher Einstieg: „Ich habe mitbekommen, dass es schwierig ist. Magst du erzählen? Was wäre für dich gerade hilfreich?“ Bei Kindern und Jugendlichen kann eine vertraute erwachsene Person oder die Schulsozialarbeit unterstützen.' };
  if (answers.need === 'talk') return { title: 'Ein Gespräch ohne Druck beginnen', text: 'Ein möglicher Einstieg: „Mir ist etwas aufgefallen, das mich beschäftigt. Wie geht es dir damit?“ Beschreibe eine konkrete Beobachtung. Lass der Person Raum, auch noch nicht reden zu wollen.' };
  if (answers.need === 'help' && answers.situation === 'eating') return { title: 'Beratung ist auch für Angehörige da', text: 'Eine Beratungsstelle für Essstörungen kann mit dir besprechen, wie du unterstützen kannst und was du selbst brauchst. Du musst dafür keine Diagnose stellen und die Person muss nicht am Gespräch teilnehmen.' };
  if (answers.need === 'help') return { title: 'Unterstützung für dich finden', text: 'Eine vertraute Person, eine Beratungsstelle oder deine Hausarztpraxis kann ein erster Kontakt sein. Du darfst um ein Gespräch über deine eigene Belastung bitten.' };
  return { title: 'Was du weißt – und was offen ist', text: 'Du kannst für dich trennen: Was habe ich wirklich mitbekommen? Was vermute ich? Was löst es bei mir aus? Du musst die Situation der anderen Person nicht vollständig erklären können, um Unterstützung zu bekommen.' };
}
export const exampleAnswers: Record<string, Answers> = {
  eating: { mood: 'low', relationship: 'sibling', situation: 'eating', eatingDetail: ['diagnosed', 'meals'], phq1: '1', phq2: '1', phq3: '2', phq4: '2', impact: ['worry', 'guilt', 'exhaustion'], support: ['alone'], need: 'boundaries', selfSafety: 'no', otherSafety: 'unknown' },
  bullying: { mood: 'mixed', relationship: 'sibling', situation: 'bullying', bullyingDetail: ['told', 'seen'], phq1: '0', phq2: '1', phq3: '1', phq4: '1', impact: ['helpless', 'anger'], support: ['trusted'], need: 'talk', selfSafety: 'no', otherSafety: 'no' },
};
