// Bandzl PWA Client Logic (v0.6.0)

let eventsData = [];
let map;
let markersLayer;
let userLocation = { lat: 37.5485, lng: -121.9886 }; // Default: Fremont, CA

document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  await loadEvents();
  setupEventListeners();
});

// Initialize Leaflet Map centered on Fremont Area
function initMap() {
  map = L.map('map', { zoomControl: false }).setView([userLocation.lat, userLocation.lng], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  L.control.zoom({ position: 'topright' }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);
}

// Fetch events from events.json
async function loadEvents() {
  try {
    const response = await fetch('events.json');
    if (!response.ok) throw new Error('Failed to load events.json');
    eventsData = await response.json();
    renderEvents(eventsData);
    updateMapMarkers(eventsData);
  } catch (err) {
    console.error('Error loading events:', err);
    document.getElementById('events-container').innerHTML = '<p>Could not load events. Please check back later.</p>';
  }
}

// Haversine formula to calculate distance in miles
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
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
  container.innerHTML = '';

  if (events.length === 0) {
    container.innerHTML = '<p>No shows found matching your criteria.</p>';
    return;
  }

  events.forEach(event => {
    const dist = calculateDistance(userLocation.lat, userLocation.lng, event.lat, event.lng).toFixed(1);
    
    // Format start time nicely
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
        <span class="cost">${event.cost === 'Free' ? 'Free' : '$' + event.cost}</span>
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

    // Fixed "View on Map" interaction: Pans map, opens popup, and scrolls user view smoothly up to map
    const mapBtn = card.querySelector('.map-link-btn');
    mapBtn.addEventListener('click', () => {
      // Smoothly scroll user view up to the interactive map section
      document.querySelector('.map-section').scrollIntoView({ behavior: 'smooth' });

      // Pan map and open popup
      map.setView([event.lat, event.lng], 15, { animate: true });
      
      markersLayer.eachLayer(layer => {
        if (layer.getLatLng().lat === event.lat && layer.getLatLng().lng === event.lng) {
          layer.openPopup();
        }
      });
    });

    container.appendChild(card);
  });
}

// Update Leaflet map markers
function updateMapMarkers(events) {
  markersLayer.clearLayers();

  events.forEach(event => {
    const marker = L.marker([event.lat, event.lng]);
    marker.bindPopup(`<b>${event.venue_name}</b><br>${event.title}<br><em>${event.artist_name}</em>`);
    markersLayer.addLayer(marker);
  });
}

// Filter and Sort Event Logic
function filterAndSortEvents() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const activeFilterBtn = document.querySelector('.filter-btn.active');
  const filterType = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
  const sortType = document.getElementById('sort-select').value;

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
      // Check if event is Friday, Saturday, or Sunday
      const day = eventDate.getDay();
      return (day === 5 || day === 6 || day === 0);
    } else if (filterType === 'favorites') {
      // Find corresponding card in DOM marked as favorite
      const card = document.querySelector(`.event-card[data-id="${event.event_id}"]`);
      return card && card.querySelector('.fav-btn').textContent === '❤️';
    }

    return true; // 'all'
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
      const costA = a.cost === 'Free' ? 0 : parseFloat(a.cost);
      const costB = b.cost === 'Free' ? 0 : parseFloat(b.cost);
      return costA - costB;
    }
    return 0;
  });

  renderEvents(filtered);
  updateMapMarkers(filtered);
}

// Setup Event Listeners
function setupEventListeners() {
  // Search input change
  document.getElementById('search-input').addEventListener('input', filterAndSortEvents);

  // Filter buttons click
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterAndSortEvents();
    });
  });

  // Sort dropdown change
  document.getElementById('sort-select').addEventListener('change', filterAndSortEvents);

  // Riff Radar button action
  document.getElementById('riff-radar-btn').addEventListener('click', () => {
    alert('📡 Riff Radar scanning surrounding Fremont venues for live audio streams...');
  });
}