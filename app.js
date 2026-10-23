// Bandzl PWA Client Logic (v0.6.2 - Mobile Resilient & Auto-Cache Fallback)

let eventsData = [];
let map;
let markersLayer;
let userLocation = { lat: 37.5485, lng: -121.9886 }; // Default: Fremont, CA

// Generic fallback record shown only if events.json fails to load over the network
const fallbackEvents = [
  {
    "event_id": "evt-fallback-001",
    "title": "Unable to Load Events",
    "artist_name": "Network/Cache Fallback",
    "venue_name": "Bandzl Offline Mode",
    "address": "Fremont, CA",
    "lat": 37.5485,
    "lng": -121.9886,
    "start_time": new Date().toISOString(),
    "cost": "N/A",
    "vibe": "Notice",
    "ticket_url": "#",
    "ticket_label": "Retry Sync"
  }
];

document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadEvents();
  setupEventListeners();
});

// Initialize Leaflet Map centered on Fremont Area
function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  map = L.map('map', { zoomControl: false }).setView([userLocation.lat, userLocation.lng], 12);

  // Reliable OpenStreetMap production HTTPS tile server
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  // Recalculate tile sizing for mobile viewports
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 300);

  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });
}

// Fetch events from events.json with automatic local fallback
async function loadEvents() {
  try {
    const response = await fetch('events.json');
    if (!response.ok) throw new Error('Failed to load events.json');
    eventsData = await response.json();
  } catch (err) {
    console.warn('Network or CORS load failed, using fallback notification record:', err);
    eventsData = fallbackEvents;
  }
  
  renderEvents(eventsData);
  updateMapMarkers(eventsData);
}

// Haversine formula to calculate distance in miles
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Render event cards into single-column vertical stack
function renderEvents(events) {
  const container = document.getElementById('events-container');
  if (!container) return;
  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = '<p>No shows found matching your criteria.</p>';
    return;
  }

  events.forEach(event => {
    const dist = calculateDistance(userLocation.lat, userLocation.lng, event.lat, event.lng).toFixed(1);
    
    const eventDate = new Date(event.start_time);
    const dateFormatted = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const card = document.createElement('div');
    card.className = 'event-card';
    card.dataset.id = event.event_id;
    card.innerHTML = `
      <button class="fav-btn" aria-label="Save Event">🤍</button>
      <span class="vibe-badge">${event.vibe}</span>
      <h3>${event.title}</h3>
      <p class="artist-name"><strong>Artist:</strong> ${event.artist_name}</p>
      <p class="venue-info">📍 ${event.venue_name} <span class="distance-badge">(${dist} mi)</span></p>
      <div class="event-meta">
        <span>📅 ${dateFormatted}</span>
        <span class="cost">${event.cost === 'Free' ? 'Free' : (event.cost === 'N/A' ? 'N/A' : '$' + event.cost)}</span>
      </div>
      <div class="actions" style="margin-top: 0.8rem;">
        <button class="map-link-btn" data-lat="${event.lat}" data-lng="${event.lng}" data-venue="${event.venue_name}">View on Map</button>
        <a href="${event.ticket_url}" target="_blank" class="ticket-link">${event.ticket_label || 'Event Info'}</a>
      </div>
    `;

    // Favorite toggle button listener
    const favBtn = card.querySelector('.fav-btn');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      favBtn.textContent = favBtn.textContent === '🤍' ? '❤️' : '🤍';
      card.classList.toggle('highlighted');
    });

    // Fixed "View on Map" interaction
    const mapBtn = card.querySelector('.map-link-btn');
    mapBtn.addEventListener('click', () => {
      document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });

      if (map) {
        map.setView([event.lat, event.lng], 15, { animate: true });
        
        markersLayer.eachLayer(layer => {
          if (layer.getLatLng().lat === event.lat && layer.getLatLng().lng === event.lng) {
            layer.openPopup();
          }
        });
      }
    });

    container.appendChild(card);
  });
}

// Update Leaflet map markers
function updateMapMarkers(events) {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  events.forEach(event => {
    const marker = L.marker([event.lat, event.lng]);
    marker.bindPopup(`<b>${event.venue_name}</b><br>${event.title}<br><em>${event.artist_name}</em>`);
    markersLayer.addLayer(marker);
  });
}

// Filter and Sort Event Logic
function filterAndSortEvents() {
  const query = (document.getElementById('search-input')?.value || '').toLowerCase();
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  const filterType = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
  const sortType = document.getElementById('sort-select')?.value || 'date';

  let filtered = eventsData.filter(event => {
    const matchesQuery = event.title.toLowerCase().includes(query) ||
                         event.artist_name.toLowerCase().includes(query) ||
                         event.venue_name.toLowerCase().includes(query) ||
                         event.vibe.toLowerCase().includes(query);
    if (!matchesQuery) return false;

    const eventDate = new Date(event.start_time);
    const now = new Date();

    if (filterType === 'today') {
      return eventDate.toDateString() === now.toDateString();
    } else if (filterType === 'weekend') {
      const day = eventDate.getDay();
      return (day === 5 || day === 6 || day === 0);
    } else if (filterType === 'favorites') {
      const card = document.querySelector(`.event-card[data-id="${event.event_id}"]`);
      return card && card.querySelector('.fav-btn').textContent === '❤️';
    }

    return true;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (sortType === 'date') {
      return new Date(a.start_time) - new Date(b.start_time);
    } else if (sortType === 'distance') {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    } else if (sortType === 'cost') {
      const costA = a.cost === 'Free' || a.cost === 'N/A' ? 0 : parseFloat(a.cost);
      const costB = b.cost === 'Free' || b.cost === 'N/A' ? 0 : parseFloat(b.cost);
      return costA - costB;
    }
    return 0;
  });

  renderEvents(filtered);
  updateMapMarkers(filtered);
}

// Setup Event Listeners
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', filterAndSortEvents);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterAndSortEvents();
    });
  });

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.addEventListener('change', filterAndSortEvents);

  const radarBtn = document.getElementById('riff-radar-btn');
  if (radarBtn) {
    radarBtn.addEventListener('click', () => {
      alert('📡 Riff Radar scanning surrounding Fremont venues for live audio streams...');
    });
  }
}