---
title: "La cronologia versioni di Word non copre le consegne di 3 mesi fa"
description: "Word AutoRecover, cronologia versioni OneDrive e Time Machine sono strumenti di salvataggio a livello di archiviazione. La retention è breve. Recuperare ciò che hai consegnato 3 mesi fa richiede uno strato strumentale."
date: 2026-05-02T09:00:00+08:00
draft: false
slug: "client-asked-which-version"
primary_keyword: "recupero versione precedente word"
locale: it
categories: ["Gestione versioni file"]
tags: ["cronologia versioni", "AutoRecover", "OneDrive", "delivery-note", "operator-error"]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
cta_topic: versioning
---

# La cronologia versioni di Word non copre le consegne di 3 mesi fa

> La cronologia versioni integrata è salvataggio a livello di archiviazione. Recuperare le versioni consegnate 3 mesi fa richiede uno strato strumentale.

Sabato sera, 23:23. Il tuo cliente ti scrive: "Puoi rimandarmi quella versione della proposta che mi avevi inviato a marzo?"

Apri la cronologia versioni di OneDrive — è rimasta solo l'ultima settimana. Word AutoRecover si è cancellato quando hai chiuso il file. Hai 7 file `_v` sul portatile, nessuno corrisponde a quello che hai consegnato a marzo.

Tre mesi fa hai premuto ⌘+S su quella versione. Gli strumenti non l'hanno ricordata.

## Punti chiave

La **cronologia versioni** di Microsoft Word, AutoRecover e snapshot OneDrive sono tutti **meccanismi di salvataggio a livello di archiviazione**. Progettati per scenari "ho perso il documento durante una crash". La retention è breve: si cancella alla chiusura del file, fino a circa 500 versioni nella cronologia cloud. Questo è salvataggio per archiviazione, non tracciamento delle consegne. Per recuperare la versione che hai consegnato tre mesi fa, ti serve una cronologia versioni always-on indipendente a livello strumentale, più un timbro metadata al momento della consegna.

## Indice

1. Cosa fa effettivamente la cronologia versioni integrata di Word?
2. AutoRecover, OneDrive, Time Machine: per quanto tempo conservano?
3. Perché questi meccanismi non arrivano a 3 mesi dopo
4. Recuperare la versione che hai consegnato 3 mesi fa
5. Domande frequenti

---

## Cosa fa effettivamente la cronologia versioni integrata di Word?

Word e l'ecosistema Office hanno tre meccanismi di "**recupero versione**" integrati:

