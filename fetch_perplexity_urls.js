const fs = require('fs');
const https = require('https');

// --- CONFIGURATION ---
const PERPLEXITY_API_KEY = 'YOUR_PERPLEXITY_API_KEY_HERE';
const INPUT_FILE = './data/songs.json';
const OUTPUT_FILE = './data/songs.json';
const MAX_NEW_FETCHES = 70; // We want 100 total, 30 are done.
const BATCH_SIZE = 5;      // Perplexity can handle multiple songs at once
// ----------------------

if (PERPLEXITY_API_KEY === 'YOUR_PERPLEXITY_API_KEY_HERE') {
  console.error('Please provide your Perplexity API key in the script.');
  process.exit(1);
}

async function fetchBatch(songs) {
  const prompt = `For each of the following songs, provide ONLY the YouTube video ID for the official music video (or official audio).
Return a JSON object where the key is the song ID and the value is the YouTube video ID.
No other text.

Songs:
${songs.map(s => `${s.id}: "${s.title} ${s.artist} official video"`).join('\n')}
`;

  const requestData = JSON.stringify({
    model: 'sonar',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that returns only valid JSON mapping song IDs to YouTube video IDs.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });

  const options = {
    hostname: 'api.perplexity.ai',
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
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
          const content = json.choices[0].message.content;
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error(`Failed to parse Perplexity response: ${e.message}\nRaw: ${data}`));
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

  console.log(`Starting Perplexity fetch for ${toFetch.length} songs...\n`);

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    console.log(`Fetching batch ${i / BATCH_SIZE + 1}... (${batch.map(s => s.id).join(', ')})`);

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

    // Small delay to be polite
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n✅ Perplexity fetching complete.');
}

main().catch(console.error);
