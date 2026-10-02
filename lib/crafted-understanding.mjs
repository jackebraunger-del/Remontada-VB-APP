// Canonical authored dialogue. Excalidraw, the transcript and the local player
// are generated from these same explicit transitions.
const nodes = [];
const c = (id, label, reply, next, extra = {}) => ({ id, label, reply, next, ...extra });
const open = next => [
  c('unknown', 'Weiß ich nicht', 'Das ist völlig okay. Du musst nichts erraten.', next, { missing: true }),
  c('private', 'Möchte ich nicht sagen', 'Das ist in Ordnung. Du entscheidest, was du erzählen möchtest.', next, { missing: true }),
  c('skip', 'Diese Frage überspringen', 'Kein Problem. Wir gehen einfach weiter.', next, { missing: true }),
];
function node(id, section, title, intro, choices, extra = {}) { nodes.push({ id, section, title, intro, choices, kind: 'question', ...extra }); }
function q(id, section, title, intro, choices, next, extra = {}) { node(id, section, title, intro, [...choices, ...open(next)], extra); }
function screen(id, section, title, intro, choices, extra = {}) { node(id, section, title, intro, choices, { kind: 'screen', ...extra }); }
function router(id, section, title, rules) { node(id, section, title, '', [], { kind: 'router', rules }); }
const fit = 'F1';
const urgent = (id, label, resume = fit) => c(id, label, 'Danke, dass du das sagst. Das könnte ein Notfall sein. Bitte hol jetzt Hilfe vor Ort.', 'H1', { help: true, resume });
const crisis = (id, label, resume = fit) => c(id, label, 'Danke, dass du das nicht für dich behältst. Bitte sprich jetzt mit einem Menschen darüber. Du musst die Dringlichkeit nicht allein einschätzen.', 'H2', { help: true, resume });

screen('START', 'A', 'Hallo, ich bin Wolki. Schön, dass du da bist.', 'Manchmal nimmt uns die Sorge um einen anderen Menschen so sehr mit, dass für die eigenen Gefühle kaum Platz bleibt. Hier darf es auch um dich gehen.\n\nWir beginnen kurz bei dir. Danach schauen wir gemeinsam auf deine Sorge und darauf, was dir jetzt helfen könnte.\n\nMeist sind es 13–16 kurze Fragen und Übergänge. Plane ungefähr 5–8 Minuten ein. Du kannst jederzeit etwas offenlassen, zurückgehen oder eine Pause machen.', [
  c('start', 'Ja, lass uns anfangen', 'Danke. Wir beginnen ganz in Ruhe bei dir.', 'A1'),
  c('help', 'Ich brauche gerade dringend Hilfe', 'Dann schauen wir direkt nach Unterstützung.', 'H0', { resume: 'START' }),
  c('about', 'Was passiert mit meinen Angaben?', 'Das zeige ich dir kurz.', 'INFO'),
], { note: 'Zeitangabe ist eine zu prüfende Schätzung. Vollständiger redaktioneller Entwurf, keine klinische Freigabe. Der breite Themenkatalog verlängert den einzelnen Weg nicht.' });
screen('INFO', 'A', 'Deine Angaben bleiben geschützt.', 'Wir verarbeiten deine Angaben, um Wolki zu verbessern. Wir geben sie nicht an Dritte weiter.\n\nDu entscheidest selbst, welche Fragen du beantworten möchtest.', [
  c('start', 'Okay, wir können anfangen', 'Gut. Wenn sich eine Frage nicht richtig anfühlt, darfst du sie einfach offenlassen.', 'A1'),
  c('back', 'Zur Begrüßung', 'Wir gehen zurück zum Anfang.', 'START'),
], { note: 'Vor Veröffentlichung mit Datenschutzerklärung und tatsächlichem Datenfluss abgleichen. Insbesondere Hosting, Analyse, KI und technische Dienstleister müssen von dieser Aussage korrekt erfasst sein.' });
q('A1', 'A', 'Bevor wir über die andere Person sprechen: Wie geht es dir gerade mit allem?', 'Es geht jetzt nur um dich. Du musst nichts erklären oder begründen – ein erster Eindruck reicht.', [
  c('good', 'Eigentlich ganz gut', 'Das freut mich. Und auch wenn es dir gerade ganz gut geht, darf deine Sorge hier Platz haben.', 'A2'),
  c('mixed', 'Mal so, mal so', 'Das kann ich verstehen. Es muss sich nicht alles eindeutig anfühlen.', 'A2'),
  c('worried', 'Ich bin angespannt oder besorgt', 'Das klingt anstrengend. Danke, dass du es mir sagst. Wir schauen ganz in Ruhe darauf.', 'A2'),
  c('low', 'Mir geht es gerade schlecht', 'Das tut mir leid. Wir gehen langsam weiter, und du darfst jederzeit eine Pause machen.', 'A2'),
  c('overwhelmed', 'Es ist mir gerade alles zu viel', 'Dann musst du jetzt nicht alles lösen. Wir machen nur einen kleinen Schritt nach dem anderen.', 'A2'),
], 'A2', { purpose: 'Aktuelle Selbstauskunft; passt den Einstieg an. Keine Skala, keine Charakterzuordnung.' });
q('A2', 'A', 'Danke. Jetzt zu der Person, um die du dir Sorgen machst: Wer ist sie für dich?', 'Einen Namen brauche ich nicht. Mir hilft nur zu verstehen, in welcher Beziehung ihr zueinander steht.', [
  c('sibling', 'Meine Schwester, mein Bruder oder ein Geschwister', 'Verstanden. Dann geht es um jemanden aus deiner Familie, der dir nahesteht.', 'A3'),
  c('partner', 'Mein:e Partner:in oder eine frühere Beziehung', 'Dann behalten wir auch im Blick, was die Situation zwischen euch auslöst.', 'A3'),
  c('child', 'Mein Kind oder ein Kind, dem ich nahestehe', 'Ich verstehe. Als wichtige Bezugsperson trägst du wahrscheinlich einiges mit.', 'A3'),
  c('parent', 'Ein Elternteil oder ein anderes Familienmitglied', 'Dann schauen wir auf eure Situation und auch darauf, wie es dir damit geht.', 'A3'),
  c('friend', 'Ein:e Freund:in oder eine befreundete Person', 'Auch in einer Freundschaft kann man sehr viel mittragen.', 'A3'),
  c('other', 'Jemand aus Schule, Arbeit oder meinem weiteren Umfeld', 'Das reicht völlig. Die genaue Bezeichnung ist nicht entscheidend.', 'A3'),
], 'A3', { purpose: 'Beziehungskontext ohne Namen oder unnötige Daten über Dritte.' });
q('A3', 'A', 'Was macht dir bei dieser Person im Moment am meisten Sorgen?', 'Vielleicht kommen mehrere Dinge zusammen. Wähle erst einmal den Bereich, der dir gerade am schwersten im Kopf liegt.', [
  c('foodBody', 'Essen, Körper oder Gewicht', 'Gut. Wir schauen gleich genauer, worum es dabei geht.', 'A3E'),
  c('feelings', 'Gefühle, Rückzug, Angst oder starke Selbstzweifel', 'Das kann sich sehr unterschiedlich zeigen. Wir grenzen es behutsam ein.', 'A3P'),
  c('development', 'Schule, Entwicklung, ADHS / Autismus oder Behinderung', 'Wir schauen auf die konkrete Alltagssituation, ohne vorschnell etwas zu bewerten.', 'A4'),
  c('relations', 'Mobbing, Streit, Kontrolle oder Gewalt', 'Dann klären wir zuerst, was passiert und ob sich jemand unsicher fühlt.', 'A3R'),
  c('addiction', 'Alkohol, Substanzen, Glücksspiel oder Gaming', 'Wir bleiben bei konkreten Auswirkungen und bei deinen Grenzen.', 'SU1'),
  c('careOther', 'Erkrankung, Pflege, Trauer oder etwas anderes', 'Dann schauen wir, welcher Weg deiner Sorge am ehesten gerecht wird.', 'A3K'),
], 'C1', { purpose: 'Höchstens sechs grobe Bereiche. Eine zusätzliche Frage führt zum konkreten Themenweg; Themenwechsel verwirft alte Zweigantworten und die alte Empfehlung.' });

q('A3E', 'A', 'Geht es dabei eher um das Essen oder um den Körper?', 'Es geht weiterhin um die andere Person. Eine grobe Richtung reicht.', [
  c('eating', 'Essen oder eine bekannte Essstörung', 'Wir unterscheiden, was dir erzählt wurde und was du selbst beobachtest.', 'E1'),
  c('body', 'Gewicht, Körperbild oder abwertende Kommentare', 'Wir schauen darauf, von wem die Sorge ausgeht und was sich die Person wünscht.', 'W1'),
], 'AI0', { purpose: 'Kurze Präzisierung nach der Grobauswahl; keine Diagnose aus Aussehen oder Essverhalten ableiten.' });

q('A3P', 'A', 'Was beschreibt deine Sorge am ehesten?', 'Du musst keine Diagnose kennen. Wähle, was du tatsächlich mitbekommst.', [
  c('mood', 'Die Person zieht sich zurück oder wirkt niedergeschlagen', 'Was du wahrnimmst, reicht für den nächsten Schritt. Du musst es nicht diagnostizieren.', 'D1'),
  c('anxiety', 'Angst, Panik oder starkes Vermeiden', 'Wir schauen auf konkrete Situationen und darauf, was sie bei dir auslösen.', 'AN1'),
  c('selfworth', 'Starke Selbstzweifel oder „Ich bin nicht genug“', 'Wir bleiben bei ihren Worten und bei dem, was du wirklich bemerkst.', 'SW1'),
  c('suicide', 'Selbstverletzung oder Aussagen, nicht mehr leben zu wollen', 'Gut, dass du das ansprichst. Wir schauen zuerst nach unmittelbarer Hilfe.', 'U1'),
], 'AI0', { purpose: 'Beobachtbare oder mitgeteilte Belastung auswählen; keine Ferndiagnose.' });

q('A4', 'A', 'Worum geht es in Schule, Entwicklung oder Alltag am ehesten?', 'Es geht weiterhin um die andere Person. Wähle den wichtigsten Bereich.', [
  c('neuro', 'ADHS, Autismus oder andere Neurodivergenz', 'Wir trennen eine bekannte Diagnose, eine fachliche Vermutung und deine eigenen Beobachtungen.', 'ND1'),
  c('disability', 'Behinderung, Entwicklung oder langfristige Unterstützung', 'Wir schauen auf Barrieren, Teilhabe und passende Unterstützung.', 'BH1'),
  c('school', 'Schule, Lernen, Anwesenheit oder Leistungsdruck', 'Wir schauen darauf, was konkret passiert und wer bereits davon weiß.', 'SCH1'),
  c('family', 'Familienalltag, Grenzen oder zu viel Verantwortung', 'Dann schauen wir auf konkrete Situationen und die Verteilung der Verantwortung.', 'FA1'),
], 'AI0', { purpose: 'Überschaubare Themenauswahl. Behinderung und Neurodivergenz werden nicht als Krankheit oder Charakterfehler behandelt.' });

q('A3R', 'A', 'Geht es eher um Ausgrenzung oder um Konflikte und Sicherheit?', 'Wir trennen das, weil daraus unterschiedliche nächste Schritte entstehen.', [
  c('bullying', 'Mobbing, Ausgrenzung oder wiederholte Abwertung', 'Wir schauen zuerst, in welchem Umfeld das passiert.', 'M1'),
  c('conflict', 'Streit, Kontrolle, Drohungen oder Gewalt', 'Dein Gefühl von Sicherheit und deine Grenzen zählen.', 'V1'),
], 'AI0', { purpose: 'Ausgrenzung und Beziehungskonflikte getrennt weiterleiten; akute Gefahr bleibt jederzeit über Hilfe erreichbar.' });

q('A3K', 'A', 'Geht es um Krankheit, Pflege, Trauer oder um etwas anderes?', 'Wenn kein fester Weg passt, darfst du dein Anliegen später kurz selbst beschreiben.', [
  c('care', 'Erkrankung, Pflege oder Trauer', 'Das kann den Alltag und die Beziehung stark verändern.', 'K1'),
  c('own', 'Etwas anderes', 'Dann darf dein Anliegen in deinen eigenen Worten Platz bekommen.', 'AI0'),
], 'AI0', { purpose: 'Fester Versorgungsweg oder transparenter eigener Weg ohne behauptete KI-Funktion.' });

q('ND1', 'ND', 'Was weißt du über ADHS, Autismus oder eine andere Neurodivergenz bei dieser Person?', 'Eine Diagnose dürfen nur qualifizierte Fachpersonen stellen. Hier reicht, woher deine Information kommt.', [
  c('diagnosed', 'Die Person oder ihre Familie hat mir von einer Diagnose erzählt', 'Danke. Wir behandeln das als mitgeteilten Kontext und prüfen die Diagnose hier nicht nach.', 'ND2'),
  c('professional', 'Eine Fachperson oder die Schule hat eine Abklärung angesprochen', 'Dann ist eine Möglichkeit im Raum, aber noch keine sichere Einordnung.', 'ND2'),
  c('waiting', 'Eine Abklärung läuft oder die Person wartet darauf', 'Warten und Ungewissheit können für alle Beteiligten anstrengend sein.', 'ND2'),
  c('observed', 'Ich bemerke bestimmte Muster, kenne aber keine Diagnose', 'Gut, dass du das unterscheidest. Wir bleiben bei konkreten Situationen.', 'ND2'),
  c('boundary', 'Die Person möchte darüber nicht mit mir sprechen', 'Diese Grenze zählt. Deine eigene Belastung darf trotzdem Thema sein.', 'ND3'),
], 'ND2', { sources: ['nice-adhd', 'nice-autism-diagnosis'], purpose: 'Keine Symptom-Checkliste zur Ferndiagnose. Quelle der Information und Selbstbestimmung der anderen Person sichtbar halten.' });
q('ND2', 'ND', 'Was macht den Alltag im Moment am schwierigsten?', 'Wähle die wichtigste konkrete Situation. Unterschiedliche Menschen erleben dieselbe Diagnose sehr verschieden.', [
  c('organising', 'Aufmerksamkeit, Planen oder Anforderungen in Schule und Arbeit', 'Dann geht es um Anforderungen und darum, welche Struktur wirklich hilft.', 'ND3'),
  c('impulses', 'Unruhe, impulsives Handeln oder häufige Konflikte', 'Das kann anstrengend sein. Es sagt noch nichts über den Charakter der Person aus.', 'ND3'),
  c('sensory', 'Reize, Veränderungen oder unvorhersehbare Situationen', 'Dann können Umgebung, Vorbereitung und Rückzugsmöglichkeiten wichtig sein.', 'ND3'),
  c('communication', 'Missverständnisse, Kommunikation oder soziale Situationen', 'Wir schauen auf konkrete Missverständnisse, ohne Motive zu unterstellen.', 'ND3'),
  c('sleep', 'Schlaf, Erschöpfung oder dauernde Überforderung', 'Das kann die Person und ihr Umfeld stark belasten.', 'ND3'),
  c('unsafe', 'Ich habe Angst, dass sich gerade jemand verletzen könnte', 'Danke, dass du das sagst. Wir klären zuerst die unmittelbare Sicherheit.', 'H0', { help: true, resume: 'ND3' }),
], 'ND3', { sources: ['nice-adhd', 'nice-autism-support'], purpose: 'Alltagswirkung in mehreren Lebensbereichen statt Diagnose aus einzelnen Verhaltensweisen.' });
q('ND3', 'ND', 'Welche Unterstützung oder Anpassung gibt es schon?', 'Uns interessiert, was tatsächlich hilft und was der Person selbst wichtig ist.', [
  c('works', 'Es gibt Struktur oder Anpassungen, die spürbar helfen', 'Das ist ein guter Anhaltspunkt: Hilfreiches darf konkret benannt und beibehalten werden.', fit),
  c('schoolhelp', 'Schule, Arbeit oder eine Fachperson unterstützt bereits', 'Dann gibt es schon eine Ansprechstelle, mit der die Person weiterdenken kann.', fit),
  c('waiting', 'Unterstützung wurde angefragt, aber wir warten noch', 'Wartezeiten und Zuständigkeitsfragen können viel Kraft kosten.', fit),
  c('mismatch', 'Es gibt Hilfe, aber sie passt noch nicht gut', 'Dann ist die Rückmeldung der betroffenen Person besonders wichtig.', fit),
  c('none', 'Nach meinem Wissen gibt es noch keine passende Unterstützung', 'Du musst die Lücke nicht allein schließen.', fit),
  c('boundary', 'Die Person möchte nicht, dass ich mich einmische', 'Ihre Grenze bleibt bestehen. Du darfst trotzdem Unterstützung für dich suchen.', fit),
], fit, { sources: ['nice-adhd', 'nice-autism-support'], note: 'Stärken, Interessen und Wünsche der Person im späteren Gespräch ausdrücklich mit aufnehmen; keine pauschale Normalisierung oder Verhaltenskontrolle als Ziel.' });

