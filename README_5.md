# Bandzl - Live Music Finder PWA

Bandzl is a mobile-first Progressive Web Application (PWA) designed for location-based live music event discovery with a $0 initial budget. Built with vanilla web tools and custom interactive map integration, Bandzl delivers an arcade/game-like user experience for discovering local gigs, indie shows, and live performances across Fremont and the greater Bay Area.

---

## 🎨 Visual Identity & Styling
- **Theme:** Playful Platformer / Cartoony Arcade (Option 3)
- **Typography Stack:** 
  - Headings / Branding / Badges / Buttons: `Fredoka` (Google Fonts, weights 600 & 700)
  - Body Text / Event Details / Metadata: `Outfit` (Google Fonts, weights 400, 600 & 700)
- **Color Palette:**
  - Neon Purple (`#7928ca`)
  - Electric Teal (`#00dfd8`)
  - Hot Pink (`#ff007f`)
  - Dark Accent (`#121212`)
  - Light Background (`#f9fafb`)
  - Selected Card Highlight (`#fff0f6`)

---

## 🏗️ Tech Stack & Architecture
- **Frontend Core:** Vanilla HTML5, CSS3, Custom JavaScript (ES6 Modules)
- **Map Engine:** Leaflet.js (`v1.9.4`) with OpenStreetMap tiles & inline SVG divIcons
- **Discovery Engine:** Custom fuzzy substring search, time slicing filters, and Haversine distance calculation
- **Persistence:** Browser `localStorage` for offline favorite bookmarking
- **Hosting Strategy:** GitHub Pages / Vercel (Static Web Hosting)
- **Tooling:** Visual Studio Code with Live Server Extension (`RitwickDey.LiveServer`)

---

## 📁 Project File Structure

## 📜 Rolling Changelog

### [v0.5.0] - Phase 3: Client-Side Discovery & Filtering
- **Fuzzy Substring Search:** Implemented instant client-side filtering across event titles, artist names, venue locations, and vibe genres.
- **Time Filter Slicing:** Added filter pills for "All Dates", "Tonight", "This Weekend", and saved favorites.
- **HTML5 Geolocation & Riff Radar:** Integrated browser geolocation API with the "Riff Radar" button to pinpoint user coordinates, drop a custom location marker, and calculate real-time distance radii (in miles) sorted dynamically.
- **LocalStorage Persistence:** Added bookmark toggle buttons (`❤️`/`🤍`) to persist favorited shows directly in browser storage without backend dependencies.

### [v0.4.3] - Phase 2: Mobile Robustness & Inline SVG Standardization
- **Cross-Platform Vector Pins:** Replaced emojis with crisp inline SVG music notes inside 26px circular markers.

### [v0.4.2] - Phase 2: Refined Map Pins & Event Dates
- **High-Contrast Compact Pins:** Reduced map pin diameter to 24px and updated them to hot pink with a crisp white border.
- **Event Date Integration:** Added formatted event dates alongside start times.

### [v0.4.1] - Phase 2: Custom SVG Pins & Card Highlights
- **Soft Pink Card Highlight:** Updated selected event cards to display a soft light pink background (`#fff0f6`) and smooth auto-scrolling.

### [v0.4.0] - Phase 2: Map Core & Geospatial Display
- **Leaflet.js Integration:** Initialized Leaflet map centered on Fremont, CA (`37.5483, -121.9886`) with OpenStreetMap tile layer and bi-directional card/pin syncing.

### [v0.3.0] - Phase 1: Game-Like Visual Overhaul (Option 3)
- **Typography Update:** Integrated Google Fonts (`Fredoka` and `Outfit`).

### [v0.1.0] - Phase 1: Frontend Shell & Static Data Layer
- **Core Setup:** Created baseline PWA files and 25 Bay Area local music records.