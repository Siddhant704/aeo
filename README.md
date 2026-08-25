# Thali

**Every wellness app, one plate.**

A concept build for a unified wellness app: AI meal tracking, an AI coach, class
booking, a dietitian marketplace and a vitals dashboard — five things people
normally split across five apps, served on one plate.

The interface is built around a thali: a plate divided into five wedges, tilted
into perspective so it reads as an object on a table rather than a pie chart.
Each wedge is one module, and hovering lifts it like picking up a katori.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build
```

## What's here

| Module | What it does |
|---|---|
| **Home** | Calorie ring, water and sleep logging, today's meals, quick links |
| **Snap** | Upload a meal photo; AI identifies the food and estimates calories and macros |
| **Coach** | "Sage" — a conversational nutrition and fitness coach that keeps its history |
| **Move** | Browse and book live classes, filtered by format |
| **Consult** | Book 1:1 sessions with dietitians and trainers |
| **Vitals** | Weight and sleep trends, with a rolling 7-day weight log |

## How it's put together

- **React 18 + Vite + Tailwind CSS 3.**
- **Persistence** goes through `window.storage`, a key-value API provided by the
  host the app was designed for. Outside that host, [src/main.jsx](src/main.jsx)
  shims it with `localStorage`, so meals, bookings and vitals survive a refresh.
  Each domain has its own key: `profile`, `meals`, `coach_messages`, `bookings`,
  `consultations`, `daily_stats`, `weight_log`.
- **Motion** lives in [src/motion.jsx](src/motion.jsx). One physical rule runs
  through the whole product: objects rest on a table under a warm light from the
  top-left, and depth means elevation off that table. Every shadow agrees about
  where the light is.
- **Reduced motion** is honored throughout — `useCalm()` gates every animation,
  and the thali falls back to a still, flat plate carrying the same information.

Charts deliberately get a reveal rather than a 3D tilt: skewing a trend line in
perspective would misrepresent the data.

## Known limitation

**Snap** and **Coach** call `https://api.anthropic.com/v1/messages` directly from
the browser with no API key. That works only inside the host environment the app
was written for, which intercepts the request. Running locally, both features
fail their fetch and fall into their error states ("Couldn't analyze that photo",
"Something went wrong reaching the coach"). Everything else works offline.

Making them work locally needs a small dev proxy that attaches an API key
server-side — a browser must never hold one.

## Not affiliated

A concept build. Not affiliated with HealthifyMe, Fittr, cult.fit or Fitelo;
feature credits in the app name the products that inspired each module.
