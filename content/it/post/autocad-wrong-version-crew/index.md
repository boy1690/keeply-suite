---
title: "Controllo versioni disegni AutoCAD in 4 passi: ferma la squadra dal disegno della scorsa settimana"
description: "Sono le 9:40, passi dall'ufficio e il PM tira fuori la revisione di giovedì scorso. La specifica del telaio è cambiata, sei stato in cantiere ogni giorno, nessuno te l'ha detto. Guida del capocantiere al controllo versioni dei disegni in 4 passi: nessun nuovo strumento per la squadra, nessuna rivoluzione del flusso di lavoro."
slug: "autocad-wrong-version-crew"
date: 2026-04-24T08:50:00+08:00
draft: false
locale: it
primary_keyword: "controllo versioni disegni AutoCAD"
tags: [controllo versione, recupero file]
categories: [Gestione file]
locales: [zh-TW, en, zh-CN, ja, ko, it]
image: cover.svg
og_image: cover.png
role: cluster
template: T1
pillar_parent: file-version-management-complete-guide
voice_version: v2-2026-05-11
status: approved_master
cta_topic: versioning
image_alt_data: "Tre linee temporali divergenti: Design ha distribuito 5 versioni, l'ufficio ha mancato le ultime 2, il cantiere costruisce ancora dalla versione 2 — una cartella, tre realtà, il gap ufficio-cantiere si spezza per primo"
howto_schema:
  name: 圖檔版本管理 4 步：辦公室與現場對齊
  totalTime: PT2H
  steps:
    - name: 新版進辦公室即通知現場
      text: 新版一進辦公室當下通知現場人員，並要求對方明確回覆「收到」才算完成交接，不能只存好就算。
      url: '#h2-4'
    - name: 新版覆蓋舊版前先留檔
      text: 每次新版覆蓋舊版之前，將舊版獨立保存並於檔名中標記版次，以備設計回頭改回舊版時有據可查。
      url: '#h2-4'
    - name: 工具自動記錄版本供全員查看
      text: 導入 Keeply 等版本管理工具，讓每次存檔自動記錄一版，所有人開啟同一保管庫即可看到同一條版本時間線。
      url: '#h2-4'
    - name: 保留一份異地備份
      text: 確保至少一份檔案不在辦公室或工地 NAS，存放於外接硬碟、雲端或備份槽，防止公司 NAS 損毀時無從復原。
      url: '#h2-4'
---

> Sono le 9:40, passi dall'ufficio e il PM tira fuori la revisione di giovedì scorso. La specifica del telaio è cambiata, sei stato in cantiere ogni giorno, nessuno te l'ha detto. Guida del capocantiere al controllo versioni dei disegni in 4 passi: nessun nuovo strumento per la squadra, nessuna rivoluzione del flusso di lavoro.

Sono le 9:40 del mattino. Passi finalmente dall'ufficio e fai scorrere con disinvoltura le foto del cantiere di ieri davanti al PM. La sezione di drenaggio acque piovane dove è stato gettato il calcestruzzo, i telai a getto pieno tutti annegati nella soletta, pronti per le griglie.

Il PM non dice nulla. Apre un file sulla sua scrivania: `A-05_drain_0422_issued.dwg`.

"Il telaio è sbagliato. L'architetto l'ha rivisto di nuovo giovedì scorso."

Senti quel tuffo al petto. La revisione di giovedì scorso è arrivata in ufficio. Mike l'ha ricevuta, l'ha archiviata sul server, non ha avvisato nessuno. Tu sei stato in cantiere ogni giorno. Nessuno l'ha menzionata alla riunione del lunedì. Non avevi modo di saperlo.

Quella sezione è già stata gettata. Specifica del telaio cambiata. Significa scalpellare il calcestruzzo indurito per estrarre i vecchi telai, posare i nuovi telai con le dimensioni corrette, ricolare i bordi, lasciar maturare. Due giorni in più sul cronoprogramma. Le altre maestranze accodate dietro di te, tutte in attesa.

Non hai mandato il file sbagliato alla squadra. Semplicemente non sapevi che il file fosse cambiato.

