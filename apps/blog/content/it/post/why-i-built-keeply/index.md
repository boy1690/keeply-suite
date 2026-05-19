---
title: "【2026 Gestione file】Perché ho creato Keeply: per chi perde file nelle cartelle condivise ogni giorno"
description: "Keeply è cresciuto dalla cartella condivisa del cantiere che ogni settimana genera la storia del calcestruzzo da rompere — non per trasformare i non-sviluppatori in utenti git, ma per costruire lo strumento che non devono imparare. Nota del fondatore."
voice_version: v2-2026-05-11
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
image_alt_data: "Sagoma del fondatore vicino alla finestra con il carattere 創 (creare) scritto a mano — il momento che ha dato vita a Keeply: vedere un collega perdere 6 settimane di lavoro CAD per una sovrascrittura non salvata, capendo che gli strumenti esistenti non erano progettati per non-sviluppatori"
faq_schema:
  - q: Qual è la differenza tra Keeply e Git?
    a: 'Git è progettato per chi scrive codice — a ogni checkpoint esegui comandi manualmente, impari concetti come rami e merge, gestisci un repository. Keeply è progettato per chi non scrive codice — trascini una cartella dentro, continui a salvare come fai sempre, e la cronologia versioni nasce in background. Niente comandi da imparare, nessuna curva "diventa utente Git".'
  - q: Perché hai deciso di costruire Keeply?
    a: Ho visto la stessa scena ripetersi troppe volte in cantiere — un collega che perde 6 settimane di lavoro CAD per una sovrascrittura non salvata, oppure operai che rifanno colate di calcestruzzo perché in cantiere c'era ancora la tavola della settimana prima. Gli strumenti esistenti davano per scontato che l'utente volesse imparare Git. Architetti, designer, commercialisti, avvocati, dottorandi non vogliono imparare Git — vogliono "mentre lavoro, qualcuno in silenzio mi tiene le versioni".
  - q: Quale problema risolve davvero Keeply?
    a: 'Uno strato di mezzo trascurato — la cronologia versioni intenzionale a livello di file. La sincronizzazione cloud risolve "il file esiste", Time Machine risolve il recupero a livello di disco, le revisioni di Word coprono solo le modifiche in questa sessione. "La versione che ho salvato apposta un martedì tre mesi fa" — quella casella non ha nessun occupante, e la maggior parte delle persone la affronta a colpi di _v7 _final manuali che non resistono sei mesi.'
  - q: Per chi è adatto e per chi no?
    a: "Adatto a — architetti, designer, avvocati, commercialisti, dottorandi, sviluppatori in pair programming con l'AI, chiunque debba tracciare chi ha cambiato cosa in cartelle condivise. Non adatto per — lavoro di puro codice (Git/GitHub è più indicato), aziende la cui policy IT impone SharePoint/OneDrive come unica fonte di verità, persone i cui file vivono interamente in strumenti cloud-native (Google Docs, Notion). Non vogliamo competere con Git né sostituire la sincronizzazione cloud — Keeply copre solo lo strato che gli altri dimenticano."
---

Negli ultimi anni ho lavorato fianco a fianco con ingegneri dell'edilizia. Molti hanno 50, 60 anni. Il computer non è il loro strumento più comodo, ma planimetrie, ordini di variante e contratti passano tutti da lì ogni giorno. La cartella condivisa è il loro campo di collaborazione: un NAS, un gruppo di persone, N versioni di file, modifiche continue.

Ho visto [il caos andare in scena](/it/post/autocad-wrong-version-crew/) troppe volte. I designer mandano una nuova versione all'ufficio. Chi raccoglie l'email la salva sul NAS ma non avvisa il cantiere. Il capocantiere quel giorno sta lavorando con il disegno della settimana scorsa. Il calcestruzzo è già colato, le dimensioni non corrispondono, devi rompere il getto, rifare il telaio, spostare il programma di due giorni. Nessuno ha sbagliato. Ma qualcuno paga.

## Il bivio che ho preso

Io uso git con scioltezza. Gli sviluppatori lo fanno tutti, esistono perfino corsi a pagamento. Quando trovo un problema faccio commit, branch, reset, lo strumento è come una seconda mano.

Ma nel momento in cui ho detto "prova git" a un capocantiere, mi è tornata indietro una faccia confusa ogni volta. Git non è fatto per loro: CLI, merge conflict, puntatore HEAD, ogni concetto è un muro che blocca la strada. Ero bloccato in mezzo: io usavo lo strumento con scioltezza, i miei clienti non potevano, la cartella condivisa continuava a generare storie settimanali di calcestruzzo da rompere.

Insegnare loro git è più economico. Costruire uno strumento che non devono imparare è più difficile. Ho scelto la strada difficile.

## Un errore che ho fatto (uno tra molti)

La prima versione di Keeply aveva troppe funzionalità. Pensavo: serve all'edilizia, ai designer, agli studi commercialisti la useranno anche, volevo prendere ogni caso. Il risultato sembrava un coltellino svizzero: c'erano tutte le funzionalità, ma nessuno le usava con scioltezza.

Quindi ho tagliato. E tagliato ancora.

Ora ogni nuova funzionalità deve passare tre domande prima di entrare in Keeply: il cantiere la userà davvero? I miei capisquadra di 60 anni la apriranno? A qualcuno importerà se la taglio? Qualunque "no" = non la metto. Meno funzionalità non è un bug, è una scelta di design.

## Perché lo scrivo

Questo riguarda l'**origine**.

Keeply non sta cercando di vincere la battaglia del controllo versione contro git, SVN o Mercurial, gli sviluppatori l'hanno vinta vent'anni fa. Keeply è per le persone che **non aprono git** ogni giorno ma **aprono cartelle** ogni giorno: capisquadra di cantiere, designer, avvocati, commercialisti, studenti, freelance.

Se sei una di queste persone, leggi [Il costo nascosto delle cartelle condivise](/it/post/hidden-cost-shared-folders/) e capirai: non sei scarso a organizzare i file. Lo strumento ha solo scaricato la responsabilità di organizzarli sulla tua memoria.

Ci vediamo nella prossima versione.

---

> A proposito dell'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
