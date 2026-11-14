# Muczek i Przyjaciele

Statyczna strona bez instalacji zależności.
Lokalnie: `python3 -m http.server 8000`.

## Dodawanie komiksu

1. Dodaj obrazek do `assets/`.
2. Dopisz wpis na początku listy w `comics.js`:

```js
{
  "id": "nowy-komiks",
  "date": "2026-11-12",
  "title": "Nowy komiks",
  "image": "assets/2026_11_nowy_komiks.png",
  "alt": "Opis komiksu dla osób korzystających z czytników ekranu.",
  "compact": true
}
```

Oddziel wpisy przecinkami. Kolejność listy określa kolejność na stronie.
`id` musi być unikalne; zachowuj je po publikacji, aby stare linki działały.
Data ma format `RRRR-MM-DD`; widoczna data i etykieta powiększenia powstają
automatycznie. Opcjonalne `compact` zachowuje klasę stosowaną przez istniejące paski.

Wspólny szablon jest w `index.html`, a renderowanie w `script.js`.
Powiększanie i udostępnianie są dodawane automatycznie. Linki nadal prowadzą
do `https://muczek.pl/share/id/`. Wyświetlanie komiksów wymaga JavaScriptu.

## Podglądy udostępnień i publikacja

`node tools/build.mjs` (Node.js 24) przygotowuje stronę w `dist/` i generuje
podglądy `/share/<id>/` z tej samej listy `comics.js`. Niczego nie generujemy
do śledzonych plików repozytorium. Dodanie paska nie wymaga dodatkowej pracy.
Testy: `node --test tools/build.test.mjs`. Lokalny podgląd wdrożenia:
`python3 -m http.server 8000 --directory dist`.

Metadane Open Graph i Twitter są zapisane w HTML i wskazują obrazek danego
paska. Przeglądarka przekierowuje czytelnika na `https://muczek.pl/#id`;
bez JavaScriptu pozostaje obrazek i link. Stare kotwice nadal działają, ale
nie zapewniają indywidualnych podglądów. Do postów używaj opcji „Kopiuj link”.

Workflow `.github/workflows/pages.yml` testuje PR i publikuje `dist/` po zmianach
na main. **Przy pierwszym wdrożeniu ustaw Settings → Pages → Source na
GitHub Actions** (zamiast Deploy from a branch). Domena `muczek.pl` pozostaje
bez zmian. Przed przełączeniem źródła poczekaj na zielony build PR; po scaleniu
sprawdź zakończenie deploy. Samo scalenie bez zmiany źródła Pages nie udostępni
wygenerowanych adresów.

Po publikacji sprawdź konkretny adres `/share/<id>/` w LinkedIn Post Inspector:
https://www.linkedin.com/post-inspector/ — odświeża też buforowane podglądy.
Ostateczne kadrowanie obrazka zależy od serwisu społecznościowego.