## Indice

- ["È quella la revisione di giovedì scorso?"](#h2-1)
- [Prima dell'"emesso per costruzione" ci sono molte bozze. Poi l'architetto torna indietro su una](#h2-2)
- [L'ufficio sa. Il cantiere no](#h2-3)
- [Controllo versioni disegni AutoCAD in 4 passi: ufficio + cantiere allineati](#h2-4)
- [Le uniche persone che non ne hanno bisogno: la squadra che installa dai fogli stampati](#h2-5)

---

## "È quella la revisione di giovedì scorso?" {#h2-1}

È la domanda con cui il PM torna su qualcosa quando qualcosa non quadra. Anche la squadra la fa. Non vogliono dire nulla con questo. Vogliono solo confermare. Il problema è che metà delle volte non sai rispondere subito nemmeno tu.

Apri il portatile. La cartella del progetto contiene `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. C'è anche `A-05_drain_0420_avoidutility.dwg` che qualcuno ha buttato nel gruppo WhatsApp. E quello di inizio marzo, `A-05_drain_0315.dwg`, che non hai mai cancellato perché l'architetto a volte torna a un layout precedente quando un cambio non funziona.

Cinque nomi di file. Sai che uno di loro è quello da cui la squadra sta effettivamente costruendo. Ma non ricordi quale.

Non è pigrizia, né da parte tua né da parte di Mike. È che il divario tra "un nuovo disegno arriva in ufficio" e "il cantiere lo viene a sapere" non ha nessuno assegnato. Ti capita di essere la persona che sta su entrambi i lati di quel divario.

Sono stato anni sui cantieri io stesso e ho visto questa scena troppe volte. Le nuove revisioni arrivano in ufficio, il cantiere non lo sa, e sono sempre due linee che non si connettono.

---

## Prima dell'"emesso per costruzione" ci sono molte bozze. Poi l'architetto torna indietro su una {#h2-2}

Potresti pensare: "Va bene, ricontrollerò ogni volta che sono in ufficio." In teoria, certo. In pratica si sfalda perché **le bozze continuano ad accumularsi prima che qualcosa venga emesso ufficialmente**.

Un dettaglio, dal primo schema all'emesso per costruzione, passa per molte versioni. Il committente aggiunge un commento. Revisione. Un sopralluogo trova un conflitto con i sottoservizi. Revisione. L'ingegnere strutturista revisiona. Revisione. **Poi l'architetto arriva alla rev 5 e il committente dice "in realtà il dettaglio del bordo della rev 2 era più pulito", così si torna indietro**. Apri la cartella e vedi sei file, due dei quali quasi identici. Ma non riesci a capire quale sia quello che conta in questo momento.

Se aspettassi che l'architetto "finalizzi" completamente prima di lasciar partire la squadra, il cronoprogramma ti schiaccerebbe. Tre maestranze sono accodate dietro questa sezione. Ogni giorno che trattieni, bruci manodopera, attrezzature e margine. Quindi l'impresa generale prende il rischio calcolato ,  **procede sull'ultima versione vista**, scommettendo che la prossima revisione non sarà drastica.

Il più delle volte la scommessa paga. A volte no. È questa settimana.

---

## L'ufficio sa. Il cantiere no {#h2-3}

Il vero punto di rottura è qui: **un nuovo disegno arriva in ufficio, il cantiere non lo viene a sapere e nessuno porta il messaggio attraverso il divario**.

Sul lato ufficio, la persona che riceve l'email può essere un assistente PM, un addetto amministrativo o un altro capocantiere. Il loro istinto quando arriva un file è "archiviarlo bene". Cartella, denominazione, archivio. Non sempre sanno esattamente cosa stia facendo il cantiere questa settimana, e non sempre riescono a capire a colpo d'occhio se questa revisione è di quelle che vanno segnalate immediatamente. Per loro, archiviato è fatto.

Sul lato cantiere, sei fuori ogni giorno. Anche se passi in ufficio ogni venerdì per sincronizzarti, tra l'ultimo controllo e il successivo l'architetto potrebbe aver emesso due revisioni e averne ribaltata una. Puoi trovarla se vai a cercarla. Ma **solo se sei abbastanza disciplinato da rifare attivamente il giro**. Non tutti i capocantiere lo fanno, ogni volta.

Sul lato squadra, costruiscono da quello che hai consegnato loro l'ultima volta. Non sanno se in ufficio ci sia un file più nuovo. E non dovrebbero averne bisogno. Il loro lavoro è installare secondo il disegno, non tracciare le versioni.

Di quei tre fili, **quello tra ufficio e cantiere è il più facile da perdere**. Non perché qualcuno stia scansando il lavoro. Perché nessun processo costringe quella linea a restare aperta. Un messaggio "nuova versione caricata" in un thread di gruppo che viene perso, è perso per sempre.

---

## Controllo versioni disegni AutoCAD in 4 passi: ufficio + cantiere allineati {#h2-4}

Non c'è molto da fare. Quattro passaggi. Prima di costruire Keeply ho visto lo stesso copione andare in scena nello studio dove lavoravo: nuova revisione arriva in ufficio, il cantiere non lo sa, il calcestruzzo viene gettato male. I quattro passi qui sotto sono il set minimo che chiude "nessuno l'ha portato dall'altro lato."

**1. Nel momento in cui un nuovo file arriva in ufficio, avvisa il cantiere. E aspetta un "ricevuto" di ritorno.** Non "archiviato e fatto." **Lo scambio è completo solo quando la persona del cantiere conferma esplicitamente**. Può essere WhatsApp, può essere Slack, può essere una telefonata. La regola è: il cantiere deve confermare per iscritto. Senza conferma, il passaggio non è completo.

**2. Prima che una nuova revisione sovrascriva la precedente, conserva la precedente separatamente.** Chiamala `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. Questo è **per quando l'architetto torna indietro**. Puoi ancora tirare fuori esattamente com'era la rev 3.

**3. Lascia che lo strumento registri ogni revisione automaticamente, e rendila visibile a tutti.** Qui gli strumenti subentrano nelle parti che la disciplina non riesce a sostenere. [Keeply](https://keeply.work) è costruito esattamente per questo. Ogni salvataggio registra automaticamente una versione. I file restano dove sono. Nella tua cartella di progetto, proprio dove la tua squadra già guarda. **Finché tutti aprono lo stesso archivio condiviso (di solito il NAS aziendale), tutti vedono la stessa cronologia**. Nel momento in cui l'ufficio carica un nuovo file, il capocantiere apre Keeply in cantiere e la cronologia mostra "oggi alle 15:30, l'architetto ha rivisto di nuovo." Nota onesta: se devi confrontare due disegni `.dwg` riga per riga, devi comunque aprire AutoCAD e farlo da solo. Keeply non fa il confronto tra disegni CAD. Ma "è arrivata una nuova versione, chi l'ha mandata, quando, e l'hai aperta?". Questo smetti di perderlo. Il PM chiede "Hai visto la rev di giovedì scorso?" e la cronologia risponde.

Ecco grosso modo come si presenta sullo schermo:

```text
A-05_drain.dwg
Archivio: Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Descrizione versione                   Tag     Quando
─────────────────────────────────────────────
 ●  Specifica telaio rivista                    Oggi
 ●  Reinstradato per evitare sottoservizi       04/20
 ●  Emesso dopo revisione committente  ⭐Emesso  04/18
 ●  Profilo aggiustato                          04/15

─────────────────────────────────────────────
 Membri dell'archivio (NAS condiviso)
   Mike (ufficio) · Tu (cantiere) · Chen (caposquadra)

   Tutti aprono la stessa cartella, tutti vedono
   la stessa cronologia. Nel momento in cui arriva
   una nuova versione, compare per tutti.
   Passa il mouse su una riga → ripristino con un click.
```

**Compatibilità**: Keeply registra a livello sottostante, compatibile con il NAS aziendale, SharePoint, OneDrive Business, Synology, QNAP, dischi di rete condivisi. I file non si spostano, non sostituisci AutoCAD, non cambi il flusso di lavoro della squadra.

Devo essere onesto: se devi confrontare due disegni `.dwg` riga per riga, devi comunque aprire AutoCAD e farlo a mano. Keeply non fa il confronto tra disegni CAD.

**4. Almeno una copia che non sia su questa macchina e non sul NAS di cantiere.** Hard disk esterno, cloud, slot di backup. Qualunque cosa. Il punto è **almeno una copia fuori sede**. I dischi NAS dell'ufficio si rompono, vengono cancellati, vengono riutilizzati per il prossimo progetto. Il backup fuori sede è l'assicurazione più economica che ti comprerai mai.

I passaggi 1 e 2 possono funzionare con la sola disciplina, ma onestamente. Tre mesi dopo ne mancherai metà. Il passaggio 3 è come lo strumento prende l'altra metà.

---

## Le uniche persone che non ne hanno bisogno: la squadra che installa dai fogli stampati {#h2-5}

Siamo onesti. Non è per tutti nell'edilizia. Ma la lista delle esclusioni è più corta di quanto pensi.

**Le uniche persone che davvero non ne hanno bisogno sono le squadre che installano dal disegno che hanno davanti.** Il loro lavoro è costruire secondo il foglio che è stato consegnato loro, non rincorrere le versioni. Rincorrere le versioni è il tuo lavoro.

**I lavori pubblici ne hanno bisogno di più, non di meno.** Potresti pensare che i grandi progetti pubblici o governativi siano coperti perché hanno già una piattaforma di collaborazione BIM. È il contrario. I lavori pubblici producono più carta dei lavori privati, di gran lunga, le richieste di variante si trascinano per mesi, il turnover dei dirigenti è più alto, la pila di documenti cresce più veloce e la memoria istituzionale si rompe più facilmente. Le piattaforme BIM risolvono il consegnabile finale. Non risolvono i documenti di pianificazione, i file condivisi e le note di revisione che i disegni di progetto accumulano in corso d'opera. E quelle sono le cose che effettivamente crescono, giorno dopo giorno.

**Anche i singoli professionisti ne hanno bisogno.** Potresti pensare: "Sono solo io su questo progetto dall'inizio alla fine, ho davvero bisogno del controllo versioni?" Sì. Perché tra tre mesi, guardando lo stesso file, **dimenticherai perché il tu di prima ha fatto quel cambio**. Una cronologia conserva più del file stesso. Conserva il motivo nel momento. Il tu del futuro ringrazierà il tu del presente per aver lasciato la traccia.

Tutti gli altri. Residenziale piccolo e medio, commerciale, finiture d'interni, drenaggi, paesaggio, strade, lavori di campus, lavori pubblici, progetti BIM, designer singoli, studi di progettazione ,  **se il tuo lavoro coinvolge un file che viene cambiato e riaperto in seguito da qualcun altro o dal tu del futuro, hai bisogno di una cronologia.** Ogni volta che quella linea si rompe, tempo e denaro escono dalla tua tasca.

---

Un `.dwg` non è solo un disegno. È un'istantanea di ciò su cui progettazione, ufficio e cantiere si sono accordati in un momento specifico. Quel momento continua a cambiare, continua a passare di mano, continua a essere costruito dalla versione sbagliata.

Vale la pena dare a ciascuno dei tuoi progetti la sua cronologia?

---

Ricordi quel momento delle 9:40. Il PM che tira fuori la revisione di giovedì e quel tuffo al petto? Non devi più essere il responsabile delle versioni. **Keeply: la memoria custode dei tuoi file.** Ricorda ogni salvataggio, ogni versione emessa, ogni istantanea prima che la vecchia venga sovrascritta. Vive dentro la tua cartella di progetto esistente. Nessun nuovo strumento, nessuna nuova abitudine per la squadra. L'edilizia ci si adatta particolarmente bene, perché la linea tra ufficio e cantiere si rompe in ogni singolo progetto.

[Conosci Keeply →](https://keeply.work)

---

> Sull'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
