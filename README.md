# music-shuffler

A lightweight music discovery web app that shuffles through a curated library of 3,000 songs. Filter by genre or type, then hit Shuffle to get a random pick with a direct YouTube link.

**Live site:** https://tototofu123.github.io/music-shuffler/

---

## Features

- **Shuffle** — picks a random song from the active filter pool
- **Genre filters** — 26 genres: Hip-hop, R&B, Indie Rock, Indie Folk, Pop, Electronic, Psych Pop, Alt Rock, Classic Rock, Jazz, Classical, Lo-fi, Soul, Blues, Country, Metal, Latin, Afrobeats, K-pop, Reggae, Synth Pop, Punk, Disco, Gospel, Ambient, Indie Pop
- **Type filters** — Original, Remix, Acoustic, Lo-fi, Classical
- **YouTube embed** — inline video player for the first 5 shuffles (when a direct URL is available)
- **Play on YouTube** button — opens the song on YouTube (falls back to a search query if no direct URL is stored)
- **Copy Link** — copies the stored YouTube URL to clipboard
- **Pool info** — live count of songs matching current filters
- **Session playlist** — running history of songs shuffled in the current session
- **Dark / light theme** — toggled via the header button, persisted in `localStorage`

## Tech Stack

Pure frontend — no build step, no server.

| Layer | Details |
|---|---|
| HTML / CSS / JS | `index.html`, `style.css`, `script.js` |
| In-browser database | [sql.js](https://github.com/sql-js/sql.js) 1.10.2 (SQLite compiled to WebAssembly) |
| Song data | `data/songs.json` fetched from GitHub raw at runtime |
| Fonts | DM Serif Display + DM Sans via Google Fonts |

## Song Database

`data/songs.json` — 3,000 songs, each with:

```json
{
  "id": 1,
  "title": "HUMBLE.",
  "artist": "Kendrick Lamar",
  "year": 2017,
  "genre": "Hip-hop",
  "type": "Original",
  "youtube_url": "https://music.youtube.com/watch?v=..."
}
```

`youtube_url` is optional. Songs with a stored URL get priority in shuffle results and show the inline video player and Copy Link button.

## Adding YouTube URLs

The `add_songs/` folder contains three helper scripts that look up YouTube video IDs for songs that are missing a `youtube_url` and write the results back to `data/songs.json`.

| Script | API used | Auth |
|---|---|---|
| `fetch_youtube_urls.js` | YouTube Data API v3 | `YOUTUBE_API_KEY` env var (or `.env` file) |
| `fetch_gemini_urls.js` | Google Gemini 1.5 Flash | `GEMINI_API_KEY` env var (or `.env` file) |
| `fetch_perplexity_urls.js` | Perplexity Sonar | hardcoded key in script |

All three scripts skip songs that already have a `youtube_url` and save progress to disk every batch so a crash doesn't lose work.

`add_songs/split.py` — one-time utility that extracts inline `<style>` and `<script>` blocks from `index.html` into the separate `style.css` and `script.js` files.

## Project Structure

```
music-shuffler/
├── index.html              # App entry point
├── style.css               # All styles
├── script.js               # App logic (sql.js init, shuffle, filters)
├── data/
│   └── songs.json          # 3,000-song library
├── add_songs/
│   ├── fetch_youtube_urls.js
│   ├── fetch_gemini_urls.js
│   ├── fetch_perplexity_urls.js
│   ├── split.py
│   └── shuffle.svg
└── .github/
    └── workflows/
        ├── deploy-pages.yml          # Auto-deploys to GitHub Pages on push
        └── security-secrets-scan.yml # Gitleaks secret scanning
```

## Deployment

GitHub Pages is configured to serve from the repository root. The `deploy-pages.yml` workflow triggers on every push to `main` and deploys automatically.

## Security

- **Secret scanning:** `.github/workflows/security-secrets-scan.yml` runs [Gitleaks](https://github.com/gitleaks/gitleaks) on every push
- **Gitleaks config:** `.gitleaks.toml`