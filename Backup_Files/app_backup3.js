// Bandzl MVP - App Logic & Map Core (v0.4.0)

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("events-container");
  if (!container) return;

  // 1. Initialize Leaflet Map centered on Fremont, CA
  const map = L.map('map', { zoomControl: true }).setView([37.5483, -121.9886], 12);

  // Add OpenStreetMap Tile Layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  let markersMap = {}; // Store markers by event_id for syncing

  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const eventsData = await response.json();
    container.innerHTML = "";
    
    const countHeader = document.createElement("p");
    countHeader.style.fontWeight = "600";
    countHeader.style.fontSize = "0.9rem";
    countHeader.style.color = "#4b5563";
    countHeader.textContent = `${eventsData.length} Shows Found`;
    container.appendChild(countHeader);

    eventsData.forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.setAttribute("data-id", event.event_id);
      
      const dateObj = new Date(event.start_time);
      const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const costDisplay = event.cost.toLowerCase() === "free" ? "FREE" : `$${event.cost}`;

      card.innerHTML = `
        <h3>${event.title}</h3>
        <span class="vibe-badge">${event.vibe}</span>
        <p class="artist-name"><strong>${event.artist_name}</strong></p>
        <p class="venue-info">📍 ${event.venue_name}</p>
        <div class="event-meta">
          <span class="cost">${costDisplay}</span>
          <span class="time">${timeFormatted}</span>
          <div class="actions">
            <button class="map-link-btn" data-lat="${event.lat}" data-lng="${event.lng}">View on Map</button>
            <a href="${event.ticket_url}" target="_blank" class="ticket-link">GET TIX ↗</a>
          </div>
        </div>
      `;

      // Card click event to pan map to pin & open popup
      card.querySelector(".map-link-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        const lat = parseFloat(e.target.getAttribute("data-lat"));
        const lng = parseFloat(e.target.getAttribute("data-lng"));
        map.setView([lat, lng], 15, { animate: true });
        if (markersMap[event.event_id]) {
          markersMap[event.event_id].openPopup();
        }
      });

      container.appendChild(card);

      // 2. Render Leaflet Map Marker
      if (event.lat && event.lng) {
        const marker = L.marker([event.lat, event.lng]).addTo(map);
        
        marker.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; min-width: 160px;">
            <h4 style="margin: 0 0 4px 0; font-family: 'Fredoka', sans-serif; color: #7928ca;">${event.title}</h4>
            <p style="margin: 0 0 2px 0; font-size: 0.85rem;"><strong>${event.artist_name}</strong></p>
            <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: #555;">📍 ${event.venue_name}</p>
            <a href="${event.ticket_url}" target="_blank" style="color: #ff007f; font-weight: bold; font-size: 0.8rem; text-decoration: none;">GET TIX ↗</a>
          </div>
        `);

        // Marker click event to highlight corresponding card
        marker.on("click", () => {
          document.querySelectorAll(".event-card").forEach(c => c.classList.remove("highlighted"));
          card.classList.add("highlighted");
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        markersMap[event.event_id] = marker;
      }
    });

    // Riff Radar button event
    document.getElementById("riff-radar-btn").addEventListener("click", () => {
      map.setView([37.5483, -121.9886], 13, { animate: true });
      alert("📡 Riff Radar activated! Scanning Fremont metro area for live music...");
    });

  } catch (error) {
    console.error("Failed to load events:", error);
    container.innerHTML = `<p style="color: red;">Error loading events. Ensure you are running via a local server (like Live Server in VS Code).</p>`;
  }
});