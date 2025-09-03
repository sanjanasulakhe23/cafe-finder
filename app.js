// Initialize map
const map = L.map("map").setView([12.9716, 77.5946], 14); // Default: Bangalore

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

let markers = [];

// Fetch cafes using Overpass API (OpenStreetMap)
async function getCafes(lat, lon) {
  const query = `
    [out:json];
    node["amenity"="cafe"](around:1500,${lat},${lon});
    out;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const response = await fetch(url);
  const data = await response.json();
  return data.elements;
}

// Load cafes on map and sidebar
async function loadCafes(lat, lon) {
  // Clear existing markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const cafes = await getCafes(lat, lon);
  const cafeList = document.getElementById("cafeList");
  cafeList.innerHTML = "";

  cafes.forEach(cafe => {
    const name = cafe.tags.name || "Unnamed Cafe";
    const addr = cafe.tags["addr:street"] || "No address";
    const rating = (Math.random() * (5 - 3) + 3).toFixed(1); // Random rating for demo

    // Create a colorful circular DivIcon
    const markerIcon = L.divIcon({
      className: 'custom-pin',
      html: `<div class="pin"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 20],
      popupAnchor: [0, -20]
    });

    const marker = L.marker([cafe.lat, cafe.lon], { icon: markerIcon }).addTo(map);
    marker.bindPopup(`<b>${name}</b><br>${addr}<br>⭐ ${rating}/5`);
    markers.push(marker);

    // Sidebar card
    const card = document.createElement("div");
    card.className = "cafe-card";
    card.innerHTML = `
      <h4>${name}</h4>
      <p>${addr}</p>
      <p class="rating">⭐ ${rating}/5</p>
      <a href="#" target="_blank">View Menu</a>
    `;
    card.addEventListener("mouseover", () => marker.openPopup());
    cafeList.appendChild(card);
  });
}

// Search location using Nominatim (OpenStreetMap)
async function searchLocation() {
  const place = document.getElementById("locationInput").value;
  if (!place) return;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.length > 0) {
    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);
    map.setView([lat, lon], 14);
    loadCafes(lat, lon);
  }
}

// Load default cafes on page load
loadCafes(12.9716, 77.5946);
