# AGENTS.md

## Project

Front-end demo of a 爱达航 (DATALEX) style flight search & results page.
Vue 3 + Vite + Element Plus + TailwindCSS. Flight and fare data come from a
local REST service (`/tdprest-2/api/air/search` and `/price`) proxied by Vite;
there is no auth and no other backend. Request/response samples live in
`interface/` (`RQ` = request, `RS` = response, `OW` = one-way, `HRT` = half
round trip).

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
- `src/views/` — route-level pages. `FlightSearch` switches between the search
  view (`FlightSearchForm` + `PriceCalendar`) and the results view (progress
  steps, route summary, notices, date strip, fare table) based on whether a
  search query is set. `BookingInfo` renders the verified booking draft and
  redirects back to `/flight-search` when the draft is missing.
- `src/utils/date.js` — date parsing/formatting helpers shared by the results
  date strip and route summary.
- `src/api/client.js` — axios instance (`baseURL` defaults to
  `/tdprest-2/api/air`, override with `VITE_API_BASE_URL`); forces
  `Accept: application/json` because the service otherwise returns XML; wraps
  failures in `ApiError`.
- `src/api/flight.js` — `searchAir` / `priceAir`. Search 404
  `NO_FLIGHTS_FOUND` is treated as an empty result.
- `src/api/mappers.js` — builds search (`ONE_WAY` / `HALF_ROUND_TRIP`) and price
  requests (`VERIFY` one-way, `VALIDATE` round trip) and maps responses into the
  UI model (legs, segments, cabins, fares, baggage, refund rules, price
  breakdown).
- `src/composables/useFlightStore.js` — global search state (`runSearch`), fare
  verification (`verifyFare`), and the `sessionStorage` booking draft consumed by
  `BookingInfo`.
- `src/composables/useLowestPrices.js` — per-date lowest fare lookups for the
  price calendar / results date strip (cache, serial fetch, paused during a
  primary search so the local service is not overloaded).
- `src/constants/airportData.js` — 289 个 IATA 机场三字码（国内 133 / 国际及港澳台 156）。
- `src/constants/airports.js` — 机场静态字典与辅助函数（中文名、城市、热门标记、
  分组、三字码/中文/拼音搜索）。
- `src/constants/fare.js` — cabin order, cabin-class mapping, static baggage /
  mileage service standards.
- `src/constants/notices.js` — static booking notice copy.
- `vite.config.js` — proxies `/tdprest-2` to `http://127.0.0.1:9090` for both
  `server` and `preview`.
- `src/composables/useSearchQuery.js` — shared reactive search state used by both
  `FlightSearchForm.vue` and `PriceCalendar.vue`.
- `src/components/` — `Header.vue` (global nav), `Footer.vue` (global footer),
  `FlightSearchForm.vue` (emits `search` with trip/date/passenger/cabin params),
  `AirportPicker.vue` (domestic/international tabs, pinyin alphabet groups,
  search by Chinese name / pinyin / IATA code),
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
- **The query service must be running** at `http://127.0.0.1:9090` for search,
  price verification, calendar, and date-strip fares. There is no mock fallback.
  If it is down, pages show the request error and an empty result.
- Requests must send `Accept: application/json` (already set in
  `src/api/client.js`); without it the service responds with XML.
- Round trips use one search request with two `originDestination` legs
  (`HALF_ROUND_TRIP`); each result row is a combined itinerary and its fares are
  combined 往返 totals. Do not reintroduce separate outbound/return steps.
- Leftover unused mock modules must not be imported; all flight data now comes
  from `src/api/`.
