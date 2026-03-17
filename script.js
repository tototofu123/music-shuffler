const SONGS_URL = 'https://raw.githubusercontent.com/tototofu123/music-shuffler/main/data/songs.json';
    const GENRES = ["Hip-hop", "R&B", "Indie Rock", "Indie Folk", "Pop", "Electronic", "Psych Pop", "Alt Rock", "Classic Rock", "Jazz", "Classical", "Lo-fi", "Soul", "Blues", "Country", "Metal", "Latin", "Afrobeats", "K-pop", "Reggae", "Synth Pop", "Punk", "Disco", "Gospel", "Ambient", "Indie Pop"];
    const TYPES = ["Original", "Remix", "Acoustic", "Lo-fi", "Classical"];

    let db = null;
    let activeGenres = new Set();
    let activeTypes = new Set();
    let shuffleCount = 0;
    let lastRowId = -1;

    // ── Progress bar ──────────────────────────────────────────
    function setProgress(pct) {
      document.getElementById('loadingBar').style.width = pct + '%';
    }

    // ── Build filter chips ────────────────────────────────────
    function buildFilters() {
      const gf = document.getElementById('genreFilters');
      const tf = document.getElementById('typeFilters');

      gf.innerHTML = `<button class="chip active" data-g="all" onclick="toggleGenre(this,'all')">All</button>` +
        GENRES.map(g => `<button class="chip" data-g="${g}" onclick="toggleGenre(this,'${g.replace(/'/g, "\\'")}')">${g}</button>`).join('');

      tf.innerHTML = `<button class="chip active" data-t="all" onclick="toggleType(this,'all')">All</button>` +
        TYPES.map(t => `<button class="chip" data-t="${t}" onclick="toggleType(this,'${t}')">${t}</button>`).join('');
    }

    function getColor(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const h = Math.abs(hash) % 360;
      return `hsl(${h}, 70%, 45%)`;
    }

    function toggleGenre(el, val) {
      const allChip = document.querySelector('#genreFilters .chip[data-g="all"]');
      
      if(val === 'all') {
        activeGenres.clear();
        document.querySelectorAll('#genreFilters .chip').forEach(c => {
          c.classList.remove('active');
          c.style.backgroundColor = '';
          c.style.color = '';
          c.style.borderColor = '';
        });
        allChip.classList.add('active');
      } else {
        const wasActive = el.classList.contains('active');
        
        // Clear all chips
        document.querySelectorAll('#genreFilters .chip').forEach(c => {
          c.classList.remove('active');
          c.style.backgroundColor = '';
          c.style.color = '';
          c.style.borderColor = '';
        });
        activeGenres.clear();

        if (wasActive) {
          allChip.classList.add('active');
        } else {
          el.classList.add('active');
          activeGenres.add(val);
          el.style.backgroundColor = getColor(val);
          el.style.color = '#fff';
          el.style.borderColor = 'transparent';
        }
      }
      updatePoolInfo();
    }

    function toggleType(el, val) {
      const allChip = document.querySelector('#typeFilters .chip[data-t="all"]');
      
      if(val === 'all') {
        activeTypes.clear();
        document.querySelectorAll('#typeFilters .chip').forEach(c => {
          c.classList.remove('active');
          c.style.backgroundColor = '';
          c.style.color = '';
          c.style.borderColor = '';
        });
        allChip.classList.add('active');
      } else {
        const wasActive = el.classList.contains('active');
        
        // Clear all chips
        document.querySelectorAll('#typeFilters .chip').forEach(c => {
          c.classList.remove('active');
          c.style.backgroundColor = '';
          c.style.color = '';
          c.style.borderColor = '';
        });
        activeTypes.clear();

        if (wasActive) {
          allChip.classList.add('active');
        } else {
          el.classList.add('active');
          activeTypes.add(val);
          el.style.backgroundColor = getColor(val);
          el.style.color = '#fff';
          el.style.borderColor = 'transparent';
        }
      }
      updatePoolInfo();
    }

    // ── SQL query builder ─────────────────────────────────────
    function buildQuery(forCount = false) {
      const conditions = [];
      const params = {};

      if (activeGenres.size > 0) {
        const gKeys = [...activeGenres].map((g, i) => { params[`:g${i}`] = g; return `:g${i}`; });
        conditions.push(`genre IN (${gKeys.join(',')})`);
      }
      if (activeTypes.size > 0) {
        const tKeys = [...activeTypes].map((t, i) => { params[`:t${i}`] = t; return `:t${i}`; });
        conditions.push(`type IN (${tKeys.join(',')})`);
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const sql = forCount
        ? `SELECT COUNT(*) as cnt FROM songs ${where}`
        : `SELECT * FROM songs ${where} ORDER BY youtube_url IS NOT NULL DESC, RANDOM() LIMIT 1`;

      return { sql, params };
    }

    function formatQueryDisplay(sql, params) {
      let pretty = sql;
      for (const [k, v] of Object.entries(params)) {
        pretty = pretty.replace(k, `'${v}'`);
      }
      return pretty
        .replace(/\b(SELECT|FROM|WHERE|IN|AND|ORDER BY|LIMIT|COUNT)\b/g, '<span class="kw">$1</span>')
        .replace(/'([^']+)'/g, '<span class="val">\'$1\'</span>');
    }

    // ── Update pool count ─────────────────────────────────────
    function updatePoolInfo() {
      if (!db) return;
      try {
        const { sql, params } = buildQuery(true);
        const result = db.exec(sql, params);
        const count = result[0]?.values[0][0] ?? 0;
        const gLabel = activeGenres.size === 0 ? 'all genres' : `${activeGenres.size} genre${activeGenres.size > 1 ? 's' : ''}`;
        const tLabel = activeTypes.size === 0 ? 'all types' : `${activeTypes.size} type${activeTypes.size > 1 ? 's' : ''}`;
        document.getElementById('poolInfo').innerHTML = `<span>${count.toLocaleString()}</span> songs in pool · ${gLabel} · ${tLabel}`;
      } catch (e) { }
    }

    // ── Shuffle ───────────────────────────────────────────────
    function shuffle() {
      if (!db) return;

      const btn = document.getElementById('shuffleBtn');
      const icon = document.getElementById('btnIcon');
      icon.innerHTML = '<span class="spin">&#x21BB;</span>';
      btn.disabled = true;

      setTimeout(() => {
        try {
          const { sql, params } = buildQuery(false);

          // Show query
          const qBox = document.getElementById('queryBox');
          document.getElementById('queryCode').innerHTML = formatQueryDisplay(sql, params);
          qBox.classList.add('visible');

          const result = db.exec(sql, params);

          if (!result.length || !result[0].values.length) {
            document.getElementById('card').innerHTML = `<p class="empty-state">No songs match your filters</p>`;
            document.getElementById('ytBtn').style.display = 'none';
            icon.innerHTML = '&#x21BB;';
            btn.disabled = false;
            return;
          }

          const cols = result[0].columns;
          const row = result[0].values[0];
          const song = {};
          cols.forEach((c, i) => song[c] = row[i]);

          shuffleCount++;
          lastRowId = song.id;

          const card = document.getElementById('card');
          card.classList.add('has-song');
          
          let videoHtml = '';
          if (shuffleCount <= 5 && song.youtube_url) {
            const videoId = song.youtube_url.split('v=')[1]?.split('&')[0];
            if (videoId) {
              videoHtml = `
                <div class="video-container fade-up" style="animation-delay: 0.1s">
                  <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>
                </div>
              `;
            }
          }

          card.innerHTML = `
        <div class="fade-up">
          <div class="tag-row">
            <span class="tag tag-genre">${song.genre}</span>
            <span class="tag tag-type">${song.type}</span>
            ${song.youtube_url ? '<span class="tag tag-url">Direct URL</span>' : ''}
          </div>
          <p class="song-title">${song.title}</p>
          <p class="song-artist">${song.artist}</p>
          <p class="song-year">${song.year}</p>
          ${videoHtml}
        </div>
      `;

          const ytUrl = song.youtube_url || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${song.title} ${song.artist} official music video`);
          const ytBtn = document.getElementById('ytBtn');
          ytBtn.href = ytUrl;
          ytBtn.style.display = 'inline-flex';
          
          document.getElementById('meta').textContent = shuffleCount + ' shuffled';
          
          const playlist = document.getElementById('playlist');
          const item = document.createElement('div');
          item.className = 'playlist-item fade-in';
          item.innerHTML = `
            <div class="song-info">
              <span class="song-title-sm">${song.title}</span>
              <span class="song-artist-sm">${song.artist}</span>
            </div>
            <div class="song-tags-sm">
              <span class="tag-sm" style="background:${getColor(song.genre)}; color:#fff">${song.genre}</span>
              <span class="tag-sm" style="background:${getColor(song.type)}; color:#fff">${song.type}</span>
            </div>
          `;
          playlist.prepend(item);
        } catch (e) {
          document.getElementById('card').innerHTML = `<p class="empty-state">Query error: ${e.message}</p>`;
        }

        icon.innerHTML = '&#x21BB;';
        btn.disabled = false;
      }, 200);
    }

    // ── Init: load sql.js + fetch JSON + populate DB ──────────
    async function init() {
      const statusEl = document.getElementById('dbStatus');
      buildFilters();

      try {
        setProgress(10);
        statusEl.textContent = 'loading sql engine…';

        const SQL = await initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
        });

        setProgress(35);
        statusEl.textContent = 'fetching songs…';

        const res = await fetch(SONGS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status} — check your GitHub repo and songs.json path`);
        const songs = await res.json();

        setProgress(65);
        statusEl.textContent = 'building database…';

        db = new SQL.Database();

        db.run(`
      CREATE TABLE songs (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        year INTEGER,
        genre TEXT,
        type TEXT,
        youtube_url TEXT
      );
      CREATE INDEX idx_genre ON songs(genre);
      CREATE INDEX idx_type ON songs(type);
      CREATE INDEX idx_genre_type ON songs(genre, type);
    `);

        // Batch insert with prepared statement
        db.run('BEGIN TRANSACTION');
        const stmt = db.prepare('INSERT INTO songs VALUES (:id,:title,:artist,:year,:genre,:type,:youtube_url)');
        for (const s of songs) {
          stmt.run({ ':id': s.id, ':title': s.title, ':artist': s.artist, ':year': s.year, ':genre': s.genre, ':type': s.type, ':youtube_url': s.youtube_url || null });
        }
        stmt.free();
        db.run('COMMIT');

        setProgress(100);
        statusEl.textContent = `${songs.length.toLocaleString()} songs ready`;
        statusEl.classList.add('ready');

        document.getElementById('shuffleBtn').disabled = false;
        updatePoolInfo();

        setTimeout(() => setProgress(0), 600);

      } catch (e) {
        statusEl.textContent = `error: ${e.message}`;
        statusEl.classList.add('error');
        setProgress(0);
        console.error(e);
      }
    }

    init();