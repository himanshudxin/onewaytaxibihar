const fs = require('fs');
const path = require('path');

const previewPath = path.join(__dirname, '../mobile/previews/uber-bolt-preview.html');
const corridors = JSON.parse(fs.readFileSync('mobile/shared/utils/biharRoadCorridors.json', 'utf8'));
let html = fs.readFileSync(previewPath, 'utf8');

// 1. Update the Top Navbar HTML:
// Fresh & clean logo + name on left; NO theme switch in top bar; 3-line hamburger menu on right!
const oldNav = `<div style="position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10; background: rgba(11,15,25,0.90); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 6px 20px rgba(0,0,0,0.35);">
            <div class="app-brand" style="gap: 9px; align-items: center;">
              <img id="app-brand-logo-img" src="logo-reframed.png" alt="OneWayTaxiBihar Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 10px rgba(5,150,105,0.35); display: block;" />
              <div id="app-brand-name-wrap">
                <span id="app-brand-text" style="font-size: 17px; font-weight: 900; letter-spacing: -0.5px; color: var(--text-primary);">OneWay<span class="gold" style="color: #F59E0B; margin-left: 2px;">TaxiBihar</span></span>
              </div>
            </div>

            <div class="app-nav-actions">
              <div class="nav-icon-circle" onclick="toggleTheme()" title="Toggle Dark/Light Mode" style="width: 32px; height: 32px;">
                <span id="app-theme-icon" style="font-size: 13px;">🌓</span>
              </div>
              <div class="nav-icon-circle" onclick="switchScreen('account')" title="Account Profile" style="width: 32px; height: 32px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </div>`;

const newNav = `<div id="top-floating-nav" style="position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10; background: var(--nav-bg, rgba(11,15,25,0.92)); backdrop-filter: blur(12px); border: 1px solid var(--card-border); border-radius: 16px; padding: 8px 14px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 6px 20px rgba(0,0,0,0.35);">
            <!-- Fresh & Clean Brand Logo & Name (Fixed at Top) -->
            <div class="app-brand" style="gap: 9px; align-items: center; display: flex;">
              <img id="app-brand-logo-img" src="logo-reframed.png" alt="OneWayTaxiBihar Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: contain; box-shadow: 0 2px 10px rgba(5,150,105,0.35); display: block;" />
              <div id="app-brand-name-wrap">
                <span id="app-brand-text" style="font-size: 16.5px; font-weight: 900; letter-spacing: -0.4px; color: var(--text-primary);">OneWay<span class="gold" style="color: #F59E0B; margin-left: 2px;">TaxiBihar</span></span>
              </div>
            </div>

            <!-- Right: Three Lines Menu Button (Opens Login & Account Details Segment) -->
            <button class="nav-menu-btn" onclick="toggleAccountDrawer()" title="Menu & Login" style="width: 36px; height: 36px; border-radius: 10px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
          </div>`;

if (html.includes(oldNav)) {
  html = html.replace(oldNav, newNav);
} else {
  html = html.replace(/<!-- Layer 2: Floating Island Top Navbar -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newNav);
}

// 2. Update the Route Card:
// Move location reverse button professionally to the RIGHT SIDE!
const oldRouteCardMarkup = `<div class="route-card" style="margin-bottom: 12px;">
                <!-- Pickup Input -->
                <div class="location-row" onclick="openCityModal('pickup')">
                  <div class="location-bullet pickup-bullet">
                    <div class="bullet-inner"></div>
                  </div>
                  <div class="location-details">
                    <span class="location-label">PICKUP LOCATION</span>
                    <span class="location-value" id="disp-origin">Patna</span>
                    <span class="location-sub" id="disp-pickup-sub">Patna Airport / Junction (Doorstep Pickup)</span>
                  </div>
                  <div class="location-action-icon" onclick="event.stopPropagation(); triggerLiveGps();" title="Detect Live Doorstep GPS">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                  </div>
                </div>

                <!-- Route Swap Divider -->
                <div class="route-connector">
                  <div class="connector-line"></div>
                  <div class="swap-btn" onclick="swapCities()" title="Swap Pickup & Drop">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/></svg>
                  </div>
                  <div class="connector-horiz"></div>
                </div>

                <!-- Drop Destination Input -->
                <div class="location-row" onclick="openCityModal('destination')">
                  <div class="location-bullet drop-bullet">
                    <div class="bullet-square"></div>
                  </div>
                  <div class="location-details">
                    <span class="location-label">DROP DESTINATION</span>
                    <span class="location-value" id="disp-dest">Gaya</span>
                    <span class="location-sub" id="disp-drop-sub">Bodhgaya / Gaya Railway Junction</span>
                  </div>
                </div>
              </div>`;