q('BH1', 'BH', 'Worum geht es bei dem Unterstützungsbedarf am ehesten?', 'Die Bezeichnung allein sagt wenig über den Alltag. Wähle nur, was du sicher weißt.', [
  c('physical', 'Bewegung, körperliche Funktionen oder Barrierefreiheit', 'Dann schauen wir auf konkrete Zugänge, Aufgaben und Unterstützung.', 'BH2'),
  c('sensory', 'Sehen, Hören oder andere Sinneswahrnehmung', 'Dann können Zugänglichkeit und passende Kommunikation entscheidend sein.', 'BH2'),
  c('development', 'Lernen, Verstehen oder Entwicklung', 'Wir schauen auf passende Unterstützung, ohne den Wert der Person zu bewerten.', 'BH2'),
  c('health', 'Eine chronische oder komplexe gesundheitliche Situation', 'Das kann Termine, Pflege und Familienalltag stark prägen.', 'BH2'),
  c('unclear', 'Langfristige Unterstützung, aber noch keine klare Bezeichnung', 'Eine genaue Bezeichnung ist hier nicht nötig. Die konkreten Barrieren reichen.', 'BH2'),
], 'BH2', { sources: ['who-icf', 'who-disability-survey'], purpose: 'Behinderung kontextbezogen behandeln: Funktionieren, Umweltbarrieren, Teilhabe und Unterstützung statt Defizitbewertung.' });
q('BH2', 'BH', 'Wo entsteht im Moment die größte Hürde?', 'Es geht um die Situation der Person und eurer Familie, nicht um eine Bewertung ihres Lebens.', [
  c('communication', 'Kommunikation oder gegenseitiges Verstehen', 'Dann sollten Wünsche und Informationen in einer passenden Form zugänglich sein.', 'BH3'),
  c('participation', 'Schule, Ausbildung, Arbeit oder soziale Teilhabe', 'Dann schauen wir auf Zugänge und Unterstützung im jeweiligen Umfeld.', 'BH3'),
  c('daily', 'Pflege, Mobilität oder tägliche Aufgaben', 'Das kann viel Verantwortung in den Alltag bringen.', 'BH3'),
  c('services', 'Termine, Anträge, Hilfsmittel oder viele unklare Zuständigkeiten', 'Koordination kann selbst zu einer großen Belastung werden.', 'BH3'),
  c('bullying', 'Ausgrenzung, Abwertung oder Mobbing', 'Dann passt der Weg zu Ausgrenzung besser.', 'M1'),
  c('health', 'Schmerzen oder eine deutliche gesundheitliche Verschlechterung', 'Das kann Wolki nicht medizinisch einschätzen. Bei deutlicher Verschlechterung ist medizinischer Rat wichtig.', 'H3', { help: true, resume: 'BH3' }),
], 'BH3', { sources: ['who-icf', 'unicef-inclusive'], purpose: 'Barrieren und Teilhabe erfassen; gesundheitliche Dringlichkeit separat weiterleiten.' });
q('BH3', 'BH', 'Wie ist die Unterstützung gerade verteilt?', 'Auch die betroffene Person soll – soweit es für sie möglich ist – an Entscheidungen über ihre Unterstützung beteiligt sein.', [
  c('shared', 'Die Person wird einbezogen und die Unterstützung passt meistens', 'Das ist eine wichtige Grundlage. Auch deine eigene Belastung darf daneben Platz haben.', fit),
  c('professional', 'Schule, Fachpersonen oder Dienste tragen verlässlich mit', 'Dann musst du nicht alles allein koordinieren.', fit),
  c('family', 'Das meiste bleibt an mir oder unserer Familie hängen', 'Das klingt nach viel Verantwortung. Entlastung für euch ist ein berechtigtes Thema.', fit),
  c('waiting', 'Wir warten, wurden abgelehnt oder Zuständigkeiten sind unklar', 'Solche Lücken können viel Kraft kosten und sollten nicht unsichtbar bleiben.', fit),
  c('conflict', 'Wir sind uns uneinig, welche Hilfe passend ist', 'Dann sollten die Wünsche, Rechte und Möglichkeiten der Person klar mitgedacht werden.', fit),
  c('boundary', 'Die erwachsene Person möchte mich nicht einbeziehen', 'Ihre Selbstbestimmung zählt. Du kannst deine eigene Sorge trotzdem sortieren.', fit),
], fit, { sources: ['nice-disabled-children', 'who-icf'], note: 'Bei Minderjährigen Sorgeberechtigung und Kindeswohl, bei Erwachsenen Einwilligung und Selbstbestimmung beachten. Für die Produktion rechtlich und fachlich gesondert prüfen.' });

q('SCH1', 'SCH', 'Was ist in Schule oder Ausbildung im Moment am schwierigsten?', 'Bitte wähle die Situation, die am meisten belastet. Wolki vergibt keine Schuld und stellt keine Diagnose.', [
  c('learning', 'Lernen, Noten, Prüfungen oder starker Leistungsdruck', 'Dann schauen wir auf Belastung, Unterstützung und Erwartungen.', 'SCH2'),
  c('attendance', 'Häufiges Fehlen, Angst vor der Schule oder Vermeiden', 'Das kann viele Gründe haben. Wir fragen erst, was du wirklich weißt.', 'SCH2'),
  c('adults', 'Konflikte mit Lehrkräften oder der Schule', 'Dann trennen wir Beobachtungen, Aussagen und unterschiedliche Sichtweisen.', 'SCH2'),
  c('bullying', 'Mobbing, Ausgrenzung oder wiederholte Abwertung', 'Dann gehen wir direkt in den passenden Schutz- und Unterstützungsweg.', 'M1'),
  c('support', 'Aufmerksamkeit, Entwicklung oder fehlende Unterstützung', 'Dann klären wir mit einer kurzen Frage, welcher Weg besser passt.', 'SCH0'),
  c('danger', 'Akute Gewalt oder eine unmittelbare Bedrohung', 'Dann geht Sicherheit jetzt vor.', 'H1', { help: true, resume: 'SCH2' }),
], 'SCH2', { sources: ['unicef-school', 'unicef-inclusive'], purpose: 'Schulprobleme zunächst nach Situation ordnen; Mobbing, Neurodivergenz, Behinderung und akute Gefahr sauber weiterleiten.' });
q('SCH0', 'SCH', 'Welche Art von Unterstützung fehlt wahrscheinlich?', 'Du musst noch keine genaue Bezeichnung kennen. Wähle nur die passendere Richtung.', [
  c('neuro', 'Es geht eher um Aufmerksamkeit, Reize oder soziale Situationen', 'Dann unterscheiden wir Beobachtung, fachliche Abklärung und bekannte Diagnose.', 'ND1'),
  c('disability', 'Entwicklung, Barrieren oder langfristige Unterstützung', 'Dann schauen wir auf Teilhabe, Zugänglichkeit und passende Hilfen.', 'BH1'),
  c('unclear', 'Das lässt sich für mich noch nicht unterscheiden', 'Dann bleiben wir bei dem, was in der Schule konkret passiert.', 'SCH2'),
], 'SCH2', { sources: ['nice-adhd', 'unicef-inclusive'], purpose: 'Nur bei Bedarf eine zusätzliche Klärung; keine Diagnose aus Schulproblemen ableiten.' });
q('SCH2', 'SCH', 'Woher weißt du, was dort passiert?', 'Mehrere Sichtweisen können sich unterscheiden. Du musst daraus noch kein Urteil bilden.', [
  c('person', 'Die Person hat mir selbst davon erzählt', 'Dann ist ihre eigene Sicht ein wichtiger Ausgangspunkt.', 'SCH3'),
  c('school', 'Die Schule oder Ausbildungsstelle hat es mir mitgeteilt', 'Dann kennen wir zunächst die Sicht der Einrichtung.', 'SCH3'),
  c('observed', 'Ich sehe Veränderungen, kenne aber nicht alle Gründe', 'Dann bleiben wir bei den Veränderungen, die du wirklich bemerkst.', 'SCH3'),
  c('mixed', 'Ich höre unterschiedliche oder widersprüchliche Darstellungen', 'Das kann verunsichern. Ein ruhiges Zuhören auf mehreren Seiten kann helfen.', 'SCH3'),
], 'SCH3', { sources: ['unicef-school'], purpose: 'Informationsquelle sichtbar machen; nicht automatisch Schule, Kind oder Familie als Ursache festlegen.' });
q('SCH3', 'SCH', 'Was bemerkst du außerhalb der Schule am deutlichsten?', 'Ein konkreter Punkt reicht. Wir suchen keine Beweise, sondern verstehen die Belastung.', [
  c('feelings', 'Angst, Traurigkeit oder Rückzug', 'Dann wirkt die Schulsituation offenbar auch emotional nach.', 'SCH4'),
  c('body', 'Schlafprobleme, Bauchweh, Kopfweh oder starke Erschöpfung', 'Körperliche Beschwerden verdienen Aufmerksamkeit; Wolki kann sie nicht medizinisch beurteilen.', 'SCH4'),
  c('conflict', 'Streit zu Hause, besonders rund um Schule oder Aufgaben', 'Dann belastet die Situation auch eure Beziehung und euren Alltag.', 'SCH4'),
  c('absence', 'Mehr Fehlzeiten oder deutlich weniger Teilnahme', 'Das ist eine konkrete Veränderung, die mit passenden Ansprechpersonen geklärt werden kann.', 'SCH4'),
  c('confidence', 'Weniger Selbstvertrauen oder Rückzug von Freund:innen', 'Dann scheint die Erfahrung auch das Selbstbild oder Zugehörigkeitsgefühl zu treffen.', 'SCH4'),
  c('nochange', 'Außerhalb bemerke ich bisher keine deutliche Veränderung', 'Auch das ist eine wichtige Information. Wir müssen keine zusätzliche Belastung erfinden.', 'SCH4'),
], 'SCH4', { sources: ['unicef-school'] });
q('SCH4', 'SCH', 'Wer trägt die Situation schon mit?', 'Die andere Person sollte, passend zu ihrem Alter und ihren Möglichkeiten, in nächste Schritte einbezogen werden.', [
  c('school', 'Eine Lehrkraft, Schulsozialarbeit oder Beratungsstelle', 'Dann gibt es bereits eine mögliche Ansprechperson im Umfeld.', fit),
  c('professional', 'Eine medizinische, therapeutische oder pädagogische Fachperson', 'Dann kann diese Person die Situation fachlich genauer einordnen.', fit),
  c('dismissed', 'Wir haben es angesprochen, wurden aber bisher nicht ernst genommen', 'Das kann sehr entmutigend sein. Die Belastung wird dadurch nicht weniger real.', fit),
  c('none', 'Noch niemand – bisher liegt es vor allem bei mir', 'Du musst nicht allein die ganze Lösung tragen.', fit),
  c('boundary', 'Die Person möchte gerade nicht, dass ich mich einmische', 'Dieser Wunsch zählt. Bei unmittelbarer Gefahr darf trotzdem Hilfe geholt werden.', fit),
], fit, { sources: ['unicef-school', 'unicef-inclusive'], note: 'Konkrete Schul- und Teilhaberechte hängen von Alter, Ort und Situation ab; vor Veröffentlichung regionale Fachprüfung ergänzen.' });

q('SW1', 'SW', 'Was hat dir gezeigt, dass die Person stark an sich zweifelt?', 'Wir bleiben bei ihren Worten oder bei beobachtbarem Verhalten. Daraus lesen wir keine Persönlichkeit heraus.', [
  c('said', 'Sie sagt: „Ich bin nicht gut genug“ oder „nichts wert“', 'Solche Sätze können weh tun und sollten ernst genommen werden.', 'SW2'),
  c('avoids', 'Sie gibt schnell auf oder vermeidet Dinge aus Angst zu scheitern', 'Dann scheint die Angst vor Fehlern viel Raum einzunehmen.', 'SW2'),
  c('perfection', 'Sie setzt sich stark unter Druck oder vergleicht sich ständig', 'Dauernder Vergleich und hohe Ansprüche können sehr erschöpfen.', 'SW2'),
  c('criticism', 'Nach Kritik oder einem Misserfolg zieht sie sich stark zurück', 'Dann wirkt diese Erfahrung offenbar länger nach.', 'SW2'),
  c('interpretation', 'Es ist mein Eindruck; sie hat es nicht selbst gesagt', 'Danke, dass du das unterscheidest. Wir halten deine Wahrnehmung als Sorge fest, nicht als Tatsache über sie.', 'SW2'),
  crisis('suicide', 'Sie sagt, sie wolle nicht mehr leben oder sich etwas antun', 'SW2'),
], 'SW2', { sources: ['nimh-suicide'], purpose: 'Selbstwertbezogene Aussagen erfassen, ohne Persönlichkeit, Diagnose oder Motive zuzuschreiben.' });
q('SW2', 'SW', 'In welchem Bereich zeigt sich das am stärksten?', 'Ein Schwerpunkt hilft, ohne die Person insgesamt darauf zu reduzieren.', [
  c('schoolwork', 'Schule, Ausbildung oder Arbeit', 'Dann hängen die Zweifel besonders mit Leistung oder Erwartungen zusammen.', 'SW3'),
  c('body', 'Körper oder Aussehen', 'Dann ist der Weg zu Körperbild und Abwertung passender.', 'W1'),
  c('family', 'Familie oder Partnerschaft', 'Dann spielen Beziehungen und Erwartungen eine große Rolle.', 'SW3'),
  c('social', 'Freundschaften, Zugehörigkeit oder soziale Medien', 'Dann scheint Vergleich oder Ausgrenzung besonders mitzuwirken.', 'SW3'),
  c('many', 'In vielen Lebensbereichen', 'Dann kann die Belastung sehr umfassend wirken.', 'SW3'),
], 'SW3', { purpose: 'Kontext statt globaler Persönlichkeitsbewertung.' });
q('SW3', 'SW', 'Was wünscht sich die Person von dir – soweit du das weißt?', 'Unterstützung darf sich an ihrem Wunsch orientieren. Du musst ihr Selbstwertgefühl nicht allein reparieren.', [
  c('listen', 'Zuhören, ohne sofort eine Lösung zu geben', 'Dann kann ruhiges Zuhören schon ein hilfreicher erster Schritt sein.', fit),
  c('practical', 'Konkrete Hilfe bei einer Aufgabe oder einem Gespräch', 'Dann kann die Hilfe klein und klar begrenzt werden.', fit),
  c('encourage', 'Ermutigung, aber gerade keine Ratschläge', 'Dann darfst du bestärken, ohne zusätzlichen Druck aufzubauen.', fit),
  c('help', 'Unterstützung dabei, fachliche Hilfe zu suchen', 'Das ist eine konkrete Bitte, die ihr gemeinsam planen könnt.', fit),
  c('space', 'Ruhe oder Abstand; sie möchte gerade nicht reden', 'Diese Grenze zählt. Du kannst trotzdem für dich Unterstützung suchen.', fit),
  c('notasked', 'Ich weiß es noch nicht oder habe noch nicht gefragt', 'Dann müssen wir ihren Wunsch nicht erraten.', fit),
], fit, { note: 'Keine allgemeinen Komplimente als Pflichtlösung; konkrete Anerkennung, Zuhören und gewünschte Hilfe bevorzugen.' });

