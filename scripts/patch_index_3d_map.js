const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Replace Leaflet CSS with MapLibre GL CSS
html = html.replace(
  /<!-- Leaflet CSS for Interactive Map[\s\S]*?<\/noscript>/,
  `<!-- MapLibre GL CSS for Authentic 3D Interactive Map -->\n  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />`
);

// 2. Remove style="display: none !important;" from #route-map-section so .fare-section-closed / .fare-section-open work
html = html.replace(
  '<section class="app-section alt-bg fare-section-closed" id="route-map-section" style="display: none !important;">',
  '<section class="app-section alt-bg fare-section-closed" id="route-map-section">'
);

// 3. Replace Leaflet JS with MapLibre GL JS + bihar-road-corridors.js
html = html.replace(
  /<script src="https:\/\/unpkg\.com\/leaflet[\s\S]*?<\/script>/,
  `<!-- MapLibre GL JS for 3D Edge CDN Rendering -->\n  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js" defer></script>\n  <!-- Authentic Bihar Highway Corridors Database -->\n  <script src="/js/bihar-road-corridors.js" defer></script>`
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully patched index.html with MapLibre GL 3D Map and Bihar Corridors!');