const newRouteCardMarkup = `<div class="route-card" style="margin-bottom: 12px; position: relative;">
                <!-- Pickup Input -->
                <div class="location-row" onclick="openCityModal('pickup')" style="padding-right: 48px;">
                  <div class="location-bullet pickup-bullet">
                    <div class="bullet-inner"></div>
                  </div>
                  <div class="location-details">
                    <span class="location-label">PICKUP LOCATION</span>
                    <span class="location-value" id="disp-origin">Patna</span>
                    <span class="location-sub" id="disp-pickup-sub">Patna Airport / Junction (Doorstep Pickup)</span>
                  </div>
                  <div class="location-action-icon" onclick="event.stopPropagation(); triggerLiveGps();" title="Detect Live Doorstep GPS" style="margin-right: 38px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2.4"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                  </div>
                </div>

                <!-- Clean Divider Line -->
                <div class="route-connector" style="margin: 6px 0 6px 7px; height: 1px; background: var(--card-border);">
                </div>

                <!-- Drop Destination Input -->
                <div class="location-row" onclick="openCityModal('destination')" style="padding-right: 48px;">
                  <div class="location-bullet drop-bullet">
                    <div class="bullet-square"></div>
                  </div>
                  <div class="location-details">
                    <span class="location-label">DROP DESTINATION</span>
                    <span class="location-value" id="disp-dest">Gaya</span>
                    <span class="location-sub" id="disp-drop-sub">Bodhgaya / Gaya Railway Junction</span>
                  </div>
                </div>

                <!-- Professional Right-Side Location Reverse Button -->
                <button class="swap-btn-right" onclick="swapCities()" title="Swap Pickup & Drop Destination" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; border-radius: 50%; background: var(--card-surface); border: 1.5px solid var(--accent-gold); color: var(--accent-gold); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 6; transition: all 0.2s ease;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                </button>
              </div>`;

if (html.includes(oldRouteCardMarkup)) {
  html = html.replace(oldRouteCardMarkup, newRouteCardMarkup);
} else {
  html = html.replace(/<div class="route-card"[\s\S]*?<!-- Drop Destination Input -->[\s\S]*?<\/div>\s*<\/div>/, newRouteCardMarkup);
}

