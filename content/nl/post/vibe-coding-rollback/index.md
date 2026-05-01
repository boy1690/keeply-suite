---
title: "Vibe Coding ontspoord? Eén actie om terug te keren naar een werkende versie"
description: "AI-agent rent vooruit, code draait niet meer. Open de Keeply Timeline. Het laatste werkende opslagpunt staat er nog."
date: 2026-04-30T09:00:00+08:00
slug: vibe-coding-rollback
locale: nl
primary_keyword: "vibe coding rollback"
locales: [zh-TW, en, zh-CN, ja, nl]
tags: [Keeply tutorial, vibe coding, AI coding, versiebeheer, bestandsherstel]
categories: [Keeply gebruikssituaties]
template: T1-cluster
voice: B-Emotional-StoryBrand
motif: "AI rent vooruit vs jij kunt het terughalen"
image: cover.svg
og_image: cover.png
draft: false
status: approved
---

# Vibe Coding ontspoord? Eén actie om terug te keren naar een werkende versie

> AI-agent rent vooruit, code draait niet meer. Open de Keeply Timeline. Het laatste werkende opslagpunt staat er nog.

## Inhoud

1. [Hoe ziet het moment van AI-overschieten eruit?](#ai-overshoot)
2. [Eén actie: open de Timeline, klik op het laatste werkende punt](#one-action)
3. [Waarom AI zichzelf niet zal terugdraaien](#ai-doesnt-rollback)

---

Engineer A opent Cursor en zegt de AI een bug op te lossen. De AI is klaar. Code draait niet. Hij zegt de AI om het opnieuw te fixen. De AI raakt een derde bestand aan. Nog steeds stuk. Bewerkt een vijfde. Inmiddels is Engineer A niet meer zeker welke bestanden de AI heeft veranderd.

Op dit punt denk je waarschijnlijk: stop, ga terug naar de staat die een moment geleden tenminste nog draaide.

Het probleem is dit: **hoe weet je welke versie het was die draaide?**

---

## Hoe ziet het moment van AI-overschieten eruit? {#ai-overshoot}

Je bent aan het vibe coden. Je geeft de AI een doel. De AI schrijft een stuk.

Run het. Oké.

Volgende ronde, je zegt „voeg nog een feature toe". De AI raakt 3 bestanden aan. Run — fout.

Je zegt „los die fout op". De AI raakt 5 bestanden aan, bewerkt de config, voegt een hulpfunctie toe waar je nooit om hebt gevraagd. Run — meer fouten.

![AI-agent chatvenster vs het werkelijke aantal veranderde bestanden op je computer](image-1.svg)

De AI is nog steeds vol vertrouwen dingen aan het fixen. **Het zal niet uit zichzelf zeggen „ik heb dit misschien om zeep geholpen".**

Zijn geheugen is alleen het huidige contextvenster. **Het weet niet dat 5 prompts geleden je code in orde was.** Maar de bestanden op je computer weten het. Zolang iemand het onthoudt.

---

## Eén actie: open de Timeline, klik op het laatste werkende punt {#one-action}

### Stap 1: Open de Keeply Timeline

Eerste tabblad in de linkerzijbalk. Je ziet elke wijziging van vandaag, op tijd geordend.

### Stap 2: Vind het laatste punt waarop de code „nog draaide"

Elke vermelding op de Timeline is ofwel een automatisch opslagpunt van Keeply ofwel een moment dat je handmatig markeerde. Open elk punt om de wijzigingen erin te zien, en vind de versie die je je herinnert als „toen getest en oké".

Meestal 30-60 minuten geleden. De laatste test voordat de AI begon te ontsporen.

![Keeply Timeline ingezoomd: elke file note toont tijdstempel + gewijzigde regels + je eerdere testopname](image-2.svg)

### Stap 3: Rechtsklik op die vermelding, kies Herstellen

De hele map keert binnen 30 seconden terug naar dat moment in de tijd. **Alle bestanden, de volledige mapboom, elke config — ze gaan allemaal samen terug.** Niet alleen één bestand.

Daaronder valt ook de hulpfunctie die de AI erin heeft gesmokkeld, de config die het heeft bewerkt, het .env-bestand dat het niet had mogen aanraken. **Alles gaat terug.**

Daarna run je het. Het werkt.

![Voor en na het herstellen: bestandsboom + het groene licht van het uitvoeren van tests](image-3.svg)

Het hele proces duurt minder dan een minuut. **Je hoeft niet te onthouden welke bestanden de AI heeft aangeraakt. Keeply heeft ze allemaal onthouden.**

---

## Waarom AI zichzelf niet zal terugdraaien {#ai-doesnt-rollback}

AI-agents zijn ontworpen om **vooruit te rijden**. Ze ontvangen een prompt, produceren een aanpassing. Ze pauzeren niet om terug te kijken en te vragen „heeft die laatste ronde het project zojuist erger gemaakt?"

Die verantwoordelijkheid zit niet bij de AI. Het is een architectonische limiet.

De verantwoordelijkheid zit bij jou: **je hebt een vangnet nodig dat op de achtergrond draait.** Laat de AI rennen zo ver hij wil, want jij kunt het terughalen.

Keeply is hier niet om het deel te vervangen waar jij code schrijft. Het is hier zodat je tijdens vibe coding niet op je geheugen hoeft te leunen om terug te gaan. Geheugen verliest het van de snelheid waarmee AI bestanden bewerkt.

---

## Afsluiten

Voordat de AI-sessie van vandaag ontspoort, open [Keeply](https://keeply.work/) en sleep je projectmap erin.

Volgende keer dat het overschiet, open je de Timeline en klik je op de laatste vermelding. **Probleem opgelost in 30 seconden.**

---

## Verder lezen

- [Hoe je Keeply gebruikt, de file-notes app: sla de 30-functie tour over, kom op gang in 2 acties](/nl/post/keeply-getting-started-from-zero/) (PILLAR 3, de volledige Keeply-onboardinggids)

---

*Door Ting-Wei Tsao, oprichter van Keeply | [LinkedIn](https://www.linkedin.com/in/tingwei-tsao/)*
