## Dodatkowe (szczegółowe) dane do artykułu  
###  Zbigniew Koza (UWr), Robert Lew (UAM), Emanuel Kulczycki (UAM), Piotr Stec (UO) 
##  "How the national academic promotion system is controlled by old boys: An analysis of power distribution in Poland" 
####  Wrocław-Poznań-Opole, luty 2021. 

# Zawartość
Repozytorium składa się z nastepujących katalogów:
- `ck-dane-historyczne`
  - `skład`: skład CK od 2011 do 2020 (trzy kolejne kadencje)
  - `sprawozdania`: oryginalne sprawozdania CK za lata 2008 i 2011-2019 
- `gender`: dane dotyczące płci uczestników postępowań awansowych, osobno dla postepowań habilitacyjnych i profesorskich 
- `highly-cited`: dane dotyczące udziału najczęściej cytowanych polskich naukowców w postępowaniach awansowych (por.: Ioannidis i in., PLOS Biology, 17(8), 1–6, 2019)
- `uczestnictwa`: tabele imienne uczestnictw w postępowaniach awansowych, w rozbiciu na funkcje (przewodniczący, sekretarz, recenzent, członek KH; recenzent w postepowaniu profesorskim). 
- `dane_ogólne`: pozostałe dane
  -  `kto_w_jakich_dyscyplinach_KH.csv`: przypisanie każdej parze (`imię`, `nazwisko`)  dyscyplin, w ramach których pojawia się ona na decyzjach o powołaniu komisji habilitacyjnych, wraz z liczbą takich powołań. Przypisanie jednej "parze" wielu bardzo odległych od siebie dyscyplin sugeruje, że para ta może odpowadać kilku osobom.  
  -  `postępowania_z_przewagą_CK.csv` - wykaz postepowań, w których w decyzjach CK o powołaniu komisji habiliacyjnych zidentyfikowano przypadki co najmniej 4 par (`imię`, `nazwisko`) zgodnych z imionami i nazwiskami członków CK w kadencji, w której wydano decyzję. 

# Format danych
## Pliki CSV
Tabele zapisano w formacie CSV, czyli w plikach, które można odczytywać zarówno jako zwykły tekst, jak i jako arkusze kalkulacyjne w programach typu LibreOffice czy Excel. 

-  Kodowanie znaków: UTF-8
-  Sparator części ułamkowej: kropka
-  Separator kolumn: tabulator

## Pozostałe pliki 
Pozostałe pliki to pliki tekstowe lub pobrane z Internetu pliki typu PDF lub HTML  


# Uwagi
Tabele zawierają dane zgodne z publicznie dostępnymi dokumentami Centralnej Komisji ds Stopni i Tytułów zgromadzonymi na stronie https://www.ck.gov.pl/. Dane zostały uzyskane poprzez automatyczną konwersję skanów decyzji CK z plików w formacie PDF (rastrowym) na pliki tekstowe. Oznacza to, że mogą zawierać błędy w pisowni nazwisk, w przypisaniu do dyscyplin itp. Ponadto tam, gdzie wystepują imiona i nazwiska, nie istnieje powiązanie tych danych z konkretnymi osobami: w danych nie odróżnia się różnych osób mających te same nazwiska, nie ma w nich też informacji o ewentualnych zmianach nazwisk, a zarówno imiona, jak i nazwiska mogły zostac zniekształcone zarówno przez obsługę CK, jak nasze oprogramowanie. W tym sensie udostępniane tu dane dotyczą ciągów liter (napisów) a nie konkretnych osób. Jakakolwiek próba kojarzenia ich z konkretnymi osobami wymaga weryfikacji w materiałach źródłowych. 

Autorzy dołożyli wszelkich starań, by dane, a zwłaszcza te choćby pośrednio związane z danymi osobowymi, były jak nabliższe stanowi faktycznemu, jednak ze względu na sposób ich pozyskania, nie dają gwarancji ich stuprocentowej dokładności. Wszelkie odstępstwa od stanu faktycznego są niezamierzone.

Oznaczenia niektórych kolumn, np. "K50", objaśnione są w oryginalnym artylule. 

W części kolumn wystepują wyłącznie liczby 0 lub 1. W tych przypadkach 0 oznacza "nie", 1 - "tak".

Liczba 0 w kolumnie zawierającej numer sekcji CK oznacza, że dana osoba nie była członkiem CK w analizowanym tu okresie. 

Dane dotyczące składu CK trzech kolejnych kadencji są niepełne w tym sensie, że składy te ewoluowały w czasie (np. wskutek śmierci członików). Tabela zawiera "migawki" tych składów w wybranych chwilach czasu (dla których znaleźliśmy wiarygodne dane).  

Podczas przetwarzania dokumentów uwzględniono wyłącznie pierwotne decyzje o składach komisji habilitacyjnych i zeposłów recenzentów postępowań profesorskich. Nie uwzględniono ewentualnych późniejszych zmian w tych składach. 

Sprawozdania CK zostały pobrane ze stron tej nieistniejącej już instytucji. CK przez dziesięciolecia stanowiła fundament systemu awansów akademickich w Polsce, niech chociaż tyle z niej zostanie na nieco dłużej w naszej pamięci. 

Każdej parze (`imię`, `nazwisko`) przypisano płeć na podstawie wartości pola `imię`. W bardzo nielicznych przypadkach metoda ta zawodzi i wówczas płeć ma przypisaną wartość `nieznana`. 