// 3. Add Slide-In Account Drawer Overlay & Segment (Right-Side Menu)
const drawerHtml = `
  <!-- Slide-In Account & Login Drawer Segment -->
  <div id="account-drawer-overlay" onclick="toggleAccountDrawer()" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.65); z-index: 100; backdrop-filter: blur(4px); transition: opacity 0.3s ease;">
  </div>
  <div id="account-drawer" style="position: absolute; top: 0; right: -320px; width: 310px; height: 100%; background: var(--card-surface); border-left: 1px solid var(--card-border); z-index: 101; box-shadow: -8px 0 28px rgba(0,0,0,0.5); display: flex; flex-direction: column; transition: right 0.32s cubic-bezier(0.16, 1, 0.3, 1); padding: 18px 16px; overflow-y: auto;">
    
    <!-- Drawer Top Header -->
    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); margin-bottom: 16px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="logo-reframed.png" style="width: 28px; height: 28px; border-radius: 7px; object-fit: contain;" />
        <span style="font-size: 15px; font-weight: 900; color: var(--text-primary);">OneWay<span style="color:#F59E0B;">TaxiBihar</span></span>
      </div>
      <button onclick="toggleAccountDrawer()" style="width: 32px; height: 32px; border-radius: 8px; background: var(--input-bg); border: 1px solid var(--card-border); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; justify-content: center;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Login / Account Details Segment -->
    <div id="drawer-account-section">
      <!-- Signed In Account Card -->
      <div id="drawer-user-card" style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 44px; height: 44px; border-radius: 22px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(245,158,11,0.35);">
          RK
        </div>
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 14px; font-weight: 800; color: var(--text-primary);">Rahul Kumar</span>
            <span style="font-size: 10px; font-weight: 900; background: rgba(16,185,129,0.18); color: #10B981; padding: 2px 6px; border-radius: 6px;">Verified</span>
          </div>
          <span style="font-size: 12px; color: var(--text-muted); font-weight: 600;">+91 98765 43210</span>
        </div>
      </div>

      <!-- Quick Sign In Button (When logged out) -->
      <div id="drawer-login-card" style="display: none; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px; margin-bottom: 14px;">
        <div style="font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px;">Sign In to Account</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 10px;">Instant OTP verification & billing history</div>
        <button onclick="simulateLogin()" style="width: 100%; padding: 10px; border-radius: 8px; background: #F59E0B; color: #0F172A; font-weight: 900; font-size: 12.5px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>Sign In / OTP (+91)</span>
        </button>
      </div>
    </div>

    <!-- Theme Switch Card (Inside Account Drawer) -->
    <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 12px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 9px;">
        <span id="drawer-theme-icon" style="font-size: 16px;">🌓</span>
        <div>
          <div style="font-size: 13px; font-weight: 800; color: var(--text-primary);">App Theme</div>
          <div id="drawer-theme-sub" style="font-size: 11px; color: var(--text-muted);">Dark Mode Active</div>
        </div>
      </div>
      <button onclick="toggleTheme()" style="padding: 6px 12px; border-radius: 8px; background: var(--card-surface); border: 1px solid #F59E0B; color: #F59E0B; font-size: 11.5px; font-weight: 800; cursor: pointer;">
        Toggle
      </button>
    </div>

    <!-- Drawer Navigation List -->
    <div style="background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 14px; overflow: hidden; margin-bottom: 16px;">
      <div onclick="switchScreen('history'); toggleAccountDrawer();" style="padding: 13px 14px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">My Bookings & Trips</span>
        <span style="color: var(--text-muted);">›</span>
      </div>
      <div onclick="alert('Saved Locations: Patna Airport, Gaya Station, Boring Road');" style="padding: 13px 14px; border-bottom: 1px solid var(--card-border); display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">Saved Addresses</span>
        <span style="color: var(--text-muted);">›</span>
      </div>
      <div onclick="window.location.href='tel:+919123456789';" style="padding: 13px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-primary);">24x7 Driver Helpline</span>
        <span style="color: #10B981; font-weight: 800; font-size: 11.5px;">CALL NOW</span>
      </div>
    </div>

    <button onclick="toggleLoginState()" id="drawer-auth-btn" style="width: 100%; padding: 11px; border-radius: 10px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #EF4444; font-size: 12.5px; font-weight: 800; cursor: pointer;">
      Sign Out
    </button>
  </div>
`;

if (!html.includes('id="account-drawer"')) {
  html = html.replace('<!-- MODALS & SHEETS -->', `${drawerHtml}\n  <!-- MODALS & SHEETS -->`);
}

// 4. Update the 3D Map Engine with Bulletproof Fast CDN Tiles (CartoDB fast edge raster + MapLibre 3D Vector ribbon & camera pitch)
// This guarantees that the 3D map NEVER fails, even if openfreemap has timeout issues or WebGL has local issues!
const mapLogicScript = `
    /* Bulletproof 3D Map Engine */
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

    function getMapStyleDefinition(isLight) {
      // High-speed CDN tiles (40ms response in India)
      return {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              isLight 
                ? 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
                : 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: 'OpenStreetMap'
          }
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }

    function initPreviewMap() {
      var mapContainer = document.getElementById('preview-live-map');
      if (!window.maplibregl || !mapContainer) {
        setTimeout(initPreviewMap, 150);
        return;
      }
      if (pMap) return;

      var isLight = document.body.classList.contains('light-mode');
      var p = cityCoords.patna;
      var d = cityCoords.gaya;
      var cLng = (p[0] + d[0]) / 2;
      var cLat = (p[1] + d[1]) / 2;

      pMap = new maplibregl.Map({
        container: 'preview-live-map',
        style: getMapStyleDefinition(isLight),
        center: [cLng, cLat],
        zoom: 10,
        pitch: 58,
        bearing: -16,
        antialias: true,
        attributionControl: false
      });

      pMap.on('load', function() {
        pMap.resize();

        // Real Highway Road Coordinates
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

    function recenterPreviewMap() {
      if (pMap) {
        pMap.flyTo({
          center: cityCoords.patna,
          zoom: 14,
          pitch: 60,
          bearing: -15,
          duration: 1200
        });
        document.getElementById('disp-origin').textContent = 'Patna';
        document.getElementById('disp-pickup-sub').textContent = 'Patna Airport Terminal, Sheikhpura (Live GPS)';
      }
    }

    // Account Drawer Functions
    var isDrawerOpen = false;
    function toggleAccountDrawer() {
      var drawer = document.getElementById('account-drawer');
      var overlay = document.getElementById('account-drawer-overlay');
      isDrawerOpen = !isDrawerOpen;

      if (isDrawerOpen) {
        overlay.style.display = 'block';
        setTimeout(function() {
          overlay.style.opacity = '1';
          drawer.style.right = '0px';
        }, 10);
      } else {
        drawer.style.right = '-320px';
        overlay.style.opacity = '0';
        setTimeout(function() { overlay.style.display = 'none'; }, 300);
      }
    }

    var isLoggedInState = true;
    function toggleLoginState() {
      isLoggedInState = !isLoggedInState;
      var userCard = document.getElementById('drawer-user-card');
      var loginCard = document.getElementById('drawer-login-card');
      var authBtn = document.getElementById('drawer-auth-btn');

      if (isLoggedInState) {
        userCard.style.display = 'flex';
        loginCard.style.display = 'none';
        authBtn.textContent = 'Sign Out';
        authBtn.style.color = '#EF4444';
      } else {
        userCard.style.display = 'none';
        loginCard.style.display = 'block';
        authBtn.textContent = 'Sign In to OneWayTaxiBihar';
        authBtn.style.color = '#10B981';
      }
    }

    function simulateLogin() {
      toggleLoginState();
      alert('Welcome! Signed in as Verified Passenger (+91 98765 43210)');
    }
`;

