---
title: "Pourquoi ton équipe ouvre toujours le plan AutoCAD de la semaine dernière"
description: "Il est 9h40, tu passes au bureau, le PM affiche la révision de jeudi dernier — la spec du cadre a changé. Tu étais sur chantier tous les jours, personne ne t'a prévenu. Le béton est déjà coulé. Le guide pratique d'un conducteur de travaux pour la gestion des versions de plans : pas de nouvel outil pour l'équipe, pas de refonte du process, juste une façon de faire en sorte que chaque révision laisse sa propre trace."
slug: "autocad-wrong-version-crew"
date: 2026-04-24
image: cover.svg
og_image: cover.png
categories:
  - Gestion de fichiers
tags:
  - AutoCAD
  - Construction
  - Gestion des versions
  - Gestion de chantier
---

Il est 9h40. Tu passes enfin au bureau et tu fais défiler tranquillement les photos de chantier d'hier pour le PM — la section du caniveau d'orage où le béton vient d'être coulé, les cadres encastrés tous calés dans la dalle, prêts à recevoir les grilles.

Le PM ne dit rien. Il ouvre un fichier sur son bureau : `A-05_drain_0422_issued.dwg`.

« Le cadre est faux. L'architecte l'a encore révisé jeudi dernier. »

Tu sens ce coup au creux de la poitrine. La révision de jeudi dernier est passée par le bureau — Mike l'a reçue, l'a classée sur le serveur, n'a prévenu personne. Tu étais sur chantier tous les jours. Personne ne l'a mentionné au point lundi matin. Tu n'avais aucune raison de le savoir.

Cette section est déjà coulée. La spec du cadre a changé — ça veut dire piquer le béton durci pour sortir les anciens cadres, poser des cadres neufs aux bonnes dimensions, recouler les bords, laisser durcir. Deux jours de plus sur le planning. Les autres corps de métier empilés derrière toi, tous en attente.

Tu n'as pas envoyé le mauvais fichier à l'équipe. Tu ne savais simplement pas que le fichier avait changé.

## Sommaire

