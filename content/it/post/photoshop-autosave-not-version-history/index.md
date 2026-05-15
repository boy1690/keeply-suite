---
title: "【2026 Gestione file】Il salvataggio automatico di Photoshop salva i crash, non i file sovrascritti"
description: "La cartella di salvataggio automatico di Photoshop è vuota per design. È stata costruita per i crash, non per recuperare la versione che hai appena sovrascritto con Cmd+S. Ti serve un altro livello."
date: 2026-05-11T08:00:00+08:00
slug: photoshop-autosave-not-version-history
retrofit_status: v1-legacy
tags: ["gestione versioni file", "design", "recupero"]
categories: ["controllo versioni"]
image: cover.svg
og_image: cover.png
primary_keyword: "photoshop salvataggio automatico"
locales: [en, ja, zh-tw, zh-cn, ko, it]
draft: false
---

Hai premuto Cmd+S. Il cursore ha lampeggiato una volta.

Poi te ne sei reso conto — quella versione era proprio quella che il cliente voleva.

Il brief diceva "v2, ma con i colori della v3". Tu eri sulla v2. Hai scelto le campionature della v3. Hai salvato.

Game over.

Il livello che hai appena sovrascritto è l'unica v2 che hai. Cerchi freneticamente su Google "photoshop autosave location," convinto che Photoshop abbia nascosto da qualche parte una copia. Apri la cartella di salvataggio automatico. C'è un file di martedì scorso. Niente di oggi.

Hai aperto la cartella giusta. Quello che fa, semplicemente, non è quello che pensavi facesse.

## Apri la cartella. Non c'è nulla.

La cartella di salvataggio automatico non sta nascondendo il tuo file. Non l'ha mai avuto, prima di tutto.

Davanti alla cartella vuota, i designer fanno tipicamente le stesse due cose: cercano su Google una volta in più "photoshop autosave location," poi fissano la cartella per dieci minuti. Entrambe a vuoto, perché il salvataggio automatico è da sempre un meccanismo diverso — è il paracadute d'emergenza che Photoshop tiene per sé stesso, pronto per un certo tipo di caduta. Sotto il paracadute c'è Photoshop, non la tua cronologia delle versioni.

Cosa fa esattamente questo paracadute d'emergenza? Photoshop sorveglia le "chiusure anomale" — crash, terminazioni forzate, kernel panic del sistema. Quando queste cose accadono, scrive lo stato di lavoro in memoria in un file `.psb` di recupero; al lancio successivo di Photoshop appare una finestra che chiede se ripristinare quel file.

Il suo compito finisce qui. Un Cmd+S normale che sovrascrive la tua versione precedente è una situazione completamente diversa — il programma funziona, l'utente ha volontariamente eseguito un comando di salvataggio, il meccanismo di salvataggio automatico non si attiva affatto. Niente crash, niente da recuperare, niente viene scritto nella cartella di recupero.

