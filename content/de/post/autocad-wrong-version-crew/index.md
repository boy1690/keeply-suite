---
title: "Warum dein Trupp ständig die AutoCAD-Zeichnung der letzten Woche öffnet"
description: "9:40 Uhr, du schaust kurz im Büro vorbei, der PM holt die Revision vom letzten Donnerstag hoch — die Rahmenspezifikation hat sich geändert. Du warst jeden Tag auf der Baustelle, niemand hat dir Bescheid gegeben. Der Beton ist schon gegossen. Ein Praxisleitfaden für Bauleiter zur Zeichnungs-Versionskontrolle: keine neuen Tools für den Trupp, keine Workflow-Umstellung, nur ein Weg, jede Revision ihre eigene Spur hinterlassen zu lassen."
slug: "autocad-wrong-version-crew"
date: 2026-04-24
image: cover.svg
og_image: cover.png
categories:
  - Dateiverwaltung
tags:
  - AutoCAD
  - Bauwesen
  - Versionskontrolle
  - Bauleitung
cta_topic: versioning
---

Es ist 9:40 Uhr. Du schaust endlich kurz im Büro vorbei und wischst dem PM beiläufig durch die gestrigen Baustellenfotos — den Abschnitt der Regenentwässerung, in dem der Beton schon gegossen ist, die einbetonierten Rahmen alle in der Platte sitzen, bereit für die Roste.

Der PM sagt nichts. Er holt eine Datei auf seinem Schreibtisch hoch: `A-05_drain_0422_issued.dwg`.

„Rahmen ist falsch. Der Architekt hat ihn letzten Donnerstag nochmal geändert."

Du spürst diesen Stich in der Brust. Die Revision vom letzten Donnerstag kam ins Büro — Mike hat sie empfangen, auf den Server abgelegt, niemandem Bescheid gegeben. Du warst jeden Tag auf der Baustelle. Beim Montagsmeeting hat es niemand erwähnt. Du hattest keinen Grund, davon zu wissen.

Dieser Abschnitt ist schon gegossen. Rahmenspezifikation geändert — das heißt, den ausgehärteten Beton aufstemmen, die alten Rahmen rausziehen, neue Rahmen in der richtigen Größe setzen, die Kanten neu vergießen, aushärten lassen. Zwei Tage mehr im Terminplan. Andere Gewerke stehen hinter dir aufgereiht und warten.

Du hast nicht die falsche Datei an den Trupp gegeben. Du wusstest nur nicht, dass sich die Datei geändert hatte.

## Inhalt