q('FA1', 'FA', 'Was belastet euren Familienalltag im Moment am stärksten?', 'Wähle eine konkrete Situation. Wir suchen nicht nach einer Person, die an allem schuld ist.', [
  c('conflict', 'Viele Auseinandersetzungen über Regeln, Termine oder Aufgaben', 'Dann scheinen Absprachen und Alltag gerade viel Kraft zu kosten.', 'FA2'),
  c('responsibility', 'Eine Person übernimmt dauerhaft zu viel Verantwortung', 'Dann sollten Rollen und Entlastung genauer angeschaut werden.', 'FA2'),
  c('siblings', 'Geschwister oder andere Angehörige kommen zu kurz', 'Auch ihre Bedürfnisse dürfen sichtbar werden, ohne jemanden abzuwerten.', 'FA2'),
  c('separation', 'Trennung, Patchwork oder Wechsel zwischen Haushalten', 'Viele Übergänge und unterschiedliche Regeln können belastend sein.', 'FA2'),
  c('care', 'Pflege, Begleitung oder viele organisatorische Aufgaben', 'Dann trägt der Familienalltag wahrscheinlich eine große zusätzliche Last.', 'FA2'),
  c('fear', 'Ich habe Angst vor der Person oder fühle mich kontrolliert', 'Dann sollst du das nicht allein in einem Gespräch lösen müssen. Sicherheit geht vor.', 'H4', { help: true, resume: 'FA2' }),
], 'FA2', { purpose: 'Konkrete Familienbelastung und Rollen erfassen; Gewalt und Kontrolle sofort in den Sicherheitsweg leiten.' });
q('FA2', 'FA', 'Wie gut kann die andere Person ihre Sicht und ihre Wünsche einbringen?', 'Alter, Kommunikation und Abhängigkeit können dabei eine Rolle spielen. Wir nehmen ihre Perspektive ernst.', [
  c('well', 'Sie kann ihre Sicht sagen und wird meistens gehört', 'Das ist eine wichtige Grundlage für gemeinsame Absprachen.', 'FA3'),
  c('hard', 'Sie kann es sagen, aber Gespräche eskalieren schnell', 'Dann braucht es vielleicht einen ruhigeren Rahmen oder Unterstützung von außen.', 'FA3'),
  c('communication', 'Sie braucht Unterstützung, um Wünsche verständlich zu machen', 'Dann sollte die Form der Kommunikation angepasst werden.', 'FA3'),
  c('notheard', 'Ihre Sicht wird oft übergangen', 'Dann ist es wichtig, Beteiligung bewusst wiederherzustellen.', 'FA3'),
  c('notknown', 'Ich weiß noch nicht, was sie sich wünscht', 'Dann muss Wolki ihren Wunsch nicht erfinden.', 'FA3'),
], 'FA3', { sources: ['nice-disabled-children'], purpose: 'Beteiligung und Kommunikation berücksichtigen, ohne Eltern, Kind oder andere Angehörige pauschal zu bewerten.' });
q('FA3', 'FA', 'Wer kann Verantwortung oder Entlastung mittragen?', 'Du musst nicht erst völlig erschöpft sein, bevor Unterstützung erlaubt ist.', [
  c('family', 'Eine weitere vertraute Person in Familie oder Freundeskreis', 'Dann kann eine konkrete Aufgabe geteilt werden.', fit),
  c('school', 'Schule, Betreuung oder eine pädagogische Fachperson', 'Dann gibt es eine Stelle im Alltag, die mit einbezogen werden kann.', fit),
  c('professional', 'Eine Beratungsstelle, Therapie oder medizinische Fachperson', 'Dann kann die Situation mit fachlicher Unterstützung sortiert werden.', fit),
  c('none', 'Im Moment sehe ich niemanden, der verlässlich mitträgt', 'Das klingt einsam und anstrengend. Genau diese fehlende Entlastung darf sichtbar werden.', fit),
  c('dismissed', 'Ich habe um Hilfe gebeten, wurde aber nicht ernst genommen', 'Das kann entmutigen. Es bedeutet nicht, dass dein Unterstützungsbedarf unwichtig ist.', fit),
], fit, { purpose: 'Vorhandene und fehlende Unterstützungswege erfassen; keine pauschale Aufforderung zur familiären Konfrontation.' });

q('E1', 'E', 'Was weißt du bisher über die Schwierigkeiten mit dem Essen?', 'Bitte wähle, was am ehesten zutrifft. Eine Vermutung ist etwas anderes als eine mitgeteilte Diagnose.', [
  c('diagnosed', 'Die Person hat mir von einer diagnostizierten Essstörung erzählt', 'Danke. Die mitgeteilte Diagnose ist ein Kontext, den wir nicht selbst überprüfen.', 'E2T'),
  c('told', 'Die Person hat mir selbst von Schwierigkeiten mit dem Essen erzählt', 'Es ist hilfreich zu unterscheiden, was die Person dir selbst sagt.', 'E2O'),
  c('observed', 'Mir fallen Veränderungen auf, aber ich kenne keine Diagnose', 'Wir bleiben bei den Veränderungen, die du tatsächlich bemerkst.', 'E2O'),
  c('appearance', 'Meine Sorge entsteht vor allem durch Gewicht oder Aussehen', 'Aussehen allein sagt nicht, ob eine Essstörung vorliegt.', 'W1'),
  urgent('emergency', 'Die Person ist gerade bewusstlos oder kaum ansprechbar'),
], 'E2U', { sources: ['nice-eating', 'iqwig-eating'], purpose: 'Quelle der Information trennen; keine Gewichtszahlen, Kalorien, Kompensationsmethoden oder Ferndiagnose.' });
q('E2T', 'E', 'Welche Unterstützung ist für die Person gerade bekannt?', 'Es reicht, was sie dir freiwillig erzählt hat.', [
  c('treatment', 'Sie bekommt fachliche Hilfe und hat darüber mit mir gesprochen', 'Gut zu wissen. Auch neben ihrer Behandlung darfst du eigene Unterstützung suchen.', fit),
  c('waiting', 'Sie sucht Hilfe oder wartet auf einen Platz', 'Warten kann auch für dich belastend sein.', fit),
  c('none', 'Nach meinem Wissen bekommt sie noch keine Hilfe', 'Du musst die Behandlung nicht selbst übernehmen. Beratung steht auch Angehörigen offen.', fit),
  c('treatmentPrivate', 'Sie möchte ihre Behandlung nicht mit mir besprechen', 'Ihre Privatsphäre und dein eigener Unterstützungsbedarf dürfen nebeneinander bestehen.', fit),
], fit, { sources: ['nice-eating'] });
q('E2O', 'E', 'Was beschäftigt dich dabei am meisten?', 'Wähle eine Beobachtung oder eine Aussage der Person. Daraus leiten wir keine Diagnose ab.', [
  c('restriction', 'Sie lässt häufig Mahlzeiten aus oder meidet gemeinsames Essen', 'Du bemerkst eine Veränderung rund um das Essen.', fit),
  c('distress', 'Sie berichtet von Kontrollverlust oder großer Belastung beim Essen', 'Du nimmst ihre eigene Beschreibung ernst.', fit),
  c('body', 'Sie wertet ihren Körper ab oder fürchtet eine Gewichtszunahme', 'Solche Aussagen können auch dich verunsichern oder belasten.', fit),
  c('conflict', 'Essen führt zwischen uns immer wieder zu Streit', 'Dann belastet dich auch, was zwischen euch passiert.', fit),
  c('physical', 'Ich mache mir Sorgen um ihren körperlichen Zustand', 'Bei körperlicher Verschlechterung ist medizinischer Rat wichtig. Wolki kann das nicht beurteilen.', 'H3', { help: true, resume: fit }),
], fit, { sources: ['nice-eating', 'iqwig-eating'] });
q('E2U', 'E', 'Was brauchst du, obwohl noch vieles unklar ist?', 'Du brauchst keine Beweise, um für dich Unterstützung zu suchen.', [
  c('talk', 'Einen behutsamen Weg, meine Sorge anzusprechen', 'Wir können später einen Einstieg ohne Vorwurf auswählen.', fit),
  c('info', 'Verlässliche Informationen und eine Beratungsstelle', 'Beratung ist auch möglich, wenn du keine Diagnose kennst.', fit),
  c('self', 'Erst einmal Entlastung für mich', 'Das ist ein berechtigter Ausgangspunkt.', fit),
], fit, { sources: ['nice-eating'] });

q('W1', 'W', 'Von wem kommt die Sorge um Gewicht oder Körperbild?', 'Ein Körpergewicht allein sagt nicht, wie es jemandem geht. Hier geht es um Belastung und gewünschte Unterstützung.', [
  c('person', 'Die Person selbst sagt, dass sie darunter leidet', 'Dann orientieren wir uns an dem, was sie sich wünscht.', 'W2A'),
  c('stigma', 'Die Person wird wegen ihres Körpers abgewertet oder ausgeschlossen', 'Abwertung verdient Unterstützung, unabhängig von der Körperform.', 'W2D'),
  c('medical', 'Sie erzählte mir von einem ärztlich besprochenen Thema', 'Wir bleiben bei dieser mitgeteilten Information und bei ihren Wünschen.', 'W2A'),
  c('mine', 'Vor allem ich mache mir wegen ihres Aussehens Sorgen', 'Bevor Gewicht zum Thema wird, ist ihre Zustimmung wichtig.', 'W2M'),
  c('eating', 'Eigentlich geht es um belastendes Essverhalten', 'Dann ist der Themenweg Essen passender.', 'E2O'),
], 'W2M', { sources: ['iqwig-weight', 'awmf-weight'], purpose: 'Gewichtsstigma vermeiden; weder Aussehen noch BMI als Ersatz für Befinden verwenden.' });
q('W2A', 'W', 'Was hat sich die Person von dir gewünscht?', 'Auch der Wunsch, gerade keine Ratschläge zu bekommen, zählt.', [
  c('listen', 'Dass ich zuhöre', 'Zuhören darf bereits eine Form von Unterstützung sein.', fit),
  c('accompany', 'Begleitung zu einem Gespräch oder Termin', 'Das ist eine konkrete Bitte, deren Umfang du mitbestimmen darfst.', fit),
  c('info', 'Hilfe bei der Suche nach verlässlichen Informationen', 'Informationen können sich an ihren Fragen orientieren.', fit),
  c('space', 'Keine Kommentare oder Ratschläge zu ihrem Körper', 'Diesen Wunsch zu respektieren kann Vertrauen schützen.', fit),
  c('notasked', 'Wir haben noch nicht darüber gesprochen', 'Dann muss Wolki keine Wünsche für die Person erfinden.', fit),
], fit, { sources: ['awmf-weight'] });
q('W2D', 'W', 'Wo bekommt die Person diese Abwertung mit?', 'Es geht um das Verhalten anderer, nicht darum, ob mit ihrem Körper etwas falsch ist.', [
  c('schoolwork', 'In Schule, Ausbildung oder Arbeit', 'Auch dort muss die Person die Abwertung nicht allein tragen.', fit),
  c('close', 'In Familie, Beziehung oder Freundeskreis', 'Abwertung durch nahestehende Menschen kann besonders wehtun.', fit),
  c('online', 'Online oder in sozialen Medien', 'Auch digitale Abwertung kann belasten.', fit),
  c('care', 'Bei medizinischen Terminen oder anderen Dienstleistungen', 'Respektvolle Behandlung ist auch in diesen Situationen wichtig.', fit),
], fit, { sources: ['awmf-weight'], note: 'Bei wiederholten Übergriffen kann später der Mobbingweg gewählt werden. Keine Körperveränderung als Lösung für Diskriminierung empfehlen.' });
q('W2M', 'W', 'Möchte die Person überhaupt mit dir über ihren Körper sprechen?', 'Du darfst deine eigene Sorge sortieren, ohne ein Gespräch über ihren Körper zu erzwingen.', [
  c('yes', 'Ja, sie hat das ausdrücklich gesagt', 'Dann kann ihre eigene Frage den Ausgangspunkt bilden.', fit),
  c('no', 'Nein, das möchte sie nicht', 'Dann bleibt ihre Grenze bestehen. Deine Gefühle können trotzdem hier Platz haben.', fit),
  c('notasked', 'Ich habe noch nicht um Erlaubnis gefragt', 'Dann beginnen wir zunächst mit deiner Sorge.', fit),
], fit, { sources: ['awmf-weight', 'iqwig-weight'] });

q('M1', 'M', 'In welchem Umfeld passiert die Ausgrenzung oder Abwertung?', 'Ein Schwerpunkt reicht für den Anfang.', [
  c('school', 'In Schule oder Ausbildung', 'Wir schauen auf Unterstützung in diesem Umfeld.', 'M2S'),
  c('work', 'Bei der Arbeit', 'Wir schauen auf das, was du mitbekommst.', 'M2W'),
  c('online', 'Online, in Chats oder sozialen Medien', 'Wir betrachten auch den digitalen Teil als reale Belastung.', 'M2O'),
  c('privateEnvironment', 'Im privaten Umfeld oder an mehreren Orten', 'Dann klären wir kurz, woher deine Informationen kommen.', 'M2U'),
  urgent('attack', 'Gerade passiert ein Angriff oder eine unmittelbare Bedrohung'),
], 'M2U', { sources: ['bullying'], purpose: 'Umfeldbezogene Unterstützung; keine Schuldzuweisung, erzwungene Konfrontation oder Aufforderung zurückzuschlagen.' });
q('M2S', 'M', 'Wer weiß bereits davon und nimmt es ernst?', 'Du musst noch keinen fertigen Hilfeplan haben.', [
  c('school', 'Eine Lehrkraft, Schulsozialarbeit oder Ausbildungsbetreuung', 'Dann gibt es bereits eine mögliche Ansprechperson.', fit),
  c('trusted', 'Eine andere vertraute erwachsene Person', 'Es kann entlasten, Verantwortung mit jemandem zu teilen.', fit),
  c('dismissed', 'Es wurde angesprochen, aber bisher heruntergespielt', 'Dass es heruntergespielt wurde, macht die Belastung nicht weniger wichtig.', fit),
  c('nobody', 'Bisher niemand außer mir', 'Du musst damit nicht die einzige Ansprechperson bleiben.', fit),
], fit, { sources: ['bullying'], note: 'Bei Minderjährigen Schutz durch geeignete Erwachsene mitdenken; nicht pauschal Eltern empfehlen, wenn diese selbst bedrohen.' });
q('M2W', 'M', 'Was hast du selbst mitbekommen oder erzählt bekommen?', 'Wähle den wichtigsten Punkt. Eine rechtliche Einordnung ist hier nicht nötig.', [
  c('words', 'Wiederholte abwertende Bemerkungen oder Bloßstellen', 'Wiederholte Abwertung kann auch die Menschen im Umfeld belasten.', fit),
  c('excluded', 'Gezieltes Ausschließen oder Vorenthalten wichtiger Informationen', 'Du beschreibst ein konkretes Verhalten im Arbeitsalltag.', fit),
  c('power', 'Druck durch eine Person mit mehr Macht oder Einfluss', 'Ein Machtgefälle kann es schwer machen, allein etwas anzusprechen.', fit),
  c('reported', 'Die Person hat mir davon erzählt; Einzelheiten kenne ich nicht', 'Du musst keine Einzelheiten sammeln, um zuzuhören.', fit),
  c('threat', 'Es gibt Drohungen oder Angst vor Gewalt', 'Dann stellen wir Unterstützung und Sicherheit in den Vordergrund.', 'H4', { help: true, resume: fit }),
], fit, { note: 'Keine rechtliche Bewertung des Begriffs Mobbing. Konkrete Fälle gehören gegebenenfalls in vertrauliche Fachberatung.' });
q('M2O', 'M', 'Was belastet die Person nach deinem Wissen online?', 'Bitte keine Nachrichten, Bilder oder Namen hier hochladen.', [
  c('messages', 'Wiederholte verletzende Nachrichten oder Kommentare', 'Auch wiederholte Nachrichten können den Alltag stark belasten.', fit),
  c('excluded', 'Gezieltes Ausschließen aus Gruppen', 'Ausgeschlossen zu werden kann sich sehr verletzend anfühlen.', fit),
  c('shared', 'Inhalte werden gegen ihren Willen geteilt', 'Das muss sie nicht allein klären. Unterstützung kann beim Melden helfen.', fit),
  c('threat', 'Drohungen, Erpressung oder Angst um die eigene Sicherheit', 'Dabei ist persönliche Unterstützung wichtig.', 'H4', { help: true, resume: fit }),
  c('unspecified', 'Sie berichtet von Mobbing, möchte aber keine Details nennen', 'Ihr Wunsch nach Privatsphäre darf bestehen bleiben.', fit),
], fit, { sources: ['bullying'] });
q('M2U', 'M', 'Woher weißt du von der Situation?', 'So bleiben Mitgeteiltes und eigene Vermutungen auseinander.', [
  c('told', 'Die Person hat es mir selbst erzählt', 'Danke. Wir halten fest, dass es ihre eigene Mitteilung ist.', fit),
  c('seen', 'Ich habe etwas davon selbst gesehen oder gehört', 'Dann bleiben wir bei deiner Beobachtung.', fit),
  c('third', 'Andere haben mir davon erzählt', 'Dann ist es eine Information aus zweiter Hand.', fit),
  c('guess', 'Ich vermute es wegen Veränderungen im Verhalten', 'Die Ursache bleibt damit offen. Deine Sorge zählt trotzdem.', fit),
], fit, { sources: ['bullying'] });

