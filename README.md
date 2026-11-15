# AstroHealth Tracker

**NASA Space Apps Challenge project.** A bilingual (English / Turkish) web console that combines the live position of the International Space Station, real-time space weather and NASA's Open Science Data Repository (OSDR) to estimate health risks for the ISS crew, right now and over the next few days.

> Türkçe kılavuz: **BENIOKU.md**

## Run it (2 minutes)

1. Install **Python 3.7+** from <https://www.python.org/downloads/> (on Windows, tick **"Add python.exe to PATH"**).
2. Unzip the project.
3. Windows: double-click **`baslat.bat`**. macOS / Linux: `./baslat.sh`.
   If Windows Smart App Control blocks the `.bat` file, open a terminal in the folder and run `python server\sunucu.py`.
4. Your browser opens <http://localhost:8000>. Switch the language with **TR / EN** in the top bar.

No `pip install` is needed: the server uses only Python's standard library, and Leaflet, Chart.js, the Barlow font and the world map ship in `web/vendor/`, so the console also works offline.

**Before a demo:** get a free key at <https://api.nasa.gov> and put it in `ayarlar.json` (`DEMO_KEY` allows only ~30 requests per hour). Leave the app online for a few minutes so the backup data in `data/yedek/` is refreshed. Every successful API response is saved there automatically and reused if the network drops.

## What it shows

| Page | Contents |
|---|---|
| Overview | 0–100 risk score, today's dose, share of NASA's 600 mSv career limit, Kp and proton flux, the country or ocean under the ISS, countdowns to the next SAA entry and sunrise, top actions, most affected body systems, recent events, session alert history |
| Orbit | Map with real past and future ground track (wheretheiss.at), NASA Blue Marble imagery, visibility footprint, South Atlantic Anomaly, high-latitude bands and night side; position details; radiation zones explained |
| Space weather | NOAA G / S / R scales, Kp observed and 3-day forecast, GOES proton flux, CME arrival table, NASA DONKI events |
| Crew health | Dose rate, daily and cumulative dose, DNA damage score, telomeres, bone loss, 7 organ systems with OSDR evidence, 4-day organ risk calendar, recommendations |
| Crew with medical history | Six fictional astronauts with conditions that don't ground them but can worsen with conditions (bone marrow cancer in remission, blood clots, atrial fibrillation, osteopenia, kidney stones, early cataract). Combines the last 10 days of observed space weather, today's ISS orbit and a 7-day forecast into daily personal risk, dated alerts, do/don't lists and a return-to-Earth recommendation |
| EVA planner | 12-hour radiation-risk and cognitive-performance chart, best spacewalk windows, SAA passes, eligibility rules |
| Research (OSDR) | Free-text OSDR search, 8 curated topics, study details from the OSDR Biological Data API, statistics |
| Method and sources | How it works, risk formula, every constant with its source, live data-source status, glossary, limitations |

A **"next 3 hours" orbit strip** on every page shows which radiation zones the ISS will cross and when it is in daylight. **Replay the May 2024 storm** switches space weather to the real Kp 9 superstorm from NASA DONKI records. **Download report (PDF)** prints a one-page summary: current risk and space weather, the best EVA window, each astronaut's risk, decision, suggested return date and vital signs, and the active alarms with first steps.

## Data sources

| Source | Endpoint |
|---|---|
| ISS position | `api.wheretheiss.at/v1/satellites/25544/positions` |
| NOAA SWPC Kp, 3-day forecast, GOES protons and X-rays | `services.swpc.noaa.gov` |
| NASA DONKI (FLR, CME, SEP, GST), last 10 days | `api.nasa.gov/DONKI/…` |
| GOES protons (7 days), NOAA event probabilities, NOAA 27-day outlook | `services.swpc.noaa.gov/json/goes/primary/integral-protons-7-day.json`, `/json/solar_probabilities.json`, `/text/27-day-outlook.txt` |
| NASA OSDR search | `osdr.nasa.gov/osdr/data/search` |
| NASA OSDR Biological Data API | `visualization.osdr.nasa.gov/biodata/api/v2/…` |

## Model

```
Risk = min(100, 10 × B × H × E)
B  location factor: equator 1, mid-latitude 1.4, high latitude 1.8 (×1.3 in storms), SAA 3
H  space-weather factor: the largest of the NOAA S, G and R scale factors
E  1.5 in EVA mode
```

Sourced constants: ~0.5 mSv/day typical ISS dose (STCE), 600 mSv career limit and 250 mSv per solar particle event (NASA-STD-3001), 1–1.5 % bone density loss per month (NASA), NOAA scale thresholds. Model assumptions: zone and storm factors, quality factor ~2, ~35 DNA double-strand breaks per Gy per cell, a circular orbit model anchored to the live position, and a simple circadian curve for cognitive performance.

**This is an educational model, not a medical diagnosis or a dosimeter reading.**

## Project structure

```
server/   sunucu.py (HTTP server + /api), kaynaklar.py (fetching, cache, backups),
          analiz.py (risk engine), hastalik.py (crew with medical history), yorunge.py (orbit, Sun, zones), senaryo.py (May 2024 storm)
web/      index.html, style.css, app.js, i18n.js (all EN/TR text), vendor/
data/yedek/  last good API responses (auto-updated)
```

API responses are language-neutral codes and numbers; all wording lives in `web/i18n.js`, so adding a language means adding one block there.
