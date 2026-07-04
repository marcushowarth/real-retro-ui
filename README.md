# real-retro-ui

The front end for **REAL RETRO** — a real-terms retrospective visualiser.
Compare any historical price or value series (income, car prices, the cost
of a Mars bar — whatever you enter) at an equivalent point of purchasing
power, anywhere from 1987 to today.

Built on the [`real-retro-api`](https://github.com/marcushowarth/real-retro-api)
service, which wraps the [`fin-model`](https://github.com/marcushowarth/fin-model)
`rpi` module.

## Features

- **Multiple datasets** — create/select/delete named datasets, each holding
  one or more labelled series
- **CSV import/export** — bulk load a whole dataset from a wide-format CSV
  (`date,SeriesA,SeriesB,...`) or export the current one back out
- **Manual data entry** — a per-label dialog: pick or create a label, edit
  its `(date, amount)` rows in a table, save or delete the whole label
  without touching any other label's data
- **Reference-year slider** — drag to rebase every series onto the
  purchasing power of any year from 1987 to the latest available RPI year
- **Inflation chart** — a multi-series line chart (Recharts) showing all
  labels in a dataset, adjusted to the chosen reference year
- **Client-side only persistence** — datasets and points live entirely in
  `localStorage`; the API is stateless and has no database

## Stack

React 18 · TypeScript · Vite · Recharts · uuid.

## Develop

Requires Node 22+.

```bash
npm install
npm run dev        # http://localhost:5173
```

The dev server proxies `/api` to the back end on `http://localhost:8090`, so
**[`real-retro-api`](https://github.com/marcushowarth/real-retro-api) needs
to be running** for the RPI series and version info to load.

```bash
npm run build      # type-check (tsc) + production build
npm run preview    # serve the production build
```

## How it fits together

```
real-retro-ui  ──HTTP──▶  real-retro-api  ──depends on──▶  fin-model (rpi)
  (this repo)              (Quarkus-native)                 (Java engine)
```

The API only serves the RPI index series (`/api/rpi`) and build info
(`/api/version`) — it holds no user data. All dataset/point storage and the
inflation adjustment math (`src/utils/inflation.ts`) live in this repo.

## Privacy

Nothing you enter is stored on the server — `real-retro-api` has no
database and no session; it only serves the public ONS RPI series. Datasets
and data points you create persist client-side only (`localStorage`), never
sent anywhere.

This tool is illustrative only, not financial advice.

## License

[MIT](LICENSE)
