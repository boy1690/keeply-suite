---
title: "Bestandsversiebeheer: waarom verzint iedereen zijn eigen naamgevingsregels?"
description: "Gedeelde mappen, Dropbox en NAS-schijven zijn nooit ontworpen om bestandsgeschiedenis te beheren. Ze hebben 4 structurele gaten, en elk gat schuift het werk terug naar jou."
slug: file-version-management-complete-guide
date: 2026-04-28T09:00:00+08:00
draft: false
categories:
  - Bestandsversiebeheer
tags:
  - bestandsversiebeheer
  - gedeelde mappen
  - Dropbox
  - NAS
  - kenniswerkers
image: cover.svg
og_image: cover.png
cta_topic: versioning
---

> Het ligt niet aan jou. Je tool is hier gewoon nooit voor ontworpen.

Drie mensen. Drie verhalen.

**Persoon A** is freelance ontwerper. Op z'n bureaublad staat `_v3_final_FINAL.psd`.
**Persoon B** werkt als assistent bij een advocatenkantoor. Op haar schijf staat `contract_v7_klantversie_2025-04-15.docx`.
**Jij die dit leest**, houdt misschien op dit moment een bestand open dat `scriptie_hoofdstuk3_na-feedback-begeleider_echt-definitief-v2.docx` heet.

Verschillende beroepen. Verschillende bestandsnamen. **Dezelfde symptomen**.

Niet omdat ze allemaal te pietluttig zijn. Maar omdat als je het niet zo doet, **je bestanden één grote bende worden**. En op een NAS: verwijderd is verwijderd, voor altijd. Dus eindig je met een map `oud/` waar je elk oud exemplaar in parkeert.

![Three filenames side by side — Persoon A's .psd / Persoon B's .docx / jij die dit leest, thesis.docx. Caption: Verschil](image-1.svg)

---

**Samenvatting**: Gedeelde mappen, Dropbox en NAS-schijven **zijn nooit ontworpen om bestandsgeschiedenis te beheren**. Ze hebben 4 structurele gaten, en elk gat schuift het werk terug naar jou. Dit artikel pakt ze één voor één uit — en geeft eerlijk aan wat Keeply wel en niet oplost.

## Inhoudsopgave