q('D1', 'D', 'Was lässt dich an Niedergeschlagenheit oder Rückzug denken?', 'Du brauchst keine Diagnose zu kennen.', [
  c('diagnosed', 'Die Person hat mir von einer diagnostizierten Depression erzählt', 'Wir übernehmen das als mitgeteilten Kontext, nicht als eigene Diagnose.', 'D2'),
  c('told', 'Sie sagt, dass sie traurig, leer oder hoffnungslos ist', 'Du nimmst ernst, was die Person dir sagt.', 'D2'),
  c('withdrawn', 'Sie zieht sich zurück oder sagt viele Treffen ab', 'Du bemerkst weniger Kontakt. Die Gründe bleiben zunächst offen.', 'D2'),
  c('interest', 'Früher Wichtiges scheint sie kaum noch zu interessieren', 'Du beschreibst eine Veränderung, keine feste Eigenschaft.', 'D2'),
  c('suicide', 'Sie hat gesagt, dass sie nicht mehr leben möchte', 'Dann ist zuerst persönliche Unterstützung wichtig.', 'U1', { help: true }),
], 'D2', { sources: ['bapk', 'nvl'], purpose: 'Keine Fremdanwendung des PHQ. Symptome, Beobachtungen und mitgeteilte Diagnosen bleiben getrennt.' });
q('D2', 'D', 'Was weißt du über Unterstützung für die Person?', 'Du musst ihre Behandlung nicht kennen oder organisieren.', [
  c('yes', 'Sie hat fachliche Unterstützung und hat mir davon erzählt', 'Auch dann darfst du für deine eigene Belastung Hilfe bekommen.', fit),
  c('search', 'Sie sucht Hilfe oder wartet darauf', 'Diese Zwischenzeit kann auch dich beanspruchen.', fit),
  c('no', 'Nach meinem Wissen hat sie bisher keine Unterstützung', 'Du kannst Unterstützung anbieten, ohne allein dafür verantwortlich zu sein.', fit),
  c('declines', 'Sie möchte gerade nicht darüber sprechen oder Hilfe annehmen', 'Das kann schwer auszuhalten sein. Deine Grenzen bleiben trotzdem wichtig.', fit),
], fit, { sources: ['bapk', 'nvl'] });

q('AN1', 'AN', 'Was bekommst du von der Angst mit?', 'Bitte bleib bei dem, was die Person sagt oder was du beobachtest.', [
  c('reported', 'Sie erzählt mir von starken Sorgen oder Angst', 'Dann nehmen wir ihre eigene Beschreibung als Ausgangspunkt.', 'AN2'),
  c('panic', 'Sie berichtet von Panikattacken', 'Das kann auch für dich als Bezugsperson beängstigend sein.', 'AN2'),
  c('avoid', 'Sie meidet immer mehr Situationen oder braucht viel Begleitung', 'Du bemerkst, dass sich ihr Alltag und vielleicht auch deiner verändert.', 'AN2'),
  c('reassure', 'Sie fragt mich sehr häufig nach Rückversicherung', 'Auch ständiges Beruhigen kann für dich anstrengend sein.', 'AN2'),
  urgent('medical', 'Starke Atemnot, Bewusstlosigkeit oder ein möglicher Notfall'),
], 'AN2', { sources: ['anxiety'], note: 'Neue schwere körperliche Beschwerden nicht als Panik abtun. Keine angeleitete Konfrontationsbehandlung durch Angehörige.' });
q('AN2', 'AN', 'Was wird in solchen Momenten von dir gebraucht?', 'Es geht um deine Rolle, nicht darum, ob du alles richtig machst.', [
  c('presence', 'Ich soll zuhören oder dableiben', 'Nähe kann helfen, und du darfst sagen, was du gerade leisten kannst.', fit),
  c('takeover', 'Ich soll Aufgaben oder schwierige Situationen übernehmen', 'Dann schauen wir auch darauf, wie viel Verantwortung bei dir landet.', fit),
  c('accompany', 'Ich begleite zu Terminen oder helfe bei der Suche nach Hilfe', 'Das ist konkrete Unterstützung, die auch Zeit und Kraft kostet.', fit),
  c('unsaid', 'Ich weiß noch nicht, was sich die Person von mir wünscht', 'Du musst diesen Wunsch nicht erraten.', fit),
], fit, { sources: ['anxiety', 'bapk'] });

q('SU1', 'SU', 'Worum geht deine Sorge hauptsächlich?', 'Eine Sorge bedeutet noch nicht, dass eine Abhängigkeit feststeht.', [
  c('alcohol', 'Alkohol', 'Wir schauen auf die Situation und auf deine Belastung.', 'SU2S'),
  c('drugs', 'Andere Substanzen oder Medikamente', 'Du brauchst keine Mengen oder Einzelheiten zum Konsum anzugeben.', 'SU2S'),
  c('gambling', 'Glücksspiel oder Wetten', 'Auch finanzielle und zwischenmenschliche Folgen dürfen hier Platz haben.', 'SU2V'),
  c('gaming', 'Gaming oder andere Online-Aktivitäten', 'Viel Zeit online allein ist keine Diagnose. Wir fragen nach den Auswirkungen.', 'SU2V'),
  urgent('emergency', 'Sie reagiert kaum, ist bewusstlos oder atmet auffällig'),
], 'SU2V', { sources: ['addiction'], purpose: 'Keine Etiketten wie „Co-Abhängigkeit“ aus Antworten ableiten; keine Entzugsanweisungen.' });
q('SU2S', 'SU', 'Was belastet dich daran am meisten?', 'Du kannst dich beraten lassen, auch wenn die Person selbst keine Hilfe möchte.', [
  c('health', 'Ich habe Angst um ihre Gesundheit', 'Diese Sorge musst du nicht allein beurteilen.', fit),
  c('unreliable', 'Absprachen werden nicht eingehalten, und ich fange vieles auf', 'Dann betrifft dich auch die zusätzliche Verantwortung.', fit),
  c('hide', 'Ich verberge Dinge oder entschuldige die Person gegenüber anderen', 'Es kann anstrengend sein, so viel mitzutragen.', fit),
  c('care', 'Kinder oder andere abhängige Personen bekommen die Folgen mit', 'Dann zählt auch, dass geeignete Unterstützung für sie erreichbar ist.', fit),
  c('fear', 'Ich habe Angst vor Aggression, Druck oder Gewalt', 'Deine Sicherheit bekommt jetzt Vorrang.', 'H4', { help: true, resume: fit }),
], fit, { sources: ['addiction'] });
q('SU2V', 'SU', 'Welche Auswirkungen bekommst du konkret mit?', 'Bitte wähle den wichtigsten Punkt.', [
  c('money', 'Geldprobleme oder Druck, Geld zu geben', 'Du darfst auch bei Geld Unterstützung und klare Grenzen brauchen.', fit),
  c('time', 'Gemeinsame Zeit, Schlaf oder Aufgaben kommen zu kurz', 'Dann verändert die Situation auch den gemeinsamen Alltag.', fit),
  c('trust', 'Verheimlichen oder gebrochene Absprachen belasten das Vertrauen', 'Vertrauensverlust kann sehr anstrengend sein.', fit),
  c('unclear', 'Ich sorge mich, kenne aber noch keine konkreten Folgen', 'Dann halten wir die Auswirkungen offen.', fit),
  c('fear', 'Drohungen oder Gewalt kommen dazu', 'Dabei sollst du nicht allein nach einer Lösung suchen.', 'H4', { help: true, resume: fit }),
], fit, { sources: ['digisucht'] });

q('V1', 'V', 'Was passiert zwischen den Menschen, um die es geht?', 'Du kannst auch angeben, wenn du selbst betroffen bist. Einzelheiten zu Übergriffen sind nicht nötig.', [
  c('arguments', 'Häufige Streitgespräche, aber keine Angst vor Drohungen oder Gewalt', 'Wir schauen auf die Belastung durch den Streit und auf deine Grenzen.', 'V2'),
  c('control', 'Kontrolle, Demütigung, Isolation oder Druck', 'Das verdient Unterstützung. Es muss nicht erst körperlich werden.', 'H4', { help: true, resume: 'C1' }),
  c('fear', 'Angst vor Drohungen oder körperlicher / sexueller Gewalt', 'Du musst keine weiteren Details nennen, um Hilfe zu bekommen.', 'H4', { help: true, resume: 'C1' }),
  urgent('attack', 'Ein Angriff oder eine unmittelbare Bedrohung passiert gerade', 'C1'),
  c('unclear', 'Ich kann schwer einordnen, ob Grenzen überschritten werden', 'Auch mit dieser Unsicherheit darfst du vertrauliche Beratung suchen.', 'H4', { help: true, resume: 'C1' }),
], 'V2', { sources: ['violence'], note: 'Bei Gewalt keine Paar-Kommunikation, Mediation oder Konfrontation als Standardlösung anbieten.' });
q('V2', 'V', 'Kannst du in diesem Konflikt eine Pause oder Grenze ansprechen, ohne Angst vor Folgen zu haben?', 'Wenn das unklar ist, musst du es nicht ausprobieren.', [
  c('yes', 'Ja, das geht grundsätzlich', 'Dann können wir später eine kleine, konkrete Grenze formulieren.', fit),
  c('hard', 'Ja, aber es fällt mir schwer', 'Das darfst du üben, ohne dich dafür abzuwerten.', fit),
  c('no', 'Nein, ich fürchte die Reaktion', 'Dann geht Unterstützung vor einem Grenzgespräch.', 'H4', { help: true, resume: 'C1' }),
], 'H4', { sources: ['violence'], note: 'Auch bei offener Antwort Hilfe anbieten; Offenlassen ist keine bestätigte Sicherheit. Rückkehr danach zu C1.' });

q('U1', 'U', 'Glaubst du, dass die Person gerade unmittelbar in Gefahr ist?', 'Zum Beispiel, weil sie angekündigt hat, jetzt zu handeln, bereits eine Verletzung vorliegt oder sie nach einer solchen Ankündigung nicht erreichbar ist. Du brauchst keine Details zu nennen.', [
  urgent('now', 'Ja, es könnte gerade passieren', 'C1'),
  crisis('uncertain', 'Ich bin unsicher und mache mir akut Sorgen', 'C1'),
  c('notnow', 'Nach meinem Wissen besteht gerade keine unmittelbare Gefahr', 'Danke. Das ist deine aktuelle Einschätzung. Wolki kann Sicherheit nicht feststellen.', 'U2'),
], 'H2', { sources: ['nimh-suicide', 'nvl'], note: 'Bei Nichtantwort bleibt die Dringlichkeit offen. H2 bietet Hilfe ohne Pflichtangaben; Fortsetzen führt zu C1. Keine Wahrscheinlichkeiten oder Risikoklassen.' });
q('U2', 'U', 'Was hat die Person dir mitgeteilt oder was hast du direkt mitbekommen?', 'Einzelheiten zu Methoden oder Verletzungen brauche ich nicht.', [
  crisis('wish', 'Sie hat in letzter Zeit gesagt, dass sie nicht mehr leben möchte', 'C1'),
  crisis('selfharm', 'Sie erzählte davon oder ich habe es direkt mitbekommen', 'C1'),
  c('past', 'Es geht um frühere Gedanken oder frühere Selbstverletzung', 'Frühere Erfahrungen können weiterhin Sorgen auslösen.', 'U3'),
  c('guess', 'Ich vermute es, habe aber keine Aussage oder direkte Beobachtung', 'Eine direkte, ruhige Frage ist möglich. Sie löst solche Gedanken nicht erst aus.', 'U3'),
], 'H2', { sources: ['nimh-suicide'], note: 'Nichtantwort → H2, Fortsetzen → C1. Selbstverletzung und Suizidgedanken nicht gleichsetzen; beide bekommen menschliche Unterstützung.' });
q('U3', 'U', 'Hast du jemanden, mit dem du diese Sorge besprechen kannst?', 'Du musst das nicht allein einschätzen oder allein für die Person da sein.', [
  c('professional', 'Ja, eine Fachperson oder Beratungsstelle', 'Das kann helfen, die nächsten Schritte gemeinsam zu klären.', fit),
  c('trusted', 'Ja, eine verlässliche Person aus meinem Umfeld', 'Es kann entlasten, diese Sorge mit jemandem zu teilen.', fit),
  crisis('alone', 'Nein, damit bin ich bisher allein', 'C1'),
  crisis('help', 'Ich möchte jetzt mit jemandem sprechen', 'C1'),
], 'H2', { sources: ['nimh-suicide'], note: 'Bei offener Angabe Hilfe zeigen, Rückkehr zu C1. Kein Premium-Angebot im gesamten Suizidsorgen-Pfad.' });

q('K1', 'K', 'Welche Situation beschäftigt dich gerade?', 'Krankheit, Pflege und Verlust können sehr unterschiedlich erlebt werden.', [
  c('care', 'Ich unterstütze oder pflege eine erkrankte Person', 'Dann schauen wir auch darauf, wie die Verantwortung verteilt ist.', 'K2P'),
  c('illness', 'Eine schwere Erkrankung verändert unser Leben', 'Auch ohne Pflegeaufgaben kann das sehr viel auslösen.', 'K2P'),
  c('othergrief', 'Ich möchte jemanden unterstützen, der trauert', 'Du musst die Trauer nicht wegmachen können.', 'K2T'),
  c('owngrief', 'Ich trauere selbst um einen nahestehenden Menschen', 'Es tut mir leid, dass du einen Verlust erlebst. Auch deine Trauer hat hier Platz.', 'K2T'),
], 'K2P', { sources: ['care', 'grief'], purpose: 'Normale Trauer nicht als Störung etikettieren; keine feste Frist für „richtiges“ Trauern.' });
q('K2P', 'K', 'Wie ist die Unterstützung gerade verteilt?', 'Auch Organisation und ständige Erreichbarkeit kosten Kraft.', [
  c('alone', 'Sehr vieles bleibt an mir hängen', 'Dann trägst du gerade viel. Eigene Entlastung darf ein Ziel sein.', fit),
  c('shared', 'Wir teilen die Aufgaben, trotzdem belastet es mich', 'Geteilte Aufgaben nehmen nicht automatisch die emotionale Belastung.', fit),
  c('professional', 'Ein Dienst oder Fachpersonen helfen bereits', 'Auch mit professioneller Hilfe können eigene Bedürfnisse offenbleiben.', fit),
  c('distance', 'Ich bin weit weg oder kann wenig praktisch tun', 'Wenig tun zu können kann sich ebenfalls schwer anfühlen.', fit),
], fit, { sources: ['care'] });
q('K2T', 'K', 'Was fällt dir in der Trauer gerade besonders schwer?', 'Es gibt hier keine richtige Reihenfolge von Gefühlen.', [
  c('words', 'Ich weiß nicht, was ich sagen oder tun soll', 'Dasein kann auch ohne perfekte Worte wichtig sein.', fit),
  c('overwhelmed', 'Die eigenen Gefühle sind sehr stark oder widersprüchlich', 'Mehrere Gefühle dürfen nebeneinander da sein.', fit),
  c('practical', 'Der Alltag und praktische Aufgaben überfordern mich', 'Dann kann ganz konkrete Entlastung helfen.', fit),
  c('different', 'Andere erwarten, dass ich oder die Person schon weiter sein müsste', 'Trauer lässt sich nicht nach einem festen Zeitplan erledigen.', fit),
], fit, { sources: ['grief'] });

