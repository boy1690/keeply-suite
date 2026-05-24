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

Negli ultimi anni ho lavorato fianco a fianco con [ingegneri dell'edilizia](/it/post/autocad-wrong-version-crew/). Molti hanno 50, 60 anni. Il computer non è il loro strumento più comodo, ma planimetrie, ordini di variante e contratti passano tutti da lì ogni giorno. La cartella condivisa è il loro campo di collaborazione: un NAS, un gruppo di persone, N versioni di file, modifiche continue.

Ho visto il caos andare in scena troppe volte. I designer mandano una nuova versione all'ufficio. Chi raccoglie l'email la salva sul NAS ma non avvisa il cantiere. Il capocantiere quel giorno sta lavorando con il disegno della settimana scorsa. Il calcestruzzo è già colato, le dimensioni non corrispondono, devi rompere il getto, rifare il telaio, spostare il programma di due giorni. Nessuno ha sbagliato. Ma qualcuno paga.

## Il bivio che ho preso

Io uso git con scioltezza. Gli sviluppatori lo fanno tutti, esistono perfino corsi a pagamento. Quando trovo un problema faccio commit, branch, reset, lo strumento è come una seconda mano.

Ma nel momento in cui ho detto "prova git" a un capocantiere, mi è tornata indietro una faccia confusa ogni volta. Git non è fatto per loro: CLI, merge conflict, puntatore HEAD, ogni concetto è un muro che blocca la strada. Ero bloccato in mezzo: io usavo lo strumento con scioltezza, i miei clienti non potevano, la cartella condivisa continuava a generare storie settimanali di calcestruzzo da rompere.

Insegnare loro git è più economico. Costruire uno strumento che non devono imparare è più difficile. Ho scelto la strada difficile.

## Un errore che ho fatto (uno tra molti)

La prima versione di Keeply aveva troppe funzionalità. Pensavo: serve all'edilizia, ai designer, agli studi commercialisti la useranno anche, volevo prendere ogni caso. Il risultato sembrava un coltellino svizzero: c'erano tutte le funzionalità, ma nessuno le usava con scioltezza.

Quindi ho tagliato. E tagliato ancora.

Ora ogni nuova funzionalità deve passare tre domande prima di entrare in Keeply: il cantiere la userà davvero? I miei capisquadra di 60 anni la apriranno? A qualcuno importerà se la taglio? Qualunque "no" = non la metto. Meno funzionalità non è un bug, è una scelta di design.

## Perché il problema italiano è strutturalmente diverso

Quando ho cominciato a parlare con utenti in Italia, ho capito che c'è qualcosa di specifico nel contesto italiano che aggrava il problema in modo sistematico — e che nessuno dei tool che ho visto affronta davvero.

Il tessuto produttivo italiano è fatto di **piccole e medie imprese a conduzione familiare**: uno studio di commercialisti dove lavorano padre, figlia e due collaboratori; uno studio tecnico con geometri e architetti che si alternano sugli stessi file di progetto; un'impresa edile dove il capocantiere e il direttore dei lavori condividono gli stessi disegni via NAS. In queste realtà, il NAS condiviso è il centro gravitazionale di tutto il lavoro — non perché qualcuno lo abbia scelto consapevolmente come soluzione di versioning, ma perché era già lì, ed è comodo.

Il problema è che **in queste organizzazioni nessuno ha il ruolo di IT manager**. Chi ha installato il NAS anni fa magari non lavora più lì. Le versioni precedenti di Synology o QNAP sono spesso disabilitate — "per non riempire il disco" — e nessuno lo sa. Quando arriva il momento di recuperare un file sovrascritto, la risposta è sempre la stessa: silenzio.

Ho visto questo accadere in settori precisi:

- **Commercialisti e avvocati**: i file dei clienti (dichiarazioni, contratti, perizie) cambiano mano tra collaboratori più volte al giorno. Una sovrascrittura su cartella condivisa non notificata può costare ore di ricostruzione o, peggio, un errore che finisce in un atto ufficiale.
- **Geometri e studi di progettazione**: i disegni CAD sono enormi, vengono salvati spesso, e la storia del "calcestruzzo colato sul disegno sbagliato" non è metafora — l'ho vissuta di persona in cantiere.
- **Imprese edili e artigianali**: il capocantiere apre il file che trova sul NAS — non sa, e non deve sapere, se è la versione aggiornata dal progettista ieri sera o quella della settimana scorsa.

In Taiwan, da dove vengo, i problemi di versioning nelle PMI esistono, ma la struttura è più piatta e la digitalizzazione è partita prima. In Italia c'è una generazione intera di professionisti di 50-65 anni che usa il computer ogni giorno ma non ha mai avuto accesso a strumenti di versioning progettati per loro. Git è fuori questione. OneDrive e SharePoint richiedono che qualcuno li configuri e li mantenga. Dropbox funziona, ma la cronologia versioni finisce.

Ho costruito Keeply pensando a loro — non come semplificazione di Git, ma come strumento che non richiede nessuna configurazione IT, nessun concetto da imparare, nessun NAS da riconfigurare. Trascini la cartella dentro. Continui a lavorare come hai sempre fatto. Le versioni vengono salvate in silenzio.

## Perché lo scrivo

Questo riguarda l'**origine**.

Keeply non sta cercando di vincere la battaglia del controllo versione contro git, SVN o Mercurial, gli sviluppatori l'hanno vinta vent'anni fa. Keeply è per le persone che **non aprono git** ogni giorno ma **aprono cartelle** ogni giorno: capisquadra di cantiere, designer, avvocati, commercialisti, studenti, freelance.

Se sei una di queste persone, leggi [Il costo nascosto delle cartelle condivise](/it/post/hidden-cost-shared-folders/) e capirai: non sei scarso a organizzare i file. Lo strumento ha solo scaricato la responsabilità di organizzarli sulla tua memoria.

Ci vediamo nella prossima versione.

---

> A proposito dell'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
