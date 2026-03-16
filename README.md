# 🎵 music-shuffler

A pure frontend random song discovery tool. No API keys, no backend, no frameworks — just HTML, a JSON database on GitHub, and SQLite running in the browser via WebAssembly.

**[Live Demo →](https://tototofu123.github.io/music-shuffler)**

---

## How it works

When you open the app:

1. **Fetches** `data/songs.json` directly from this repo via the GitHub raw URL
2. **Spins up** [sql.js](https://sql.js.org/) — SQLite compiled to WebAssembly, running 100% in the browser
3. **Loads** all 1000 songs into an in-memory SQLite table with indexes on `genre`, `type`, and `(genre, type)`
4. **Runs** a real SQL query on every shuffle:

```sql
SELECT * FROM songs
WHERE genre IN ('Hip-hop', 'R&B')
  AND type IN ('Original', 'Remix')
ORDER BY RANDOM()
LIMIT 1
```

5. **Opens** YouTube search for the result so you can start listening immediately

No data ever leaves your browser. Nothing is stored server-side.

---

## Repo structure

```
music-shuffler/
├── index.html        # Main HTML structure
├── style.css         # Styling and UI design
├── script.js         # App logic and SQL queries
└── data/
    └── songs.json    # Song database (1000 songs)
```

---

## Song database

`data/songs.json` contains 1000 songs across **26 genres** and **5 types**.

### Schema

```json
[
  {
    "id": 1,
    "title": "HUMBLE.",
    "artist": "Kendrick Lamar",
    "year": 2017,
    "genre": "Hip-hop",
    "type": "Original"
  }
]
```

### Genres

| Genre | Genre | Genre |
|-------|-------|-------|
| Hip-hop | R&B | Indie Rock |
| Indie Folk | Pop | Electronic |
| Psych Pop | Alt Rock | Classic Rock |
| Jazz | Classical | Lo-fi |
| Soul | Blues | Country |
| Metal | Latin | Afrobeats |
| K-pop | Reggae | Synth Pop |
| Punk | Disco | Gospel |
| Ambient | Indie Pop | |

### Types

| Type | Description |
|------|-------------|
| `Original` | Studio / original release |
| `Remix` | Official remix by another artist |
| `Acoustic` | Stripped acoustic version |
| `Lo-fi` | Lo-fi / chill instrumental |
| `Classical` | Classical / orchestral pieces |

---

## Adding songs

Open `data/songs.json` and add entries following the schema. Make sure to:

- Increment `id` from the last entry
- Use one of the exact genre strings listed above (case-sensitive)
- Use one of the exact type strings: `Original`, `Remix`, `Acoustic`, `Lo-fi`, `Classical`

Then commit and push — the app reads the file live from GitHub, so changes are reflected immediately.

---

## Deploying

### GitHub Pages (recommended)

1. Go to your repo **Settings → Pages**
2. Under *Source*, select **Deploy from a branch**
3. Choose `main` branch and `/ (root)` folder
4. Click **Save**

Your app will be live at:
```
https://tototofu123.github.io/music-shuffler
```

### Local development

Just open `index.html` in a browser. Note: browsers block `fetch()` on `file://` URLs, so you'll need a local server:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then visit `http://localhost:8080`.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| UI | Vanilla HTML / CSS / JS |
| Database | [sql.js](https://sql.js.org/) (SQLite → WebAssembly) |
| Song data | JSON file hosted on GitHub raw |
| Fonts | [DM Serif Display + DM Sans](https://fonts.google.com/) via Google Fonts |
| Hosting | GitHub Pages |

Zero npm. Zero build step. Zero dependencies to install.

---

## License

MIT
