# How to Continue Fetching YouTube URLs

Since the YouTube Data API has a daily quota of 10,000 units (each search costs 100 units = max 100 searches/day per API key), resolving all 1,000 songs will take multiple days or multiple API keys.

## Instructions

1. **Get a new YouTube Data API v3 Key**
   - Go to Google Cloud Console.
   - Create a project or use an existing one.
   - Go to "APIs & Services" > "Library" and enable "YouTube Data API v3".
   - Go to "Credentials" and "Create Credentials" > "API key".

2. **Update the script**
   - Open `fetch_youtube_urls.js` in your editor.
   - Replace the `API_KEY` variable at the top with your new key.

3. **Run the script locally**
   - Open a terminal in the `music shuffle` folder.
   - Run the script with Node.js:
     ```bash
     node fetch_youtube_urls.js
     ```
   - The script automatically skips songs that already have a `youtube_url` in `data/songs.json`. It will only fetch the missing ones.

4. **Push the updates to GitHub**
   - Once the script finishes (or hits the quota), commit and push the updated `data/songs.json` file.
   - The web app is already updated to prioritize songs that have a `youtube_url`!

## Note on Security
**Never share your API key publicly.** If you push a script with an API key, someone might scrape it and use it. I recommend:
1. Revoking the key you pasted in the chat.
2. Running the script locally and only pushing `data/songs.json`.
