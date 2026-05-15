---
title: "【2026 Gestione file】Time Machine vs Dropbox: backup, sync, e il terzo asse che nessuno dei due è"
description: "Ogni articolo di confronto Time Machine vs Dropbox lo inquadra come backup vs sync. Entrambi corretti. Entrambi mancano il terzo asse — cronologia versioni intenzionale a livello di file — che nessuno dei due strumenti fa davvero. Tre mesi dopo, quando ti serve il salvataggio deliberato di 60 giorni fa, quell'assenza è quello che fa male."
voice_version: v2-2026-05-13
date: 2026-05-13T09:00:00+08:00
draft: false
slug: "time-machine-vs-dropbox"
retrofit_status: v1-legacy
primary_keyword: "Time Machine vs Dropbox"
locale: it
categories: [Gestione file]
tags: [controllo versione, sincronizzazione cloud, confronto strumenti]
image: cover.svg
og_image: cover.png
cta_topic: backup
role: cluster
pillar_parent: file-version-management-complete-guide
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
image_alt_data: "Diagramma a tre assi che confronta Time Machine (snapshot a livello disco), Dropbox (sincronizzazione cloud), e un terzo asse etichettato «cronologia versioni intenzionale a livello di file» — illustra che il confronto standard Time Machine vs Dropbox copre solo due dei tre assi"
faq_schema:
  - q: Time Machine fa il backup della mia cartella Dropbox?
    a: Sì, di default. Time Machine fa lo snapshot di qualunque cosa sia nella tua home directory, inclusa la cartella Dropbox sul Mac. Ma fa il backup dello stato sincronizzato — non della cronologia versioni di Dropbox stesso. Se vuoi escludere Dropbox per risparmiare spazio Time Machine, aggiungilo alla lista delle esclusioni.
    
  - q: Basta Time Machine da solo?
    a: Per il disaster recovery sul tuo Mac (guasto disco, formattazione accidentale), sì — Time Machine ripristina tutta la macchina. Per «mi serve la versione di questo file di 60 giorni fa che ho salvato deliberatamente martedì pomeriggio», no — Time Machine ha snapshot orari dello stato del disco, non un registro della tua intenzione di salvataggio a livello di file.
    
  - q: Mi servono sia Time Machine che Dropbox?
    a: Risolvono problemi diversi, quindi la maggior parte delle persone beneficia di entrambi — Time Machine per il ripristino completo del disco, Dropbox per la sincronizzazione tra dispositivi e la copia offsite. Ma anche con entrambi attivi rimane aperto il terzo asse — cronologia versioni deliberata per file senza cap di retention.
    
  - q: Qual è la differenza tra gli snapshot di Time Machine e la cronologia versioni di Dropbox?
    a: Gli snapshot di Time Machine sono a livello disco — snapshot orari dell'intero disco, diluiti nel tempo. Può recuperare qualunque file in qualsiasi punto coperto da uno snapshot, ma navighi per data, non per evento di salvataggio. La cronologia versioni di Dropbox è a livello file — tiene una lista di versioni per file, ma capped a 30 giorni sui piani gratuiti, 180 o 365 sui paid. Time Machine conosce il disco; Dropbox conosce il file; nessuno conosce la tua intenzione di salvataggio.
    
  - q: Qual è il terzo asse che nessuno dei due copre?
    a: Cronologia versioni intenzionale a livello di file senza cap di tempo e senza cap di conteggio — registra ogni salvataggio deliberato come un suo punto recuperabile, con la capacità di marcare una specifica versione come «questa è quella che ho mandato al cliente» affinché sopravviva per sempre. Strumenti come Keeply costruiscono questo terzo strato separatamente dal backup disco e dalla sincronizzazione cloud.
---

# 【2026 Gestione file】Time Machine vs Dropbox: backup, sync, e il terzo asse che nessuno dei due è

> Ogni articolo di confronto lo inquadra come backup vs sync. Entrambi corretti. Entrambi mancano il terzo asse che ti serve davvero tre mesi dopo.

Venerdì sera, ore 18:18. Stai cercando la versione della proposta «del round prima che cambiassimo il prezzo». Ricordi che era il martedì di due mesi fa — c'è stato uno specifico salvataggio che hai fatto quel pomeriggio.

