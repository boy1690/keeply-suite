---
title: "【2026 Gestione file】Il dipendente in uscita ti ha cancellato i file? Hai confuso «sincronizzazione» con «backup»"
description: "Sabato sera, Tina svuota la cartella brand-book. Dropbox sincronizza fedelmente il disastro. Perché «sync non è backup» è la vera lezione — non gli avvocati, non il DLP."
slug: departing-employee-data-risk
retrofit_status: v1-legacy
image: cover.svg
og_image: cover.png
date: 2026-05-09T08:00:00+08:00
draft: false
locale: it
primary_keyword: 'rischio dati dipendente in uscita (baseline; ja-master primary keyword 退職 データ 持ち出し どこまで)'
spec: specs/departing-employee-data-risk/
status: approved
voice_version: v2-2026-05-11
image_alt_data: "Timeline della cartella alle 23:03: brand-book/ copiata alle 22:50, eliminata alle 23:03, scaduta dopo 30 giorni — due azioni sulla stessa cartella, nessuna registrata da Dropbox o Google Drive, entrambe fuori dalla portata degli strumenti di sync"
faq_schema:
  - q: "Un dipendente in uscita ha svuotato la cartella Dropbox o Google Drive prima di andarsene. La cronologia delle versioni può recuperarla?"
    a: "Quasi mai. Dropbox conserva 30 giorni di cronologia sui piani personali e 180 giorni su quelli Business — ma nel momento in cui l'utente svuota il proprio cestino (o ha permessi di amministratore), quella cancellazione esce dal campo della cronologia. Gli strumenti di sincronizzazione sono progettati per «mantenere coerenti i due estremi», non per «conservare una cronologia irreversibile»."
  - q: "Gli avvocati o il software DLP possono fermare questa situazione?"
    a: "Nessuno dei due in tempo. Una causa per segreti commerciali richiede 12-24 mesi, l'onere della prova è pesante e quando vinci i file originali sono troppo vecchi per servire. Il DLP (software per la prevenzione della perdita di dati) costa più di quanto abbia senso per un team di 10 persone, richiede un amministratore dedicato, e blocca solo il futuro — non può annullare ciò che il dipendente ha già fatto sabato scorso."
  - q: "Come copre Keeply il punto cieco lasciato dagli strumenti di sincronizzazione?"
    a: "Keeply non si basa sulla sincronizzazione, ma sulla cronologia irreversibile. Ogni salvataggio entra nella timeline, il repository locale non ha limite di tempo, e il «tetto di 500 versioni» semplicemente non esiste. Le consegne critiche possono essere congelate come Release (vedi ADR-003) — anche un amministratore non può cancellare una versione Release congelata."
  - q: "Keeply è adatto a un'azienda con IT centralizzato?"
    a: "I team piccoli (≤10 persone) possono adottarlo direttamente. Le aziende medie possono affiancarlo al DLP esistente o al backup centralizzato — il ruolo di Keeply è «cronologia delle versioni per workflow individuali o di squadra». Non sostituisce il DLP enterprise (blocco USB, monitoraggio in tempo reale, canali criptati) — copre il punto cieco che quegli strumenti non hanno mai coperto, cioè la cancellazione fatta da un utente legittimo."
---

# 【2026 Gestione file】Il dipendente in uscita ti ha cancellato i file? Hai confuso «sincronizzazione» con «backup»

> Sabato sera, Tina svuota la cartella brand-book. Dropbox sincronizza fedelmente il disastro. Perché «sync non è backup» è la vera lezione — non gli avvocati, non il DLP.

## Indice

