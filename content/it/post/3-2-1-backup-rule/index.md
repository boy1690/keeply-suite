---
title: "La regola 3-2-1 del backup: 20 anni dopo, basta ancora nel 2026?"
description: "3-2-1 è necessario—ma fin dalla progettazione non gestisce l'operator-error. Questo articolo analizza cosa la regola 3-2-1 protegge, cosa non protegge, e cosa serve per quel livello mancante."
date: 2026-05-02T09:00:00+08:00
draft: false
slug: "3-2-1-backup-rule"
primary_keyword: "regola 3-2-1 backup"
locale: it
categories: ["Strategia di backup"]
tags: ["3-2-1 backup", "backup dati", "controllo versione", "operator-error"]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
---

# La regola 3-2-1 del backup: 20 anni dopo, basta ancora nel 2026?

> La regola 3-2-1 non è cambiata in 20 anni, ma quello che temi oggi non è più quello del 2005.

Nel 2005, il fotografo **Peter Krogh** definì la sua regola di backup: 3 copie, 2 supporti diversi, 1 fuori sede. Stava proteggendosi da nastri deteriorati, dischi rigidi caduti, incendi nelle sale server.

Vent'anni dopo, quello che tu temi è **premere ⌘+S una volta di troppo**.

La regola 3-2-1 non si è mai mossa—ma la tua vera minaccia sì.

## Punti chiave

La **regola 3-2-1 del backup** è necessaria: tre copie, due tipi di supporto, una fuori sede. Protegge dai guasti hardware, incendi, ransomware—gli scenari di disastro. Ma fin dalla progettazione non gestisce **operator-error**: tu che sovrascrivi il tuo file, un collega che modifica la versione sbagliata, la sincronizzazione cloud che replica la versione errata in tutte e tre le copie. Questo articolo analizza cosa la 3-2-1 copre, cosa non copre, e cosa serve per quel livello mancante.

## Indice

1. Cos'è esattamente la regola 3-2-1?
2. Da cosa protegge la 3-2-1, e da cosa no?
3. Perché fai 3-2-1 e perdi comunque i file?
4. 3-2-1 + cronologia versioni, è possibile in un solo strumento?
5. Domande frequenti

---

## Cos'è esattamente la regola 3-2-1?