q('F1', 'C', 'Passt das bisher zu dem, was dich beschäftigt?', 'Bevor wir wieder ganz zu dir zurückkommen, möchte ich kurz prüfen, ob wir deine Sorge richtig eingeordnet haben.', [
  c('fits', 'Ja, das passt erst einmal', 'Danke. Dann schauen wir jetzt darauf, was diese Situation mit dir macht.', 'C1'),
  c('change', 'Ich möchte ein anderes Thema wählen', 'Natürlich. Dann gehen wir noch einmal zurück und wählen eine passendere Richtung.', 'A3', { resetTopic: true }),
  c('missing', 'Etwas Wichtiges passt in keinen dieser Wege', 'Danke, dass du das sagst. Dann bekommst du Platz, dein Anliegen in eigenen Worten zu beschreiben.', 'AI0'),
], 'C1', { purpose: 'Explizite Passungsprüfung; kein endloses Nachfragen. Ein Themenwechsel oder der optionale eigene Weg genügt.' });
q('C1', 'C', 'Jetzt geht es wieder nur um dich: Was löst die Situation gerade am stärksten in dir aus?', 'Es können mehrere Gefühle gleichzeitig da sein. Wähle einfach das, was du im Moment am deutlichsten spürst.', [
  c('worry', 'Sorge, Angst oder Traurigkeit', 'Das kann viel Raum einnehmen, besonders wenn deine Gedanken immer wieder bei der Person sind.', 'C2'),
  c('guilt', 'Schuldgefühle oder das Gefühl, verantwortlich zu sein', 'Das kann sehr schwer auf dir liegen. Und trotzdem musst du nicht alles allein lösen.', 'C2'),
  c('exhausted', 'Erschöpfung oder kaum noch Kraft', 'Dann trägst du gerade viel. Deine Kraft darf auch für dich selbst da sein.', 'C2'),
  c('anger', 'Ärger oder der Wunsch nach Abstand', 'Auch Ärger und der Wunsch nach Abstand dürfen da sein. Das macht dich nicht zu einem schlechten Menschen.', 'C2'),
  c('helpless', 'Hilflosigkeit oder Unsicherheit', 'Nicht zu wissen, was richtig wäre, kann einen sehr belasten.', 'C2'),
  c('okay', 'Ich komme im Moment recht gut damit zurecht', 'Das ist gut zu hören. Dann schauen wir auch darauf, was dir gerade Halt gibt.', 'C2'),
], 'C2', { sources: ['nice-eating', 'bapk', 'care'], purpose: 'Aktuelles eigenes Erleben. Keine Zuschreibung von Rettertyp, Bindungsstil oder Persönlichkeit.' });
q('C2', 'C', 'Wie sehr begleitet dich das schon in deinem Alltag?', 'Denk zum Beispiel an deinen Schlaf, deine Arbeit, das Lernen, Essen, Erholung oder Kontakte. Es gibt keine richtige oder falsche Antwort.', [
  c('little', 'Kaum – das meiste gelingt wie gewohnt', 'Okay. Im Moment bleibt in deinem Alltag noch vieles stabil.', 'C3'),
  c('some', 'Etwas – einzelne Dinge fallen mir schwerer', 'Danke. Auch solche kleineren Veränderungen dürfen ernst genommen werden.', 'C3'),
  c('much', 'Deutlich – mehrere Dinge leiden darunter', 'Dann nimmt die Situation gerade schon viel Raum in deinem Leben ein.', 'C3'),
  c('very', 'Sehr stark – selbst Grundlegendes fällt mir schwer', 'Das klingt nach sehr viel. Es wäre gut, wenn du damit nicht allein bleiben musst.', 'C3'),
], 'C3', { purpose: 'Funktionelle Selbstauskunft ohne erfundenen klinischen Grenzwert.' });
q('C3', 'C', 'Wer ist im Moment für dich da?', 'Ich meine wirklich Unterstützung für dich – jemanden, bei dem auch deine Gefühle und deine Belastung Platz haben.', [
  c('trusted', 'Eine verlässliche Person, mit der ich sprechen kann', 'Das ist wertvoll. Du musst deine Gedanken nicht ganz allein tragen.', 'C4'),
  c('professional', 'Beratung, Therapie, ärztliche Hilfe oder eine Selbsthilfegruppe', 'Gut, dass es schon einen Ort gibt, an dem es auch um dich gehen darf.', 'C4'),
  c('practical', 'Jemand entlastet mich bei Aufgaben oder im Alltag', 'Das kann wirklich helfen. Unterstützung muss nicht immer nur aus Gesprächen bestehen.', 'C4'),
  c('notenough', 'Es gibt Menschen, aber ich fühle mich damit wenig verstanden', 'Das kann einsam sein. Menschen um sich zu haben und sich verstanden zu fühlen ist nicht dasselbe.', 'C4'),
  c('alone', 'Bisher niemanden', 'Danke, dass du so ehrlich bist. Dann kann ein erster Schritt sein, jemanden nur für dich zu finden.', 'C4'),
], 'C4', { sources: ['bapk', 'nice-eating'] });
q('C4', 'C', 'Was würde dir jetzt am meisten guttun?', 'Du kennst deine Situation am besten. Wähle, wonach du dich im Moment am ehesten sehnst.', [
  c('calm', 'Erst einmal etwas zur Ruhe kommen', 'Gut. Dann suchen wir einen kleinen Schritt, der dir jetzt etwas Luft geben kann.', 'S1'),
  c('understand', 'Meine Situation und Gefühle besser sortieren', 'Dann bringen wir gemeinsam etwas Ordnung in das, was gerade in dir los ist.', 'S1'),
  c('talk', 'Mit der Person ins Gespräch kommen', 'Dann schauen wir nach einem vorsichtigen Einstieg, der zu deiner Situation passt.', 'S1'),
  c('boundaries', 'Grenzen setzen und wieder Platz für mich finden', 'Das ist ein wichtiger Wunsch. Wir suchen eine Grenze, die du wirklich halten kannst.', 'S1'),
  c('support', 'Passende menschliche Unterstützung finden', 'Dann schauen wir, an wen du dich wenden kannst, damit du das nicht allein tragen musst.', 'S1'),
], 'S1', { purpose: 'Gewählter Wunsch steuert den ersten Schritt; keine KI-Rangfolge oder Krankheitswahrscheinlichkeit.' });

// Help always remains reachable. Answers to these questions are not a risk score.
const safetyOpen = (resume) => [
  crisis('unknown', 'Weiß ich nicht', resume),
  c('private', 'Möchte ich nicht sagen', 'Das bleibt offen. Hilfe ist auch ohne weitere Angaben erreichbar.', 'H5', { missing: true, resume }),
  c('skip', 'Diese Frage überspringen', 'Wir lassen die Frage offen. Daraus folgt keine Entwarnung.', 'H5', { missing: true, resume }),
];
node('S1', 'H', 'Denkst du gerade daran, dir etwas anzutun oder nicht mehr leben zu wollen?', 'Bevor ich dir etwas vorschlage, möchte ich noch zwei wichtige Fragen stellen. Die erste bezieht sich nur auf dich. Du darfst sie offenlassen.', [
  urgent('now', 'Ja, und ich könnte jetzt handeln', 'S2'),
  crisis('thoughts', 'Ja, solche Gedanken sind gerade da', 'S2'),
  c('no', 'Nein', 'Danke für deine Antwort. Jetzt frage ich getrennt nach der anderen Person.', 'S2'),
  ...safetyOpen('S2'),
], { sources: ['nimh-suicide', 'nvl'] });
node('S2', 'H', 'Hat die Person dir in letzter Zeit gesagt, dass sie sich etwas antun oder nicht mehr leben möchte?', 'Jetzt geht es wieder um die andere Person. Entscheidend ist nur, was sie dir selbst gesagt hat. Du musst ihre Gedanken nicht erraten.', [
  urgent('now', 'Ja, und ich befürchte, dass sie jetzt handeln könnte', 'P0'),
  crisis('said', 'Ja, sie hat so etwas gesagt', 'P0'),
  c('no', 'Nein, so etwas hat sie mir nicht gesagt', 'Danke. Nicht davon zu wissen ist keine Bestätigung, dass keine Gefahr besteht.', 'P0'),
  ...safetyOpen('P0'),
], { sources: ['nimh-suicide'], note: 'Falls dieselbe Information im U-Weg bereits aktuell beantwortet wurde: Produkt darf sie anzeigen und bestätigen lassen, statt stillschweigend Sicherheit anzunehmen. Dieser vollständige Testweg fragt sie nochmals ausdrücklich.' });

screen('P0', 'P', 'Möchtest du dein eigenes Befinden noch etwas genauer ansehen?', 'Dafür gibt es vier kurze Aussagen zu den letzten zwei Wochen, den PHQ-4. Er erfasst bestimmte Beschwerden bei dir. Er stellt keine Diagnose und beurteilt nicht die andere Person. Das ist freiwillig und dauert zusätzlich ungefähr eine Minute.', [
  c('yes', 'Ja, die vier Aussagen beantworten', 'Die Aussagen stehen in ihrer ursprünglichen Formulierung. Es gibt keine richtigen oder falschen Antworten.', 'P1'),
  c('no', 'Direkt zu meinem Überblick', 'Dein Überblick funktioniert auch ohne diesen Fragebogen.', 'NOTE'),
], { sources: ['phq-form', 'phq-study'], note: 'Chatformat und gesamter WOLKI-Dialog sind nicht durch die PHQ-4-Studien validiert. Keine wertenden Zwischenreaktionen innerhalb der vier Items.' });
const phqItems = ['Wenig Interesse oder Freude an Ihren Tätigkeiten', 'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit', 'Nervosität, Ängstlichkeit oder Anspannung', 'Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren'];
const freq = ['Überhaupt nicht', 'An einzelnen Tagen', 'An mehr als der Hälfte der Tage', 'Beinahe jeden Tag'];
phqItems.forEach((title, i) => {
  const next = i === 3 ? 'NOTE' : `P${i + 2}`;
  node(`P${i+1}`, 'P', title, 'Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt?', [
    ...freq.map((label, value) => c(String(value), label, i === 3 ? 'Danke. Damit sind die vier Aussagen abgeschlossen.' : 'Antwort übernommen.', next, { value })),
    ...open(next).map(choice => ({ ...choice, reply: 'Diese Aussage bleibt unbeantwortet.' })),
  ], { clinical: true, sources: ['phq-form', 'phq-study'], note: `Originale deutsche UKE-Fassung, Bernd Löwe 2015. Item ${i+1} von 4. Fehlende Angaben erhalten keinen Punktwert.` });
});

screen('AI0', 'AI', 'Dein Anliegen braucht mehr Platz?', 'Du kannst es in eigenen Worten ergänzen. Die geplante KI soll nur beim Sortieren helfen: höchstens zwei Rückfragen, dann bestätigst oder korrigierst du die Zusammenfassung.\n\nIn dieser Testfassung ist noch keine KI verbunden. Dein Text wird als lokale Notiz übernommen. Es wird nichts an einen KI-Dienst gesendet.', [
  c('write', 'Mein Anliegen in eigenen Worten ergänzen', 'Bitte nenne keine Namen, Kontaktdaten oder andere identifizierenden Angaben.', 'AI1'),
  c('fixed', 'Einen festen Themenweg wählen', 'Du kannst einen anderen Schwerpunkt ausprobieren.', 'A3'),
  c('continue', 'Ohne Ergänzung weiter', 'Wir können auch mit den bisherigen Angaben arbeiten.', 'C1'),
], { note: 'KI ist eine optionale Erweiterung, kein erzwungener Ersatz für menschliche Hilfe. Die Auswahl eigener Text ist keine Zustimmung zu zukünftiger Cloud-Verarbeitung.' });
screen('AI1', 'AI', 'Was ist an deiner Situation bisher nicht vorgekommen?', 'Ein paar Sätze reichen. Du musst keine Einzelheiten erzählen.\n\nWolki liest diesen Text in der Testfassung nicht inhaltlich aus. Wenn es um akute Gefahr geht, nutze bitte „Hilfe jetzt“.', [
  c('save', 'Als Notiz übernehmen', 'Deine Ergänzung wird unverändert als Notiz geführt.', 'AI2'),
  c('skip', 'Ohne Text weiter', 'Wir lassen die Ergänzung aus.', 'C1'),
  c('help', 'Es geht um mögliche akute Gefahr', 'Dann gehen wir direkt zu menschlicher Hilfe.', 'H0', { help: true, resume: 'C1' }),
], { input: { key: 'ownConcern', maxLength: 800, required: false }, note: 'Die echte KI-Anbindung ist ausdrücklich deaktiviert. Keine scheinbare KI-Antwort und kein Keyword-Sicherheitstest in diesem lokalen Freitext.' });
screen('AI2', 'AI', 'Dein Text bleibt deine eigene Beschreibung.', 'Für die automatische Einordnung ist hier noch keine KI angeschlossen. Du kannst deine Notiz später im Überblick lesen.\n\nAuch ohne Einordnung können wir anschauen, wie es dir damit geht und was du brauchst.', [
  c('continue', 'Mit meinem Befinden weitermachen', 'Jetzt richten wir den Blick wieder auf dich.', 'C1'),
  c('edit', 'Meine Notiz ändern', 'Du kannst die Formulierung anpassen.', 'AI1'),
  c('fixed', 'Doch einen festen Themenweg wählen', 'Du kannst neu wählen; die Notiz bleibt separat sichtbar.', 'A3'),
]);

