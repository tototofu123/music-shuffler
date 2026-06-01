# 🎵 Music Shuffler

A smart, web-based music discovery and randomization tool designed to help you explore your playlist with precision. Filter by genre, mood, or song type and find the perfect track for any moment.

## ✨ Features

- **Smart Randomization:** High-quality shuffling logic to prevent repetitive tracks.
- **Granular Filtering:** Filter your library by **Genre** (Hip-hop, R&B, Indie, etc.) and **Type** (Original, Remix, Acoustic, etc.).
- **Dynamic Themes:** Responsive light and dark modes with system preference detection.
- **Real-time Search:** Instantly find songs in your database.
- **Mobile Optimized:** A clean, touch-friendly interface for on-the-go listening.
- **Automated Data Updates:** Includes scripts for fetching and updating song metadata from YouTube and Gemini.

## 🚀 Getting Started

### Prerequisites
- A modern web browser.
- (Optional) A local web server (e.g., Live Server extension in VS Code) for the best experience.

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/tototofu123/music-shuffler.git
   ```
2. Open `index.html` in your browser.

## 🛠️ Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom Properties for Theming).
- **Data Storage:** JSON-based database (`data/songs.json`).
- **Automation:** Node.js scripts for metadata fetching.
- **CI/CD:** GitHub Actions for automated deployment to GitHub Pages.

## 📂 Project Structure

- `index.html`: Main application entry point.
- `script.js`: Core logic for shuffling, filtering, and theme management.
- `style.css`: Modern, responsive styling.
- `data/`: Contains the `songs.json` database.
- `add_songs/`: Automation scripts for library expansion.
- `.github/workflows/`: CI/CD pipelines for deployment and security.

## 🔧 Automation Scripts

The `add_songs/` directory contains several utility scripts:
- `fetch_youtube_urls.js`: Extracts song data from YouTube playlists.
- `fetch_gemini_urls.js`: Uses AI to enrich song metadata.
- `split.py`: A helper script for data management.

---

Built with 🧡 by [tototofu123](https://github.com/tototofu123)