La regola 3-2-1 viene da [*The DAM Book*](https://www.oreilly.com/library/view/the-dam-book/9780596008550/) di Peter Krogh (O'Reilly, 2005):

- **3 copie** dei tuoi dati: l'originale più 2 backup
- **2 tipi di supporto**: ad es. disco locale + cloud, oppure NAS + SSD esterno
- **1 copia fuori sede**: separata fisicamente dalle altre

Nel 2005 i supporti dominanti erano nastri, CD/DVD, dischi rigidi meccanici. I tassi di guasto erano alti, i supporti invecchiavano in fretta. L'intento progettuale era chiaro: **fare in modo che nessun guasto hardware singolo, degrado del supporto o disastro nella struttura potesse cancellare i tuoi file**.

## Da cosa protegge la 3-2-1, e da cosa no?

Per vedere dove la 3-2-1 regge, guarda come si presenta davvero "perdere un file":

| Scenario | La 3-2-1 ti salva? | Perché |
| --- | :---: | --- |
| Il disco si rompe | ✅ | 3 copie su supporti diversi |
| Incendio in ufficio | ✅ | 1 copia è fuori sede |
| Cifratura ransomware | ✅ (la copia offsite intatta) | Isolamento offsite |
| **Sovrascrivi la tua versione** | ❌ | Tutte e 3 le copie sincronizzano la nuova versione |
| **Collega modifica il file sbagliato** | ❌ | Stessa cosa |
| **Serve una versione di 3 mesi fa** | ❌ | La 3-2-1 non è cronologia versioni |

Sì, è proprio qui che si blocca. La 3-2-1 protegge da "il file è sparito". Non si occupa di "il file c'è ancora ma è sbagliato".

## Perché fai 3-2-1 e perdi comunque i file?

Ecco un punto cieco vecchio di 20 anni che nessuno nomina chiaramente: **il "3" in "3 copie" è ridondanza spaziale, non temporale.**

Nel 2005 le durate dei dischi erano brevi e i supporti fragili. Più copie combattevano il decadimento fisico. "3" era una risposta sensata.

Nel 2026 i dischi sono affidabili e la sincronizzazione cloud è istantanea. Cosa diventa il "3"? Diventa lo stesso errore replicato in tre posti, in tempo reale.

A è un designer. Lunedì mattina alle 10:32, un cliente chiama chiedendo la versione della proposta firmata tre mesi fa. A apre il NAS — 12 versioni, tre copie cloud che mostrano tutte l'attuale "ultima".

Ma A non vuole l'ultima. Vuole la versione di tre mesi fa.

Ecco il peggio: si rende conto solo dopo il completamento del backup che "ultima" non è quella che gli serve. La 3-2-1 ha protetto diligentemente la versione sbagliata, tre volte.

## 3-2-1 + cronologia versioni, è possibile in un solo strumento?

Sì. [Keeply](https://keeply.work) integra la 3-2-1 nello strato di posizione:

- **Copia di lavoro locale**: la versione sul tuo computer (corrisponde alla "1 copia" di 3-2-1)
- **Posizione canonica del progetto**: il deposito canonico su NAS o cloud (conta come "2 supporti")
- **Posizione di backup**: l'intero progetto sincronizzato in un'altra posizione fisica (la "1 fuori sede")

Aggiungi cronologia versioni a livello git, più un meccanismo di freezing per Release. Uno strumento, tre livelli di protezione.

Keeply non decide dove va la posizione di backup. Se tieni il computer e il backup nello stesso ufficio, un incendio prende entrambi. Nessuno strumento risolve questo. Il principio "fuori sede" rimane responsabilità tua.

Ma non hai bisogno di due strumenti separati: uno per la ridondanza spaziale e uno per la cronologia versioni. Un Keeply, dal portatile al backup, da questo secondo a settimana scorsa, tutto visibile e tutto recuperabile.

## Domande frequenti

**Q1: Qual è la differenza tra la regola 3-2-1 e la 4-2-1-1-0?**

4-2-1-1-0 estende la 3-2-1: aggiunge un backup immutabile e zero errori di verifica. È sempre ridondanza spaziale alla base. **Non risolve il problema della cronologia versioni.**

**Q2: Il backup cloud conta come copia "fuori sede" della 3-2-1?**

Sì. Ma iCloud, OneDrive e Google Drive sono sincronizzazione, non backup. Se cancelli o sovrascrivi localmente, il cloud sincronizza la stessa modifica in pochi secondi. **Non proteggono da operator-error.**

**Q3: Il NAS conta come 2 tipi di supporto?**

NAS più un disco locale possono contare come 2 supporti. Ma RAID non è un backup. RAID protegge dal guasto del disco. Non protegge dal fatto che cancelli il file sbagliato.

**Q4: Keeply è già 3-2-1?**

Sì. Keeply integra la 3-2-1 nel suo strato di posizione (copia di lavoro locale + canonica + posizione di backup) e aggiunge cronologia versioni e freezing Release. Uno strumento, tre livelli.

**Q5: Anche i lavoratori autonomi hanno bisogno della 3-2-1?**

Dipende da quanto contano i tuoi file. Se perderli farebbe male, sì. Il criterio è "perderlo farebbe male" — non ha nulla a che fare con il fatto che tu sia individuo o azienda.

---

Nel 2005 Peter Krogh progettò la 3-2-1 per proteggere da dischi rigidi che cadono per terra.

Tu non sei Peter Krogh nel 2005. Hai paura di premere ⌘+S una volta di troppo.

Non hai bisogno di due strumenti—ne serve uno che gestisca tutti e tre i livelli.
