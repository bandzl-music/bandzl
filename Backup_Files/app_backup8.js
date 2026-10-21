// Bandzl MVP - Client-Side Discovery, Filtering & Geolocation (v0.5.0)

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("events-container");
  const countHeader = document.getElementById("events-count-header");
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const riffRadarBtn = document.getElementById("riff-radar-btn");

  if (!container) return;

  // 1. Initialize Leaflet Map centered on Fremont, CA
  const map = L.map('map', { zoomControl: true, tap: true }).setView([37.5483, -121.9886], 12);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  let allEvents = [];
  let markersMap = {};
  let userLocation = null;
  let userMarker = null;

  // Load favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem("bandzl_favorites")) || [];

  // Active filter state
  let currentSearchQuery = "";
  let currentTimeFilter = "all";

  try {
    const response = await fetch("events.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    allEvents = await response.json();
    
    renderApp();

    // 2. Event Listeners for Search and Filters
    searchInput.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      renderApp();
    });

    filterBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        filterBtns.forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        currentTimeFilter = e.target.getAttribute("data-filter");
        renderApp();
      });
    });

    // 3. HTML5 Geolocation "Riff Radar"
    riffRadarBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      riffRadarBtn.textContent = "📡 LOCATING...";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          userLocation = { lat, lng };

          map.setView([lat, lng], 14, { animate: true });

          if (userMarker) {
            map.removeLayer(userMarker);
          }

          const userIcon = L.divIcon({
            className: 'user-loc-pin',
            html: `<div style="background-color: #00dfd8; border: 2px solid #121212; width: 18px; height: 18px; border-radius: 50%; box-shadow: 0 0 10px #00dfd8;"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map)
            .bindPopup("<b>📍 You are here</b>").openPopup();

          riffRadarBtn.textContent = "📡 RIFF RADAR";
          renderApp();
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to retrieve your location. Please check browser permissions.");
          riffRadarBtn.textContent = "📡 RIFF RADAR";
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });

  } catch (error) {
    console.error("Failed to load events:", error);
    container.innerHTML = `<p style="color: red;">Error loading events. Ensure you are running via a local server (like Live Server in VS Code).</p>`;
  }

  // Haversine formula to calculate distance in miles
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Core Filtering & Rendering Engine
  function renderApp() {
    // Clear existing markers from map temporarily
    Object.values(markersMap).forEach(marker => map.removeLayer(marker));
    markersMap = {};

    // Filter events
    const filteredEvents = allEvents.filter(event => {
      // Fuzzy Search matching title, artist_name, venue_name, vibe
      const matchesSearch = 
        event.title.toLowerCase().includes(currentSearchQuery) ||
        event.artist_name.toLowerCase().includes(currentSearchQuery) ||
        event.venue_name.toLowerCase().includes(currentSearchQuery) ||
        event.vibe.toLowerCase().includes(currentSearchQuery);

      if (!matchesSearch) return false;

      // Time Filter logic (Assuming current mock context is around Oct 2026)
      const eventDate = new Date(event.start_time);
      const now = new Date("2026-10-20T19:00:00Z"); // Anchor date for MVP testing

      if (currentTimeFilter === "tonight") {
        return eventDate.toDateString() === new Date("2026-10-24T18:00:00Z").toDateString() || 
               eventDate.getDate() === now.getDate();
      } else if (currentTimeFilter === "weekend") {
        // Saturday/Sunday check
        const day = eventDate.getDay();
        return (day === 0 || day === 6 || day === 5);
      } else if (currentTimeFilter === "favorites") {
        return favorites.includes(event.event_id);
      }

      return true;
    });

    // Calculate distances if user location is available
    if (userLocation) {
      filteredEvents.forEach(event => {
        event.distance = calculateDistance(userLocation.lat, userLocation.lng, event.lat, event.lng);
      });
      filteredEvents.sort((a, b) => a.distance - b.distance);
    }

    // Render Count Header
    countHeader.innerHTML = `<h2>Nearby Shows</h2><span style="font-size: 0.85rem; font-weight: 600; color: #6b7280;">${filteredEvents.length} Found</span>`;
    container.innerHTML = "";

    if (filteredEvents.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: #6b7280; padding: 2rem 0;">No matching shows found. Try a different search or filter!</p>`;
      return;
    }

    filteredEvents.forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.setAttribute("data-id", event.event_id);
      
      const dateObj = new Date(event.start_time);
      const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateTimeDisplay = `${dateFormatted} • ${timeFormatted}`;
      const costDisplay = event.cost.toLowerCase() === "free" ? "FREE" : `$${event.cost}`;
      const isFav = favorites.includes(event.event_id);
      const distanceDisplay = event.distance !== undefined ? `<span class="distance-badge">📍 ${event.distance.toFixed(1)} mi</span>` : "";

      card.innerHTML = `
        <button class="fav-btn" title="Save show">${isFav ? '❤️' : '🤍'}</button>
        <h3>${event.title}</h3>
        <span class="vibe-badge">${event.vibe}</span>
        <p class="artist-name"><strong>${event.artist_name}</strong></p>
        <p class="venue-info">📍 ${event.venue_name} ${distanceDisplay}</p>
        <p style="margin: 0.2rem 0; font-size: 0.85rem; color: #4b5563;">📅 ${dateTimeDisplay}</p>
        <div class="event-meta">
          <span class="cost">${costDisplay}</span>
          <div class="actions">
            <button class="map-link-btn" data-lat="${event.lat}" data-lng="${event.lng}">View on Map</button>
            <a href="${event.ticket_url}" target="_blank" rel="noopener noreferrer" class="ticket-link">GET TIX ↗</a>
          </div>
        </div>
      `;

      // Favorite toggle handler
      card.querySelector(".fav-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (favorites.includes(event.event_id)) {
          favorites = favorites.filter(id => id !== event.event_id);
        } else {
          favorites.push(event.event_id);
        }
        localStorage.setItem("bandzl_favorites", JSON.stringify(favorites));
        renderApp();
      });

      // Card click event to pan map to pin & open popup
      card.querySelector(".map-link-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".event-card").forEach(c => c.classList.remove("highlighted"));
        card.classList.add("highlighted");

        const lat = parseFloat(e.target.getAttribute("data-lat"));
        const lng = parseFloat(e.target.getAttribute("data-lng"));
        map.setView([lat, lng], 15, { animate: true });
        if (markersMap[event.event_id]) {
          markersMap[event.event_id].openPopup();
        }
      });

      container.appendChild(card);

      // Render Map Marker
      if (event.lat && event.lng) {
        const customIcon = L.divIcon({
          className: 'custom-svg-pin',
          html: `
            <div style="
              background-color: #ff007f; 
              border: 2px solid #ffffff; 
              width: 26px; 
              height: 26px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
              cursor: pointer;
            ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
          popupAnchor: [0, -15]
        });

        const marker = L.marker([event.lat, event.lng], { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; min-width: 160px;">
            <h4 style="margin: 0 0 4px 0; font-family: 'Fredoka', sans-serif; color: #7928ca;">${event.title}</h4>
            <p style="margin: 0 0 2px 0; font-size: 0.85rem;"><strong>${event.artist_name}</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 0.8rem; color: #555;">📍 ${event.venue_name}</p>
            <p style="margin: 0 0 6px 0; font-size: 0.75rem; color: #666;">📅 ${dateTimeDisplay}</p>
            <a href="${event.ticket_url}" target="_blank" rel="noopener noreferrer" style="color: #ff007f; font-weight: bold; font-size: 0.8rem; text-decoration: none;">GET TIX ↗</a>
          </div>
        `);

        marker.on("click", () => {
          document.querySelectorAll(".event-card").forEach(c => c.classList.remove("highlighted"));
          card.classList.add("highlighted");
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        markersMap[event.event_id] = marker;
      }
    });
  }
});