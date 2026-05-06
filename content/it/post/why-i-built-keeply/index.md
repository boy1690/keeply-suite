---
title: "Perché ho creato Keeply: tutto è iniziato da \"Dove sono finiti i miei file?\""
description: "Keeply è costruito perché tu possa vedere i tuoi file—non perché tu impari a essere uno sviluppatore."
date: 2026-05-06T01:00:00+08:00
draft: false
slug: why-i-built-keeply
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - Note del fondatore
tags:
  - Keeply
  - Filosofia di design
  - Fondatore
image: cover.svg
og_image: cover.png
role: standalone
template: T6
---

Il primo early tester ha aperto la cartella NAS per guardare i suoi file. Dentro ha trovato `objects/`, `pack/`, `HEAD`. Nessuno dei suoi file di design. Mi ha mandato un messaggio: "Dove sono finiti i miei file?"

In quel momento ho capito cosa avevamo sbagliato.

Avevamo scelto "backup" come concetto centrale. Nella testa di un ingegnere il backup va bene: compresso, codificato, non navigabile direttamente. Ma per un utente, **l'opposto di "backup" non è "no backup," è "non lo trovo."** Aprire una cartella e non vedere le proprie cose = fiducia rotta. La tecnica può dire che è sicuro, ma se gli occhi dicono che non è sicuro, non è sicuro.

Quella è stata la prima svolta di Keeply. Poi è diventata l'[ADR-001](https://github.com/boy1690) formale: togliere "backup" come metafora centrale, passare a "posizione del progetto." Una parola di differenza, l'intera struttura dati è cambiata.

## Il bivio che ho preso

C'erano due strade. O insegnare all'utente a essere uno sviluppatore (imparare che `objects/` è un pack file, `HEAD` è un puntatore), o fare uno strumento che parla la lingua dell'ufficio ("salva versione," "cronologia versioni," "ripristina").

Educare gli utenti è più economico. Costruire uno strumento vero è più difficile. Ho scelto la seconda.

La [missione](https://github.com/boy1690) di Keeply è diventata una frase: "**Permettere a persone non tecniche di gestire le versioni dei file in linguaggio ufficio, senza alcuna necessità di sapere che Git esiste.**" L'UI non mostra commit, branch, HEAD, stash—nemmeno come metafore. Sotto c'è un motore git2, ma è un mio problema, non tuo.

## Un errore che ho fatto (uno tra molti)

Non ogni decisione di design è giusta. Ad aprile di quest'anno ho chiesto a un modello di tier superiore una bozza di strategia di differenziazione Free / Team. È tornato con 530 righe: 5 quote per casi d'uso, watermark come prova, timestamp RFC 3161, 5 trigger complessi di upgrade.

Ho rifiutato tutto.

Il ragionamento: i watermark non sono prova legale a Taiwan (lo sono i documenti formali). Più cartelle su un NAS sono fisicamente equivalenti a multi-vault—un limite numerico non significa nulla. I timestamp RFC 3161 non hanno alcun valore di vendita reale per gli utenti taiwanesi (vanno in posta per timbri di evidenza o da un notaio). **Quelle feature servono la teoria, non gli utenti reali.**

Ora ogni decisione di spec passa attraverso tre domande: gli utenti la vogliono? Ha senso nello scenario reale? A qualcuno importerà se la taglio? Qualunque "no" = non spedire.

## Perché lo scrivo

Non è marketing. È **trasparenza**: le mie ragioni per costruire questo strumento, gli errori che ho fatto, i principi che mantengo.

Se vai ad affidare a uno strumento 5 o 10 anni di dati clienti, file di design, contratti—devi sapere come pensa la persona che lo costruisce. Non posso promettere che Keeply sarà sempre giusto, ma posso promettere: ogni decisione è scritta, ogni errore viene rireframato, ogni idea over-engineered viene uccisa.

Ci vediamo nella prossima versione.

---

> A proposito dell'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