- [Quel sabato sera, alle 23:03](#hook)
- [L'avvocato non spegne l'incendio, il DLP arriva troppo tardi](#alternatives)
- [Perché le è stato così facile cancellarli](#why)
- [Passare a Keeply: una cronologia irreversibile](#keeply)
- [Quello che Keeply non risolve](#limits)

---

## Quel sabato sera, alle 23:03 {#hook}

Quel sabato sera alle 23:03, Tina trascina l'intera cartella `brand-book` nel cestino di casa, e già che c'è la svuota anche.

In meno di un minuto, Dropbox sincronizza fedelmente quell'azione sul cloud.

Lunedì mattina il cliente chiama per i file originali. Apri la cartella — vuota. Pensi che ci sia ancora speranza, ma la sua mossa manuale di «svuota cestino» ha aggirato in blocco il meccanismo di ripristino versioni di Dropbox.

(Dropbox Personal conserva i file cancellati per 30 giorni, Business per 180. Nessuno dei due ti salva quando l'utente svuota attivamente il cestino. Vedi la [documentazione ufficiale di Dropbox](https://help.dropbox.com/delete-restore/recover-deleted-files). Anche il software di recupero dati non arriva — sono [4 casi documentati](/it/post/restore-without-panic/).)

Non sai nemmeno se prima ha copiato i file fuori. Non puoi consegnare nulla al cliente.

---

## L'avvocato non spegne l'incendio, il DLP arriva troppo tardi {#alternatives}

Quando ti capita una cosa così, vai a cercare risposte online.

La via legale? L'avvocato inizierà a parlarti di segreti commerciali. Il problema è che, al momento, non hai nemmeno modo di produrre prove. Anche se passassi un anno o due a vincere la causa, quel brand-book sarebbe ormai troppo vecchio per servire a qualcuno.

Visto che la legge non spegne l'incendio, ti rivolgi al software di sicurezza aziendale (DLP). È una buca ancora più profonda. Il DLP blocca le copie, certo. Ma il canone mensile è del tutto sproporzionato per un team di una dozzina di persone, e ti serve anche un ingegnere dedicato per fargli da balia. Il colpo finale: il DLP difende solo il futuro. Quello che Tina ha già fatto nel weekend, nessuna licenza DLP comprata oggi può annullarlo.

Entrambe le strade cercano di risolvere «cosa fare dopo». Nessuno fa la domanda fondamentale.

---

## Perché le è stato così facile cancellarli {#why}

**Perché le è stato così facile cancellarli?**

Perché hai usato lo strumento sbagliato.

Dropbox, Google Drive, OneDrive — nessuno di loro è rotto. Il loro nucleo di progettazione si chiama «coerenza tra i due capi». Tu cancelli, il cloud cancella. Tu modifichi, il cloud sovrascrive. Il loro lavoro è riflettere la tua azione, non proteggere il tuo patrimonio.

Usare uno strumento di sincronizzazione come cassaforte dei file è come affidare l'intera spina dorsale dell'azienda a un magazzino nudo, senza assicurazione.

Ho costruito Keeply proprio per colmare questa lacuna meccanica.

---

## Passare a Keeply: una cronologia irreversibile {#keeply}

Ecco perché ti serve un vero strumento di gestione delle versioni dei file. La sua logica di fondo non è la sincronizzazione, ma una cronologia irreversibile.

Su Keeply, quando Tina cancella un file, non devi frugare in nessun cestino. Apri la timeline e ripristini la versione precedente. Anche con i permessi di admin, non può cancellare le pietre miliari marcate come Release. E quello che ha toccato? La traccia di audit è inchiodata lì. Non ti serve fare il detective per rimettere insieme i pezzi.

E come fa chi prende in carico il lavoro a portarsi davvero quelle versioni dal laptop di Tina sulla propria macchina? Keeply ha una finestra chiamata "cherry-pick" che ti permette di applicare versioni specifiche da un'altra macchina o da un altro vault.

![Finestra di dialogo Keeply cherry-pick: applica la versione di consegna del 12 aprile dal vault brand-book sul laptop di Tina, 12 file più nota di Release-freeze](cherry-pick-dialog.svg)

Il nuovo collega apre Keeply, sceglie il vault brand-book dal laptop di Tina, vede la riga della consegna del 12 aprile, scrive "brand-book consegna cliente — set completo approvato" nelle note e clicca "Applica". Dodici file — logos, guidelines.pdf, color-tokens.json — arrivano insieme nella cartella di lavoro sulla nuova macchina. Anche l'attributo Release-freeze li segue, così nessuno potrà cancellarli per errore in seguito.

---

## Quello che Keeply non risolve {#limits}

Te lo dico onestamente: Keeply non è una soluzione miracolosa.

Se quello che vuoi è «monitorare in tempo reale e bloccare le chiavette USB dei dipendenti», quello è il lavoro del DLP. Se devi revocare gli accessi a Slack o Figma, è la normale procedura di uscita degli account. Se vuoi un parere legale, vai da un avvocato.

Prima devi decidere una cosa: vuoi spendere un mucchio di soldi per impedire ai dipendenti di sbagliare, oppure vuoi **«qualunque cosa faccia un dipendente, posso ripristinarla in un secondo»**?

Io ho costruito Keeply per la seconda.

La prossima volta che un dipendente si dimette, quando aprirai il sistema lunedì mattina alle 9:14, vedrai ogni file che ha toccato negli ultimi sei mesi, ogni modifica che conta, tutto seduto al sicuro sulla timeline.

Non ti servirà preoccuparti di cosa abbia fatto durante il suo ultimo weekend prima di andarsene. Perché la registrazione era già inchiodata lì da tempo.

---

> Riguardo all'autore: Ting-Wei Tsao, fondatore di Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
