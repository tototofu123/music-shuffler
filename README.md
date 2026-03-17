# Music Shuffle App

A simple and elegant web application for shuffling music with a massive database of 3,000 songs.

## Features
- **Massive Database**: Integrated 3,000 songs across various genres (Hip-hop, Alt Rock, etc.).
- **Smart Shuffle**: Randomly pick songs from the database with visual feedback.
- **YouTube Integration**: Some songs include official YouTube music video links for easy listening.

## Development & Security
This project uses automated scripts to fetch YouTube metadata. To protect private API keys, we use an `.env` file configuration.

### Setup
1. Create a `.env` file in the root directory.
2. Add your API keys from Google Cloud Console (YouTube Data API v3) and Gemini API:
   ```env
   GEMINI_API_KEY=your_key_here
   YOUTUBE_API_KEY=your_key_here
   ```

### Fetching Metadata
- `add_songs/fetch_gemini_urls.js`: Uses AI to batch process metadata.
- `add_songs/fetch_youtube_urls.js`: Fetches official video IDs directly from YouTube API.
- **Quota Note**: The YouTube Data API v3 has a daily limit of 10,000 units. Each search costs 100 units, allowing for approximately **100 searches per day** on the free tier.
- All fetcher scripts automatically load keys from the `.env` file. To run them: `node add_songs/fetch_youtube_urls.js`.

## Technologies
- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend Scripts**: Node.js.
- **Data**: JSON.
