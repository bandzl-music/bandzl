# Bandzl - Local Live Music Discovery PWA

> "Dropping map pins where the music drops."

Bandzl is a streamlined, mobile-first Progressive Web App (PWA) designed to locate local live music sessions, street performances, and venue shows using geospatial filtering, custom UI controls, and interactive map displays.

---

## Technical Architecture & Setup

### Tech Stack
- **Frontend Framework:** Vanilla HTML5, CSS3, JavaScript (ES6 Modules)
- **Map Renderer:** Leaflet.js (OpenStreetMap base tiles)
- **Data Source:** Static JSON (`events.json`) parsed client-side via native `fetch()`
- **PWA Packaging:** `manifest.json` and Service Worker (`sw.js`) for native-like installation and offline caching

### Project File Structure
```
bandzl/
├── index.html        # SPA Shell, viewports, bottom sheet structure
├── style.css         # Neon visual system, CSS Grid/Flexbox layout, responsive sheet styles
├── app.js            # Core application logic, event fetching, rendering engine
├── events.json       # 25-record test dataset centered on Fremont/Bay Area
├── manifest.json     # PWA manifest metadata
├── sw.js             # Service Worker cache controller
└── README.md         # Project plan, changelog, setup documentation
```

### Setup Instructions for VS Code Development
1. Clone or extract the project repository into your local directory.
2. Open the folder in **Microsoft VS Code Studio**.
3. Install the **Live Server** extension (`ms-vscode.live-server`) in VS Code if not already installed.
4. Right-click `index.html` and select **Open with Live Server**.
5. Open Developer Tools (`F12`), toggle the Mobile Device Toolbar (`Ctrl+Shift+M`), and set screen emulation to iPhone 12 Pro or Pixel 7 to test mobile touch interactions and viewport behavior.

---

## Project Plan & Roadmap

### Phase 1: Frontend Shell & Static Data Layer (COMPLETED)
- [x] Responsive Single Page Application Shell (Mobile-first header, viewport map frame, collapsible bottom drawer).
- [x] High-contrast brand identity (Neon Purple `#8A2BE2`, Electric Teal `#00F5D4`, Hot Pink `#FF007F`).
- [x] Static 25-record JSON dataset for local Bay Area live music events.
- [x] Client-side asynchronous `fetch()` loader.
- [x] Basic PWA manifest and offline Service Worker initialization.

### Phase 2: Map Core & Geospatial Display (NEXT STEPS)
- [x] Initialize Leaflet.js map layer centered on Fremont, CA (`37.5483, -121.9886`).
- [x] Render custom interactive pins mapped to event coordinates (`lat`/`lng`).
- [x] Bind custom popups and map pin tap events to bottom-sheet event detail cards.

### Phase 3: Client-Side Discovery & Filtering
- [x] Client-side fuzzy search integration for artist, venue, and title matching.
- [x] Loudness Slider filter ("Acoustic Whisper" to "Wall of Sound").
- [x] Time slice filters ("Tonight", "This Weekend", "All Dates").
- [x] HTML5 Geolocation API integration ("Riff Radar" / Find My Location).
- [x] Local storage persistence for favorited shows.

### Phase 4: Pilot Deployment & Offline QA
- [x] GitHub Pages static deployment over free HTTPS.
- [ ] Cross-platform mobile QA (iOS Safari / Android Chrome touch gestures).

---

## Rolling Changelog

### v0.1.0 - 2026-10-20
**Phase 1: Frontend Shell & Static Data Layer Completed**
- **Added:** Initialized single-page responsive mobile structure (`index.html`).
- **Added:** Built design system with Neon Purple, Electric Teal, and Hot Pink highlights (`style.css`).
- **Added:** Created event feed list and interactive bottom-sheet UI.
- **Added:** Created `events.json` populated with 25 venue/event mock records around Fremont, Newark, Union City, Hayward, San Jose, Santa Clara, and Palo Alto.
- **Added:** Created asynchronous data loader module in `app.js`.
- **Added:** Created PWA manifest (`manifest.json`) and service worker offline handler (`sw.js`).