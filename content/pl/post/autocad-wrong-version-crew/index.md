---
title: "Dlaczego twoja ekipa wciąż otwiera rysunek AutoCAD z zeszłego tygodnia"
description: "9:40, wpadasz do biura, a kierownik projektu otwiera rewizję z zeszłego czwartku — zmieniła się specyfikacja ramy. Codziennie byłeś na budowie, nikt ci nie powiedział. Beton już wylany. Praktyczny przewodnik kierownika robót po kontroli wersji rysunków: bez nowych narzędzi dla ekipy, bez przebudowy procesu, tylko sposób, by każda rewizja zostawiała własny ślad."
slug: "autocad-wrong-version-crew"
date: 2026-04-24
image: cover.svg
og_image: cover.png
categories:
  - Zarządzanie plikami
tags:
  - AutoCAD
  - Budownictwo
  - Kontrola wersji
  - Zarządzanie budową
cta_topic: versioning
---

9:40 rano. W końcu wpadasz do biura i swobodnie przewijasz wczorajsze zdjęcia z budowy dla kierownika projektu — odcinek odpływu burzowego, gdzie wylano beton, wszystkie ramy zalewane na miejscu osadzone w płycie, gotowe pod kraty.

Kierownik projektu nic nie mówi. Otwiera plik na biurku: `A-05_drain_0422_issued.dwg`.

„Rama jest zła. Architekt zrobił rewizję jeszcze raz w zeszły czwartek."

Czujesz to opadnięcie w klatce piersiowej. Rewizja z zeszłego czwartku przyszła do biura — Mike ją odebrał, zapisał na serwerze, nikomu nie zapingował. Codziennie byłeś na budowie. Nikt nie wspomniał o tym na poniedziałkowej odprawie. Nie miałeś powodu wiedzieć.

Ten odcinek jest już wylany. Zmienia się specyfikacja ramy — to znaczy skuwanie stwardniałego betonu, żeby wyciągnąć stare ramy, osadzenie nowych ram o właściwym wymiarze, ponowne wylanie krawędzi, czas na wiązanie. Kolejne dwa dni w harmonogramie. Inne branże ustawione za tobą, wszystkie czekają.

Nie wysłałeś ekipie złego pliku. Po prostu nie wiedziałeś, że plik się zmienił.

## Spis treści