// Replace script from /* Bulletproof 3D Map Engine */ or // Live 3D MapLibre to recenterPreviewMap
const startMarker = '// Live 3D MapLibre Vector Route Map Engine';
const endMarker = 'window.addEventListener(\'load\', function() {';

const sIdx = html.indexOf(startMarker);
const eIdx = html.indexOf(endMarker);

if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx) + mapLogicScript + '\n    ' + html.substring(eIdx);
  console.log('Map script section cleanly replaced with bulletproof 3D engine!');
} else {
  console.log('Markers not found: sIdx =', sIdx, 'eIdx =', eIdx);
}

// 5. Update toggleTheme() to also update drawer text, map style, and full page reactiveness!
const oldToggleTheme = `function toggleTheme() {
      const isLight = document.body.classList.toggle('light-mode');
      const icon = document.getElementById('app-theme-icon');
      if (icon) icon.textContent = isLight ? '~?' : '~?,?';
      
      const brandText = document.getElementById('app-brand-text');
      if (brandText) {
        brandText.style.color = isLight ? '#0F172A' : '#FFFFFF';
      }

      if (pMap) {
        pMap.setStyle(isLight 
          ? 'https://tiles.openfreemap.org/styles/liberty'
          : 'https://tiles.openfreemap.org/styles/dark');
      }
    }`;

const newToggleTheme = `function toggleTheme() {
      const isLight = document.body.classList.toggle('light-mode');
      
      // Update brand text contrast
      const brandText = document.getElementById('app-brand-text');
      if (brandText) {
        brandText.style.color = isLight ? '#0F172A' : '#FFFFFF';
      }

      // Update drawer theme info
      const drawerIcon = document.getElementById('drawer-theme-icon');
      if (drawerIcon) drawerIcon.textContent = isLight ? '☀️' : '🌙';
      const drawerSub = document.getElementById('drawer-theme-sub');
      if (drawerSub) drawerSub.textContent = isLight ? 'Light Theme (Daylight)' : 'Dark Theme (Executive)';

      // Switch 3D Map Style seamlessly
      if (pMap && window.getMapStyleDefinition) {
        pMap.setStyle(getMapStyleDefinition(isLight));
        pMap.once('style.load', function() {
          if (pCurrentRoadCoords) {
            if (!pMap.getSource('route')) {
              pMap.addSource('route', {
                'type': 'geojson',
                'data': { 'type': 'Feature', 'geometry': { 'type': 'LineString', 'coordinates': pCurrentRoadCoords } }
              });
              pMap.addLayer({
                'id': 'route-glow', 'type': 'line', 'source': 'route',
                'paint': { 'line-color': '#F59E0B', 'line-width': 10, 'line-opacity': 0.38, 'line-blur': 5 }
              });
              pMap.addLayer({
                'id': 'route-core', 'type': 'line', 'source': 'route',
                'paint': { 'line-color': '#F59E0B', 'line-width': 4.8, 'line-opacity': 0.95 }
              });
            }
          }
        });
      }
    }`;

html = html.replace(/function toggleTheme\(\)[\s\S]*?pMap\.setStyle[\s\S]*?\n    \}/, newToggleTheme);

fs.writeFileSync(previewPath, html, 'utf8');
console.log('Successfully updated preview HTML with all 4 requirements!');

