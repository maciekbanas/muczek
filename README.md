# Muczek i Przyjaciele

Statyczna strona, bez instalacji zależności. Lokalnie: `python3 -m http.server 8000`.

## Podstrony komiksów

Każdy pasek ma adres `/komiksy/<id>/`, własny tytuł, opis, canonical oraz
metadane Open Graph i Twitter z obrazkiem. Pliki HTML są zapisane w repozytorium,
więc GitHub Pages nie wymaga dodatkowego procesu budowania.

Po dodaniu lub zmianie komiksu w `index.html` uruchom:

```sh
python3 tools/generate_comic_pages.py
python3 -m unittest discover -s tests
```

Artykuł powinien mieć unikalne, stałe `id`, tytuł `h3` z linkiem
`/komiksy/<id>/`, datę oraz obrazek z opisem `alt`. Kolejność na stronie głównej
wyznacza nawigację między paskami. Zacommituj także wygenerowane podstrony.
Przy zmianie szablonu strony głównej ponownie wygeneruj podstrony.
Stare adresy z kotwicami pozostają działające.
