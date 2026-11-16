const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../js/app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

const newMapManager = `/* ==========================================================================
   1. 3D MAPLIBRE HIGHWAY ROUTE MAP CONTROLLER (AUTHENTIC 3D BIHAR ROADS)
   ========================================================================== */
class OneWayMapManager {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.originMarker = null;
    this.destMarker = null;
    this.cabMarker = null;
    this.lastRouteSignature = null;
    this.routePoints = [];
    this.debounceTimer = null;
    this.cabAnimTimer = null;
    this.isLoaded = false;
    this.queuedRoute = null;
  }

  initMap() {
    const el = document.getElementById(this.containerId);
    if (!el) return;

    if (typeof maplibregl === "undefined") {
      setTimeout(() => this.initMap(), 150);
      return;
    }

    try {
      this.map = new maplibregl.Map({
        container: this.containerId,
        style: {
          version: 8,
          sources: {
            'carto-tiles': {
              type: 'raster',
              tiles: [
                'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors, © CARTO'
            }
          },
          layers: [
            {
              id: 'carto-layer',
              type: 'raster',
              source: 'carto-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [85.1376, 25.5941], // Patna, Bihar
        zoom: 8.5,
        pitch: 58,    // 58° 3D Camera Tilt
        bearing: -15, // Real-world perspective
        attributionControl: false
      });

      this.map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');

      this.map.on('load', () => {
        this.isLoaded = true;
        if (this.queuedRoute) {
          const q = this.queuedRoute;
          this.queuedRoute = null;
          this._renderRoute(q.originCity, q.destCity, q.distanceKm);
        }
      });
    } catch (e) {
      console.error("MapLibre init error:", e);
    }
  }

  refreshSize() {
    if (this.map && typeof this.map.resize === "function") {
      this.map.resize();
    }
  }

  getHighwayCorridorName(originCity, destCity) {
    const o = (originCity.name || "").toLowerCase();
    const d = (destCity.name || "").toLowerCase();
    const combined = o + " " + d;

    if (combined.includes("gaya") || combined.includes("bodhgaya") || combined.includes("jehanabad")) {
      return "NH-83 4-Lane Expressway";
    }
    if (combined.includes("muzaffarpur") || combined.includes("darbhanga") || combined.includes("madhubani") || combined.includes("sitamarhi")) {
      return "NH-22 & NH-27 via Gandhi Setu";
    }
    if (combined.includes("bhagalpur") || combined.includes("munger") || combined.includes("begusarai")) {
      return "NH-31 Ganga Expressway Corridor";
    }
    if (combined.includes("chapra") || combined.includes("siwan") || combined.includes("gopalganj")) {
      return "NH-531 Saran Highway & Setu";
    }
    if (combined.includes("purnia") || combined.includes("katihar") || combined.includes("saharsa")) {
      return "NH-31 / NH-27 Kosi East-West Corridor";
    }
    if (combined.includes("sasaram") || combined.includes("buxar") || combined.includes("dehri")) {
      return "NH-922 / NH-19 GT Expressway";
    }
    if (combined.includes("airport")) {
      return "Patna Airport Express Road";
    }
    return "Bihar State Highway Network";
  }

  updateRoute(originCity, destCity, distanceKm) {
    if (!originCity || !destCity || !originCity.lat || !destCity.lat) return;

    // Reveal route map section
    const mapSection = document.getElementById("route-map-section");
    if (mapSection) {
      mapSection.classList.remove("fare-section-closed");
      mapSection.classList.add("fare-section-open");
    }

    const signature = originCity.lat.toFixed(3) + "_" + originCity.lng.toFixed(3) + "_" + destCity.lat.toFixed(3) + "_" + destCity.lng.toFixed(3) + "_" + distanceKm;
    if (this.lastRouteSignature === signature) return;
    this.lastRouteSignature = signature;

    if (!this.map || !this.isLoaded) {
      this.queuedRoute = { originCity, destCity, distanceKm };
      return;
    }

    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this._renderRoute(originCity, destCity, distanceKm);
    }, 80);
  }

  _renderRoute(originCity, destCity, distanceKm) {
    if (!this.map) return;

    const oLat = originCity.lat;
    const oLng = originCity.lng;
    const dLat = destCity.lat;
    const dLng = destCity.lng;

    // 1. Get authentic highway coordinates
    let coords = [];
    if (typeof window.getRoadCorridor === "function") {
      const match = window.getRoadCorridor(originCity, destCity);
      if (match && match.coordinates && match.coordinates.length > 5) {
        // match.coordinates is [lat, lng] array -> convert to [lng, lat] for MapLibre
        coords = match.coordinates.map(pt => [pt[1], pt[0]]);
      }
    }

    // Fallback: smooth highway curve if not directly in pre-embedded routes
    if (!coords || coords.length === 0) {
      const pts = 25;
      const dx = dLng - oLng;
      const dy = dLat - oLat;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const curveOffset = Math.sin(Math.atan2(dy, dx)) * 0.04 * (dist > 1.2 ? 1 : 0.5);

      for (let i = 0; i <= pts; i++) {
        const t = i / pts;
        const curLat = oLat + dy * t + Math.sin(t * Math.PI) * curveOffset;
        const curLng = oLng + dx * t + Math.sin(t * Math.PI) * (curveOffset * 0.5);
        coords.push([curLng, curLat]);
      }
    }

    this.routePoints = coords;

    // 2. Add or update GeoJSON route sources and layers
    const geojsonData = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coords
      }
    };

    if (this.map.getSource('route-source')) {
      this.map.getSource('route-source').setData(geojsonData);
    } else {
      this.map.addSource('route-source', {
        type: 'geojson',
        data: geojsonData
      });

      // Neon Emerald Glow Layer
      this.map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#059669',
          'line-width': 10,
          'line-opacity': 0.38,
          'line-blur': 4
        }
      });

      // Sharp Core Route Line
      this.map.addLayer({
        id: 'route-core',
        type: 'line',
        source: 'route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#10B981',
          'line-width': 4.5,
          'line-opacity': 0.95
        }
      });
    }

    // 3. Pickup Marker (Green Pill)
    if (this.originMarker) this.originMarker.remove();
    const pEl = document.createElement('div');
    pEl.innerHTML = '<div style="background: #10B981; color: #FFFFFF; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 8px; box-shadow: 0 4px 14px rgba(16,185,129,0.45); display: flex; align-items: center; gap: 5px; white-space: nowrap; border: 1.5px solid #FFFFFF;"><span>📍</span> ' + (originCity.name || 'Pickup') + '</div>';
    this.originMarker = new maplibregl.Marker({ element: pEl, anchor: 'bottom' })
      .setLngLat([oLng, oLat])
      .addTo(this.map);

    // 4. Drop Marker (Amber / Red Pill)
    if (this.destMarker) this.destMarker.remove();
    const dEl = document.createElement('div');
    dEl.innerHTML = '<div style="background: #F59E0B; color: #0F172A; font-size: 11px; font-weight: 800; padding: 5px 10px; border-radius: 8px; box-shadow: 0 4px 14px rgba(245,158,11,0.45); display: flex; align-items: center; gap: 5px; white-space: nowrap; border: 1.5px solid #FFFFFF;"><span>🎯</span> ' + (destCity.name || 'Drop') + '</div>';
    this.destMarker = new maplibregl.Marker({ element: dEl, anchor: 'bottom' })
      .setLngLat([dLng, dLat])
      .addTo(this.map);

    // 5. Animated 3D Cab Marker driving along the corridor
    if (this.cabMarker) this.cabMarker.remove();
    if (this.cabAnimTimer) clearInterval(this.cabAnimTimer);

    const cabEl = document.createElement('div');
    cabEl.innerHTML = '<div style="width: 32px; height: 32px; background: #0F172A; border: 2px solid #F59E0B; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.6); font-size: 16px; transition: transform 0.15s linear;">🚖</div>';
    this.cabMarker = new maplibregl.Marker({ element: cabEl, anchor: 'center' })
      .setLngLat(coords[0])
      .addTo(this.map);

    let progressIndex = 0;
    const totalPts = coords.length;
    this.cabAnimTimer = setInterval(() => {
      progressIndex = (progressIndex + 1) % totalPts;
      const curPt = coords[progressIndex];
      const nextPt = coords[(progressIndex + 1) % totalPts];
      if (this.cabMarker) {
        this.cabMarker.setLngLat(curPt);
        const heading = Math.atan2(nextPt[0] - curPt[0], nextPt[1] - curPt[1]) * (180 / Math.PI);
        const inner = cabEl.querySelector('div');
        if (inner) inner.style.transform = 'rotate(' + (heading - 90) + 'deg)';
      }
    }, 180);

    // 6. Smooth 3D Camera Flight
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    coords.forEach(pt => {
      if (pt[0] < minLng) minLng = pt[0];
      if (pt[0] > maxLng) maxLng = pt[0];
      if (pt[1] < minLat) minLat = pt[1];
      if (pt[1] > maxLat) maxLat = pt[1];
    });

    this.map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
      padding: { top: 60, bottom: 60, left: 50, right: 50 },
      pitch: 58,    // 58° 3D Tilt
      bearing: -15, // Real-world perspective
      duration: 1800,
      essential: true
    });

    // 7. Update UI Stats
    this.updateStats(originCity, destCity, distanceKm);
  }

  updateStats(originCity, destCity, distanceKm) {
    const originEl = document.getElementById("route-text-origin");
    const destEl = document.getElementById("route-text-dest");
    const highwayEl = document.getElementById("route-text-highway");
    const distEl = document.getElementById("map-stat-dist");
    const timeEl = document.getElementById("map-stat-time");

    const highwayName = this.getHighwayCorridorName(originCity, destCity);

    if (originEl) originEl.textContent = originCity.name;
    if (destEl) destEl.textContent = destCity.name;
    if (highwayEl) highwayEl.textContent = "via " + highwayName;
    if (distEl) distEl.textContent = (distanceKm || 120) + " km";

    const estHours = Math.floor((distanceKm || 120) / 45);
    const estMins = Math.round((((distanceKm || 120) % 45) / 45) * 60);
    const timeStr = (estHours > 0 ? estHours + "h " : "") + estMins + "m";
    if (timeEl) timeEl.textContent = "~" + timeStr;
  }
}`;

const oldManagerRegex = /\/\* ==========================================================================\s*1\. LEAFLET HIGHWAY ROUTE MAP CONTROLLER[\s\S]*?updateStats\([^{]*\{[\s\S]*?\}\s*\}/;

if (!oldManagerRegex.test(content)) {
  console.error("Could not find old OneWayMapManager pattern");
  process.exit(1);
}

content = content.replace(oldManagerRegex, newMapManager);
fs.writeFileSync(appJsPath, content, 'utf8');
console.log("Successfully replaced OneWayMapManager in js/app.js with 3D MapLibre Engine!");