- [„Czy to rewizja z zeszłego czwartku?"](#h2-1)
- [Przed „issued-for-construction" jest mnóstwo szkiców. Potem architekt cofa się do wcześniejszego](#h2-2)
- [Biuro wie. Budowa nie wie](#h2-3)
- [Daj swoim rysunkom własną oś czasu](#h2-4)
- [Jedyni, którzy tego nie potrzebują: ekipa montująca z wydrukowanych arkuszy](#h2-5)

---

## „Czy to rewizja z zeszłego czwartku?" {#h2-1}

To pytanie, do którego wraca kierownik projektu, gdy coś wygląda nie tak. Ekipa też je zadaje. Nie mają na myśli niczego złego — chcą tylko potwierdzić. Problem w tym, że w połowie przypadków ty też nie umiesz odpowiedzieć od razu.

Otwierasz laptopa. W folderze projektu są `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. Jest też `A-05_drain_0420_avoidutility.dwg`, który ktoś wrzucił na grupę WhatsApp. I ten z początku marca, `A-05_drain_0315.dwg`, którego nigdy nie skasowałeś, bo architekt czasem wraca do wcześniejszego układu, kiedy jakaś zmiana nie wypali.

Pięć nazw plików. Wiesz, że jeden z nich to ten, z którego ekipa rzeczywiście buduje. Ale nie pamiętasz który.

To nie jest lenistwo, ani twoje, ani Mike'a. To przerwa między „nowy rysunek dotarł do biura" a „budowa o tym wie", do której nikt nie jest przypisany. Tak się składa, że ty stoisz po obu stronach tej luki.

---

## Przed „issued-for-construction" jest mnóstwo szkiców. Potem architekt cofa się do wcześniejszego {#h2-2}

Możesz pomyśleć: „Dobra, po prostu sprawdzę dwa razy za każdym razem, gdy będę w biurze." W teorii — pewnie. W praktyce się sypie, bo **szkice piętrzą się, zanim cokolwiek zostanie formalnie wydane**.

Jeden detal, od pierwszego schematu do issued-for-construction, przechodzi przez mnóstwo wersji. Inwestor dodaje uwagę — rewizja. Obchód budowy ujawnia kolizję z instalacją — rewizja. Konstruktor robi przegląd — rewizja. **Potem architekt dochodzi do rev 5 i inwestor mówi „właściwie detal krawędzi z rev 2 był czystszy", więc wraca do tamtego**. Otwierasz folder i widzisz sześć plików, dwa prawie identyczne — ale nie umiesz powiedzieć, który właśnie teraz się liczy.

Gdybyś czekał, aż architekt w pełni „zafinalizuje", zanim puścisz ekipę, harmonogram by cię zmiażdżył. Trzy branże ustawione za tym odcinkiem. Każdy dzień, w którym wstrzymujesz, pali pracę, sprzęt i zapas czasu. Więc generalny wykonawca podejmuje skalkulowane ryzyko — **idzie z najnowszą widzianą wersją**, zakładając, że kolejna rewizja nie będzie drastyczna.

Najczęściej zakład się opłaca. Czasem nie. Tak jest w tym tygodniu.

---

## Biuro wie. Budowa nie wie {#h2-3}

Prawdziwy punkt pęknięcia jest tutaj: **nowy rysunek dociera do biura, budowa o tym nie słyszy i nikt nie przenosi tej wiadomości przez przerwę**.

Po stronie biura osobą odbierającą maila może być asystent kierownika projektu, biuro, inny majster. Ich instynkt, kiedy plik wpada, brzmi „zarchiwizować poprawnie" — folder, nazewnictwo, archiwum. Nie zawsze dokładnie wiedzą, co budowa robi w tym tygodniu, i nie zawsze potrafią od razu powiedzieć, czy ta rewizja jest tego rodzaju, że trzeba o niej natychmiast krzyknąć. Dla nich zarchiwizowane to gotowe.

Po stronie budowy jesteś codziennie w terenie. Nawet jeśli wpadasz w piątek do biura, żeby się zsynchronizować, między ostatnim sprawdzeniem a kolejnym architekt mógł wypuścić dwie rewizje i jedną cofnąć. Możesz to znaleźć, jeśli zaczniesz szukać — ale **tylko jeśli masz dyscyplinę, żeby aktywnie wracać i sprawdzać**. Nie każdy majster to robi, za każdym razem.

Po stronie ekipy oni budują z tego, co im ostatnio dałeś. Nie wiedzą, czy w biurze jest nowszy plik. I nie powinni musieć — ich praca to montaż według rysunku, nie śledzenie wersji.

Z tych trzech wątków **ten między biurem a budową jest najłatwiejszy do upuszczenia**. Nie dlatego, że ktoś się obija. Dlatego, że żaden proces nie wymusza, by ta linia zostawała otwarta. Wiadomość „wgrano nową wersję" w grupowym czacie, którą się przegapi, jest przegapiona na zawsze.

---

## Daj swoim rysunkom własną oś czasu {#h2-4}

Nie ma w tym wiele. Cztery kroki.

**1. W chwili, gdy nowy plik dociera do biura, zapinguj budowę — i czekaj na „mam".** Nie „zarchiwizowane i koniec". **Przekazanie kompletne dopiero, gdy osoba na budowie wyraźnie potwierdzi**. Może być WhatsApp, może być Slack, może być telefon. Zasada jest jedna: budowa musi potwierdzić na piśmie. Brak potwierdzenia, przekazanie nie jest zakończone.

**2. Zanim jakakolwiek nowa rewizja nadpisze poprzednią, zachowaj poprzednią osobno.** Nazwij ją `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. To jest **na czas, gdy architekt cofa się** — nadal możesz wyciągnąć dokładnie to, jak wyglądał rev 3.

**3. Niech narzędzie zapisuje każdą rewizję automatycznie i niech będzie widoczna dla wszystkich.** Tutaj narzędzia przejmują to, czego dyscyplina nie utrzyma. [Keeply](https://keeply.work) jest zbudowane dokładnie do tego. Każde zapisanie automatycznie odnotowuje wersję. Pliki zostają tam, gdzie są — w folderze projektu, dokładnie tam, gdzie twój zespół już patrzy. **Dopóki wszyscy otwierają ten sam wspólny vault (zwykle firmowy NAS), wszyscy widzą tę samą oś czasu** — w chwili, gdy biuro wrzuca nowy plik, majster na budowie otwiera swojego Keeply na miejscu i oś czasu pokazuje „dziś 15:30, architekt znów zrobił rewizję." Uczciwa uwaga: jeśli musisz porównać dwa rysunki `.dwg` linia po linii, nadal musisz otworzyć AutoCAD i zrobić to sam — Keeply nie robi porównań rysunków CAD. Ale „spadła nowa wersja, kto ją wysłał, kiedy i czy ją otworzyłeś?" — tego przestajesz przegapiać. Kierownik projektu pyta „Widziałeś rewizję z zeszłego czwartku?" i oś czasu mu odpowiada.

Tak to mniej więcej wygląda na ekranie:

```text
A-05_drain.dwg
Vault: Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Opis wersji                            Tag     Kiedy
─────────────────────────────────────────────
 ●  Specyfikacja ramy zmieniona               Dziś
 ●  Zmiana trasy w celu ominięcia instalacji  04/20
 ●  Wydane po przeglądzie inwestora  ⭐Wydane  04/18
 ●  Profil dostosowany                        04/15

─────────────────────────────────────────────
 Członkowie vaultu (wspólny NAS)
   Mike (biuro) · Ty (budowa) · Chen (brygadzista)

   Wszyscy otwierają ten sam folder, wszyscy widzą
   tę samą oś czasu. W chwili, gdy ląduje nowa wersja,
   pojawia się u wszystkich.
   Najedź na dowolny wiersz → przywrócenie jednym kliknięciem.
```

**4. Co najmniej jedna kopia, której nie ma na tej maszynie i nie ma na NAS-ie budowy.** Dysk zewnętrzny, chmura, slot kopii zapasowej — cokolwiek. Chodzi o **co najmniej jedną kopię poza budową**. Dyski NAS biurowe padają, są czyszczone, są wykorzystywane do następnego projektu. Kopia zapasowa poza biurem to najtańsze ubezpieczenie, jakie sobie kiedykolwiek kupisz.

Kroki 1 i 2 mogą działać na samej dyscyplinie, ale uczciwie — trzy miesiące później przegapisz połowę z nich. Krok 3 to sposób, w jaki narzędzie łapie drugą połowę.

---

## Jedyni, którzy tego nie potrzebują: ekipa montująca z wydrukowanych arkuszy {#h2-5}

Bądźmy szczerzy — to nie jest dla wszystkich w budownictwie. Ale lista wykluczonych jest krótsza, niż myślisz.

**Jedyni, którzy tego w pełni nie potrzebują, to ekipa montująca z rysunku, który mają przed sobą.** Ich praca to budowa według arkusza, który dostali, nie ściganie wersji. Ściganie wersji to twoja praca.

**Roboty publiczne właściwie potrzebują tego bardziej, nie mniej.** Możesz zakładać, że duże projekty publiczne lub rządowe są pokryte, bo już mają platformę współpracy BIM. Jest odwrotnie. Roboty publiczne mają znacznie więcej papierologii niż prywatne, wnioski o zmiany ciągną się miesiącami, rotacja kierownictwa jest wyższa, stos dokumentów rośnie szybciej, a pamięć instytucjonalna pęka łatwiej. Platformy BIM rozwiązują finalny deliverable. Nie rozwiązują dokumentów planistycznych, plików wspólnych i notatek rewizyjnych, które rysunki projektowe akumulują w trakcie — a to są właśnie te rzeczy, które rzeczywiście rosną, dzień po dniu.

**Jednoosobowe firmy też tego potrzebują.** Możesz pomyśleć: „Jestem na tym projekcie sam od początku do końca, czy naprawdę potrzebuję kontroli wersji?" Potrzebujesz. Bo trzy miesiące później, patrząc na ten sam plik, **zapomnisz, dlaczego ten-ty-z-przeszłości zrobił tę zmianę**. Oś czasu przechowuje więcej niż sam plik — przechowuje powód w tamtym momencie. Ten-ty-z-przyszłości podziękuje temu-tobie-z-teraz za zostawienie śladu.

Wszyscy inni — małe i średnie projekty mieszkaniowe, komercyjne, wykończenia wnętrz, odwodnienia, krajobraz, drogi, projekty kampusowe, roboty publiczne, projekty BIM, samodzielni projektanci, biura projektowe — **jeśli twoja praca polega na tym, że plik jest zmieniany i otwierany później przez kogoś innego lub przez ten-ty-z-przyszłości, potrzebujesz osi czasu.** Za każdym razem, gdy ta linia pęka, czas i pieniądze wychodzą ci z kieszeni.

---

`.dwg` to nie tylko rysunek. To zdjęcie tego, na co projekt, biuro i budowa się zgodzili w jednym konkretnym momencie. Ten moment ciągle się zmienia, jest ciągle przekazywany dalej, ciągle budowany ze złej wersji.

Warto dać każdemu z twoich projektów jego własną oś czasu?

---

Pamiętasz tę chwilę o 9:40 — kierownik projektu otwiera rewizję z czwartku, a ty czujesz to opadnięcie w klatce piersiowej? Nie musisz już być menedżerem wersji. **Keeply: pamięć-strażnik twoich plików.** Pamięta każde zapisanie, każdą wydaną wersję, każdą migawkę zanim stara zostanie nadpisana. Żyje w twoim istniejącym folderze projektu — bez nowych narzędzi, bez nowych nawyków dla ekipy. Budownictwo pasuje szczególnie dobrze, bo linia między biurem a budową pęka na każdym pojedynczym projekcie.

[Poznaj Keeply →](https://keeply.work)
