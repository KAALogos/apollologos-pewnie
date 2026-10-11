# APOLLOLOGOS / PEWNIE

Interaktywne wydanie wiersza **PEWNIE**. To **aplikacja TypeScript + React + Vite**, a nie strona Google Sites ani generator pojedynczego HTML-a.

## Uruchomienie

Wymagane: Node.js 22.12+ i npm (z dostępem do rejestru pakietów).

```bash
npm install
npm run dev
```

Kontrola i przygotowanie do publikacji:

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

## Zasady edytorskie

- Kanoniczny tekst w `src/data/pewnie.json` — pole `poem`; kontrolna, identyczna kopia w `docs/poem.canonical.txt`.
- **Nie zmieniaj** ortografii, interpunkcji, wielkich liter, niedzielących spacji ani oryginalnych podziałów wersowych.
- Glosy mają stałe ID `1–36`, status i ręcznie zatwierdzone połączenia `related`. Teksty glos nie są przepisane w komponentach.
- `src/data/annotations.ts` przechowuje wyłącznie klikalne zakresy wersów (oddzielone od tekstu). Dzięki temu aktywowanie glos nie wpływa na długość wersów ani ich optyczną geometrię.
- Po pierwszym otwarciu **widać tylko wiersz**. Glosy uruchamia wyłącznie przycisk **pod wierszem**.
- Panel: glosa, przeszukiwalny indeks, relacje i przejścia między glosami. Telefon: dolny panel. Klawisze: `Esc` zamyka panel, strzałki przełączają glosy po wybraniu glosy.
- `npm test` bez zewnętrznych pakietów sprawdza nienaruszalność treści, strukturę kotwic i graf powiązań.

## GitHub Pages

1. Utwórz repozytorium (publiczne, jeżeli strona ma być ogólnodostępna w bezpłatnym GitHub Pages).
2. `package-lock.json` jest w repozytorium; workflow używa `npm ci`.
3. Ustaw `Settings → Pages → Build and deployment → Source: GitHub Actions`.
4. Wypchnij projekt na gałąź `main`. Plik `.github/workflows/deploy.yml` przetestuje dane, zbuduje stronę i opublikuje zawartość `dist/`.
5. Adres domyślny: `https://NAZWA_UŻYTKOWNIKA.github.io/NAZWA_REPO/`.

Konfiguracja `base: './'` pozwala hostować projekt pod ścieżką repozytorium, bez ręcznego wpisywania nazwy użytkownika lub repo. Brak backendu, kluczy API i konieczności korzystania z Google Sites.

## Struktura

```text
src/
  App.tsx                  stan interakcji
  data/pewnie.json         pełna redakcja i 36 glos
  data/annotations.ts      precyzyjne kotwice fraz
  lib/model.ts             typy i walidacja
  components/Poem.tsx     wierne wyświetlenie tekstu
  components/GlossPanel.tsx / GlossBody.tsx
  styles.css               estetyka ApolloLogos, desktop/mobile/druk
.github/workflows/deploy.yml
tests/*.test.mjs
```

## Stan sprawdzenia

Zależności instalują się bez błędów, `npm test` (4 testy), `npm run typecheck` i `npm run build` przechodzą (Node 22).

## Licencja

Kod: MIT (`LICENSE`). Tekst wiersza i glosy: wszelkie prawa zastrzeżone (`NOTICE.md`).