Apri Time Machine. C'è, tecnicamente — ma Time Machine vuole farti scorrere una pila di snapshot datati dell'intera cartella Documenti. Non ricordi la data esatta. Ricordi «dopo pranzo, martedì due mesi fa».

Apri Dropbox. La cronologia versioni è 30 giorni. Sparita.

Ti rendi conto che il consiglio standard — «usa sia Time Machine che Dropbox» — ti ha dato due strumenti che non rispondono alla domanda che hai davvero.

## Cosa confrontano davvero gli articoli Time Machine vs Dropbox

Ogni articolo di confronto che hai letto lo inquadra come uno scontro a due assi:

| Asse | Time Machine | Dropbox |
|---|---|---|
| Backup disco locale | ✅ Snapshot dell'intero disco | ❌ Non è il suo lavoro |
| Sincronizzazione cloud tra dispositivi | ❌ Non è il suo lavoro | ✅ Funzione core |

Entrambi corretti. Entrambi veri. Conclusione di ogni articolo: «usa entrambi». Consiglio ragionevole — scope sbagliato.

Perché c'è un terzo asse che non mettono sul tavolo.

## Il terzo asse: cronologia versioni intenzionale a livello di file

Quello che manca da ogni confronto: **un registro per file dei tuoi salvataggi deliberati, senza limite di tempo né limite di conteggio, con la capacità di marcare un salvataggio specifico come una milestone che sopravvive per sempre**.

Ecco la stessa tabella con il terzo asse aggiunto:

| Asse | Time Machine | Dropbox |
|---|---|---|
| Backup disco locale | ✅ Snapshot orario di tutto il disco | ❌ |
| Sincronizzazione cloud tra dispositivi | ❌ | ✅ |
| **Cronologia versioni intenzionale a livello di file** | ⚠️ Solo livello disco, non livello file | ⚠️ Cap 30 giorni (180 a pagamento) |

Time Machine ha snapshot, ma sono a livello disco. Non sa che hai premuto Cmd+S su un file specifico alle 14:47 con intenzione. Conosce lo stato del disco al prossimo snapshot orario, che potrebbe essere le 14:00 (prima del tuo salvataggio) o le 15:00 (dopo — ma contenente qualunque altra cosa sia cambiata nel frattempo).

Dropbox ha versioni a livello file, ma capped a 30 giorni per il gratuito, 180 o 365 per i piani a pagamento. Passato il limite, quella cronologia a livello file è sparita.

Quindi quando ti serve «il salvataggio deliberato di martedì pomeriggio di due mesi fa», Time Machine ha i byte (da qualche parte nello snapshot) ma non l'indice. Dropbox aveva l'indice, ma l'ha buttato al giorno 31.

## Perché il terzo asse non compare negli articoli di confronto

È un problema di categorizzazione.

I recensori confrontano prodotti inquadrati come competitor. Time Machine e Dropbox non sono in realtà competitor — Apple lo spedisce con l'OS, Dropbox vende abbonamenti. L'inquadramento «vs» viene dal fatto che gli utenti assumono che si sovrappongano perché entrambi toccano file.

Il terzo asse — cronologia versioni intenzionale a livello di file — non è una categoria che la maggior parte degli strumenti mainstream occupa. Quindi i siti di recensioni non hanno un vendor in quello slot, e l'asse resta invisibile.

Scegli quindi gli strumenti per gli assi visibili. Prendi Time Machine più Dropbox, ti sembra di aver coperto tutto, e scopri il vuoto solo quando ne hai bisogno.

## Come si presenta il terzo asse quando uno strumento lo implementa

Uno strumento costruito attorno alla cronologia versioni intenzionale a livello di file fa queste cose:

- **Salva una versione a ogni Cmd+S deliberato**, non su uno schedule di snapshot
- **Nessun limite di tempo** — la versione di due anni fa è accessibile come quella di ieri
- **Nessun limite di conteggio** — 500 salvataggi dopo, le prime sono ancora recuperabili
- **Un marker «Release» o «Milestone»** — segnala un salvataggio specifico come «questo è quello che ho mandato al cliente l'8 marzo» e sopravvive per sempre, anche se salvi il file altre 500 volte
- **Funziona accanto a Time Machine e Dropbox** — non li sostituisce, sta sul terzo asse