- [„Ist das die Revision vom letzten Donnerstag?"](#h2-1)
- [Vor „issued for construction" liegen viele Entwürfe. Dann springt der Architekt einen zurück](#h2-2)
- [Das Büro weiß es. Die Baustelle nicht](#h2-3)
- [Gib deinen Zeichnungen ihre eigene Zeitleiste](#h2-4)
- [Die einzigen, die das nicht brauchen: der Trupp, der nach gedruckten Plänen einbaut](#h2-5)

---

## „Ist das die Revision vom letzten Donnerstag?" {#h2-1}

Es ist die Frage, die der PM stellt, wenn etwas nicht stimmig wirkt. Der Trupp fragt sie auch. Sie meinen nichts Böses damit — sie wollen nur kurz absichern. Das Problem ist, du kannst die Hälfte der Zeit selbst nicht sofort antworten.

Du klappst dein Notebook auf. Im Projektordner liegen `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. Dazu noch `A-05_drain_0420_avoidutility.dwg`, das jemand in die WhatsApp-Gruppe geworfen hat. Und die vom frühen März, `A-05_drain_0315.dwg`, hast du nie gelöscht, weil der Architekt manchmal zu einer früheren Anordnung zurückspringt, wenn eine Änderung nicht aufgeht.

Fünf Dateinamen. Du weißt, einer davon ist der, nach dem der Trupp tatsächlich baut. Aber du erinnerst dich nicht, welcher.

Das ist keine Faulheit, weder bei dir noch bei Mike. Es ist die Lücke zwischen „eine neue Zeichnung kommt im Büro an" und „die Baustelle weiß davon" — niemandem zugewiesen. Du bist zufällig die Person, die auf beiden Seiten dieser Lücke steht.

---

## Vor „issued for construction" liegen viele Entwürfe. Dann springt der Architekt einen zurück {#h2-2}

Du denkst vielleicht: „Gut, dann checke ich halt jedes Mal doppelt, wenn ich im Büro bin." In der Theorie, klar. In der Praxis kippt es, weil **sich Entwürfe stapeln, bevor irgendetwas formell ausgegeben wird**.

Ein Detail, vom ersten Schemaentwurf bis zur Ausführungsfreigabe, durchläuft viele Versionen. Bauherr fügt einen Kommentar an — Revision. Begehung deckt einen Konflikt mit einer Versorgungsleitung auf — Revision. Tragwerksplaner prüft — Revision. **Dann ist der Architekt bei Rev 5 und der Bauherr sagt „eigentlich war das Kantendetail von Rev 2 sauberer", also springt es zurück**. Du öffnest den Ordner und siehst sechs Dateien, von denen zwei fast identisch sind — aber du erkennst nicht, welche jetzt gerade die gültige ist.

Würdest du warten, bis der Architekt komplett „finalisiert" hat, bevor du den Trupp loslegen lässt, würde dich der Terminplan zerreißen. Drei Gewerke stehen hinter diesem Abschnitt aufgereiht. Jeder Tag, den du hältst, kostet Lohn, Geräte und Puffer. Also geht der Generalunternehmer das kalkulierte Risiko ein — **arbeitet mit der zuletzt gesehenen Version** und wettet darauf, dass die nächste Revision nicht drastisch ausfällt.

Meistens geht die Wette auf. Manchmal nicht. Diese Woche ist so eine.

---

## Das Büro weiß es. Die Baustelle nicht {#h2-3}

Der eigentliche Bruchpunkt liegt hier: **eine neue Zeichnung kommt im Büro an, die Baustelle hört nichts davon, und niemand trägt die Botschaft über die Lücke**.

Auf der Bürozeile ist die Person, die die E-Mail empfängt, vielleicht eine PM-Assistenz, eine Sachbearbeiterin oder ein anderer Bauleiter. Ihr Reflex, wenn eine Datei reinkommt, ist „ordentlich ablegen" — Ordner, Benennung, Archiv. Sie wissen nicht immer genau, was die Baustelle diese Woche treibt, und sie können nicht immer auf einen Blick sagen, ob diese Revision die Sorte ist, die sofort gemeldet werden muss. Für sie ist abgelegt erledigt.

Auf der Baustellenseite bist du jeden Tag draußen. Selbst wenn du jeden Freitag im Büro vorbeischaust, um dich abzugleichen, kann der Architekt zwischen deiner letzten und deiner nächsten Kontrolle zwei Revisionen ausgegeben und eine zurückgesprungen haben. Du kannst es finden, wenn du suchen gehst — aber **nur, wenn du diszipliniert genug bist, aktiv nachzufassen**. Nicht jeder Bauleiter macht das, jedes Mal.

Auf der Truppseite bauen sie nach dem, was du ihnen zuletzt in die Hand gegeben hast. Sie wissen nicht, ob im Büro eine neuere Datei liegt. Und sie sollten es nicht müssen — ihr Job ist, nach Plan einzubauen, nicht Versionen zu verfolgen.

Von diesen drei Fäden ist **der zwischen Büro und Baustelle der, der am leichtesten reißt**. Nicht weil jemand schlampt. Weil kein Prozess diese Linie zwingt, offen zu bleiben. Eine „neue Version hochgeladen"-Nachricht in einem Gruppenchat, die untergeht, ist endgültig untergegangen.

---

## Gib deinen Zeichnungen ihre eigene Zeitleiste {#h2-4}

Es steckt nicht viel dahinter. Vier Schritte.

**1. In dem Moment, in dem eine neue Datei im Büro landet, gib der Baustelle Bescheid — und warte auf ein „angekommen" zurück.** Nicht „abgelegt und fertig". **Übergabe ist erst abgeschlossen, wenn die Person auf der Baustelle es ausdrücklich bestätigt**. Kann WhatsApp sein, kann Slack sein, kann ein Anruf sein. Die Regel: die Baustelle muss schriftlich bestätigen. Keine Bestätigung, keine vollständige Übergabe.

**2. Bevor irgendeine neue Revision die vorherige überschreibt, halte die vorherige separat fest.** Benenne sie `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. Das ist **für den Fall, dass der Architekt zurückspringt** — du kannst dann immer noch genau zeigen, wie Rev 3 aussah.

**3. Lass das Tool jede Revision automatisch festhalten und mache sie für alle sichtbar.** Hier übernehmen Tools die Teile, die Disziplin nicht durchhält. [Keeply](https://keeply.work) ist genau dafür gebaut. Jede Speicherung legt automatisch eine Version an. Dateien bleiben, wo sie sind — in deinem Projektordner, genau dort, wo dein Team ohnehin schon hinschaut. **Solange alle denselben gemeinsamen Tresor öffnen (typischerweise das Firmen-NAS), sehen alle dieselbe Zeitleiste** — sobald das Büro eine neue Datei reinlegt, öffnet der Bauleiter sein Keeply auf der Baustelle, und die Zeitleiste zeigt „heute 15:30, Architekt hat erneut revidiert". Ehrliche Anmerkung: Wenn du zwei `.dwg`-Zeichnungen Zeile für Zeile vergleichen musst, musst du immer noch AutoCAD öffnen und es selbst tun — Keeply macht keinen CAD-Zeichnungsvergleich. Aber „eine neue Version ist reingekommen, wer hat sie geschickt, wann, und hast du sie geöffnet?" — das übersiehst du nicht mehr. Der PM fragt „Hast du die Revision vom letzten Donnerstag gesehen?" — die Zeitleiste antwortet darauf.

So sieht das ungefähr auf dem Bildschirm aus:

```text
A-05_drain.dwg
Tresor: Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Versionsbeschreibung                    Tag      Wann
─────────────────────────────────────────────
 ●  Rahmenspezifikation revidiert                Heute
 ●  Umgeleitet wegen Versorgungsleitung         20.04.
 ●  Ausgegeben nach Bauherrenprüfung   ⭐Issued  18.04.
 ●  Profil angepasst                            15.04.

─────────────────────────────────────────────
 Tresor-Mitglieder (gemeinsames NAS)
   Mike (Büro) · Du (Baustelle) · Chen (Polier)

   Alle öffnen denselben Ordner, alle sehen
   dieselbe Zeitleiste. Sobald eine neue Version
   landet, taucht sie für alle auf.
   Mit der Maus über eine Zeile fahren →
   Ein-Klick-Wiederherstellung.
```

**4. Mindestens eine Kopie, die nicht auf diesem Rechner und nicht auf dem Baustellen-NAS liegt.** Externe Festplatte, Cloud, Backup-Slot — egal. Der Punkt ist **mindestens eine Kopie außer Haus**. Büro-NAS-Laufwerke fallen aus, werden gelöscht, werden für das nächste Projekt umgewidmet. Das externe Backup ist die billigste Versicherung, die du dir je kaufen wirst.

Schritt 1 und 2 lassen sich rein über Disziplin fahren, aber ehrlich — drei Monate später hast du die Hälfte verpasst. Schritt 3 ist, wie das Tool die andere Hälfte auffängt.

---

## Die einzigen, die das nicht brauchen: der Trupp, der nach gedruckten Plänen einbaut {#h2-5}

Sei mal ehrlich — das ist nicht für jeden im Bauwesen. Aber die Ausschlussliste ist kürzer, als du denkst.

**Die einzigen, die das wirklich nicht brauchen, sind die Leute, die nach der Zeichnung einbauen, die sie in der Hand halten.** Ihr Job ist, nach dem ausgehändigten Plan zu bauen, nicht Versionen zu jagen. Versionen jagen ist dein Job.

**Öffentliche Bauvorhaben brauchen das eher mehr, nicht weniger.** Du nimmst vielleicht an, große öffentliche oder staatliche Projekte seien abgedeckt, weil sie schon eine BIM-Kollaborationsplattform haben. Es ist umgekehrt. Öffentliche Bauvorhaben fahren bei weitem mehr Papierkram als private Aufträge, Änderungsanträge ziehen sich über Monate, die Personalfluktuation in der Leitung ist höher, der Dokumentenstapel wächst schneller, und das institutionelle Gedächtnis bricht leichter weg. BIM-Plattformen lösen das finale Werk. Sie lösen nicht Planungsdokumente, gemeinsame Dateien und die Revisionsnotizen, die Entwurfszeichnungen unterwegs ansammeln — und genau das sind die Dinge, die Tag für Tag tatsächlich wachsen.

**Ein-Mann-Büros brauchen es auch.** Du denkst vielleicht: „Bei diesem Projekt bin ich von Anfang bis Ende allein, brauche ich wirklich Versionskontrolle?" Ja. Weil du in drei Monaten, wenn du auf dieselbe Datei schaust, **vergessen wirst, warum dein Vergangenheits-Ich die Änderung gemacht hat**. Eine Zeitleiste speichert mehr als die Datei selbst — sie speichert den Grund im Moment. Dein Zukunfts-Ich wird deinem Gegenwarts-Ich danken, dass du die Spur hinterlassen hast.

Alle anderen — kleine bis mittlere Wohnbauten, Gewerbe, Innenausbau, Entwässerung, Landschaftsbau, Straßenbau, Campusarbeiten, öffentliche Vorhaben, BIM-Projekte, Solo-Designer, Planungsbüros — **wenn deine Arbeit eine Datei umfasst, die später von jemand anderem oder von deinem Zukunfts-Ich geändert und wieder geöffnet wird, brauchst du eine Zeitleiste.** Jedes Mal, wenn diese Linie reißt, wandert Zeit und Geld aus deiner Tasche.

---

Eine `.dwg` ist nicht nur eine Zeichnung. Sie ist ein Schnappschuss dessen, worauf sich Entwurf, Büro und Baustelle in einem bestimmten Moment geeinigt haben. Dieser Moment ändert sich ständig, wird ständig weitergereicht, wird ständig nach der falschen Version gebaut.

Es lohnt sich, jedem deiner Projekte seine eigene Zeitleiste zu geben?

---

Erinnerst du dich an den Moment um 9:40 Uhr — der PM holt die Revision vom Donnerstag hoch, und dir sackt es in die Brust? Du musst nicht mehr der Versionsmanager sein. **Keeply: das wachsame Gedächtnis deiner Dateien.** Merkt sich jede Speicherung, jede ausgegebene Version, jeden Schnappschuss, bevor der alte überschrieben wird. Lebt in deinem bestehenden Projektordner — keine neuen Tools, keine neuen Gewohnheiten für den Trupp. Bauwesen passt besonders gut, weil die Linie zwischen Büro und Baustelle bei jedem einzelnen Projekt reißt.

[Keeply kennenlernen →](https://keeply.work)