- **AutoRecover**: salva il contenuto non salvato durante una crash. Salva una versione temporanea ogni 10 minuti per impostazione predefinita. Si cancella quando il file si chiude normalmente.
- **AutoSave** (in [OneDrive / SharePoint Word online](https://support.microsoft.com/it-it/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893)): scrive sul cloud mentre digiti.
- **Cronologia versioni OneDrive**: snapshot di ogni salvataggio, recuperabile per qualsiasi timestamp. La [documentazione SharePoint versioning](https://support.microsoft.com/it-it/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) di Microsoft indica circa 500 versioni principali conservate per impostazione predefinita.

L'intento progettuale è coerente: gestire "**ho avuto una crash a metà documento**" o "**ho appena salvato sopra qualcosa**" — incidenti di salvataggio a breve termine. Non sono progettati per "**il cliente chiede la versione v3 di tre mesi fa**".

## AutoRecover, OneDrive, Time Machine: per quanto tempo conservano?

Per vedere se questi meccanismi reggono, guarda i numeri di retention:

| Meccanismo | Retention predefinita | Trigger di prune | Progettato per |
| --- | --- | --- | --- |
| Word AutoRecover | Cancellato alla chiusura del file | Chiusura file, riavvio Word | Recupero da crash |
| OneDrive AutoSave | Scrittura in tempo reale | — | Co-editing in tempo reale |
| Cronologia OneDrive | Circa [500 versioni](https://support.microsoft.com/it-it/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) | Le più vecchie cadono oltre 500 | Rollback a breve termine |
| Mac [Time Machine](https://support.apple.com/it-it/HT201250) | hourly 24h + daily 30 giorni + weekly fino a disco pieno | Disco pieno | Backup di sistema |
| Cronologia file Windows | Configurabile | Configurabile | Backup di sistema |

Esatto, è proprio il vincolo. Ogni meccanismo ha un soffitto — dalla cancellazione alla chiusura fino a circa 500 versioni. Nessuno arriva oltre tre mesi.

## Perché questi meccanismi non arrivano a 3 mesi dopo

Ecco la distinzione che nessuno nomina chiaramente: **strato di archiviazione** vs **strato strumentale**.

La cronologia versioni integrata vive a livello di **archiviazione**. Lo scopo è "se l'ultima scrittura fallisce, fai rollback" — quindi la retention è breve. I punti di riferimento "500 versioni" o "30 giorni" si basano su "quanto spesso l'utente medio guarda indietro entro un mese". Tutto ciò che sta oltre tre mesi non è nello scopo; il pruning è intenzionale.

Marco è un consulente. Sabato sera alle 23:23, il suo cliente chiede la versione di marzo di un report. Marco apre la cronologia OneDrive; la voce più vecchia è del 28 aprile. AutoRecover era stato disabilitato da tempo. Ha 8 file `.docx` con prefisso `_v` localmente; nessuno dei timestamp corrisponde a quella settimana di consegna a marzo.

Ecco il problema vero. Marco si rende conto solo dopo: a marzo aveva inviato al cliente un PDF esportato quel giorno, non il `.docx`. Il `.docx` originale è stato sovrascritto settimane fa. Il PDF è nella casella del cliente. **Semplicemente non può tornare a quella versione del `.docx` per continuare a modificarla.**

## Recuperare la versione che hai consegnato 3 mesi fa

Ti servono due strati:

- **Cronologia versioni always-on**: ogni salvataggio è preservato, mai prune. Indipendente dalla retention policy di Word o OneDrive.
- **Metadata della delivery-note**: quando esporti un file, vengono incorporati i metadata "chi, quando, quale versione sottostante". Riporta il file nello strumento tre mesi dopo, vedi l'origine completa.

[Keeply](https://keeply.work) fornisce entrambi gli strati.

Lisa usa Keeply da sei mesi. Lunedì mattina, il cliente chiede la versione di aprile di una presentazione. Trova l'allegato nella mail del cliente e trascina il `.pdf` in Keeply. Keeply mostra "**Questa è la presentazione v3 del 12-04-2026**" — hash commit `.docx` originale più tag scopo "approvato dal cliente". Clicca "vai a questa versione" e tre secondi dopo Word apre proprio quella versione del 12 aprile, pronta per essere modificata.

Detto questo, Keeply non sostituisce AutoRecover — la crash a metà documento è ancora la prima linea di AutoRecover. Keeply non può riscrivere la storia retroattivamente: deve essere in esecuzione al momento della consegna perché i metadata si incorporino. Per le consegne fatte prima di installare Keeply, questo articolo non aiuta. Per ogni consegna da oggi in poi, sì.

Ecco la parte che dovrebbe farti respirare.

## Domande frequenti

**Q1: AutoRecover di Word è attivo per impostazione predefinita?**

Sì. Percorso: "File → Opzioni → Salva → Salva informazioni di salvataggio automatico ogni 10 minuti". Ma AutoRecover si cancella alla chiusura normale del file — non è retention a lungo termine.

**Q2: OneDrive Personal e Business conservano lo stesso numero di versioni?**

Non esattamente. OneDrive Personal predefinisce circa 500 versioni. OneDrive for Business (Microsoft 365) predefinisce anche 500 ma gli amministratori possono regolare il limite. Una volta raggiunto, la versione più vecchia viene prune.

**Q3: Time Machine è un backup o un gestore di versioni?**

Time Machine di Mac è backup a livello di sistema, non gestione versioni per file. Fa snapshot dell'intero disco, non "ogni salvataggio di proposal.docx". Recuperare un punto specifico nel tempo di un singolo file è tecnicamente possibile ma macchinoso.

**Q4: Per quanto tempo Google Docs conserva le revisioni?**

Google non pubblica un numero di retention chiaro. La loro [documentazione ufficiale](https://support.google.com/docs/answer/190843) nota che "revisioni più vecchie possono essere unite" per risparmiare spazio. In pratica, le revisioni più vecchie di tre mesi sono spesso unite o prune automaticamente.

**Q5: Lo strato di Keeply è uguale a Git?**

Keeply usa un motore Git sotto il cofano, ma la terminologia Git è nascosta dall'interfaccia. Vedrai "salva versione / copia di lavoro / sincronizza alla posizione del progetto" — non commit, branch o push. Per i non sviluppatori, è gestione versioni in linguaggio d'ufficio.

---

Quel messaggio delle 23:23 tornerà. Non sai quando.

Ma sai questo: il salvataggio post-evento ha limiti. La prevenzione a monte non dipende dal notare in tempo.

Per ogni salvataggio da oggi in poi — puoi lasciare che lo strumento conservi quella versione per te?
