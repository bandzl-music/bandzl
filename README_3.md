# bandzl - Live Music Finder (MVP)

> **"Find shows, not spreadsheets."**  
> Bandzl is a lightweight, mobile-first web app designed to show you live music events near you with zero friction.

---

## 📸 Vision & Design
Bandzl delivers a high-energy, video game HUD-inspired aesthetic with neon accents, dark mode backgrounds, crisp arcade typography, and tactile UI controls.

---

## 🛠️ Stack & Architecture
- **HTML5 / CSS3**: Custom design tokens with Google Fonts (`Press Start 2P` for arcade headings and `Chakra Petch` for UI readability).
- **Vanilla JavaScript**: ES6 async/await fetch module.
- **JSON**: Static events dataset (`events.json`).
- **Hosting**: Zero-cost, zero-backend deployment ready (GitHub Pages / Vercel / Netlify).

---

## ⚡ Quick Start / Local Development

Because Bandzl fetches `events.json` asynchronously, browsers require a local development server to bypass CORS file restriction policies (`file://` protocol).

### Option 1: VS Code Live Server (Recommended)
1. Install the **Live Server** extension in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"**.
3. Access the app in your browser at `http://127.0.0.1:5500`.

### Option 2: Python HTTP Server
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

---

## 📋 Project Structure
```text
.
├── index.html     # Main HTML shell with Arcade Google Fonts integration
├── style.css      # Retro arcade visual design system & HUD components
├── app.js         # Event loader logic with async fetch pipeline
├── events.json    # JSON dataset (25 local Bay Area events)
└── README.md      # Documentation & rolling changelog
```

---

## 🚀 Rolling Changelog

### **v0.2.0** - Arcade & Game-like UI Overhaul *(Current)*
- 🕹️ **Arcade UI Theme**: Introduced a retro video-game HUD interface with dark mode canvas (`#0d0e15`), neon purple borders, electric teal accents, and hot pink action buttons.
- 🔤 **Google Fonts Integration**: Imported `Press Start 2P` for retro 8-bit titles/badges and `Chakra Petch` for high-readability HUD body text.
- 🕹️ **Tactile Arcade Button**: Styled `#riff-radar-btn` with 3D button press depth effect and glowing shadows.
- 📄 **Documentation**: Standardized project structure and local setup instructions.

### **v0.1.3** - External Dataset Standardization
- 🗃️ Restored external `events.json` dataset fetching architecture via `app.js`.
- 🛠️ Standardized DOM element hooks (`#events-container`).

### **v0.1.2** - Hotfix & In-Memory Data Standby
- 🩹 Embedded fallback dataset into `app.js` to support local `file://` execution.

### **v0.1.0** - Phase 1 MVP Core
- 🚀 Initial shell creation with responsive layout, basic layout system, and event listing cards.

---

## 🔮 Next Steps (Roadmap)
- **Phase 2 (OpenStreetMap Canvas)**: Replace the standby map placeholder with an active OpenStreetMap / Leaflet.js interactive canvas centered on Fremont, CA.
- **Phase 3 (Filtering & Radar)**: Activate the `📡 RIFF RADAR` button to filter shows by distance, vibe badges, and price ranges.
- **Phase 4 (Live Ingestion)**: Connect automated scrapers/APIs to replace static `events.json` with dynamic event data.