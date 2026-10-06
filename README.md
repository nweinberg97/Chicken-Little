# Chicken Little

A calm, colorful companion for a baby's first foods: know what to serve, know what's been tried, feel good about what's next.

It's a static web app with no backend. Everything is saved in the browser on the device you use, and it works offline once added to your home screen.

## What it does

- **Home**: today's overview, gentle allergen nudges ("Peanut hasn't been served in 9 days"), foods tried, a daily meal idea
- **Explore**: 36 foods with how-to-serve guidance by age, safety notes, allergens, and live USDA nutrition
- **Log a food**: one tap for how baby responded (Loved, Liked, Neutral, Not today, Reaction); logging a whole meal counts as one action
- **Allergens**: Health Canada's priority allergens as cards: not yet, introducing, established, reaction noted
- **Ideas**: simple food combinations built only from each food's sourced preparation steps
- **Baby**: preferences, full history, backup download and restore
- **Feeding basics** and **Sources** pages

## Content: government sources only

Every feeding, allergen and safety statement comes from Health Canada, HealthLink BC (Government of BC), CDC, USDA, FDA or NIH and links to its source where it appears. Where Canadian and US advice differ (cow's milk timing, juice, plant drinks), both are shown. Nutrition numbers are pulled live from USDA FoodData Central. See `docs/content-sources.md`.

To change content, edit `tools/research/foods.json` and run:

```
python3 tools/build_data.py tools/research/foods.json js/data.js
```

The build script also applies the fact-check corrections and refuses any statement without a valid source.

## Run it locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Put it online (GitHub Pages, free)

1. On GitHub, open the repo's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
3. After a minute it's live at `https://nweinberg97.github.io/Chicken-Little/`. Open it on your phone and use **Add to Home Screen**.

## Nutrition data

Nutrition uses USDA's shared `DEMO_KEY`, which is rate-limited per visitor. If it says USDA is busy, get a free key at https://fdc.nal.usda.gov/api-key-signup and paste it under **Baby → Settings**.

## Files

- `index.html`, `css/`, `js/`: the app (no build step, no dependencies)
- `sw.js`, `manifest.webmanifest`, `icons/`, `favicon.ico`: offline support, favicon and home-screen icons
- `brand/`: logo and design tokens
- `design/`: design canvas source
- `docs/PRD.md`, `docs/content-sources.md`
- `tools/`: source research and the data build script

## Later: syncing between caregivers

Data lives in one browser. Adding Supabase (free tier) would bring Google/Apple sign-in and shared logs without changing the screens.
