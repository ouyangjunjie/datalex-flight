# AGENTS.md

## Project

Static front-end demo of a 爱达航 (DATALEX) style flight search & results page.
Vue 3 + Vite + Element Plus + TailwindCSS. All data is mocked in-repo; there is
**no backend, API client, env file, or auth** — do not add network calls.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # production build — use this to verify changes
npm run preview  # serve dist/
```

There is no lint, formatter, typecheck, or test script configured. Do not claim
they pass; verify with `npm run build`.

## Structure

- `src/router/index.js` — HTML5 history; `/` and unknown paths redirect to
  `/flight-search`; views are lazy-loaded.
- `src/views/` — route-level pages (`FlightSearch`). It switches between the
  search view (`FlightSearchForm` + `PriceCalendar`) and the results view
  (progress steps, route summary, notices, date strip, fare table) based on
  whether a search query is set.
- `src/utils/date.js` — date parsing/formatting helpers shared by the results
  date strip and route summary.
- `src/mock/flight.js` — 10 CA flights; fields are `flightNo`, `aircraft`,
  `depAirport`, `arrAirport`, `depTime`, `arrTime`, `duration`, `priceList`,
  `isDirect`.
- `src/mock/city.js` — domestic city/airport options (`code`, `name`, `airport`).
- `src/mock/policy.js` — per-cabin baggage + refund/change policy used by the
  detail dialog.
- `src/mock/price.js` — `getLowestPrice(depCity, arrCity, date)`; deterministic
  per-route/per-date economy fare for the price calendar and results date strip.
- `src/composables/useSearchQuery.js` — shared reactive search state used by both
  `FlightSearchForm.vue` and `PriceCalendar.vue`.
- `src/components/` — `Header.vue` (global nav), `Footer.vue` (global footer),
  `FlightSearchForm.vue` (emits `search` with trip/date/passenger/cabin params),
  `PriceCalendar.vue` (two-week lowest-fare grid, emits `select`),
  `BookingSteps.vue` (static purchase progress), `NoticeBar.vue` (expandable
  notice), `ResultsDateStrip.vue` (7-day fare strip, emits `select`),
  `FlightFareTable.vue` (filters + cabin-column sorting),
  `FlightItem.vue` (fare-table row, cabin prices + detail dialog),
  `FlightDetailDialog.vue` (aircraft, baggage, refund terms).
  `App.vue` composes Header + RouterView + Footer.
- `src/assets/`, `public/` — static assets.
- Alias `@` → `src` is configured in `vite.config.js`.

## Gotchas

- **Element Plus is registered globally** with Chinese locale (`zhCn` from
  `element-plus/es/locale/lang/zh-cn`) and full CSS in `src/main.js`. Use
  `<el-button>` etc. directly; do not add per-component imports.
- Icons come from `@element-plus/icons-vue` but are **not** globally registered —
  import each icon explicitly where used.
- Tailwind removes Element Plus styling if Preflight is enabled. `preflight: false`
  is set in `tailwind.config.js`; leave it off unless you re-test all `el-*` components.
- Because Preflight is off, raw `<button>`/`<a>` keep browser defaults. Use the
  `.plain-button` class (defined in `src/style.css`) on custom buttons and
  `no-underline` + explicit text color on links. Do not add a global `button`
  reset — it breaks `el-button` and `el-input-number` controls.
- Import order in `main.js` matters: `element-plus/dist/index.css` **before**
  `src/style.css`, so Tailwind utilities can override Element Plus.
- Tailwind content globs cover `index.html` and `src/**/*.{vue,js,ts,jsx,tsx}`.
  New file extensions under `src/` must be added to those globs.
- Air China theme colors live under the `ca` key in `tailwind.config.js`
  (`ca-red`, `ca-navy`, `ca-gold`, `ca-blue`, `ca-blue-light`, `ca-bg`).
  Element Plus primary is overridden to `#C7000B` in `src/style.css`.
- Full Element Plus import makes the main bundle >500 kB; the build chunk-size
  warning is expected — do not chase it.
- UI copy is Chinese; keep new user-facing text in Chinese for consistency.
- Tailwind v3 is installed intentionally (config-based, `tailwind.config.js`).
  Do not upgrade to v4 without migrating the PostCSS/config setup.
