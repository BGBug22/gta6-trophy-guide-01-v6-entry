# Neon Coastal Trophy Guide v6

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-v6-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-v6-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 official PlayStation 5 trophies** of Grand Theft Auto VI — 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 hidden — with a step-by-step route to each one, a 7-stage roadmap to the Platinum, and a spoiler shield for the hidden story trophies.

Bounty: [gta6-trophy-guide-01 on make.fun](https://make.fun/bounty/gta6-trophy-guide-01)

## What it does

- **Every trophy, exactly as PlayStation lists it** — official names, descriptions and grades, verified against Exophase and PSNProfiles on 21 November 2026.
- **122 sourced steps** — each step names its source (Exophase, PSNProfiles, PowerPyx, Push Square, Insider Gaming, Planet GTA 6, GTA BOOM, Mobalytics, GTABase). Source names only, no links.
- **Tracker** — tick trophies off (saved in localStorage), sub-progress counters for the 20 count-based trophies (+/− with mini progress bar, auto-earn at target), and My Notes per trophy. Export and import your progress as JSON.
- **Spoiler shield** — hidden trophies stay blurred until you reveal them.
- **Roadmap** — 7 stages from the first mission to the Platinum (~200 hours), including the one possibly missable trophy: Positive Mental Attitude (meditate at the Chapter 1 spot before the chapter ends).
- **Sources tab** — citation counts per source, date read, and a SOURCES DISAGREE flag (Push Square counts 5 Silver / 47 Bronze vs PowerPyx and Insider Gaming at 6 Silver / 46 Bronze; the missable question is unsettled).
- **Fully offline** — static files, no network requests, no console errors. The audit bar up top reads five metrics at a glance: Coverage (55/55), Citations (122), Tracker (20 counters), Roadmap (7 stages) and Polish (0 external requests, 0 errors).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or hand it in with `MAKEFUN_OUTPUT_DIR=out node main.ts` (dossier.json is byte-identical across runs).

## Layout

- `app/` — the guide itself (`index.html`, `style.css`, `app.js`, `data/trophies.json`)
- `screenshots/` — 4 renders of the app (the first is the cover)
- `main.ts` / `serve.ts` / `vendor/` — the kit's handoff plumbing, unchanged
- `shots.json` — what each screenshot shows
