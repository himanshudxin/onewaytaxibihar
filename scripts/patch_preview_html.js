const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../mobile/previews/uber-bolt-preview.html');
let html = fs.readFileSync(filePath, 'utf8');

// Normalize line breaks for matching
const isCrlf = html.includes('\r\n');
const normalizedHtml = html.replace(/\r\n/g, '\n');

const startMarker = "pMap.on('load', function() {";
const endMarker = "pMap.fitBounds(new maplibregl.LngLatBounds(p, d), {\n        padding: 30,\n        pitch: 58,\n        bearing: -18,\n        duration: 1000\n      });\n    }";

const startIndex = normalizedHtml.indexOf(startMarker);
const endIndex = normalizedHtml.indexOf(endMarker);

console.log('startIndex:', startIndex, 'endIndex:', endIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const before = normalizedHtml.substring(0, startIndex);
  const after = normalizedHtml.substring(endIndex + endMarker.length);

  const replacement = `pMap.on('load', function() {
        pMap.resize();
        // Setup initial GeoJSON route source and 3D glowing layers
        pMap.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': { 'type': 'LineString', 'coordinates': [p, d] }
          }
        });

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

        // Fetch real highway driving route from OSRM
        fetchPreviewRoadRoute(p, d);
      });

      // 3D Pickup Pin
      var pEl = document.createElement('div');
      pEl.innerHTML = '<div style="width:26px;height:26px;border-radius:13px;background:rgba(16,185,129,0.3);border:2.5px solid #10B981;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px #10B981;cursor:pointer;"><div style="width:9px;height:9px;border-radius:5px;background:#fff;"></div></div>';
      pPickupMarker = new maplibregl.Marker({ element: pEl, draggable: true }).setLngLat(p).addTo(pMap);
      pPickupMarker.on('dragend', function() {
        var lngLat = pPickupMarker.getLngLat();
        updateMapRoute([lngLat.lng, lngLat.lat], currentDestCoords || d);
        document.getElementById('disp-origin').textContent = 'Custom Pickup';
        document.getElementById('disp-pickup-sub').textContent = 'Pinned at ' + lngLat.lat.toFixed(4) + ', ' + lngLat.lng.toFixed(4);
      });

      pMap.on('click', function(e) {
        pPickupMarker.setLngLat(e.lngLat);
        updateMapRoute([e.lngLat.lng, e.lngLat.lat], currentDestCoords || d);
        document.getElementById('disp-origin').textContent = 'Custom Pickup';
        document.getElementById('disp-pickup-sub').textContent = 'Pinned at ' + e.lngLat.lat.toFixed(4) + ', ' + e.lngLat.lng.toFixed(4);
      });

      // 3D Drop Pin
      var dEl = document.createElement('div');
      dEl.innerHTML = '<div style="background:#F59E0B;color:#0F172A;font-size:11px;font-weight:900;padding:5px 10px;border-radius:8px;border:2px solid #fff;box-shadow:0 8px 18px rgba(0,0,0,0.45);white-space:nowrap;display:flex;align-items:center;gap:4px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg><span id="preview-drop-name">Gaya</span></div>';
      pDropMarker = new maplibregl.Marker({ element: dEl, anchor: 'bottom' }).setLngLat(d).addTo(pMap);

      // Cabs along road
      pCabMarkers = [];
    }

    var currentDestCoords = null;
    var currentRoadCoords = null;

    function fetchPreviewRoadRoute(p, d) {
      currentDestCoords = d;
      var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + p[0] + ',' + p[1] + ';' + d[0] + ',' + d[1] + '?overview=full&geometries=geojson';

      fetch(osrmUrl)
        .then(function(res) { return res.json(); })
        .then(function(json) {
          if (json && json.routes && json.routes.length > 0) {
            var coords = json.routes[0].geometry.coordinates;
            currentRoadCoords = coords;
            var distKm = (json.routes[0].distance / 1000).toFixed(1);
            var durationMin = Math.round(json.routes[0].duration / 60);

            var src = pMap.getSource('route');
            if (src) {
              src.setData({
                'type': 'Feature',
                'geometry': {
                  'type': 'LineString',
                  'coordinates': coords
                }
              });
            }

            // Fit highway bounds
            var bounds = new maplibregl.LngLatBounds();
            for (var i = 0; i < coords.length; i += Math.max(1, Math.floor(coords.length / 40))) {
              bounds.extend(coords[i]);
            }
            bounds.extend(p);
            bounds.extend(d);
            pMap.fitBounds(bounds, {
              padding: { top: 60, bottom: 60, left: 40, right: 40 },
              pitch: 58,
              bearing: -18,
              duration: 1100
            });

            console.log('Real road route loaded:', distKm + ' km', durationMin + ' min');
            drivePreviewCabs(coords);
          }
        })
        .catch(function(err) {
          console.warn('OSRM preview error, fallback:', err);
        });
    }

    function drivePreviewCabs(coords) {
      if (!coords || coords.length < 5) return;
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
        el.style.cssText = 'width:26px;height:26px;border-radius:8px;background:#0B0F19;border:1.5px solid #F59E0B;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
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
      }, 1600);
    }

    function updateMapRoute(p, d) {
      if (!pMap) return;
      if (pPickupMarker) pPickupMarker.setLngLat(p);
      if (pDropMarker) pDropMarker.setLngLat(d);
      fetchPreviewRoadRoute(p, d);
    }`;

  let finalHtml = before + replacement + after;
  if (isCrlf) {
    finalHtml = finalHtml.replace(/\n/g, '\r\n');
  }
  fs.writeFileSync(filePath, finalHtml, 'utf8');
  console.log('Successfully patched preview HTML with real highway road routing!');
} else {
  console.log('Markers not found');
}