screen('NOTE', 'R', 'Gibt es noch etwas, das ich wissen sollte?', 'Vielleicht ist etwas Wichtiges bisher nicht vorgekommen. Wenn du möchtest, kannst du es in deinen eigenen Worten ergänzen. Du kannst aber genauso gut direkt zu deinem Überblick gehen.', [
  c('save', 'Meinen Überblick ansehen', 'Danke, dass du dir die Zeit genommen hast. Ich fasse jetzt behutsam zusammen, was du mir erzählt hast.', 'R0'),
  c('skip', 'Ohne Ergänzung zum Überblick', 'Natürlich. Dann schauen wir uns jetzt gemeinsam deine Momentaufnahme an.', 'R0'),
], { input: { key: 'note', maxLength: 800, required: false } });
screen('R0', 'R', 'Danke, dass du mir das anvertraut hast.', 'So habe ich verstanden, wie es dir gerade mit der Situation geht. Dein Überblick zeigt nur das, was du selbst ausgewählt oder erzählt hast. Alles, was du offengelassen hast, bleibt offen.\n\nDas hier legt nicht fest, wer du bist. Es ist eine Momentaufnahme. Wenn etwas nicht zu dir passt, kannst du es jederzeit ändern.', [
  c('step', 'Meinen ersten Schritt ansehen', 'Gern. Ich richte den Vorschlag danach aus, was du dir gerade wünschst.', 'R_NEXT'),
  c('edit', 'Meine Angaben prüfen und ändern', 'Natürlich. Du kannst jede besuchte Stelle noch einmal ansehen und ändern.', 'REVIEW'),
  c('sources', 'Woher kommt diese Einordnung?', 'Ich zeige dir, worauf die Fragen beruhen und wo ihre Grenzen liegen.', 'SOURCES'),
  c('done', 'Für heute abschließen', 'Das ist völlig in Ordnung. Für heute darf es genug sein.', 'DONE'),
], { dynamic: 'summary', note: 'Nur aus expliziten Antworten zusammensetzen. Keine geschätzten Diagnosen, keine Persönlichkeitstypen, keine Erklärung fremder Motive. PHQ nur vollständig auswerten. Sicherheitsbedenken nicht wegmitteln.' });
router('R_NEXT', 'R', 'Welcher erste Schritt wird gezeigt?', [
  { when: 'Ein Hilfehinweis wurde ausgelöst ODER Thema Suizidsorge ODER eine Sicherheitsantwort ist offen / nicht Nein', test: 'needsHuman', next: 'R_HELP' },
  { when: 'Sonst: C4 = calm', test: 'need:calm', next: 'R_CALM' },
  { when: 'Sonst: C4 = talk', test: 'need:talk', next: 'R_TALK' },
  { when: 'Sonst: C4 = boundaries', test: 'need:boundaries', next: 'R_BOUND' },
  { when: 'Sonst: C4 = support', test: 'need:support', next: 'R_SUPPORT' },
  { when: 'Sonst: C4 = understand oder offen', test: 'always', next: 'R_SORT' },
]);
const endChoices = [
  c('overview', 'Zurück zu meinem Überblick', 'Hier sind deine bisherigen Angaben.', 'R0'),
  c('done', 'Das reicht mir für heute', 'Ein kleiner Schritt darf für heute genug sein.', 'DONE'),
  c('more', 'Mehr Begleitung ansehen', 'Du kannst dir freiwillig die Konzeptvorschau ansehen.', 'R_PREMIUM'),
];
screen('R_CALM', 'R', 'Für den Moment etwas weniger tragen.', 'Wenn du gerade sicher bist: Such dir, wenn möglich, einen ruhigen Platz. Nimm wahr, wie deine Füße den Boden berühren. Lass den Atem so, wie er gerade ist. Du musst nichts erzwingen.\n\nWähle für die nächsten Minuten eine kleine Entlastung: etwas trinken, dich kurz setzen oder eine verlässliche Person um Gesellschaft bitten. Wenn sich etwas unangenehm anfühlt, lass es weg.', endChoices, { note: 'Freiwillige allgemeine Entlastung, keine Behandlung und kein Erfolgversprechen.' });
screen('R_SORT', 'R', 'Deine Sorge sortieren, ohne alles lösen zu müssen.', 'Für heute reichen drei getrennte Gedanken:\n1. Was weiß ich wirklich, weil es mir gesagt wurde oder ich es beobachtet habe?\n2. Was fühle und brauche ich selbst gerade?\n3. Was liegt in meinem Einfluss – und wofür brauche ich Unterstützung?\n\nWas unklar ist, darf unklar bleiben. Du musst die andere Person nicht diagnostizieren.', endChoices);
screen('R_TALK', 'R', 'Ein Gespräch kann mit einer kleinen Einladung beginnen.', 'Wenn keine Angst vor Gewalt oder Druck besteht und der Moment passt:\n\n„Mir ist etwas aufgefallen, das mich beschäftigt. Magst du gerade darüber sprechen?“\n\nBleib bei einer konkreten Beobachtung. Frage nach, statt zu erklären, wie die Person ist. Wenn sie nicht reden möchte, darf das Gespräch später stattfinden. Deine eigene Unterstützung muss darauf nicht warten.', endChoices, { dynamic: 'topicTip', note: 'Bei bekanntem Gewalt-/Gefahrhinweis sperrt R_NEXT diesen Gesprächsvorschlag. Themaabhängige Ergänzungen stehen in den festen Ergebnisbausteinen.' });
screen('R_BOUND', 'R', 'Eine Grenze kann konkret und klein sein.', 'Wenn du ohne Angst vor Drohungen eine Grenze ansprechen kannst:\n\n„Du bist mir wichtig. Heute kann ich dir eine Weile zuhören. Danach brauche ich Zeit für mich. Lass uns überlegen, wer zusätzlich helfen kann.“\n\nWähle etwas, das du tatsächlich leisten kannst. Bei Angst vor der Reaktion hol dir zuerst vertrauliche Unterstützung.', endChoices, { note: 'Keine Grenzkonfrontation bei bekanntem Gewalt- oder Gefahrhinweis. Die Person muss Nähe nicht leisten, wenn sie das nicht möchte.' });
screen('R_SUPPORT', 'R', 'Unterstützung darf auch nur für dich sein.', 'Du kannst bei einer passenden Beratungsstelle sagen:\n\n„Ich mache mir Sorgen um einen nahestehenden Menschen. Die Situation belastet mich selbst. Können Sie auch mich als Angehörige oder Bezugsperson beraten?“\n\nDu brauchst dafür keine eigene Diagnose und musst nicht auf die Zustimmung zu einer gemeinsamen Beratung warten.', [
  c('contacts', 'Passende Anlaufstellen ansehen', 'Die Auswahl richtet sich nach deinem Thema.', 'CONTACTS'),
  ...endChoices,
], { sources: ['nice-eating', 'addiction', 'bapk'] });
screen('R_HELP', 'R', 'Persönliche Unterstützung steht hier im Vordergrund.', 'Bei dir ist eine Sicherheitsangabe offen, du hast einen Hilfehinweis genannt oder es geht um Suizidsorgen. Daraus berechnet Wolki keine Dringlichkeitsstufe und keine Entwarnung.\n\nDu kannst jetzt eine passende menschliche Anlaufstelle wählen. Dein Überblick bleibt zugänglich. In diesem Weg erscheint kein Premium-Angebot.', [
  c('help', 'Hilfewege ansehen', 'Du musst dazu nichts weiter beantworten.', 'H0', { resume: 'R0' }),
  c('overview', 'Meinen Überblick ansehen', 'Offene Angaben bleiben dort ausdrücklich offen.', 'R0'),
  c('done', 'Für heute beenden', 'Du kannst Hilfe auch nach dem Beenden jederzeit wieder öffnen.', 'DONE'),
]);
router('R_PREMIUM', 'R', 'Darf die freiwillige Konzeptvorschau erscheinen?', [
  { when: 'Sicherheitsangaben offen, Hilfehinweis oder Thema Suizidsorgen', test: 'needsHuman', next: 'R_HELP' },
  { when: 'Sonst, nur nach aktivem Klick auf Mehr Begleitung', test: 'always', next: 'PREMIUM' },
]);
screen('PREMIUM', 'R', 'Wenn du weiter mit Wolki arbeiten möchtest.', 'Konzeptvorschau: Geplant sind kurze Übungen zur Entlastung, Vorbereitung auf Gespräche und Unterstützung beim Setzen eigener Grenzen.\n\nDieses Angebot ist noch nicht buchbar. Umfang und Preis sind hier noch nicht festgelegt. Dein Understanding-Überblick, der erste Schritt und Hilfe bleiben kostenlos.', [
  c('back', 'Bei meinem kostenlosen Überblick bleiben', 'Dein Überblick bleibt dir offen.', 'R0'),
  c('done', 'Für heute abschließen', 'Du entscheidest selbst, ob und wann du weitermachst.', 'DONE'),
], { note: 'Kein Checkout, keine erfundenen Leistungen, keine Dringlichkeit oder Kaufaufforderung aus Symptomwerten. Keine A/B-Optimierung gegen die Sicherheit.' });

screen('H0', 'H', 'Du musst das nicht allein klären.', 'Wenn du oder jemand anderes gerade unmittelbar in Gefahr ist, hol bitte Hilfe vor Ort. Wolki ist kein Notruf und kein überwachter Krisenchat.\n\nWelche Hilfe möchtest du ansehen?', [
  c('emergency', 'Mögliche unmittelbare Gefahr oder medizinischer Notfall', 'Dann sind Notruf und Hilfe vor Ort wichtig.', 'H1', { help: true }),
  c('crisis', 'Suizidgedanken, Selbstverletzung oder eine seelische Krise', 'Du kannst auch mit Unsicherheit Unterstützung bekommen.', 'H2', { help: true }),
  c('medical', 'Dringender medizinischer Rat', 'Bei Lebensgefahr gilt immer der Notruf.', 'H3', { help: true }),
  c('violence', 'Kontrolle, Drohungen oder Gewalt', 'Es gibt vertrauliche Unterstützung, auch für Bezugspersonen.', 'H4', { help: true }),
  c('return', 'Zum Dialog zurück', 'Die Hilfe bleibt jederzeit erreichbar.', 'RESUME'),
]);
screen('H1', 'H', 'Hol bitte jetzt Hilfe vor Ort.', 'Bei unmittelbarer Gefahr oder einem medizinischen Notfall: 112 in Deutschland und der EU. Bei einem laufenden Angriff: 110 in Deutschland.\n\nWenn du bei der Person bist, bleib nur dann in ihrer Nähe, wenn das für dich sicher ist. Bring dich nicht selbst in Gefahr. Der Notruf kann dir sagen, was als Nächstes zu tun ist. Außerhalb Deutschlands nutze die örtlichen Notfallkontakte.', [
  c('112', '112 anrufen', 'Die Telefonnummer lautet 112. Wolki nimmt nicht selbst Kontakt auf.', 'H_CALL', { external: 'tel:112' }),
  c('110', '110 anrufen – laufender Angriff in Deutschland', 'Die Telefonnummer lautet 110. Wolki nimmt nicht selbst Kontakt auf.', 'H_CALL', { external: 'tel:110' }),
  c('person', 'Eine sichere Person vor Ort hinzuholen', 'Du kannst jemanden konkret bitten, bei dir zu bleiben oder Hilfe zu holen.', 'H_PERSON'),
  c('other', 'Weitere Hilfewege ansehen', 'Hier findest du weitere Anlaufstellen.', 'H0'),
  c('continue', 'Zum Dialog zurück', 'Das Fortsetzen bestätigt keine Sicherheit. Hilfe bleibt erreichbar.', 'RESUME'),
], { sources: ['emergency', 'police'], note: 'Im lokalen Tester werden keine echten Anrufe ausgelöst. In der App nur bewusster Aufruf des Telefon-Dialogs, niemals automatische Kontaktaufnahme.' });
screen('H2', 'H', 'Sprich mit einem Menschen über diese Sorge.', 'Bei unmittelbarer Gefahr: 112. Wenn die Lage unklar ist, musst du sie nicht allein beurteilen.\n\nTelefonSeelsorge: 116 123, kostenlos, anonym und rund um die Uhr in Deutschland. Leitungen können belegt sein. Bei dringendem medizinischem Bedarf ohne Lebensgefahr, wenn die reguläre Praxis nicht verfügbar ist: 116 117.\n\nAuch als Angehörige oder nahestehende Person darfst du Unterstützung suchen.', [
  c('crisis', '116 123 anrufen', 'Die Telefonnummer lautet 116 123. Wolki ruft nicht für dich an.', 'H_CALL', { external: 'tel:116123' }),
  c('online', 'Informationen der TelefonSeelsorge öffnen', 'Dort findest du Informationen zu den Kontaktmöglichkeiten.', 'H_CALL', { external: 'https://www.telefonseelsorge.de/telefon/' }),
  c('urgent', '116 117 anrufen', 'Die Telefonnummer lautet 116 117. Bei Lebensgefahr gilt 112.', 'H_CALL', { external: 'tel:116117' }),
  c('now', 'Es könnte unmittelbar gefährlich sein', 'Dann öffne bitte den Weg für Hilfe vor Ort.', 'H1'),
  c('person', 'Eine verlässliche Person einbeziehen', 'Du musst diese Sorge nicht allein tragen.', 'H_PERSON'),
  c('continue', 'Zum Dialog zurück', 'Die Hilfe bleibt offen, auch wenn du zunächst weitermachst.', 'RESUME'),
], { sources: ['telefon', '116117', 'nimh-suicide'] });
screen('H3', 'H', 'Lass körperliche Beschwerden fachlich einschätzen.', 'Wolki kann körperliche Verschlechterungen nicht beurteilen. Bei Bewusstlosigkeit, starken Atemproblemen oder anderer möglicher Lebensgefahr: 112.\n\nFür dringende medizinische Beschwerden ohne Lebensgefahr, wenn die reguläre Praxis nicht verfügbar ist: 116 117. Sonst kann die behandelnde Praxis eine Anlaufstelle sein.', [
  c('emergency', 'Möglicher Notfall – 112', 'Bei möglicher Lebensgefahr hol bitte Hilfe vor Ort.', 'H1'),
  c('urgent', '116 117 anrufen', 'Die Telefonnummer lautet 116 117.', 'H_CALL', { external: 'tel:116117' }),
  c('practice', 'Eine behandelnde Praxis kontaktieren', 'Du kannst nachfragen, welche Angaben sie benötigt und welche Unterstützung möglich ist.', 'H_PERSON'),
  c('continue', 'Zum Dialog zurück', 'Wolki ersetzt die medizinische Einschätzung nicht.', 'RESUME'),
], { sources: ['116117', 'emergency'] });
screen('H4', 'H', 'Unterstützung bei Drohungen, Kontrolle oder Gewalt.', 'Du musst die Person, von der Druck oder Gewalt ausgeht, nicht erst konfrontieren. Wähle Unterstützung so, dass sie für dich erreichbar und sicher ist.\n\nLaufender Angriff: 110. Hilfetelefon Gewalt gegen Frauen: 116 016, auch für unterstützende Personen. Für Menschen, die eine Straftat erlebt haben, und Personen, die für sie anrufen: WEISSER RING, 116 006, täglich 7–22 Uhr, kostenlos.\n\nWenn jemand dein Gerät kontrolliert, nutze möglichst einen sicheren Zugang. Ein Zurück-Knopf löscht keinen Browser-Verlauf.', [
  c('now', 'Es passiert gerade ein Angriff', 'Dann geht es um unmittelbare Hilfe vor Ort.', 'H1'),
  c('women', '116 016 – Hilfetelefon Gewalt gegen Frauen', 'Dieses Angebot berät auch Menschen, die eine betroffene Frau unterstützen.', 'H_CALL', { external: 'tel:116016' }),
  c('victim', '116 006 – WEISSER RING', 'Das Opfer-Telefon ist täglich von 7 bis 22 Uhr erreichbar.', 'H_CALL', { external: 'tel:116006' }),
  c('continue', 'Zum Dialog zurück', 'Du musst keine weiteren Einzelheiten erzählen.', 'RESUME'),
], { sources: ['violence', 'weisser-ring', 'police'] });
screen('H5', 'H', 'Diese Sicherheitsangabe bleibt offen.', 'Du musst sie nicht beantworten, um weiterzugehen. Wolki kann daraus keine Sicherheit ableiten. Hilfe ist auch ohne weitere Angaben erreichbar.', [
  c('help', 'Hilfewege ansehen', 'Dafür musst du keine weiteren Fragen beantworten.', 'H0'),
  c('continue', 'Weiter, Angabe offenlassen', 'Die Angabe bleibt auch im Überblick offen.', 'RESUME'),
]);
screen('H_CALL', 'H', 'Die Anlaufstelle ist ausgewählt.', 'Im lokalen Test wird kein echter Anruf und keine externe Übertragung ausgelöst. Die ausgewählte Nummer oder Adresse wird angezeigt.\n\nWenn ein Kontakt nicht zustande kommt, kannst du einen anderen Hilfeweg wählen. Bei unmittelbarer Gefahr gilt der Notruf.', [
  c('other', 'Andere Hilfewege ansehen', 'Hier kannst du eine andere Anlaufstelle auswählen.', 'H0'),
  c('continue', 'Zum Dialog zurück', 'Das Auswählen eines Kontakts bestätigt nicht, dass Hilfe erreicht wurde.', 'RESUME'),
], { dynamic: 'external', note: 'Produktzustand nach Rückkehr aus Telefon/Browser ebenfalls ohne Erfolg behaupten. Keine Kontaktaufnahme als erledigt markieren.' });
screen('H_PERSON', 'H', 'Eine konkrete Bitte kann den Anfang leichter machen.', 'Zum Beispiel:\n„Ich mache mir gerade Sorgen und brauche Unterstützung. Kannst du jetzt bei mir bleiben oder mit mir eine passende Hilfe anrufen?“\n\nWähle jemanden, bei dem du dich sicher fühlst. Wenn niemand erreichbar ist, bleiben die professionellen Hilfewege offen.', [
  c('help', 'Professionelle Hilfewege ansehen', 'Hier findest du Anlaufstellen.', 'H0'),
  c('continue', 'Zum Dialog zurück', 'Du kannst Hilfe jederzeit wieder öffnen.', 'RESUME'),
]);
router('RESUME', 'H', 'Wohin geht es nach Hilfe zurück?', [
  { when: 'Eine Antwort hat ein konkretes resume-Ziel gesetzt', test: 'resume', next: '$resume' },
  { when: 'Hilfe wurde global geöffnet: zur zuvor angezeigten Karte', test: 'globalReturn', next: '$return' },
  { when: 'Kein Rückkehrziel vorhanden', test: 'always', next: 'C1' },
]);

