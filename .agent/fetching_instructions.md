# YouTube Fetching Agent Instructions

This document is for the next AI agent assisting with this project to understand how to continue the YouTube URL fetching process.

## Context
- We have a list of ~1000 songs in `data/songs.json`.
- Each song should ideally have a `youtube_url` property containing a direct link to the music video.
- Currently, about 100 songs have URLs. The remaining 900 need fetching.
- The user has provided a YouTube Data API v3 key in the conversation history for this task.

## API Key (Sensitive)
The user provided this key for the YouTube Data API:
`AIzaSyAB6BULN9tBuW5ffXJClXDVUdcGK-7-CAk`
*Note: This key has a daily quota of 10,000 units. Each search costs 100 units, so it can only do 100 searches per day.*

## How to Continue
1. **Check the quota**: If you just started a new session on a new day, the quota should be fresh.
2. **Run the script**: Use `node fetch_youtube_urls.js`.
3. **Verify progress**: The script will print `[X/1000] FOUND ...` or `SKIP`. It automatically skips songs that already have URLs.
4. **Push data**: After the script finishes or hits the quota (you'll see errors), commit and push the updated `data/songs.json`.

## Logic
The script build queries based on the song `type` (Remix, Original, Acoustic, etc.) to optimize for official music videos.
- Original -> "official video"
- Remix -> "official audio"
- Acoustic -> "acoustic"
- etc.

## UI Integration
The shuffler in `script.js` uses `youtube_url IS NOT NULL DESC` to show songs with direct links first.
