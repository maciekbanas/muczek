# Muczek i Przyjaciele

Statyczna strona bez instalacji zależności i bez budowania.
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
do `https://muczek.pl/#id`. Wyświetlanie komiksów wymaga JavaScriptu.
