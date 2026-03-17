const fs = require('fs');
const https = require('https');

// --- CONFIGURATION ---
const GEMINI_API_KEY = 'AIzaSyBZAYtPW40SbaSxzwOZ5B8jPmc9efu2auw';
const INPUT_FILE = './data/songs.json';
const OUTPUT_FILE = './data/songs.json';
const MAX_NEW_FETCHES = 70; 
const BATCH_SIZE = 10;      
const MODEL = 'gemini-1.5-flash';
// ----------------------

async function fetchBatch(songs) {
  const prompt = `For each of the following songs, provide the YouTube video ID for the official music video (or official audio).
Return the results in JSON format as an object where the key is the song ID (string) and the value is the YouTube video ID (string).
Do not include any Markdown formatting or extra text.

Songs:
${songs.map(s => `${s.id}: "${s.title} ${s.artist} official video"`).join('\n')}
`;

  const requestData = JSON.stringify({
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      response_mime_type: "application/json",
    }
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': requestData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          
          const text = json.candidates[0].content.parts[0].text;
          resolve(JSON.parse(text));
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${e.message}\nRaw: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestData);
    req.end();
  });
}

async function main() {
  const songs = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  const missing = songs.filter(s => !s.youtube_url);
  const toFetch = missing.slice(0, MAX_NEW_FETCHES);

  console.log(`Starting Gemini fetch for ${toFetch.length} songs...\n`);

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}... (${batch.map(s => s.id).join(', ')})`);

    try {
      const results = await fetchBatch(batch);
      for (const [id, videoId] of Object.entries(results)) {
        const song = songs.find(s => s.id == id);
        if (song) {
          song.youtube_url = `https://music.youtube.com/watch?v=${videoId}`;
          console.log(`✓ [${id}] ${song.title} -> ${videoId}`);
        }
      }
      
      // Save progress after each batch
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(songs, null, 2));
    } catch (e) {
      console.error(`Error in batch starting with ID ${batch[0].id}: ${e.message}`);
    }

    // Small delay
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n✅ Gemini fetching complete.');
}

main().catch(console.error);