Vuoi verificare frugando direttamente la cartella? [La documentazione Adobe elenca i percorsi esatti per ogni piattaforma](https://helpx.adobe.com/photoshop/using/auto-save-recovery-background-save.html): `~/Documents/Adobe/AutoRecover/` su Mac, `%AppData%/Adobe/Adobe Photoshop {version}/AutoRecover/` su Windows. Vecchi file `.psb` di sessioni precedenti possono ancora essere lì, ma il lavoro di oggi non è mai stato scritto, quindi non c'è nulla da riportare indietro.

Allora perché esistono migliaia di articoli che ti insegnano "dov'è la cartella di salvataggio automatico"?

## Il salvataggio automatico di Photoshop è stato costruito per i crash — e solo per i crash

Onestamente, è la distinzione che nessuno sulla prima pagina di Google si prende la briga di fare:

| Meccanismo | Attivazione | Cosa salva | Integrato in Photoshop? |
|---|---|---|---|
| **Salvataggio automatico** | Photoshop rileva chiusura anomala | Stato di lavoro in memoria al momento del crash | ✅ |
| **Cronologia versioni** | Ogni Cmd+S | Snapshot completo di ogni versione salvata, conservato in modo permanente | ❌ |

**Recupero da crash** è il compito del salvataggio automatico — il programma è morto, il tuo file non era stato salvato, riportami dove ero. Un lavoro, uno slot. Puoi impostare l'intervallo nelle `Preferenze > Gestione file` di Adobe (5, 10, 15 o 30 minuti), ma qualsiasi numero tu scelga, il salvataggio è sempre nello stesso singolo slot che viene sovrascritto; le nuove scritture sostituiscono le vecchie, niente cronologia, solo "l'ultimo punto di recupero disponibile."

**Recupero da errore** appartiene a un meccanismo diverso — la cronologia delle versioni, la cosa che Photoshop non fa. Cmd+S scrive il nuovo contenuto direttamente sul vecchio. "Salva con nome..." ti dà un nuovo file, ma anche l'originale è già in qualsiasi stato in cui l'hai salvato per ultimo, quindi il vecchio contenuto sparisce allo stesso modo. Il pannello Cronologia? Vedrai tra poco — neanche lui riesce a fare questo lavoro.

Torniamo alla domanda dei "migliaia di articoli" — rispondono a una domanda più facile della tua. "Dov'è la cartella di salvataggio automatico" è una FAQ tecnica; "come riprendo la versione che ho appena sovrascritto" è un problema di design. La prima ha una risposta. La seconda, dentro Photoshop, non ce l'ha.

La parte più divertente: Adobe stessa non finge il contrario. Il nome ufficiale della funzionalità è "**Background Save and Auto-Recovery**." Adobe la chiama *recupero*; noi la leggiamo come *cronologia*. È lì che si apre la differenza.

## E no, neanche il pannello Cronologia ti salva

Visto che il salvataggio automatico non è cronologia, la prossima cosa che la maggior parte dei designer prova è il pannello Cronologia — il nome suona più simile a cronologia delle versioni.

Lo apri, scorri, vedi venti passaggi di stamattina. Niente di ieri.

Il pannello Cronologia è la "memoria undo della sessione corrente." Vive nel processo di Photoshop in esecuzione, in RAM; chiudi il file (o esci da Photoshop) e l'intera traccia svanisce. Apri lo stesso PSD la mattina dopo e il pannello Cronologia mostra una sola riga: "Apri." Ogni pennellata, ogni regolazione di livello, ogni mossa di ieri — sparita dalla cronologia. I pixel sono nel file. Il percorso che hai fatto per arrivare lì non lo è.

"Ma ho il pannello Cronologia!" Questa è la risposta istintiva. E mentre lavori, certo, ti copre — ma la traccia di ieri svanisce nel momento in cui chiudi il file. È più vicina a un post-it che a una cronologia: la usi una volta, la butti.

Per impostazione predefinita Photoshop conserva 50 passaggi; puoi alzarli nelle `Preferenze > Prestazioni`. Quel numero non importa per il tuo problema — questa cronologia muore alla chiusura del file, indipendentemente da quanto alto imposti il limite.

Il pannello Cronologia è, tecnicamente, un "log di operazioni" — "hai fatto queste cose in questo ordine." Registra azioni, non stati del file. Cmd+S non lascia alcun segno su di esso, perché non è stato progettato per farlo.

Quindi hai in mano tre cose che sembrano dovrebbero salvarti: salvataggio automatico (costruito per i crash), cartella di recupero (dove il salvataggio automatico parcheggia i suoi dump d'emergenza), e pannello Cronologia (undo della sessione, svanisce alla chiusura).

Non c'è una quarta cosa. **La cronologia delle versioni a livello di file non è integrata in Photoshop**. Quel livello mancante è ciò che ti ha portato a questo articolo.

## Quello che ti serve davvero è cronologia delle versioni a livello di file

Il livello mancante vive fuori da Photoshop — un processo separato che osserva ogni Cmd+S, posizionato un livello sopra l'applicazione stessa.

Definiamo precisamente cosa serve. Ogni volta che salvi il PSD, qualcosa preserva silenziosamente quello snapshot completo, byte per byte, e non lo sovrascrive mai. Salvi venti volte oggi, hai venti snapshot impilati. Sovrascrivi la v2 che il cliente voleva domani? Torni allo snapshot di 30 minuti fa — il tuo file attuale rimane, e una versione precedente torna accanto.

Perché Photoshop non costruisce questo livello? Adobe si posiziona come strumento di disegno. "Come è cambiato questo file sul disco nel tempo" è una questione del filesystem, una questione del sistema operativo, o una questione di uno strumento di terze parti — quindi Adobe lascia quel livello a qualcun altro.

C'è più di uno strumento che prova a riempire il vuoto. Apple Time Machine ci prova — ma Time Machine fa snapshot di sistema orari, non snapshot per salvataggio; se hai salvato la v2 più di un'ora fa potresti acchiapparla, oppure potresti acchiappare un momento in cui l'avevi già sovrascritta. Pura fortuna di tempistica. OneDrive e SharePoint offrono cronologia delle versioni con un [limite predefinito di 500 versioni principali](https://learn.microsoft.com/it-it/sharepoint/document-library-version-history-limits), e le versioni più vecchie vengono potate automaticamente una volta raggiunto il limite (gli account Microsoft personali sono più stretti — limitati a 25 versioni). Google Drive è ancora più stretto: [100 revisioni per file](https://developers.google.com/workspace/drive/api/guides/manage-revisions), con tutto ciò che è più vecchio di 30 giorni rimosso automaticamente a meno che non sia marcato manualmente come "Keep Forever" (anch'esso limitato a 200). [Abbiamo spiegato in dettaglio altrove](/post/client-asked-which-version/) perché questo livello non arriva al caso "il cliente chiede tre mesi dopo." Sono risposte parziali.

Ciò che rimane, Keeply prova a riempirlo. La logica è semplice: ogni Cmd+S su un PSD dentro una cartella Keeply, Keeply preserva silenziosamente la versione esatta in quel momento, separatamente dal file vivo — il tuo lavoro attuale non viene toccato. Anche i PSD più pesanti (quelli da 500MB in un singolo file) vengono gestiti con grazia in background; Keeply usa una memorizzazione sottostante per file grandi che non gonfia il disco. Non c'è intervallo di salvataggio da configurare, nessun pulsante "snapshot ora" da premere — lavori in Photoshop come hai sempre fatto, e lui registra ogni salvataggio dietro di te.

Quando ti accorgi di aver sovrascritto la v2 che il cliente voleva, apri il pannello Keeply, scorri a "30 minuti fa," clicca ripristina — la versione precedente appare accanto al tuo file attuale come file separato, il tuo lavoro attuale intatto. Confronti visivamente le due, copi i colori della v3 sulla v2 ripristinata, e quell'ora di rifacimento di livelli si comprime in 30 secondi di click.

Un'altra cosa: Keeply funziona insieme ad Adobe Creative Cloud, Time Machine, qualsiasi sincronizzazione cloud che già usi — non sostituisce nessuna di queste. Riempie l'unico vuoto che nessuna di loro affronta: cronologia delle versioni a livello di file persistente per file creativi binari, osservata a ogni salvataggio.

Questo vuoto è anche la parte che i designer sentono più forte ne [il più ampio problema della gestione delle versioni file](/post/file-version-management-complete-guide/) — i PSD sono grandi, le modifiche sono distruttive, e i clienti cambiano idea su quale v2 intendevano.

## Cosa Keeply non risolve

Ora che il lato funzionalità è coperto, anche i confini meritano di essere nominati. Keeply non può riportare indietro ciò che non c'è più. Alcuni limiti onesti:

**Guasto del disco rigido — quello non è il nostro territorio**. Dischi morenti, settori corrotti, un'estensione `.psd` rotta — quello è territorio di EaseUS, Disk Drill, Stellar Phoenix. Keeply presume che il tuo file sia ancora sul disco, solo con un contenuto che non vuoi; se il file stesso è andato, ti serve il recupero del disco, non la cronologia delle versioni.

**File sovrascritti prima dell'installazione di Keeply** non possono essere aiutati. Keeply non è una macchina del tempo — inizia a registrare versioni dal momento in cui lo installi. Se hai sovrascritto la v2 che il cliente voleva ieri e installi Keeply solo oggi, non c'è cronologia a cui tornare. Ammetto che suoni stupido, ma è la natura di qualsiasi strumento di cronologia delle versioni — registra la linea temporale andando avanti; il tempo prima di lui non lo conosce.

**Crash per cui il salvataggio automatico di Photoshop è stato costruito** anch'essi non sono territorio di Keeply. Photoshop crasha a metà modifica e non avevi premuto Cmd+S da 20 minuti? Quello stato di lavoro non salvato deve ancora essere afferrato dalla finestra di recupero di Photoshop.

Keeply registra cosa succede dopo Cmd+S; il salvataggio automatico di Photoshop registra il momento prima. Due meccanismi diversi che girano fianco a fianco.

## Cosa fare prima del prossimo Cmd+S

Torniamo alla scena iniziale. Il cliente voleva v2 con i colori della v3; sei sulla v2, scegli le campionature della v3, premi Cmd+S. Se c'è cronologia delle versioni a livello di file che gira in background, la apri, trovi la v2 di 30 minuti fa (prima di toccare i colori), e la ripristini come file separato. Entrambe sono davanti a te: la v2 senza colore a cui faceva riferimento il cliente, e la v2 con i colori della v3 che hai appena salvato. Confronta, decidi, consegna.

Il panico si dissolve.

Il salvataggio automatico non è cattivo design — al lavoro per cui è stato costruito (riportarti indietro da un crash) funziona bene. Solo che non dovrebbe essere atteso a risolvere un problema che nessuno si è preso la briga di risolvere lì. La cronologia delle versioni è il lavoro di un livello separato, fatto da uno strumento separato.

Per aggiungere quel livello ai tuoi PSD prima che accada il prossimo Cmd+S, [installa Keeply su Mac o Windows](/post/install-keeply-windows-mac/).

---

*Scritto da [Ting-Wei Tsao](https://www.linkedin.com/in/ting-wei-tsao-b57480152), fondatore di Keeply. Keeply è uno strumento di cronologia delle versioni di file per designer, architetti e knowledge worker che hanno bisogno di tornare indietro su singoli file senza imparare Git.*
