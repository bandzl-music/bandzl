// Bandzl MVP - App Logic & Map Core (v0.4.2)

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
      const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
      const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateTimeDisplay = `${dateFormatted} • ${timeFormatted}`;
      const costDisplay = event.cost.toLowerCase() === "free" ? "FREE" : `$${event.cost}`;

      card.innerHTML = `
        <h3>${event.title}</h3>
        <span class="vibe-badge">${event.vibe}</span>
        <p class="artist-name"><strong>${event.artist_name}</strong></p>
        <p class="venue-info">📍 ${event.venue_name}</p>
        <p style="margin: 0.2rem 0; font-size: 0.85rem; color: #4b5563;">📅 ${dateTimeDisplay}</p>
        <div class="event-meta">
          <span class="cost">${costDisplay}</span>
          <div class="actions">
            <button class="map-link-btn" data-lat="${event.lat}" data-lng="${event.lng}">View on Map</button>
            <a href="${event.ticket_url}" target="_blank" class="ticket-link">GET TIX ↗</a>
          </div>
        </div>
      `;

      // Card click event to pan map to pin & open popup
      card.querySelector(".map-link-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Highlight this card and unhighlight others
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

      // 2. Render High-Contrast Compact Map Marker (24px Hot Pink + White Note)
      if (event.lat && event.lng) {
        const customIcon = L.divIcon({
          className: 'custom-svg-pin',
          html: `
            <div style="
              background-color: #ff007f; 
              border: 2px solid #ffffff; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
              color: #ffffff;
              font-size: 11px;
              cursor: pointer;
            ">
              <!-- Inline SVG Music Note with absolute color control -->
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#000000">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -14]
        });

        const marker = L.marker([event.lat, event.lng], { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
          <div style="font-family: 'Outfit', sans-serif; min-width: 160px;">
            <h4 style="margin: 0 0 4px 0; font-family: 'Fredoka', sans-serif; color: #7928ca;">${event.title}</h4>
            <p style="margin: 0 0 2px 0; font-size: 0.85rem;"><strong>${event.artist_name}</strong></p>
            <p style="margin: 0 0 4px 0; font-size: 0.8rem; color: #555;">📍 ${event.venue_name}</p>
            <p style="margin: 0 0 6px 0; font-size: 0.75rem; color: #666;">📅 ${dateTimeDisplay}</p>
            <a href="${event.ticket_url}" target="_blank" style="color: #ff007f; font-weight: bold; font-size: 0.8rem; text-decoration: none;">GET TIX ↗</a>
          </div>
        `);

        // Marker click event to highlight card with soft pink background & scroll into view
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