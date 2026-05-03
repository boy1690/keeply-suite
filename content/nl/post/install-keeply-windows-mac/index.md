---
title: "Hoe je Keeply in 10 minuten installeert op Windows en macOS"
description: "Sla de kleine lettertjes van „Toch uitvoeren\" en het giswerk over — installeer Keeply in tien minuten en bescherm dezelfde dag je eerste project."
date: 2026-04-26
draft: false
tags: ["installatie", "tutorial", "Windows", "macOS", "winget"]
categories: ["tutorial"]
primary_keyword: "Keeply installeren"
locales: ["en", "zh-TW", "zh-CN", "ja", "nl"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
---

> „Ik heb dubbelgeklikt, het blauwe scherm verscheen, en ik dacht dat het een virus was en sloot het."
>
> — Een ontwerper die net van Keeply had gehoord, dezelfde middag antwoordend.

Hij is niet de eerste. Het blauwe scherm op Windows stopt waarschijnlijk meer mensen dan er daadwerkelijk de installatie afronden.

Hier is het hele pad van begin tot eind: **waarom het blauwe scherm verschijnt → drie schonere manieren om te installeren → meteen daarna je eerste project openen**.

## Inhoudsopgave

1. [Waarom het blauwe scherm verschijnt (het is geen Keeply-probleem)](#why-smartscreen)
2. [Drie paden — kies wat bij je past](#three-paths)
3. [Windows-pad 1: één winget-commando (aanbevolen)](#path-winget)
4. [Windows-pad 2: download het .exe-bestand](#path-exe)
5. [macOS-installatie: de rechtsklik-stap die je niet kunt overslaan](#path-macos)
6. [Na de installatie: drop je eerste project erin](#first-project)
7. [Vastgelopen? 5 veelvoorkomende fouten](#troubleshoot)

## Waarom het blauwe scherm verschijnt (het is geen Keeply-probleem) {#why-smartscreen}

Dat scherm heet [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). Het beslist niet „is deze software kwaadaardig?" — het beslist „hebben genoeg mensen dit al gebruikt?".

Zie het zo: een nieuw restaurant zonder Google-recensies is geen slecht eten. Het is gewoon eten dat nog niemand heeft beoordeeld.

SmartScreen behandelt nieuwe software op dezelfde manier. Het bouwt vertrouwen op met **downloadvolume + tijd**, en elke nieuwe release gaat opnieuw door deze observatieperiode. Keeply komt dit elke keer tegen bij een update. Niets daarvan heeft te maken met of de software zelf veilig is.

Dus waarom maakt het mensen bang? Omdat het scherm je alleen een grote knop „Niet uitvoeren" geeft. Om toch uit te voeren moet je op een minuscuul linkje klikken dat **Meer informatie** heet, ergens aan de zijkant. Visueel leest het niet als een mededeling — het leest als een muur.

Maar je hoeft er niet mee om te gaan. **Keeply is gepubliceerd in [Microsofts winget-pakketrepo](https://github.com/microsoft/winget-pkgs)**, en dat pad triggert de waarschuwing helemaal niet.

Dus het punt is niet hoe je de waarschuwing omzeilt. Het is hoe je een pad neemt waar de waarschuwing nooit verschijnt.

![Windows SmartScreen-waarschuwing, met het kleine „Meer informatie"-linkje omcirkeld](fig-smartscreen-warning.svg)

## Drie paden — kies wat bij je past {#three-paths}

| Pad | Het beste als je | Tijd | Blauw scherm? |
| --- | --- | --- | --- |
| **A. winget-commando** (Windows) | het niet erg vindt om één regel in PowerShell te plakken | 2 min | Nee |
| **B. Officiële .exe-download** (Windows) | geen zwarte terminal wilt openen | 5 min | Ja — we lopen het met je door |
| **C. Officiële .dmg-download** (macOS) | op een Mac werkt | 3 min | Nee, maar rechtsklikken vereist |

Een gekozen? Spring naar de bijbehorende sectie. Sla de andere over.

## Windows-pad 1 — één winget-commando (aanbevolen) {#path-winget}

**winget** is de ingebouwde „pakketmanager" van Windows — eigenlijk een Microsoft Store maar voor de commandoregel. Het zit standaard in Windows sinds versie 10 1809. Je hoeft niets extra te installeren.

Open PowerShell (zoek „PowerShell" in het Startmenu), plak deze regel, druk op Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell die winget draait — download en installatie zijn klaar in ongeveer 30 seconden](fig-powershell-winget.svg)

Ongeveer 30 seconden en het is klaar. Geen blauw scherm. Geen kleine lettertjes „Meer informatie".

Waarom is dit pad zo schoon? Omdat Keeply, om überhaupt in winget vermeld te worden, [Microsofts officiële review op GitHub](https://github.com/microsoft/winget-pkgs) moet doorstaan: ze controleren de installerbron, bestandshandtekeningen en installatiegedrag. Het wordt pas geleverd als alles slaagt.

Anders gezegd: als je dat commando uitvoert, heeft Microsoft al een ronde controle voor je gedaan. SmartScreens controle is op dit pad overbodig, dus die verschijnt gewoon niet.

Kort pad en vertrouwd pad, in één regel.

## Windows-pad 2 — download het .exe-bestand {#path-exe}

Wil je PowerShell niet aanraken? Prima. Ga naar keeply.work, klik op download, pak het `.exe`-bestand, dubbelklik erop.

Het blauwe SmartScreen-scherm verschijnt. **Dat is normaal** ([waarom, zie hierboven](#why-smartscreen)). Om door te gaan:

1. Klik op **Meer informatie** (de kleine onderstreepte tekst op de waarschuwing)
2. Een knop **Toch uitvoeren** verschijnt
3. Klik erop. De installer neemt het van daaruit over.

![Zodra je op „Meer informatie" klikt, verschijnt de knop „Toch uitvoeren" naast „Niet uitvoeren"](fig-smartscreen-run-anyway.svg)

De hele omweg duurt misschien 3 minuten — het meeste daarvan is psychologisch, niet daadwerkelijke klikken. Vanaf hier komen dit pad en pad 1 samen.

## macOS-installatie — de rechtsklik-stap die je niet kunt overslaan {#path-macos}

Geen blauw scherm op Mac. Maar je kunt bij de eerste start niet dubbelklikken — [macOS Gatekeeper](https://support.apple.com/en-us/102445) blokkeert het.

Juiste stappen:

1. Download het `.dmg`-bestand, sleep Keeply naar je map Programma's
2. Open Programma's, vind Keeply
3. **Rechtsklik → Open** (niet dubbelklikken)

   ![macOS Finder rechtsklikmenu met „Open" bovenaan gemarkeerd](fig-macos-rightclick.svg)

4. Een dialoog verschijnt — klik op „Open"

   ![macOS-bevestigingsdialoog met de knop „Open" gemarkeerd](fig-gatekeeper-dialog.svg)

Dat is het. **Alleen de eerste start heeft dit nodig** — daarna werkt dubbelklikken normaal.

Waarom de omweg de eerste keer? Gatekeeper blokkeert dubbelklik-start voor elke app die het niet als genotariseerd heeft gezien. Rechtsklik → Open is Apples manier om te zeggen „Ik weet wat ik installeer, laat me erdoor".

Dit is geen Keeply-eigenaardigheid. Elke nieuwe Mac-app die nog niet eerder op je machine is geweest gedraagt zich op dezelfde manier bij de eerste start.

## Na de installatie — drop je eerste project erin {#first-project}

Geïnstalleerd is niet klaar. Je eerste project diezelfde dag beschermd — dat is klaar.

Open Keeply, druk op **Nieuw project**, kies een map waar je actief in werkt.

<!-- TODO: vervang door echte screenshot keeply-add-project.png (Keeply „Nieuw project"-dialoog) -->

**Wat als eerste erin droppen**: wat je nu in handen hebt dat je je niet kunt veroorloven te verliezen en wat je blijft bewerken. Een pitch, een contract, een ontwerpbestand, een deck — elk daarvan werkt. Kies geen map die je in zes maanden niet hebt aangeraakt. De waarde van die map zit in archivering, niet in bescherming. Ander verhaal.

De eerste scan duurt 1 tot 2 minuten. Daarna houdt Keeply de map op de achtergrond in de gaten en **legt automatisch versies vast terwijl je opslaat**. Geen handmatige „checkpoint"-knop om in te drukken.

Een verzonnen maar typisch voorbeeld: een ontwerper dropt zijn Q2-pitchmap erin direct na de installatie. Eerste scan duurt 2 minuten. Drie dagen later beseft hij dat hij vorige zaterdag een logokleur verkeerd heeft verwisseld — de vorige versie uit de geschiedenis halen kost 20 seconden.

Mensen die het eerste project op de installatiedag gebruiken blijven veel vaker hangen dan mensen die een week wachten.

## Vastgelopen? 5 veelvoorkomende fouten {#troubleshoot}

| Symptoom | Oplossing |
| --- | --- |
| `winget`-commando niet gevonden | Betekent dat je Windows nog geen App Installer heeft. Gebruik in plaats daarvan pad 2 (download het .exe-bestand) — vecht er niet tegen |
| Win 11 zegt „heeft beheerder nodig" | Heropen PowerShell met **Als administrator uitvoeren** |
| Mac zegt „kan niet worden geopend omdat het van een niet-geïdentificeerde ontwikkelaar is" | Rechtsklik → Open (niet dubbelklikken). Zie macOS-sectie hierboven |
| Bedrijfsnetwerk blokkeert de download | Gebruik in plaats daarvan het winget-commando — het gaat via Microsofts CDN en komt meestal door |
| Geïnstalleerd maar wil niet openen | Herstart één keer. Nog steeds niets? Mail [support@keeply.work](mailto:support@keeply.work) |

## Het ene ding om te onthouden

Eén ding:

**Het blauwe scherm is geen oordeel — het is reputatie die nog wordt opgebouwd.**

Je hoeft de waarschuwing niet te omzeilen. Je hoeft alleen het winget-pad te nemen waar de waarschuwing nooit verschijnt.
