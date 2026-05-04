---
title: "Versioni precedenti file Excel: solo 1-2 versioni indietro? 4 limiti Microsoft che nessuno ti dice"
description: "Le versioni precedenti di Excel tornano indietro solo di 1-2 versioni: non è un bug, è Microsoft che progetta AutoSave come esca per l'abbonamento cloud."
date: 2026-05-04T20:00:00+08:00
draft: false
slug: excel-version-history-limits
primary_keyword: "versioni precedenti file excel"
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - Gestione file
tags:
  - Controllo versione
  - Excel
  - AutoSave
  - OneDrive
image: cover.svg
og_image: cover.png
role: cluster
pillar_parent: file-version-management-complete-guide
---

Venerdì pomeriggio, le 17:47. Stai lavorando alla chiusura di fine mese in Excel. Hai appena cancellato una formula per provarne un'altra, ed era sbagliata. Cmd+Z arriva al limite undo, non torna indietro. Apri File > Informazioni > Cronologia versioni. In grigio. Poi ti ricordi: questo foglio è sul desktop, non su OneDrive. Trenta minuti di lavoro sulle formule, persi.

Non è un caso isolato. Capita a chiunque lavori in Excel. È il risultato di Microsoft che progetta la cronologia versioni come esca per l'abbonamento cloud. Vediamo prima i quattro limiti che continui a sbattere contro, poi tre design di strumenti che li risolvono davvero.

## Indice

- [Perché la cronologia versioni di Excel è in grigio](#why-grayed-out)
- [Quattro limiti che Microsoft AutoSave non ti dice](#four-limits)
- [Perché Microsoft l'ha progettato così](#why-microsoft)
- [Tre design di strumento che lo risolvono davvero](#three-designs)
- [Quando non è lo strumento giusto](#boundaries)

## Perché la cronologia versioni di Excel è in grigio {#why-grayed-out}

Il pulsante "File > Informazioni > Cronologia versioni" **funziona solo quando tutte e quattro le condizioni sono soddisfatte**: (1) il file è su OneDrive o SharePoint (2) AutoSave è attivo (3) hai una licenza commerciale (4) sei su desktop, non sul web. Se ne manca una, il pulsante è in grigio.

Non è ovvio finché non ci sbatti: il tuo flusso di lavoro normale probabilmente **non rispetta nessuna delle quattro**: salvato sul desktop, AutoSave disattivato di default, licenza personale, passaggio tra desktop e web. Quindi il grigio è lo stato di default, non qualcosa che hai sbagliato tu.

## Quattro limiti che Microsoft AutoSave non ti dice {#four-limits}

Apri "la cronologia versioni di Excel non basta" e trovi quattro limiti invarianti che nessuna modifica delle impostazioni aggira:

| # | Limite | Conseguenza |
|---|---|---|
| 1 | **AutoSave desktop torna indietro solo di 1-2 versioni** | Errore di 30 minuti fa = irrecuperabile |
| 2 | **OneDrive/SharePoint scade a 30 giorni** | Revisione trimestrale, cliente vuole la versione di 60 giorni fa = persa |
| 3 | **I file locali hanno cronologia zero** | Salvato sul desktop per privacy = nessuna cronologia |
| 4 | **Niente diff a livello cella** | Non puoi dire "tieni la nuova colonna ma recupera la vecchia formula" |

Ognuno di questi è qualcosa che Microsoft **deliberatamente non risolve**, non qualcosa che non può. La prossima sezione spiega perché.

## Perché Microsoft l'ha progettato così {#why-microsoft}

Un file history layer completo è tecnicamente trivial. macOS Time Machine ha mostrato a tutta l'industria come si fa nel 2007. Microsoft può. Microsoft sceglie di no.

La ragione è design commerciale: la cronologia versioni è un differenziatore dell'abbonamento OneDrive. Se Excel desktop avesse cronologia completa di suo, anche i file locali, senza limiti di tempo, gli abbonamenti OneDrive perderebbero un motivo di lock-in.

Sì, ecco la parte fastidiosa. Quello che stai sbattendo non è un bug, è un paywall. Microsoft semplicemente non lo inquadra così. La cronologia versioni per l'utente è una **rete di sicurezza per i file**; per Microsoft è un **gancio per l'abbonamento**. Due ruoli nella stessa funzione, e la persona che decide il comportamento non sei tu.

## Tre design di strumento che lo risolvono davvero {#three-designs}

Tre pattern di design che lo strumento può usare. Ognuno risolve alcuni dei quattro limiti sopra.

### Design A: Snapshot automatici a ogni Cmd+S (no dipendenza cloud)

Lo strumento conserva silenziosamente la versione precedente ogni volta che premi Cmd+S, indipendentemente da dove vive il file. **Esempi**: macOS Time Machine (livello file / sistema), Keeply (livello file / motore git). **La differenza di Keeply**: ogni versione preservata per intero senza limiti di tempo (a differenza dei 30 giorni di OneDrive). **Risolve i limiti #1 + #2 + #3.**

### Design B: Milestone automatici (congelamento fine mese / fine trimestre)

Marchi attivamente "questa versione è chiusura fine mese v3" o "questa versione è Q2 close." Una volta marcato, qualunque cambiamento, il milestone resta. **Esempi**: Git tag (solo sviluppatori), Keeply Release (integrato, no terminologia git nell'UI). **Risolve la parte timeline estesa di #2**: revisioni trimestrali possono ancora trovare la versione esistente all'epoca.

### Design C: Ricerca contenuto versioni

Cerca contenuto cella in qualunque versione storica (non solo nomi file). **Esempio**: Keeply spec 049 ricerca contenuto attraverso le celle delle versioni storiche. **Risolve parte di #4**: non diff a livello cella, ma puoi trovare "quale versione era l'ultima che conteneva quel numero da 100 €."

Noterai che il limite #4 (diff a livello cella) è il vero confine. La prossima sezione è onesta sul perché.

## Quando non è lo strumento giusto {#boundaries}

Keeply non risolve ogni scenario Excel:

- **Diff a livello cella**: Keeply mostra "file intero v3 → v4," non "cella B7 da 100 a 105." Per diff cella vuoi ancora Microsoft 365 co-editing o uno spreadsheet diff tool.
- **Errori logici nelle formule**: Keeply ripristina "la formula precedente," non "la formula stessa era sbagliata." Quest'ultimo è il dominio di un Excel debug tool.
- **Editing collaborativo multi-persona**: Microsoft 365 collaborazione real-time batte Keeply (scenario diverso).
- **Dimensione file ancora limitata dal disco**: 100 modelli × 50MB = 5GB anche su Keeply.

## Prima di premere Cmd+S la prossima volta

La prossima volta che Excel ti grigia, non ti incolperai più. Saprai che è il design deliberato di Microsoft, e che hai altre opzioni.

Vuoi vedere come Keeply gestisce le versioni Excel? [Continua a leggere "Guida completa alla gestione versioni file".](/it/post/file-version-management-complete-guide/)

---

> A proposito dell'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
