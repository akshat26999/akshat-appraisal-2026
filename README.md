# Akshat Joshi — Season 2025/26 Appraisal Site

FC Barcelona 2008-09 treble-era themed performance-review site. FUT player card cover + three match-report pages mapped to the three rubric sections.

## Pages

| Page | Competition | Rubric section | Weight |
|------|-------------|----------------|--------|
| `index.html` | Cover — FUT card | — | — |
| `feature-delivery.html` | La Liga | Feature Delivery | 45% |
| `quality-ux.html` | Copa del Rey | Quality, UX & Production Ownership | 35% |
| `growth-ai.html` | Champions League | Growth, Code Quality & AI Adoption | 20% |
| `trophy-room.html` | Trophy Room | Season summary | — |

## Updating content (no HTML edits needed)

All data lives in plain JSON. Edit the file → reload the page.

### Q1 tickets — `assets/data/tickets.json`

- **Array order = display priority.** Move entries up to surface them sooner.
- `tier: 1` → appears in the El Clásico highlight cards (top section). Change `tier` to promote/demote a ticket.
- `result` values: `W` (Done) · `PPD` (Won't Do) · `HT` (UAT) · `LIVE` (QA Running) · `SCHED` (To Do / Ready)

### Q2 lineup — `assets/data/q2-lineup.json`

- Positions: `GK`, `DEF`, `MID`, `FWD`, `BENCH`
- Reorder entries within a position array → reorders on the pitch.
- Move an entry to a different position array → changes its role.

### Q3 bracket — `assets/data/q3-bracket.json`

- Array order = bracket order (R16 → Final → Roma '91 loss).
- Reorder entries to re-rank European nights.

## Swapping photos

Both photos are swappable with no HTML edits — just replace the file at the same path:

| Photo | File | Notes |
|-------|------|-------|
| Player (Akshat) | `assets/img/akshat-placeholder.svg` | Square, ≥ 600×600. If using JPG/PNG, also update the `src` in `index.html` to `.jpg` / `.png`. |
| Manager | `assets/img/manager-placeholder.svg` | Same rules. Used in match-report headers and trophy room. |

## Adding music

1. Drop your MP3 into `assets/audio/anthem.mp3`.
2. The ♪ button (bottom-right corner of every page) will play/pause it.
3. No autoplay — user must press the button.

## Deploy to GitHub Pages (5 minutes)

```bash
cd /Users/akshatjoshi/Desktop/performance

# Init git (skip if already a repo)
git init
git add .
git commit -m "Initial appraisal site"

# Create repo and push (requires gh CLI)
gh repo create akshat-appraisal-h1-2526 --public --source=. --push

# OR push to existing repo:
# git remote add origin https://github.com/<you>/<repo>.git
# git push -u origin main
```

Then in GitHub:
**Settings → Pages → Branch: `main` → Folder: `/ (root)` → Save**

After ~30s the site is live at:
```
https://<your-username>.github.io/<repo-name>/
```

Paste that link into your Google Form answers.

## Print to PDF

Open any page → `Cmd+P` (Mac) or `Ctrl+P` (Windows) → **Save as PDF**.  
Print CSS removes nav, shadows, and fixes ink colours automatically.

## Local preview

Open `index.html` directly in the browser, or run a simple server:

```bash
npx http-server . -p 8080
# → http://localhost:8080
```