1. [De "vorige versie"-knop heeft nooit bestaan](#reason-1)
2. [De versiegeschiedenis van 30 dagen heeft voorwaarden](#reason-2)
3. [Versiegeschiedenis vertelt je wánóér, niet waaróm](#reason-3)
4. [Naamgevingsconventies schuiven het geheugen door naar mensen](#reason-4)
5. [Wanneer Keeply niet het antwoord is](#limitations)

---

## 1. De "vorige versie"-knop heeft nooit bestaan {#reason-1}

Je wilt de versie van gisteren van dat ontwerpbestand terug.

Open Dropbox of Google Drive — alles toont de nieuwste versie. Versiegeschiedenis zit drie menu's diep. Je weet het pas als iemand het je vertelt.

![Dropbox en Google Drive: versiegeschiedenis drie menu's diep verstopt in beide](image-2.svg)

Open de NAS van je bedrijf — die rommelige versienummers die daar staan *zijn* je versiegeschiedenis.

![NAS folder screenshot. `_v2.psd` / `_v3.psd` / `_v3_final.psd` / `_v3_final_real.psd` / `_v3_finalfinal.psd` lined up. C](image-4.svg)

**Dit soort tool is nooit ontworpen om bestandsgeschiedenis te beheren.**

Wat clouddiensten het meest bezighoudt, is dat jouw bestanden op drie apparaten er identiek uitzien. Dat doel botst met "bewaar elke oude versie".

Dus kozen ze voor synchronisatie. **Ze laten je de tijdlijn van wijzigingen niet zien.**

> In 2015 verloor UCSD-taalkundige promovendus Will Styler zijn scriptiemap. Hij had 7 verschillende back-upplannen. Elk enkel plan faalde. Hij schreef de post-mortem op voor toekomstige studenten. Slotzin: "Redundancy doesn't prevent stupidity." [Volledig verslag](https://wstyler.ucsd.edu/posts/lost_dissertation_files.html)

→ Meer lezen: [Waarom je scriptie op één laptop een gok is die niemand je waarschuwt te nemen](/en/post/thesis-single-point-of-failure/)

---

## 2. De versiegeschiedenis van 30 dagen heeft voorwaarden {#reason-2}

Goed. Je ontdekt dat Dropbox écht een versiegeschiedenis heeft. Opgelucht?

Wacht, het is nog niet voorbij: **een limiet van 30 dagen**.

![Dropbox official version-history docs screenshot. Circle the Basic / Plus / Family: 30 days / Professional: 180 days / ](image-5.svg)

Vertaald naar het dagelijks leven: je wilt de klantbrief van vorig kwartaal terugvinden? Tenzij je voor een duurder abonnement betaalt, **bestaat die al niet meer**.

De grens van 30 dagen is geen technische beperking — het is een zakelijke keuze. Bestandsgeschiedenis is omgebouwd tot reden om te upgraden.
(Keeply geeft je bestandsgeschiedenis die altijd gratis is.)

> April 2026, Hacker News. Gebruiker julianozen schrijft: zijn vader overschreef een bestand dat al 2 jaar niet was aangeraakt. Twee dagen later probeerde hij het te herstellen — lukte niet. Dropbox: buiten het retentievenster van 30 dagen. Reactie julianozen: "Dat is niet wat een history van 30 dagen betekent." Reactie lazide: "Which is bonkers." [Volledig topic](https://news.ycombinator.com/item?id=47772260)

Het venster van 30 dagen is ontworpen voor "ik heb gisteren per ongeluk iets overschreven."
Voor "mijn klant wil volgende week de pitch van vorig kwartaal terug" — **gebruik je het verkeerde gereedschap voor de klus**.

→ Meer lezen: [De verborgen kosten van gedeelde mappen](/en/post/hidden-cost-shared-folders/)

---

## 3. Versiegeschiedenis vertelt je wánóér, niet waaróm {#reason-3}

Stel dat je de eerste twee problemen hebt opgelost: de geschiedenis staat aan, 30 dagen is genoeg.
Er wacht nog een dieper probleem.

Versiegeschiedenis zegt "gewijzigd op 2025-04-15 14:23".
**Het vertelt je niet wat er om 14:23 is veranderd. En ook niet waarom.**

![Side-by-side compare. Left: current version UI (just date + user). Right: wat het zou moeten tonen with a waarom gewi](image-6.svg)

Voor sommige taken is dat prima. Voor andere is het fataal:

- **Een ontwerper** veranderde de dekking van één laag naar 30%. Versiegeschiedenis zegt "gewijzigd". Niet welke laag.
- **Een jurist** veranderde "dient te" naar "kan" in een contractclausule. Één woord. Versiegeschiedenis zegt "gewijzigd". Niet welk woord.
- **Een scriptiestudent** veranderde "maar dit argument kent beperkingen" naar "dit argument staat duidelijk vast" — van voorzichtig naar stellig. Versiegeschiedenis zegt "gewijzigd". Niet dat de betekenis is omgedraaid.

> Januari 2025 publiceerde Legal Cheek een anoniem verhaal van een advocaat-stagiair: "Ik stuurde het verkeerde testament naar de familie van de verkeerde overledene mee als bijlage." De ramp was niet "geen versie opgeslagen" — het was "ik wist niet welke versie de actuele was." [Volledig verhaal](https://www.legalcheek.com/2025/01/courtroom-etiquette-email-blunders-and-document-mix-ups-lawyers-share-their-most-embarrassing-mistakes/)

Hier gaan de meeste mensen de mist in.

**Back-up betekent het bestand bewaren.**
**Versiebeheer betekent het bestand bewaren *plus* een notitie van wat je hebt gewijzigd en waarom.**

**Back-up geeft je het eerste. Beheer geeft je het tweede.**

Dus begin je de bedoeling in bestandsnamen te proppen: `contract_v7_aanpassing_klant_artikel3.docx`.
De bestandsnaam raakt vol. Je opent een spreadsheet. De spreadsheet kan het niet bijhouden. Je start een Slack-kanaal.
**Uiteindelijk bestaat je "versiebeheersysteem" uit bestandsnamen + een spreadsheet + Slack + jouw geheugen.** Faalt één schakel, dan loopt het hele systeem scheef.
Drie maanden later open je je aantekeningen en je eigen vroegere gewoontes matchen niet meer met je huidige.

---

## 4. Naamgevingsconventies schuiven het geheugen door naar mensen {#reason-4}

Na alle drie de bovenstaande problemen doet elke organisatie hetzelfde — **een pdf met naamgevingsconventies schrijven**.

Meestal ziet die er zo uit:

```text
[JJJJ-MM-DD]_[ProjectCode]_[DocType]_[Status]_[Auteur].ext
```

Heel netjes, toch?

![Two side by side. Left: page 1 of the naming convention PDF, neat and structured. Right: a real coworker's desktop scree](image-7.svg)

Zes maanden later houdt niemand zich eraan.

Niet omdat je collega's lui zijn.
**Het is dat we proberen grip te krijgen op een groep onstuurbare wezens — en het einde schrijft zichzelf.**

> Asana-forum, juni 2023, een thread over "epische bestandsnaamfouten". Becky_Caday: "Meerdere versies van hetzelfde bestand, omdat iemand niet wist dat je het origineel kon openen en bewerken — ze veranderden gewoon één woord naar hoofdletters. `Lijst 2.0` werd `LIJST 2.0`." Arndt_Dienstbier: "Ze gebruikten spaties voor versiebeheer" (meerdere `Document.docx`-bestanden, alleen te onderscheiden door spaties aan het eind). [Volledig topic](https://forum.asana.com/t/share-your-epic-file-naming-fails-and-lets-laugh-together/462366)

Elk teamlid, elke keer dat ze opslaan, moet de regel onthouden + bereid zijn die te volgen + er de tijd voor hebben. Eén van die drie valt weg, **en gefeliciteerd — je hebt alweer een bende**.

Naamgevingsconventies onthouden is iets **wat een tool gewoon zou moeten doen**.
Niet iets wat je op de discipline van elk individu afwentelt.

→ Meer lezen: [Hoe het hele AutoCAD-team met de verkeerde versie werkte](/en/post/autocad-wrong-version-crew/)

---

## 5. Wanneer Keeply niet het antwoord is {#limitations}

We bouwden Keeply om deze 4 structurele gaten te dichten.
Maar er zijn situaties **waar Keeply niet het antwoord is**:

- **Live samenwerkingsnotities in vergaderingen** → gebruik Notion / Google Docs. Keeply is langetermijngeheugen voor versies, voor individuen en kleine teams — geen realtime samenwerkingstool.
- **Videomateriaal van 50 GB+** → gebruik Frame.io / PostHaste. De versielogica van Keeply (alleen de verschillen per opslag bijhouden) schaalt economisch niet naar grote binaire bestanden.
- **Juridisch ondertekenen met externe partijen** → gebruik DocuSign / Adobe Sign. Als een contract naar 10 externe advocatenkantoren gaat, past Keeply niet in dat compliance-kader.

Voor de overige 80% van de kenniswerkerscenario's — **ontwerpers, medewerkers binnen advocatenkantoren, accountants, scriptiestudenten, PM-teams, freelancers** — treffen die 4 structurele gaten je vroeg of laat.
Daar zijn we voor.

---

Terug naar de openingsvraag: waarom verzint iedereen die ooit een gedeelde map heeft gebruikt zijn eigen naamgevingsregels?

Omdat **wat ze eigenlijk wilden een overzichtelijke structuur was, zodat ze geen beslissingen zouden nemen op basis van verouderde informatie**.
Dus stopten ze versies in bestandsnamen, in spreadsheets, in geheugen.

Organisatiegeheugen afwentelen op menselijke discipline is een ontwerp waarvan van tevoren bekend is dat het stukgaat.

**De vraag is niet hoe je naamgevingsconventies beter handhaaft.
De vraag is of jouw tool dat werk voor je doet.**

---

> Over de auteur: Ting-Wei Tsao, oprichter van Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
