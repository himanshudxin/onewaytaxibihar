const fs = require('fs');
const path = require('path');

const previewPath = path.join(__dirname, '../mobile/previews/uber-bolt-preview.html');
const corridors = JSON.parse(fs.readFileSync('mobile/shared/utils/biharRoadCorridors.json', 'utf8'));

let html = fs.readFileSync(previewPath, 'utf8');

// 1. Ensure MapLibre is in <head>
if (!html.includes('https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.js')) {
  html = html.replace(
    '<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.css" />\n  <script src="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.js"></script>'
  );
  html = html.replace('<script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>', '');
}

// 2. Fix corrupted emoji characters in the markup
html = html.replace(/dYZ/g, '🎲');
html = html.replace(/\^'/g, '−');
html = html.replace(/ >/g, '⛶');
html = html.replace(/~?,\?/g, '🌓');
html = html.replace(/dY"\?/g, '📍');
html = html.replace(/dYs-/g, '🚗');
html = html.replace(/dYs /g, '🚕');
html = html.replace(/dYs~/g, '🏎️');

// 3. Replace the entire map initialization and routing script section
const scriptStartMarker = '// Live 3D MapLibre Vector Route Map Engine';
const scriptEndMarker = 'function recenterPreviewMap()';

const startIdx = html.indexOf(scriptStartMarker);
const endIdx = html.indexOf(scriptEndMarker);

console.log('startIdx:', startIdx, 'endIdx:', endIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const before = html.substring(0, startIdx);
  const after = html.substring(endIdx);

  const newMapLogic = `// Live 3D MapLibre Vector Route Map Engine
    var pMap = null;
    var pPickupMarker = null;
    var pDropMarker = null;
    var pCabMarkers = [];
    var pCurrentRoadCoords = null;
    var currentOriginCity = 'patna';
    var currentDestCity = 'gaya';

    var BIHAR_CORRIDORS = ${JSON.stringify(corridors)};

    var cityCoords = {
      patna: [85.1376, 25.5941],
      gaya: [85.0002, 24.7955],
      muzaffarpur: [85.3647, 26.1209],
      darbhanga: [85.8918, 26.1542],
      bhagalpur: [86.9842, 25.2425],
      begusarai: [86.1272, 25.4182],
      varanasi: [82.9739, 25.3176],
      purnea: [87.4753, 25.7771],
      siwan: [84.3567, 26.2196]
    };

    function getCorridor(orig, dest) {
      if (!orig || !dest) return null;
      var oKey = orig.toLowerCase().replace(/[^a-z]/g, '');
      var dKey = dest.toLowerCase().replace(/[^a-z]/g, '');

      for (var k in BIHAR_CORRIDORS) {
        var parts = k.split('_to_');
        if ((oKey.indexOf(parts[0]) !== -1 || parts[0].indexOf(oKey) !== -1) &&
            (dKey.indexOf(parts[1]) !== -1 || parts[1].indexOf(dKey) !== -1)) {
          return BIHAR_CORRIDORS[k];
        }
      }
      for (var k in BIHAR_CORRIDORS) {
        var parts = k.split('_to_');
        if ((dKey.indexOf(parts[0]) !== -1 || parts[0].indexOf(dKey) !== -1) &&
            (oKey.indexOf(parts[1]) !== -1 || parts[1].indexOf(oKey) !== -1)) {
          var m = BIHAR_CORRIDORS[k];
          return {
            distanceKm: m.distanceKm,
            durationMin: m.durationMin,
            coordinates: m.coordinates.slice().reverse()
          };
        }
      }
      return null;
    }

    function initPreviewMap() {
      if (!window.maplibregl || !document.getElementById('preview-live-map')) {
        setTimeout(initPreviewMap, 150);
        return;
      }
      if (pMap) return;

      var isLight = document.body.classList.contains('light-mode');
      var styleUrl = isLight 
        ? 'https://tiles.openfreemap.org/styles/liberty'
        : 'https://tiles.openfreemap.org/styles/dark';

      var p = cityCoords.patna;
      var d = cityCoords.gaya;
      var cLng = (p[0] + d[0]) / 2;
      var cLat = (p[1] + d[1]) / 2;

      pMap = new maplibregl.Map({
        container: 'preview-live-map',
        style: styleUrl,
        center: [cLng, cLat],
        zoom: 10,
        pitch: 58,
        bearing: -16,
        antialias: true,
        attributionControl: false
      });

      pMap.on('load', function() {
        pMap.resize();

        // Get Highway Road Coordinates
        var corridor = getCorridor(currentOriginCity, currentDestCity);
        var coords = corridor ? corridor.coordinates : [p, d];
        pCurrentRoadCoords = coords;

        pMap.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': coords
            }
          }
        });

        // 3D Glowing Road Layers
        pMap.addLayer({
          'id': 'route-glow',
          'type': 'line',
          'source': 'route',
          'layout': { 'line-join': 'round', 'line-cap': 'round' },
          'paint': {
            'line-color': '#F59E0B',
            'line-width': 10,
            'line-opacity': 0.38,
            'line-blur': 5
          }
        });

        pMap.addLayer({
          'id': 'route-core',
          'type': 'line',
          'source': 'route',
          'layout': { 'line-join': 'round', 'line-cap': 'round' },
          'paint': {
            'line-color': '#F59E0B',
            'line-width': 4.8,
            'line-opacity': 0.95
          }
        });

        fitMapToCoordinates(coords);
        drivePreviewCabs(coords);

        if (corridor) {
          updateRouteBadgeText(corridor.distanceKm, corridor.durationMin);
        }
      });

      // 3D Pickup Pin
      var pEl = document.createElement('div');
      pEl.innerHTML = '<div style="width:26px;height:26px;border-radius:13px;background:rgba(16,185,129,0.32);border:2.5px solid #10B981;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px #10B981;cursor:pointer;"><div style="width:9px;height:9px;border-radius:5px;background:#fff;"></div></div>';
      pPickupMarker = new maplibregl.Marker({ element: pEl, draggable: true }).setLngLat(p).addTo(pMap);
      
      pPickupMarker.on('dragend', function() {
        var lngLat = pPickupMarker.getLngLat();
        document.getElementById('disp-origin').textContent = 'Custom Pickup';
        document.getElementById('disp-pickup-sub').textContent = 'Pinned at ' + lngLat.lat.toFixed(4) + ', ' + lngLat.lng.toFixed(4);
      });

      // 3D Drop Pin
      var dEl = document.createElement('div');
      dEl.innerHTML = '<div style="background:#F59E0B;color:#0F172A;font-size:11px;font-weight:900;padding:5px 10px;border-radius:8px;border:2px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,0.45);white-space:nowrap;display:flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span id="preview-drop-name">Gaya</span></div>';
      pDropMarker = new maplibregl.Marker({ element: dEl, anchor: 'bottom' }).setLngLat(d).addTo(pMap);

      pMap.on('click', function(e) {
        pPickupMarker.setLngLat(e.lngLat);
        document.getElementById('disp-origin').textContent = 'Custom Pickup';
        document.getElementById('disp-pickup-sub').textContent = 'Pinned at ' + e.lngLat.lat.toFixed(4) + ', ' + e.lngLat.lng.toFixed(4);
      });
    }

    function updateRouteBadgeText(distKm, durationMin) {
      var badge = document.querySelector('.route-card-dist');
      if (badge) {
        badge.textContent = distKm + ' km • ~' + durationMin + 'm';
      }
    }

    function fitMapToCoordinates(coords) {
      if (!pMap || !coords || coords.length === 0) return;
      var bounds = new maplibregl.LngLatBounds();
      for (var i = 0; i < coords.length; i += Math.max(1, Math.floor(coords.length / 30))) {
        bounds.extend(coords[i]);
      }
      bounds.extend(coords[0]);
      bounds.extend(coords[coords.length - 1]);
      pMap.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 45, right: 45 },
        pitch: 58,
        bearing: -16,
        duration: 900
      });
    }

    function drivePreviewCabs(coords) {
      if (!pMap || !coords || coords.length < 5) return;
      var cabSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';

      pCabMarkers.forEach(function(m) { m.marker.remove(); });
      pCabMarkers = [];

      var indices = [
        Math.floor(coords.length * 0.15),
        Math.floor(coords.length * 0.45),
        Math.floor(coords.length * 0.72)
      ];

      indices.forEach(function(idx) {
        var pt = coords[idx];
        var el = document.createElement('div');
        el.style.cssText = 'width:26px;height:26px;border-radius:7px;background:#0B0F19;border:1.5px solid #F59E0B;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
        el.innerHTML = cabSvg;
        var marker = new maplibregl.Marker({ element: el }).setLngLat(pt).addTo(pMap);
        pCabMarkers.push({ marker: marker, idx: idx });
      });

      if (window.previewCabDriveInterval) clearInterval(window.previewCabDriveInterval);
      window.previewCabDriveInterval = setInterval(function() {
        pCabMarkers.forEach(function(item) {
          item.idx = (item.idx + 1) % coords.length;
          var nextPt = coords[item.idx];
          if (nextPt) item.marker.setLngLat(nextPt);
        });
      }, 1500);
    }

    function updateMapRoute(p, d, oName, dName) {
      if (oName) currentOriginCity = oName.toLowerCase();
      if (dName) currentDestCity = dName.toLowerCase();

      var corridor = getCorridor(currentOriginCity, currentDestCity);
      var coords = corridor ? corridor.coordinates : [p, d];
      pCurrentRoadCoords = coords;

      if (pPickupMarker) pPickupMarker.setLngLat(p);
      if (pDropMarker) {
        pDropMarker.setLngLat(d);
        var label = document.getElementById('preview-drop-name');
        if (label && dName) label.textContent = dName;
      }

      if (pMap && pMap.getSource('route')) {
        pMap.getSource('route').setData({
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': coords
          }
        });
        fitMapToCoordinates(coords);
        drivePreviewCabs(coords);
      }

      if (corridor) {
        updateRouteBadgeText(corridor.distanceKm, corridor.durationMin);
      }
    }

    function previewZoomIn() {
      if (pMap) pMap.zoomIn({ duration: 300 });
    }

    function previewZoomOut() {
      if (pMap) pMap.zoomOut({ duration: 300 });
    }

    var isPreview3D = true;
    function togglePreview3D() {
      if (!pMap) return;
      isPreview3D = !isPreview3D;
      pMap.easeTo({
        pitch: isPreview3D ? 58 : 0,
        bearing: isPreview3D ? -16 : 0,
        duration: 750
      });
      var lbl = document.getElementById('preview-3d-label');
      if (lbl) lbl.textContent = isPreview3D ? '3D VIEW' : '2D VIEW';
    }

    var isPreviewMapExpanded = false;
    function togglePreviewMapExpand() {
      var mapWrap = document.getElementById('preview-map-wrapper');
      var sheet = document.getElementById('preview-bottom-sheet');
      var btn = document.getElementById('preview-expand-btn');
      isPreviewMapExpanded = !isPreviewMapExpanded;

      if (isPreviewMapExpanded) {
        mapWrap.style.height = '74%';
        sheet.style.height = '26%';
        if (btn) btn.innerHTML = '&#9660;';
      } else {
        mapWrap.style.height = '50%';
        sheet.style.height = '53%';
        if (btn) btn.innerHTML = '&#9650;';
      }
      setTimeout(function() { if (pMap) pMap.resize(); }, 360);
    }

    `;

  html = before + newMapLogic + after;
  fs.writeFileSync(previewPath, html, 'utf8');
  console.log('Successfully rebuilt preview HTML with embedded Bihar road corridors!');
} else {
  console.error('Markers not found in preview HTML: startIdx =', startIdx, 'endIdx =', endIdx);
}
