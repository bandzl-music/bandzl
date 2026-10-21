// Bandzl MVP - App Logic (v0.2.0)
// Arcade HUD Event Fetcher

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("events-container");
  if (!container) return;

  try {
    const response = await fetch("events.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const eventsData = await response.json();
    container.innerHTML = "";
    
    const countHeader = document.createElement("p");
    countHeader.className = "shows-count-header";
    countHeader.textContent = `⚡ ${eventsData.length} LIVE QUESTS FOUND`;
    container.appendChild(countHeader);

    eventsData.forEach(event => {
      const card = document.createElement("div");
      card.className = "event-card";
      
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
          <a href="${event.ticket_url}" target="_blank" class="ticket-link">GET TIX ↗</a>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to load events:", error);
    container.innerHTML = `
      <p style="color: #ff007f; font-weight: bold; padding: 1rem; border: 1px solid #ff007f; border-radius: 8px;">
        ⚠️ ERROR LOADING EVENTS<br><br>
        Please ensure you are running this app using a local server (e.g., Live Server in VS Code) rather than opening the HTML file directly.
      </p>
    `;
  }
});