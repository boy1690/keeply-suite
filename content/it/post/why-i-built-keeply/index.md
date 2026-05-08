---
title: "Perché ho creato Keeply: per chi perde file nelle cartelle condivise ogni giorno"
description: "Keeply è cresciuto dal caos delle cartelle condivise, non per farti diventare uno sviluppatore."
date: 2026-05-06T01:00:00+08:00
draft: false
slug: why-i-built-keeply
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories: [Note del fondatore]
tags: []
image: cover.svg
og_image: cover.png
role: standalone
template: T6
---

Negli ultimi anni ho lavorato fianco a fianco con ingegneri dell'edilizia. Molti hanno 50, 60 anni. Il computer non è il loro strumento più comodo, ma planimetrie, ordini di variante e contratti passano tutti da lì ogni giorno. La cartella condivisa è il loro campo di collaborazione: un NAS, un gruppo di persone, N versioni di file, modifiche continue.

Ho visto [il caos andare in scena](/it/post/autocad-wrong-version-crew/) troppe volte. I designer mandano una nuova versione all'ufficio. Chi raccoglie l'email la salva sul NAS ma non avvisa il cantiere. Il capocantiere quel giorno sta lavorando con il disegno della settimana scorsa. Il calcestruzzo è già colato, le dimensioni non corrispondono, devi rompere il getto, rifare il telaio, spostare il programma di due giorni. Nessuno ha sbagliato. Ma qualcuno paga.

## Il bivio che ho preso

Io uso git con scioltezza. Gli sviluppatori lo fanno tutti, esistono perfino corsi a pagamento. Quando trovo un problema faccio commit, branch, reset—lo strumento è come una seconda mano.

Ma nel momento in cui ho detto "prova git" a un capocantiere, mi è tornata indietro una faccia confusa ogni volta. Git non è fatto per loro: CLI, merge conflict, puntatore HEAD, ogni concetto è un muro che blocca la strada. Ero bloccato in mezzo: io usavo lo strumento con scioltezza, i miei clienti non potevano, la cartella condivisa continuava a generare storie settimanali di calcestruzzo da rompere.

Insegnare loro git è più economico. Costruire uno strumento che non devono imparare è più difficile. Ho scelto la strada difficile.

## Un errore che ho fatto (uno tra molti)

La prima versione di Keeply aveva troppe funzionalità. Pensavo: serve all'edilizia, ai designer, agli studi commercialisti la useranno anche, volevo prendere ogni caso. Il risultato sembrava un coltellino svizzero: c'erano tutte le funzionalità, ma nessuno le usava con scioltezza.

Quindi ho tagliato. E tagliato ancora.

Ora ogni nuova funzionalità deve passare tre domande prima di entrare in Keeply: il cantiere la userà davvero? I miei capisquadra di 60 anni la apriranno? A qualcuno importerà se la taglio? Qualunque "no" = non la metto. Meno funzionalità non è un bug, è una scelta di design.

## Perché lo scrivo

Questo riguarda l'**origine**.

Keeply non sta cercando di vincere la battaglia del controllo versione contro git, SVN o Mercurial—gli sviluppatori l'hanno vinta vent'anni fa. Keeply è per le persone che **non aprono git** ogni giorno ma **aprono cartelle** ogni giorno: capisquadra di cantiere, designer, avvocati, commercialisti, studenti, freelance.

Se sei una di queste persone, leggi [Il costo nascosto delle cartelle condivise](/it/post/hidden-cost-shared-folders/) e capirai: non sei scarso a organizzare i file. Lo strumento ha solo scaricato la responsabilità di organizzarli sulla tua memoria.

Ci vediamo nella prossima versione.

---

> A proposito dell'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