[Keeply](https://keeply.work) è una implementazione di questo terzo strato. Gira in locale, osserva le cartelle che aggiungi, cattura ogni salvataggio deliberato, senza limite. La funzione Release ti lascia congelare una versione specifica come milestone.

```
Keeply — martedì pomeriggio di due mesi fa

2026-03-08 — martedì
─────────────────────────────────
● 14:23   proposal.psd          (salvataggio automatico)
● 14:47   proposal.psd          ★ Release: client-pricing-v1
● 15:11   proposal.psd          (salvataggio automatico)
● 15:42   proposal.psd          (salvataggio automatico)
```

Quel marker ★ è quello che ti restituisce il «salvataggio deliberato di martedì pomeriggio» — sopravvive al limite di 30 giorni di Dropbox, alla diluizione oraria di Time Machine, e al tuo stesso dimenticare quale data esatta fosse.

## Time Machine e Dropbox restano importanti

Questo non è un argomento per sostituire uno dei due.

**Time Machine** è lo strumento giusto per: ripristino completo del disco dopo un guasto hardware, «mi hanno rubato il Mac e sto ripristinando su uno nuovo», «voglio annullare un aggiornamento di sistema andato male». È una rete di sicurezza completa del disco. Tienilo attivo.

**Dropbox** è lo strumento giusto per: sincronizzazione tra dispositivi, condivisione di cartelle con clienti, copia offsite dei file di lavoro. È una soluzione di sincronizzazione completa. Tienilo attivo.

Quello che nessuno dei due fa bene: «dammi la versione di questo file di una data che ricordo a metà, non uno snapshot di tutto il mio computer di quella data». Quello è il terzo asse.

## Quando non vale la pena aggiungere il terzo asse

Tre confini in cui l'inquadramento di questo articolo non si applica:

**Non tieni file di lavoro oltre i 30 giorni**: Se il tuo workflow è a ciclo breve e niente conta oltre un mese, la finestra di 30 giorni di Dropbox basta. Non aggiungere complessità che non userai.

**Lavori esclusivamente in Pages / Numbers / Keynote**: I tipi di file nativi Apple hanno una cronologia versioni integrata che funziona senza Time Machine o strumenti terzi. Il terzo asse è integrato nel formato file. Costo: lock-in al tipo di file.

**Sei in un settore regolamentato che richiede archivio immutabile**: La cronologia versioni non è un archivio di conformità. Se GDPR / HIPAA / SOX richiede «questa versione non può essere modificata dopo la creazione», serve uno strumento di archivio adeguato (Veeam, Acronis), non Time Machine + Dropbox + cronologia versioni.

## Letture correlate

L'articolo pilastro [guida completa alla gestione versioni file](/it/post/file-version-management-complete-guide/) scompone 4 ragioni strutturali per cui il tuo strumento non è stato progettato per conservare la cronologia dei file.

[Prima di confrontare iCloud vs Dropbox: tutte e 4 le cloud condividono lo stesso strapiombo di cronologia versioni](/it/post/cloud-version-history-cliff/) — il confronto cloud vs cloud; questo articolo copre locale vs cloud.

[Cosa salva davvero Keeply? In cosa è diverso da backup e cloud](/it/post/what-keeply-saves-vs-backup-cloud/) — stesso pensiero a tre strati applicato all'inquadramento Keeply-come-protagonista.

---

La domanda Time Machine vs Dropbox non ha mai avuto un'unica risposta perché non è mai stata la domanda giusta.

La domanda giusta è: quale asse stai cercando di coprire, e hai uno strumento che vive su quell'asse?

Asse backup: Time Machine. Asse sync: Dropbox. Asse cronologia versioni: non nella tabella di confronto che hai letto. Aggiungi uno strato che vive lì, o convivi con il vuoto sapendo che è lì.

Tra tre mesi, quando ti servirà il salvataggio deliberato di martedì pomeriggio, la risposta è «clic, 8 marzo, ripristinato» — non «fammi avviare Time Machine e scorrere per un'ora».

---

> Sull'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