screen('CONTACTS', 'R', 'Hier kann die Suche nach Unterstützung anfangen.', 'Die Anlaufstellen sind nach Thema geordnet. Auch eine Beratung nur für dich als Angehörige oder Bezugsperson ist ein möglicher erster Schritt. Es wird kein Kontakt automatisch hergestellt.', [
  c('eating', 'Essstörungen – Informationen und Beratung für Angehörige', 'Du kannst dich auch ohne bekannte Diagnose informieren.', 'H_CALL', { external: 'https://www.bzga-essstoerungen.de/hilfe-finden/welche-beratung-gibt-es/' }),
  c('addiction', 'Suchtfragen – DigiSucht für Angehörige', 'Hier findest du einen Zugang zu Suchtberatung.', 'H_CALL', { external: 'https://www.suchtberatung.digital/suchtberatung-fuer-angehoerige/' }),
  c('mental', 'Psychische Erkrankung – Angehörigenselbsthilfe', 'Auch deine Bedürfnisse dürfen Thema einer Beratung sein.', 'H_CALL', { external: 'https://www.bapk.de/angehoerige-und-psychiatrie.html' }),
  c('care', 'Pflege – Informationen zur eigenen Entlastung', 'Hier geht es auch um die Gesundheit der pflegenden Person.', 'H_CALL', { external: 'https://gesund.bund.de/belastungen-pflegende-angehoerige' }),
  c('violence', 'Mobbing mit Bedrohung, Kontrolle oder Gewalt', 'Hier stehen vertrauliche Hilfewege.', 'H4', { resume: 'R0' }),
  c('back', 'Zu meinem Überblick', 'Hier sind deine Angaben.', 'R0'),
], { note: 'Bei Schule: geeignete vertraute erwachsene Person, Schulsozialarbeit oder Schulberatung. Bei Arbeit: vertrauliche unabhängige Beratung oder passende betriebliche Ansprechstelle; keine Rechtsberatung durch Wolki.' });
screen('REVIEW', 'SYS', 'Welche Antwort möchtest du ändern?', 'Die Übersicht zeigt jede von dir besuchte Frage und deine Antwort. Wähle eine Frage aus. Antworten nach dieser Stelle werden neu aufgebaut, damit alte Themen und Empfehlungen nicht versehentlich weitergelten.', [
  c('restart', 'Ab dem Einstieg neu beantworten', 'Deine nachfolgenden Antworten werden für den neuen Verlauf verworfen.', 'A1', { reset: true }),
  c('back', 'Ohne Änderung zum Überblick', 'Deine Angaben bleiben bestehen.', 'R0'),
], { dynamic: 'review', note: 'Zusätzlich eine Schaltfläche je besuchter Frage: Ziel ist exakt deren nodeId. Ein Klick stellt den Zustand unmittelbar vor dieser Antwort wieder her. Keine unbesuchten Fragen anzeigen.' });
screen('PAUSE', 'SYS', 'Du kannst hier eine Pause machen.', 'Ohne Speichern bleiben deine Angaben nur in diesem geöffneten Fenster. Auf Wunsch kannst du den Stand auf diesem Gerät sichern und innerhalb von sieben Tagen fortsetzen. Auf einem geteilten oder kontrollierten Gerät ist das möglicherweise nicht passend.', [
  c('continue', 'Jetzt fortsetzen', 'Wir machen an derselben Stelle weiter.', 'RETURN'),
  c('save', 'Auf diesem Gerät speichern und pausieren', 'Der Stand bleibt bis zu sieben Tage auf diesem Gerät. Du kannst ihn vorher löschen.', 'PAUSED', { persist: true }),
  c('delete', 'Meine Testangaben löschen', 'Du kannst den gespeicherten Stand und die Angaben in diesem Fenster entfernen.', 'DELETE'),
]);
screen('PAUSED', 'SYS', 'Dein Stand ist auf diesem Gerät gespeichert.', 'Du kannst innerhalb von sieben Tagen an derselben Stelle weitermachen. Es erfolgt keine Erinnerung und keine Nachricht an andere Personen.', [
  c('continue', 'Fortsetzen', 'Wir kehren zu deiner letzten Stelle zurück.', 'RETURN'),
  c('delete', 'Gespeicherten Stand löschen', 'Du kannst alle lokalen Testangaben entfernen.', 'DELETE'),
]);
screen('DELETE', 'SYS', 'Möchtest du deine lokalen Testangaben löschen?', 'Dabei werden der Gesprächsstand und die Notizen dieser Testfassung auf diesem Gerät entfernt. Ein externer Browser-Verlauf wird dadurch nicht gelöscht.', [
  c('yes', 'Ja, Testangaben löschen', 'Die lokalen Testangaben wurden entfernt.', 'START', { reset: true, clearStorage: true }),
  c('no', 'Doch behalten und fortsetzen', 'Wir gehen zurück zu deiner letzten Stelle.', 'RETURN'),
]);
router('RETURN', 'SYS', 'Zur zuvor geöffneten Karte zurückkehren', [
  { when: 'Eine vorherige Karte wurde gespeichert', test: 'globalReturn', next: '$return' },
  { when: 'Kein vorheriger Ort vorhanden', test: 'always', next: 'START' },
]);
screen('SOURCES', 'SYS', 'Worauf dieser Entwurf beruht.', 'Leitlinien und Fachinformationen begründen die Themen und den Umgang mit Angehörigen. Nur die vier PHQ-Aussagen stammen aus einem validierten Instrument. Unsere übrigen Fragen und die Kombination zu diesem Dialog sind neu formuliert und noch nicht klinisch geprüft.\n\nEs wurden veröffentlichte Quellen gelesen; Ärztinnen, Ärzte oder Betroffenenverbände haben diesen Entwurf noch nicht persönlich freigegeben.', [
  c('overview', 'Zu meinem Überblick', 'Hier ist deine Momentaufnahme.', 'R0'),
], { dynamic: 'sources' });
screen('DONE', 'SYS', 'Für heute darf es genug sein.', 'Danke, dass du dir Zeit für dich genommen hast. Du darfst Unterstützung bekommen, auch wenn es ursprünglich um einen anderen Menschen geht. Und du musst nicht alles für diese Person lösen.\n\nDein Überblick bleibt in diesem Fenster erreichbar. Wenn du ihn gespeichert hast, kannst du ihn jederzeit wieder löschen.', [
  c('overview', 'Meinen Überblick noch einmal ansehen', 'Natürlich. Wir schauen noch einmal gemeinsam darauf.', 'R0'),
  c('pause', 'Stand speichern oder pausieren', 'Du entscheidest selbst, ob auf diesem Gerät etwas gespeichert werden soll.', 'PAUSE'),
  c('delete', 'Testangaben löschen', 'Okay. Du kannst deine lokalen Angaben jetzt entfernen.', 'DELETE'),
], { terminal: true });

export const sources = [
  ['nice-eating','NICE NG69: Angehörige bei Essstörungen','https://www.nice.org.uk/guidance/ng69/ifp/chapter/Supporting-parents-family-members-and-carers','Eigene emotionale, soziale und praktische Bedürfnisse von Angehörigen erfragen; Patient:innenwünsche respektieren.'],
  ['iqwig-eating','IQWiG: Essstörungen – Eltern und Angehörige','https://www.gesundheitsinformation.de/essstoerungen-informationen-fuer-eltern-und-angehoerige.html','Unterstützung betrifft auch Familie, Geschwister und nahestehende Menschen.'],
  ['iqwig-weight','IQWiG: Starkes Übergewicht','https://www.gesundheitsinformation.de/starkes-uebergewicht-adipositas.html','Viele Einflussfaktoren; Diskriminierung und Vorurteile vermeiden.'],
  ['awmf-weight','AWMF S3: Prävention und Therapie der Adipositas, 2024','https://register.awmf.org/assets/guidelines/050-001l_S3_Praevention-Therapie-Adipositas_2024-10.pdf','Nicht stigmatisierende Versorgung; keine Krankheits- oder Charakterannahmen allein aus dem Körpergewicht.'],
  ['bullying','StopBullying.gov: Betroffene Kinder unterstützen','https://www.stopbullying.gov/prevention/support-the-children-involved','Zuhören, keine Schuldzuweisung, geeignete Erwachsene einbeziehen; keine erzwungene Konfrontation. Kinderkontext, nicht automatisch ein deutsches Arbeitsrechtsmodell.'],
  ['bapk','BApK: Angehörige und Psychiatrie','https://www.bapk.de/angehoerige-und-psychiatrie.html','Eigene Belastung und Unterstützung von Angehörigen ernst nehmen.'],
  ['nvl','Nationale VersorgungsLeitlinie Unipolare Depression','https://www.leitlinien.de/themen/depression/version-3/kapitel-2','Fachliche Diagnostik und direkte Abklärung; kein Ersatz durch einen Angehörigen-Dialog.'],
  ['anxiety','AWMF Patientenleitlinie Angststörungen','https://register.awmf.org/assets/guidelines/051-028p_S3_Behandlung-von-Angststoerungen_2022-07.pdf','Angemessene fachliche Hilfe und Unterstützung; Angehörige nicht als Behandelnde einsetzen.'],
  ['addiction','IQWiG: Was können Angehörige bei Alkoholproblemen tun?','https://www.gesundheitsinformation.de/was-koennen-angehoerige-tun.html','Eigene Grenzen und Beratung; ruhige Gespräche, keine moralischen Etiketten. Nicht alle Aussagen auf Gaming übertragen.'],
  ['digisucht','DigiSucht: Beratung für Angehörige','https://www.suchtberatung.digital/suchtberatung-fuer-angehoerige/','Eigener Beratungszugang für Angehörige bei Suchtfragen.'],
  ['violence','Hilfetelefon: Häusliche Gewalt','https://www.hilfetelefon.de/gewalt-gegen-frauen/haeusliche-gewalt/','Kontrolle, Isolation und Drohungen mitdenken; vertrauliche Beratung auch für unterstützende Personen.'],
  ['nimh-suicide','NIMH: Five Action Steps','https://www.nimh.nih.gov/health/publications/5-action-steps-to-help-someone-having-thoughts-of-suicide','Direktes Fragen, Zuhören und menschliche Hilfe. US-Kontakt 988 wird nicht nach Deutschland übernommen.'],
  ['care','gesund.bund.de: Belastungen pflegender Angehöriger','https://gesund.bund.de/belastungen-pflegende-angehoerige','Eigene Gesundheit, praktische Aufgaben und Entlastung berücksichtigen.'],
  ['grief','gesund.bund.de: Mit Trauer umgehen','https://gesund.bund.de/mit-trauer-umgehen','Trauer ist unterschiedlich; keine feste Gefühlsfolge oder Frist unterstellen.'],
  ['nice-adhd','NICE NG87: ADHD – Empfehlungen','https://www.nice.org.uk/guidance/ng87/chapter/recommendations','Auswirkungen in mehreren Lebensbereichen, Umweltanpassungen, Schule sowie Bedürfnisse von Familie und Bezugspersonen berücksichtigen; die Sicht der betroffenen Person einbeziehen.'],
  ['nice-autism-diagnosis','NICE CG128: Autismus bei Kindern und Jugendlichen – Erkennen und Diagnostik','https://www.nice.org.uk/guidance/cg128/chapter/Recommendations','Bedenken ernst nehmen, andere Erklärungen offenhalten und Diagnostik einem qualifizierten Team überlassen.'],
  ['nice-autism-support','NICE CG170: Autismus bei Kindern und Jugendlichen – Unterstützung','https://www.nice.org.uk/guidance/cg170/chapter/recommendations','Kommunikation, Reize, Veränderungen, Umfeld, Begleiterkrankungen und Bedürfnisse von Familie und Bezugspersonen berücksichtigen.'],
  ['nice-disabled-children','NICE NG213: Unterstützung für behinderte Kinder und Jugendliche','https://www.nice.org.uk/guidance/ng213/chapter/Recommendations-on-specialist-support-for-disabled-children-and-young-people-with-particular-needs','Kinder, Jugendliche, Familien und Bezugspersonen an Einschätzung und Unterstützungsplanung beteiligen.'],
  ['who-icf','WHO: International Classification of Functioning, Disability and Health','https://www.who.int/standards/classifications/international-classification-of-functioning-disability-and-health','Funktionieren und Behinderung im Zusammenhang mit Umweltfaktoren und Teilhabe betrachten.'],
  ['who-disability-survey','WHO: Model Disability Survey – Fragen und Antworten','https://www.who.int/news-room/questions-and-answers/item/model-disability-survey','Menschen mit gleicher Beeinträchtigung können je nach Umwelt sehr unterschiedliche Barrieren und Teilhabemöglichkeiten erleben.'],
  ['unicef-inclusive','UNICEF: Inclusive education','https://www.unicef.org/education/inclusive-education','Barrieren, Diskriminierung und fehlende Anpassungen im Bildungssystem statt Defizite des Kindes in den Mittelpunkt stellen.'],
  ['unicef-school','UNICEF: Mit der Schule über Mobbing sprechen','https://www.unicef.org/parenting/child-care/how-talk-school-about-bullying','Dem Kind ruhig zuhören, es nicht beschuldigen, seine Wünsche berücksichtigen und passende Ansprechpersonen in der Schule einbeziehen.'],
  ['wcag22','W3C: Web Content Accessibility Guidelines 2.2','https://www.w3.org/TR/WCAG22/','Bedienbarkeit mit Tastatur, sichtbarer Fokus, konsistente Hilfe, Fehlervermeidung und mindestens 24 × 24 CSS-Pixel große oder ausreichend getrennte Zeigerziele; WOLKI plant komfortablere 44 × 44 CSS-Pixel.'],
  ['en301549','ETSI: EN 301 549 – Accessibility requirements for ICT','https://www.etsi.org/technical-groups/hf/','Europäischen Barrierefreiheitsstandard für ICT als Freigabekriterium führen; die für den Veröffentlichungszeitpunkt geltende Fassung muss im Compliance-Test bestätigt werden.'],
  ['phq-form','UKE: Originale deutsche PHQ-4-Fassung','https://www.uke.de/dateien/institute/institut-und-poliklinik-f%C3%BCr-psychosomatische-medizin-und-psychotherapie/downloads/gesundheitsfragebogen-phq-4.pdf','Originaler Zweiwochenbezug, vier Items, vier Häufigkeiten. © Prof. Dr. Bernd Löwe 2015.'],
  ['phq-study','Löwe et al.: PHQ-4-Validierung, 2010','https://pubmed.ncbi.nlm.nih.gov/19616305/','Psychometrische Untersuchung in einer deutschen Bevölkerungsstichprobe; keine Validierung des gesamten WOLKI-Flows.'],
  ['telefon','TelefonSeelsorge: Telefonangebot','https://www.telefonseelsorge.de/telefon/','116 123 in Deutschland, kostenlos, anonym, rund um die Uhr; Leitungen können belegt sein.'],
  ['116117','116117: Wann der ärztliche Bereitschaftsdienst hilft','https://www.116117.de/de/index.php?page=notfall','Dringende medizinische Hilfe ohne Lebensgefahr, wenn reguläre Versorgung nicht erreichbar ist.'],
  ['emergency','gesund.bund.de: Notfallnummern','https://gesund.bund.de/notfallnummern','112 für medizinische Notfälle; Kontakte nach Land unterscheiden.'],
  ['police','Polizei: Onlinewache / Notrufhinweis','https://portal.onlinewache.polizei.de/','110 bei laufender unmittelbarer Gefahr durch Angriff in Deutschland.'],
  ['weisser-ring','WEISSER RING: Opfer-Telefon','https://weisser-ring.de/hilfe-fuer-opfer/opfer-telefon','116 006, kostenlos und anonym, täglich 7–22 Uhr; auch stellvertretender Kontakt möglich.'],
].map(([id,title,url,application]) => ({id,title,url,application}));

