# Licznik odwiedzin

Skrypt `https://gc.zgo.at/count.js` zbiera statystyki dla `muczek.goatcounter.com`.
Licznik w stopce pobiera publiczną sumę odwiedzin z `/counter/TOTAL.json`.
Nie wymaga klucza API ani udostępniania całego panelu statystyk.

W panelu GoatCounter, w ustawieniach strony, włącz opcję
**Allow adding visitor counts on your website**. Bez niej publiczny odczyt jest
niedostępny i stopka pokazuje „Niedostępne”. Ten sam komunikat pojawi się przy
blokadzie sieci lub błędzie usługi. Odczyt kończy się po maksymalnie 5 sekundach.

GoatCounter buforuje liczbę przez maksymalnie cztery godziny, więc nowa wizyta
nie musi natychmiast zmienić widocznej wartości. Licznik pokazuje sumę dla strony
(`TOTAL`), a nie liczbę osób aktualnie online. Nie dolicza wizyt sprzed wdrożenia
GoatCounter.
