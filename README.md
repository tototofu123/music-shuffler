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
2. Add your API keys:
   ```env
   GEMINI_API_KEY=your_key_here
   YOUTUBE_API_KEY=your_key_here
   ```

### Fetching Metadata
- `fetch_gemini_urls.js`: Uses AI to batch process metadata.
- `fetch_youtube_urls.js`: Fetches official video IDs directly from YouTube API.
- All fetcher scripts automatically load keys from the `.env` file.

## Technologies
- **Frontend**: HTML5, CSS3, Vanilla JavaScript.
- **Backend Scripts**: Node.js.
- **Data**: JSON.