- [« C'est bien la révision de jeudi dernier ? »](#h2-1)
- [Avant le « bon-pour-construction », il y a beaucoup de drafts. Puis l'architecte revient sur l'un d'eux](#h2-2)
- [Le bureau sait. Le chantier ne sait pas](#h2-3)
- [Donne à tes plans leur propre chronologie](#h2-4)
- [Les seules personnes qui n'en ont pas besoin : les ouvriers qui posent à partir des feuilles imprimées](#h2-5)

---

## « C'est bien la révision de jeudi dernier ? » {#h2-1}

C'est la question que le PM revient poser quand quelque chose semble louche. L'équipe la pose aussi. Ils n'y mettent rien de méchant — ils veulent juste confirmer. Le problème, c'est que la moitié du temps tu ne peux pas répondre tout de suite non plus.

Tu ouvres ton portable. Le dossier projet contient `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. Il y a aussi `A-05_drain_0420_avoidutility.dwg` que quelqu'un a balancé dans le groupe WhatsApp. Et celui de début mars, `A-05_drain_0315.dwg`, que tu n'as jamais supprimé parce que l'architecte revient parfois sur une disposition antérieure quand un changement ne tient pas la route.

Cinq noms de fichiers. Tu sais qu'un seul est ce sur quoi l'équipe construit réellement. Mais tu ne te souviens pas duquel.

Ce n'est pas de la paresse, ni de ta part ni de celle de Mike. C'est que l'écart entre « un nouveau plan arrive au bureau » et « le chantier est au courant » n'a personne à qui il est attribué. Tu se trouves être la personne debout des deux côtés de cet écart.

---

## Avant le « bon-pour-construction », il y a beaucoup de drafts. Puis l'architecte revient sur l'un d'eux {#h2-2}

Tu pourrais te dire : « OK, je vérifierai à chaque fois que je passe au bureau. » En théorie, oui. En pratique ça s'écroule parce que **les drafts continuent à s'empiler avant que quoi que ce soit soit officiellement émis**.

Un seul détail, du premier schéma au bon-pour-construction, passe par beaucoup de versions. Le maître d'ouvrage ajoute un commentaire — révision. Une visite de chantier révèle un conflit avec un réseau — révision. L'ingénieur structure relit — révision. **Puis l'architecte arrive à la rev 5 et le maître d'ouvrage dit « en fait le détail de bordure de la rev 2 était plus propre », alors on revient en arrière**. Tu ouvres le dossier et tu vois six fichiers, dont deux quasi identiques — mais tu ne sais pas dire lequel est celui qui compte en ce moment.

Si tu attendais que l'architecte « finalise » totalement avant de laisser l'équipe démarrer, le planning t'écraserait. Trois corps de métier sont empilés derrière cette section. Chaque jour où tu retiens, tu brûles de la main-d'œuvre, du matériel et du marge. Alors le GC prend le risque calculé — **on avance sur la dernière version vue**, en pariant que la prochaine révision ne sera pas radicale.

La plupart du temps le pari paie. Parfois non. C'est le cas cette semaine.

---

## Le bureau sait. Le chantier ne sait pas {#h2-3}

Le vrai point de rupture est là : **un nouveau plan arrive au bureau, le chantier ne l'apprend pas, et personne ne porte le message à travers l'écart**.

Côté bureau, la personne qui reçoit l'email peut être un assistant PM, un admin, ou un autre conducteur de travaux. Son réflexe quand un fichier atterrit, c'est « le classer correctement » — dossier, nommage, archive. Elle ne sait pas toujours exactement ce que le chantier fabrique cette semaine, et elle ne peut pas toujours dire d'un coup d'œil si cette révision est du genre à signaler immédiatement. Pour elle, classé = fait.

Côté chantier, tu es dehors tous les jours. Même si tu passes au bureau chaque vendredi pour te synchroniser, entre ton dernier passage et le suivant, l'architecte peut avoir émis deux révisions et être revenu sur l'une. Tu peux le trouver si tu vas chercher — mais **seulement si tu es assez discipliné pour activement repasser vérifier**. Pas tous les conducteurs de travaux le font, à chaque fois.

Côté équipe, ils construisent à partir de ce que tu leur as remis en dernier. Ils ne savent pas s'il y a un fichier plus récent au bureau. Et ils ne devraient pas avoir à le savoir — leur boulot est d'installer selon le plan, pas de suivre les versions.

De ces trois fils, **celui entre bureau et chantier est le plus facile à laisser tomber**. Pas parce que quelqu'un se relâche. Parce qu'aucun process ne force cette ligne à rester ouverte. Un message « nouvelle version uploadée » dans un fil de groupe qu'on a manqué est manqué pour de bon.

---

## Donne à tes plans leur propre chronologie {#h2-4}

Il n'y a pas grand-chose à faire. Quatre étapes.

**1. À l'instant où un nouveau fichier atterrit au bureau, ping le chantier — et attends un « bien reçu ».** Pas « classé et fait ». **La passation n'est complète que quand la personne du chantier confirme explicitement**. Ça peut être WhatsApp, Slack, ou un appel. La règle est : le chantier doit confirmer par écrit. Sans confirmation, la passation n'est pas terminée.

**2. Avant qu'une nouvelle révision n'écrase la précédente, garde la précédente séparément.** Nomme-la `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. Ça sert **pour le moment où l'architecte revient en arrière** — tu peux toujours rouvrir exactement ce à quoi ressemblait la rev 3.

**3. Laisse l'outil enregistrer chaque révision automatiquement, et rends-la visible à tout le monde.** C'est là que les outils prennent le relais sur ce que la discipline ne tient pas. [Keeply](https://keeply.work) est conçu exactement pour ça. Chaque sauvegarde enregistre automatiquement une version. Les fichiers restent où ils sont — dans ton dossier projet, là où ton équipe regarde déjà. **Tant que tout le monde ouvre le même coffre partagé (typiquement le NAS de l'entreprise), tout le monde voit la même chronologie** — à l'instant où le bureau dépose un nouveau fichier, le conducteur de travaux ouvre son Keeply sur chantier et la chronologie affiche « 15h30 aujourd'hui, l'architecte a encore révisé ». Note honnête : si tu as besoin de comparer deux plans `.dwg` ligne par ligne, il faudra toujours ouvrir AutoCAD et le faire toi-même — Keeply ne fait pas le diff de plans CAO. Mais « une nouvelle version est tombée, qui l'a envoyée, quand, et l'as-tu ouverte ? » — ça, tu arrêtes de le manquer. Le PM demande « Tu as vu la rev de jeudi dernier ? » et la chronologie répond pour toi.

Voilà à peu près ce à quoi ça ressemble à l'écran :

```text
A-05_drain.dwg
Coffre : Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Description de la version              Tag         Quand
─────────────────────────────────────────────
 ●  Spec du cadre révisée                          Aujourd'hui
 ●  Recalibré pour éviter le réseau               20/04
 ●  Émis après revue maître d'ouvrage   ⭐Émis    18/04
 ●  Profil ajusté                                 15/04

─────────────────────────────────────────────
 Membres du coffre (NAS partagé)
   Mike (bureau) · Toi (chantier) · Chen (chef d'équipe)

   Tout le monde ouvre le même dossier, tout le
   monde voit la même chronologie. À l'instant où
   une nouvelle version atterrit, elle apparaît
   pour tout le monde.
   Survole une ligne → restaurer en un clic.
```

**4. Au moins une copie qui n'est pas sur cette machine et pas sur le NAS de chantier.** Disque externe, cloud, slot de sauvegarde — peu importe. Le point clé est **au moins une copie hors site**. Les disques NAS de bureau lâchent, sont effacés, sont réaffectés au projet suivant. La sauvegarde hors site est l'assurance la moins chère que tu t'achèteras jamais.

Les étapes 1 et 2 peuvent tourner sur la seule discipline, mais honnêtement — trois mois plus tard tu en oublieras la moitié. L'étape 3 est la façon dont l'outil rattrape l'autre moitié.

---

## Les seules personnes qui n'en ont pas besoin : les ouvriers qui posent à partir des feuilles imprimées {#h2-5}

Soyons honnêtes — ce n'est pas pour tout le monde dans le bâtiment. Mais la liste des exclus est plus courte que tu ne le penses.

**Les seules personnes qui n'en ont absolument pas besoin sont les ouvriers qui installent à partir du plan posé devant eux.** Leur boulot est de construire selon la feuille qu'on leur a remise, pas de courir après les versions. Courir après les versions, c'est ton boulot.

**Les marchés publics en ont en fait plus besoin, pas moins.** Tu pourrais supposer que les grands chantiers publics ou gouvernementaux sont couverts parce qu'ils ont déjà une plateforme de collaboration BIM. C'est l'inverse. Les marchés publics génèrent largement plus de paperasse que les chantiers privés, les ordres de service traînent sur des mois, le turnover de management est plus élevé, la pile documentaire grossit plus vite, et la mémoire institutionnelle se casse plus facilement. Les plateformes BIM résolvent le livrable final. Elles ne résolvent pas les documents de planification, les fichiers partagés, et les notes de révision que les plans accumulent en cours de route — et ce sont ces choses qui grossissent vraiment, jour après jour.

**Les indépendants en ont besoin aussi.** Tu pourrais te dire : « Je suis seul sur ce projet du début à la fin, ai-je vraiment besoin de gestion des versions ? » Oui. Parce que dans trois mois, en regardant le même fichier, **tu auras oublié pourquoi le toi-passé a fait le changement**. Une chronologie stocke plus que le fichier lui-même — elle stocke la raison à l'instant. Le toi-futur remerciera le toi-présent d'avoir laissé la trace.

Tous les autres — résidentiel petit-à-moyen, commerce, aménagement intérieur, drainage, paysage, voirie, campus, marchés publics, projets BIM, designers solo, agences de design — **si ton travail implique qu'un fichier soit modifié et rouvert plus tard par quelqu'un d'autre ou par le toi-futur, tu as besoin d'une chronologie.** À chaque fois que cette ligne se casse, du temps et de l'argent sortent de ta poche.

---

Un `.dwg` n'est pas qu'un plan. C'est un instantané de ce sur quoi le design, le bureau et le chantier se sont mis d'accord à un moment précis. Ce moment ne cesse de changer, ne cesse d'être passé de main en main, ne cesse d'être construit à partir de la mauvaise version.

Ça vaut le coup de donner à chacun de tes projets sa propre chronologie ?

---

Tu te souviens de ce moment à 9h40 — le PM qui ouvre la révision de jeudi, et ce coup au creux de la poitrine ? Tu n'as plus à être le gestionnaire de versions. **Keeply : la mémoire gardienne de tes fichiers.** Il se souvient de chaque sauvegarde, de chaque version émise, de chaque instantané avant que l'ancien soit écrasé. Il vit dans ton dossier projet existant — pas de nouvel outil, pas de nouvelle habitude pour l'équipe. La construction lui va particulièrement bien, parce que la ligne entre bureau et chantier se casse sur chaque chantier.

[Découvre Keeply →](https://keeply.work)
