---
title: "Word salva le versioni, non i ricordi di 3 mesi fa (Gestione file 2026)"
description: "Word AutoRecover, cronologia versioni OneDrive e Time Machine sono tutti strumenti di salvataggio a livello di archiviazione — retention va da cancellato-alla-chiusura fino a circa 500 versioni. Recuperare ciò che hai consegnato 3 mesi fa richiede una cronologia versioni always-on a livello strumentale più metadata al momento della consegna."
voice_version: v2-2026-05-11
date: 2026-05-02T09:00:00+08:00
draft: false
slug: "client-asked-which-version"
primary_keyword: "recupero versione precedente word"
locale: it
categories: [Casi d'uso]
tags: [recupero file, errore utente]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
cta_topic: versioning
image_alt_data: "Orologio alle 11:23 accanto a tre file — proposal_v3_FINAL.docx, v3_FINAL_v2.docx, v3_FINAL_final.docx — nessuno riconducibile alla consegna di marzo chiesta dal cliente; AutoRecover di Word e OneDrive non raggiungono 3 mesi indietro"
faq_schema:
  - q: Word 內建版本歷史能做什麼？
    a: Word 有三種機制：AutoRecover（當機救援，關閉即清除）、自動儲存（邊打邊存至雲端）、OneDrive 版本歷史（保留約 500 個版本快照）。三種都是短期儲存事故救援，設計目標不包含 3 個月後的交付版本追蹤。
  - q: AutoRecover、OneDrive 和 Time Machine 各能保留多久？
    a: AutoRecover 在檔案正常關閉後即清除；OneDrive 版本歷史預設約 500 個版本，超過自動刪最舊；Mac Time Machine 每小時快照保留 24 小時、每天快照保留 30 天。每種機制都有保留上限，無法跨越 3 個月這條線。
  - q: 為什麼 Word 版本歷史守不到 3 個月後？
    a: 軟體內建版本歷史活在「儲存層」，設計給最近一次寫入失敗用，保留期依平均使用者一個月內查找頻率設定。3 個月以上不在設計目標，清除是合理行為。需要工具層獨立的常駐版本歷史才能解決。
  - q: 找回 3 個月前的交付版本需要什麼？
    a: 需要兩層：常駐版本歷史（每次儲存都留下，不依賴 Word 或 OneDrive 保留期政策）；以及交付便條元資料（匯出時自動嵌入誰、何時、對應哪個版本）。Keeply 同時提供這兩層。
  - q: Google Docs 的修訂版能保留多久？
    a: Google 未公開明確保留期。官方文件指出較舊的修訂版可能會被合併以節省空間，實務上 3 個月以上的修訂版常被自動合併或清除，無法可靠用於長期交付版本追蹤。
---

# Word salva le versioni, non i ricordi di 3 mesi fa

> La cronologia versioni integrata è salvataggio a livello di archiviazione. Recuperare le versioni consegnate 3 mesi fa richiede uno strato strumentale.

Sabato sera, 23:23. Il tuo cliente ti scrive: "Puoi rimandarmi quella versione della proposta che mi avevi inviato a marzo?"

Apri la cronologia versioni di OneDrive. È rimasta solo l'ultima settimana. Word AutoRecover si è cancellato quando hai chiuso il file. Hai 7 file `_v` sul portatile, nessuno corrisponde a quello che hai consegnato a marzo.

Tre mesi fa hai premuto ⌘+S su quella versione. Gli strumenti non l'hanno ricordata.

Dalle storie che gli utenti Keeply condividono, questo messaggio delle 11:23 di sera è lo scenario che sento più spesso.

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
- **AutoSave** (OneDrive / SharePoint Word online): scrive sul cloud mentre digiti.
- **Cronologia versioni OneDrive**: snapshot di ogni salvataggio, recuperabile per qualsiasi timestamp. La [documentazione SharePoint versioning](https://learn.microsoft.com/it-it/sharepoint/document-library-version-history-limits) di Microsoft indica 500 versioni principali di default (account Microsoft personali: 25).

L'intento progettuale è coerente: gestire "**ho avuto una crash a metà documento**" o "**ho appena salvato sopra qualcosa**". Incidenti di salvataggio a breve termine. Non sono progettati per "**il cliente chiede la versione v3 di tre mesi fa**".

## AutoRecover, OneDrive, Time Machine: per quanto tempo conservano?

Per vedere se questi meccanismi reggono, guarda i numeri di retention:

| Meccanismo | Retention predefinita | Trigger di prune | Progettato per |
| --- | --- | --- | --- |
| Word AutoRecover | Cancellato alla chiusura del file | Chiusura file, riavvio Word | Recupero da crash |
| OneDrive AutoSave | Scrittura in tempo reale | Sovrascrittura sync | Co-editing in tempo reale |
| Cronologia OneDrive | Circa [500 versioni](https://learn.microsoft.com/it-it/sharepoint/document-library-version-history-limits) (25 sugli account personali) | Le più vecchie cadono oltre 500 | Rollback a breve termine |
| Mac [Time Machine](https://support.apple.com/it-it/HT201250) | hourly 24h + daily 30 giorni + weekly fino a disco pieno | Disco pieno | Backup di sistema |
| Cronologia file Windows | Configurabile | Configurabile | Backup di sistema |

Esatto, è proprio il vincolo. Ogni meccanismo ha un soffitto. Dalla cancellazione alla chiusura fino a circa 500 versioni. Nessuno arriva oltre tre mesi.

Sui cantieri, ogni versione di file decide cosa viene consegnato alla fine. Non trovare la versione consegnata significa mettere alla prova il limite della memoria di un manager.

## Perché questi meccanismi non arrivano a 3 mesi dopo

Ecco la distinzione che nessuno nomina chiaramente: **strato di archiviazione** vs **strato strumentale**.

La cronologia versioni integrata vive a livello di **archiviazione**. Lo scopo è "se l'ultima scrittura fallisce, fai rollback". Quindi la retention è breve. I punti di riferimento "500 versioni" o "30 giorni" si basano su "quanto spesso l'utente medio guarda indietro entro un mese". Tutto ciò che sta oltre tre mesi non è nello scopo; il pruning è intenzionale.

Marco è un consulente. Sabato sera alle 23:23, il suo cliente chiede la versione di marzo di un report. Marco apre la cronologia OneDrive; la voce più vecchia è del 28 aprile. AutoRecover era stato disabilitato da tempo. Ha 8 file `.docx` con prefisso `_v` localmente; nessuno dei timestamp corrisponde a quella settimana di consegna a marzo.

Ecco il problema vero. Marco si rende conto solo dopo: a marzo aveva inviato al cliente un PDF esportato quel giorno, non il `.docx`. Il `.docx` originale è stato sovrascritto settimane fa. Il PDF è nella casella del cliente. **Semplicemente non può tornare a quella versione del `.docx` per continuare a modificarla.**

## Recuperare la versione che hai consegnato 3 mesi fa

Ti servono due strati:

- **Cronologia versioni always-on**: ogni salvataggio è preservato, mai prune. Indipendente dalla retention policy di Word o OneDrive.
- **Metadata della delivery-note**: quando esporti un file, vengono incorporati i metadata "chi, quando, quale versione sottostante". Riporta il file nello strumento tre mesi dopo, vedi l'origine completa.

[Keeply](https://keeply.work) fornisce entrambi gli strati.

Lisa usa Keeply da sei mesi. Lunedì mattina, il cliente chiede la versione di aprile di una presentazione. Trova l'allegato nella mail del cliente e trascina il `.pdf` in Keeply. Keeply mostra "**Questa è la presentazione v3 del 12-04-2026**". Hash commit `.docx` originale più tag scopo "approvato dal cliente". Clicca "vai a questa versione" e tre secondi dopo Word apre proprio quella versione del 12 aprile, pronta per essere modificata.

Detto questo, Keeply non sostituisce AutoRecover. La crash a metà documento è ancora la prima linea di AutoRecover. Keeply non può riscrivere la storia retroattivamente: deve essere in esecuzione al momento della consegna perché i metadata si incorporino. Per le consegne fatte prima di installare Keeply, questo articolo non aiuta. Per ogni consegna da oggi in poi, sì.

Ecco la parte che dovrebbe farti respirare.

## Domande frequenti

**Q1: AutoRecover di Word è attivo per impostazione predefinita?**

Sì. Percorso: "File → Opzioni → Salva → Salva informazioni di salvataggio automatico ogni 10 minuti". Ma AutoRecover si cancella alla chiusura normale del file. Non è retention a lungo termine.

**Q2: OneDrive Personal e Business conservano lo stesso numero di versioni?**

Non esattamente. OneDrive Personal predefinisce circa 500 versioni. OneDrive for Business (Microsoft 365) predefinisce anche 500 ma gli amministratori possono regolare il limite. Una volta raggiunto, la versione più vecchia viene prune.

**Q3: Time Machine è un backup o un gestore di versioni?**

Time Machine di Mac è backup a livello di sistema, non gestione versioni per file. Fa snapshot dell'intero disco, non "ogni salvataggio di proposal.docx". Recuperare un punto specifico nel tempo di un singolo file è tecnicamente possibile ma macchinoso.

**Q4: Per quanto tempo Google Docs conserva le revisioni?**

Google non pubblica un numero di retention chiaro. La loro [documentazione ufficiale](https://support.google.com/docs/answer/190843) nota che "revisioni più vecchie possono essere unite" per risparmiare spazio. In pratica, le revisioni più vecchie di tre mesi sono spesso unite o prune automaticamente.

**Q5: Keeply è nella stessa categoria di Git?**

No. Git è uno strumento di controllo versione costruito per ingegneri software — la sua interfaccia è un terminale nero, e devi imparare un vocabolario (branch, merge, commit) per usarlo. Keeply è costruito per non-ingegneri dal primo giorno: l'interfaccia è una finestra file, le parole che vedi sono "salva una versione / copia di lavoro / sincronizza alla posizione del progetto", e non c'è gergo ingegneristico. Entrambi risolvono un problema simile (conservare la storia dei file), ma il pubblico, l'interfaccia e il modello mentale sono diversi."

---

Quel messaggio delle 23:23 tornerà. Non sai quando.

Ma sai questo: il salvataggio post-evento ha limiti. La prevenzione a monte non dipende dal notare in tempo.

Per ogni salvataggio da oggi in poi. Puoi lasciare che lo strumento conservi quella versione per te?

---

> Sull'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