export const topicTips = {
  eating: 'Bei Essensthemen: Sprich über eine konkrete Beobachtung und deine Sorge. Vermeide Kommentare über Gewicht, Figur oder „Disziplin“. Beratung ist auch für dich allein möglich.',
  body: 'Bei Körper- oder Gewichtsthemen: Frag erst, ob die Person darüber sprechen möchte. Unterstützung richtet sich nach ihren Wünschen. Gewichtsverlust ist keine Antwort auf Abwertung.',
  bullying: 'Bei Mobbing: „Ich nehme ernst, was du mir erzählst. Was wäre jetzt eine Unterstützung?“ Nicht zum Zurückschlagen oder zur gemeinsamen Konfrontation drängen. Bei Kindern geeignete sichere Erwachsene einbeziehen.',
  mood: 'Bei Rückzug: „Ich denke an dich. Magst du etwas erzählen oder lieber einfach Gesellschaft?“ Bei mitgeteilten Suizidgedanken direkt menschliche Hilfe einbeziehen.',
  anxiety: 'Bei Angst: Frag nach dem, was im Moment hilfreich wäre. Du musst Angst nicht wegdiskutieren oder eine Behandlung anleiten.',
  addiction: 'Bei Substanzkonsum: Ein ruhiger Moment, in dem die Person nicht berauscht ist, kann passender sein. Sprich über konkrete Auswirkungen und deine Grenzen. Bei Angst vor Aggression zuerst Hilfe suchen.',
  conflict: 'Ein Gesprächsvorschlag gilt nur, wenn du dich dabei nicht bedroht fühlst. Bei Kontrolle, Angst oder Gewalt hat vertrauliche Unterstützung Vorrang.',
  suicide: 'Suizidsorgen brauchen direkte, persönliche Unterstützung. Ein Gesprächsentwurf ersetzt keine fachliche Einschätzung.',
  care: 'Bei Krankheit oder Trauer: Biete eine konkrete, freiwillige Unterstützung an, ohne Gefühle oder Trauer verändern zu wollen.',
  neuro: 'Bei ADHS, Autismus oder anderer Neurodivergenz: Frag, welche Situationen schwer sind und welche Anpassungen tatsächlich helfen. Diagnose, Vermutung und Beobachtung bleiben getrennt; die Person bestimmt mit.',
  disability: 'Bei Behinderung oder langfristigem Unterstützungsbedarf: Frag nach Barrieren, Teilhabe und gewünschter Hilfe. Die Person ist nicht das Problem. Achte auch darauf, ob Verantwortung in der Familie fair getragen wird.',
  school: 'Bei Schulproblemen: Hör zuerst die Sicht des Kindes oder der betroffenen Person an. Kläre dann, was beobachtet wurde, wer bereits eingebunden ist und welcher kleine nächste Schritt gewünscht ist.',
  selfworth: 'Bei starken Selbstzweifeln: Greif konkrete Worte oder Situationen auf, ohne den Charakter der Person zu erklären. Frag, ob Zuhören, praktische Hilfe, Ermutigung oder Abstand gewünscht ist.',
  family: 'Bei belastendem Familienalltag: Benenne konkrete Aufgaben, Übergänge und Konflikte. Verteilt Verantwortung neu, wenn das sicher möglich ist; bei Angst oder Kontrolle zuerst vertrauliche Hilfe.',
};

export const aiContract = {
  enabled: false,
  status: 'Geplanter separater Adapter; kein Modell, keine Zugangsdaten, keine Datenübertragung eingerichtet.',
  trigger: 'A3K = eigenes Anliegen oder F1 = passt nicht. Niemals allein aufgrund eines Beschwerdewerts.',
  stages: [
    { id: 'AI-CONSENT', title: 'Vor echter KI-Verarbeitung', text: 'Dieser Teil nutzt KI zum Sortieren deiner Beschreibung. Vor dem Senden siehst du, welcher Dienst welche Angaben erhält und wie lange er sie speichert. Bitte nenne keine identifizierenden Daten über dich oder andere. Du kannst ohne KI weitermachen.', buttons: ['Zustimmen und fortfahren → feste Sicherheitsfragen', 'Ohne KI weiter → C1'] },
    { id: 'AI-SAFETY', title: 'Fester Sicherheitsweg', text: 'S1 und S2 unverändert vorschalten; bekannte Krisen- oder Gewaltangaben nie an KI abgeben. Hilfe bleibt ständig erreichbar. Eine freie Texteingabe ist kein Ersatz für direkte Sicherheitsfragen.', buttons: ['Sicherheitsangabe bejaht / unklar → H0, KI nicht starten', 'Angabe verweigert / übersprungen → C1, KI nicht starten', 'Beide Antworten Nein und kein früherer Hilfehinweis → AI-TEXT'] },
    { id: 'AI-TEXT', title: 'Ein Anliegen, eigene Worte', text: 'Was möchtest du ergänzen, damit ich deine Sorge besser verstehe?', buttons: ['Senden → begrenzte Klärung', 'Ohne Text weiter → C1'] },
    { id: 'AI-CLARIFY', title: 'Höchstens zwei Rückfragen', text: 'KI fragt nur nach einem fehlenden Kontext oder nach der eigenen Belastung. Keine Diagnose, Persönlichkeitsdeutung, Methode, Trauma-Details oder Endlosschleife. Pro Runde stehen immer „Antwort senden“, „Überspringen“ und „Ohne KI weiter“ bereit.', buttons: ['Antwort senden / überspringen → Bestätigung oder nächste zulässige Rückfrage', 'Nach maximal zwei Fragen → AI-CONFIRM', 'Fehler / Timeout / Abbruch → AI2; vorhandenen Text nur lokal als Notiz behalten'] },
    { id: 'AI-CONFIRM', title: 'Die Person bestätigt die Einordnung', text: 'So habe ich dich verstanden: [kurze vorläufige Zusammenfassung]. Trifft das deine Sorge?', buttons: ['Ja → C1 mit bestätigter Zusammenfassung separat', 'Nicht ganz → einmalige eigene Korrektur, dann C1', 'Gar nicht → unveränderte eigene Notiz behalten, C1; menschliche Beratung anbieten'] },
  ],
  allowedOutput: ['kurze vorläufige Paraphrase', 'höchstens zwei nicht sensible Klärungsfragen', 'optionaler Vorschlag für vorhandenes Thema, nur nach Nutzerbestätigung'],
  forbiddenOutput: ['Diagnose oder Prozentwahrscheinlichkeit', 'Persönlichkeit oder Motive zuschreiben', 'PHQ-Antwortwerte aus Text ableiten', 'Sicherheit bestätigen oder Hilfehinweise löschen', 'Safety-Routing, Premium-Rangfolge oder Kaufdruck erzeugen'],
  precedence: 'Strukturierte Hilfehinweise haben immer Vorrang. Auch ein freitextbezogener Gefahrenhinweis darf nur menschliche Hilfe anbieten und nie Entwarnung geben. Der künftige Dienst braucht gesonderte klinische und technische Prüfung; hier ist keine Freitext-Sicherheitserkennung implementiert.',
};

export const graph = {
  title: 'WOLKI · Crafted Understanding', version: 7, date: '2026-09-04', start: 'START', nodes, sources, topicTips, aiContract,
  sections: [
    ['A','Ankommen & wählen','#6743a4'], ['ND','ADHS, Autismus & Neurodivergenz','#446e91'], ['BH','Behinderung & Teilhabe','#35766f'],
    ['SCH','Schule & Lernen','#4f69a1'], ['SW','Selbstzweifel & Selbstwert','#75629a'], ['FA','Familienalltag & Verantwortung','#80624e'],
    ['E','Essen / Essstörungen','#2f6b76'], ['W','Gewicht & Körperbild','#3f7183'],
    ['M','Mobbing & Ausgrenzung','#4067a6'], ['D','Rückzug & Niedergeschlagenheit','#526398'], ['AN','Angst & Panik','#437788'],
    ['SU','Substanzen & Verhalten','#6b638f'], ['V','Konflikte & Gewalt','#9a566a'], ['U','Suizidsorgen & Selbstverletzung','#a34656'],
    ['K','Erkrankung, Pflege & Trauer','#427766'], ['C','Dein Befinden & Wunsch','#247365'], ['H','Sicherheit & Hilfe','#a13d50'],
    ['P','Freiwillig: PHQ-4','#517641'], ['AI','Eigenes Anliegen & KI-Grenze','#926d2f'], ['R','Überblick & erster Schritt','#8d438b'], ['SYS','Kontrolle & Fortsetzen','#626d7d'],
  ].map(([id,title,color]) => ({id,title,color})),
  global: { back: 'Vorherige beantwortete Karte aus dem Verlauf; Zustand vor dieser Antwort wiederherstellen. Nie stillschweigend alte Folgeantworten behalten.', pause: 'PAUSE', help: 'H0', rules: ['Eine Auswahl pro Frage; nichts vorselektiert.', 'Jede inhaltliche Frage hat sichtbare Nichtantworten mit explizitem Ziel.', 'Wolki-Reaktion steht über der nächsten Frage; keine künstliche Tippverzögerung.', 'Fortschritt nach Abschnitten und besuchten Fragen anzeigen; optionale Wege als Zusatz kennzeichnen.', 'Vor- und zurückgehende Navigation nach dem echten Verlauf, nicht nach einer globalen Fragenliste.', 'Bereits gemachte Angaben nicht unnötig erneut verlangen; bei einer bewussten Sicherheitsbestätigung die frühere Angabe sichtbar machen.', 'Hilfe wird nicht durch Nichtantwort, Paywall, Login oder KI-Verfügbarkeit blockiert.', 'Touchziele mindestens 44 × 44 CSS-Pixel im Test, sichtbarer Tastaturfokus und verständliche Beschriftung.'] },
};

export function findNode(id) { return nodes.find(n => n.id === id); }
export function selectedTopic(state) {
  for (const id of ['A3E','A3P','A4','A3R','A3K']) if (topicTips[state.answers[id]]) return state.answers[id];
  return topicTips[state.answers.A3] ? state.answers.A3 : null;
}
export function needsHuman(state) { return Boolean(state.helpSeen || selectedTopic(state) === 'suicide' || state.answers.S1 !== 'no' || state.answers.S2 !== 'no'); }
export function resolve(id, state) {
  let attempts = 0;
  while (findNode(id)?.kind === 'router') {
    if (++attempts > 8) throw new Error('Router cycle');
    const returnTarget = id === 'RESUME' ? state.helpReturn : state.returnTo;
    const rule = findNode(id).rules.find(rule => rule.test === 'always' || (rule.test === 'needsHuman' && needsHuman(state)) || (rule.test.startsWith('need:') && state.answers.C4 === rule.test.slice(5)) || (rule.test === 'resume' && state.resume) || (rule.test === 'globalReturn' && returnTarget));
    if (!rule) throw new Error(`No route at ${id}`);
    id = rule.next === '$resume' ? state.resume : rule.next === '$return' ? returnTarget : rule.next;
  }
  return id;
}
export function initialState() { return { current: 'START', answers: {}, notes: {}, history: [], helpSeen: false, resume: null, returnTo: null, helpReturn: null, reply: '', external: null }; }
export function advance(state, choiceId, input) {
  const current = findNode(state.current), choice = current?.choices.find(c => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice ${state.current}/${choiceId}`);
  const next = structuredClone(state);
  // Store a non-recursive snapshot, enabling precise backtracking and review.
  const { history, ...snapshot } = structuredClone(state);
  next.history.push(snapshot);
  if (current.input && choiceId !== 'skip') next.notes[current.input.key] = String(input ?? '').slice(0, current.input.maxLength);
  if (current.kind === 'question') next.answers[current.id] = choice.id;
  const topicSelectors = new Set(['A3E','A3P','A4','A3R','A3K']);
  if (choice.resetTopic || current.id === 'A3' || topicSelectors.has(current.id)) {
    const common = new Set(topicSelectors.has(current.id) && !choice.resetTopic ? ['A1', 'A2', 'A3', current.id] : ['A1', 'A2', 'A3']);
    for (const key of Object.keys(next.answers)) if (!common.has(key)) delete next.answers[key];
    // Previously disclosed concerns remain visible until a deliberate new session.
  }
  if (choice.reset) { const reset = initialState(); next.answers = reset.answers; next.notes = reset.notes; next.history = []; next.helpSeen = false; next.resume = null; }
  if (choice.help || ['H1', 'H2', 'H3', 'H4'].includes(choice.next)) next.helpSeen = true;
  if (choice.resume) next.resume = choice.resume;
  else if (['U1','U2','U3','V2'].includes(current.id) && ['H2','H4'].includes(choice.next)) next.resume = 'C1';
  if (choice.next === 'PAUSE') next.returnTo = current.id;
  if (choice.external && current.section === 'R') next.resume = 'R0';
  if (choice.external) next.external = choice.external;
  next.reply = choice.reply;
  next.current = resolve(choice.next, next);
  return next;
}
export function phqScore(answers) {
  const values = [1,2,3,4].map(i => answers[`P${i}`]);
  if (!values.every(value => typeof value === 'string' && /^[0-3]$/.test(value))) return null;
  const numbers = values.map(Number), total = numbers.reduce((a,b) => a+b,0), phq2 = numbers[0]+numbers[1], gad2 = numbers[2]+numbers[3];
  return { total, phq2, gad2, level: total <= 2 ? 'geringe' : total <= 5 ? 'leichte' : total <= 8 ? 'mittlere' : 'starke', followUp: phq2 >= 3 || gad2 >= 3 };
}
export function summaryLines(state) {
  const line = (key, prefix) => {
    const choice = findNode(key)?.choices.find(c => c.id === state.answers[key]);
    return `${prefix}: ${!choice || choice.missing ? 'offen' : choice.label}.`;
  };
  const result = [line('A2','Deine Beziehung'),line('A3','Deine Sorge')];
  const detailId = ['A3E','A3P','A4','A3R','A3K'].find(id => state.answers[id]);
  if (detailId) result.push(line(detailId,'Dein genauerer Schwerpunkt'));
  result.push(line('A1','Gerade geht es dir so'),line('C1','Das löst die Situation in dir aus'),line('C2','Dein Alltag'),line('C3','Deine Unterstützung'),line('C4','Dein Wunsch'));
  const branch = Object.entries(state.answers).filter(([id]) => ['ND','BH','SCH','SW','FA','E','W','M','D','AN','SU','V','U','K'].includes(findNode(id)?.section));
  branch.forEach(([id]) => result.push(line(id,findNode(id).title)));
  const score = phqScore(state.answers);
  result.push(score ? `PHQ-4: ${score.total} von 12 Punkten – ${score.level} Ausprägung der erfragten Beschwerden. Keine Erkrankungswahrscheinlichkeit und keine Diagnose.${score.followUp ? ' Mindestens eine Teilskala erreicht den Hinweiswert für weitere fachliche Abklärung. Ein ärztliches oder psychotherapeutisches Gespräch kann das genauer einordnen.' : ''}` : 'PHQ-4: kein vollständiger Fragebogenwert; fehlende Angaben wurden nicht ergänzt.');
  result.push(needsHuman(state) ? 'Sicherheit: mindestens eine Angabe ist offen oder es gibt einen Hilfehinweis. Daraus lässt sich keine Entwarnung ableiten.' : 'Sicherheit: Du hast die beiden Sicherheitsfragen verneint. Das ist keine fachliche Bestätigung von Sicherheit.');
  result.push('Diese Angaben beschreiben dein jetziges Erleben. Sie sind keine Aussage über deine Persönlichkeit.');
  return result;
}
