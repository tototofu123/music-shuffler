const fs = require('fs');
const https = require('https');

const API_KEY = 'AIzaSyAB6BULN9tBuW5ffXJClXDVUdcGK-7-CAk';
const INPUT_FILE = './data/songs.json';
const OUTPUT_FILE = './data/songs.json';
const DELAY_MS = 120; // stay well under quota

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function ytSearch(query) {
  return new Promise((resolve, reject) => {
    const q = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&videoCategoryId=10&maxResults=1&key=${API_KEY}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const item = json.items?.[0];
          resolve(item ? item.id.videoId : null);
        } catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const total = songs.length;
  let found = 0, missing = 0, skipped = 0;

  console.log(`Processing ${total} songs...\n`);

  for (let i = 0; i < songs.length; i++) {
    const s = songs[i];

    if (s.youtube_url) {
      skipped++;
      console.log(`[${i+1}/${total}] SKIP  ${s.title} — ${s.artist}`);
      continue;
    }

    // Build smart query based on type
    let query;
    if (s.type === 'Original') {
      query = `${s.title} ${s.artist} official video`;
    } else if (s.type === 'Remix') {
      query = `${s.title} official audio`;
    } else if (s.type === 'Acoustic') {
      query = `${s.title} ${s.artist} acoustic`;
    } else if (s.type === 'Lo-fi') {
      query = `${s.title} ${s.artist}`;
    } else if (s.type === 'Classical') {
      query = `${s.title} ${s.artist} full`;
    } else {
      query = `${s.title} ${s.artist} official`;
    }

    try {
      const videoId = await ytSearch(query);
      if (videoId) {
        s.youtube_url = `https://music.youtube.com/watch?v=${videoId}`;
        found++;
        console.log(`[${i+1}/${total}] FOUND ${s.title} — ${s.artist} → ${videoId}`);
      } else {
        missing++;
        console.log(`[${i+1}/${total}] MISS  ${s.title} — ${s.artist}`);
      }
    } catch(e) {
      console.error(`[${i+1}/${total}] ERR   ${s.title}: ${e.message}`);
      missing++;
    }

    // Save progress every 50 songs in case of crash
    if ((i + 1) % 50 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2));
      console.log(`\n💾 Progress saved (${i+1}/${total})\n`);
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2));
  console.log(`\n✅ Done! Found: ${found} | Missing: ${missing} | Skipped: ${skipped}`);
}

main().catch(console.error);
