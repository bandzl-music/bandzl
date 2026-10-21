// Bandzl MVP - App Logic (v0.1.3)
// Fetches external events.json dataset dynamically

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
    countHeader.style.fontWeight = "bold";
    countHeader.textContent = `${eventsData.length} Shows Found`;
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
          <a href="${event.ticket_url}" target="_blank" class="ticket-link">Tickets ↗</a>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.p("Failed to load events:", error);
    container.innerHTML = `<p style="color: red;">Error loading events. Ensure you are running via a local server (like Live Server in VS Code).</p>`;
  }
});