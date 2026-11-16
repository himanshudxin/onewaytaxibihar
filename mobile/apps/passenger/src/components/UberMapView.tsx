import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { useTheme } from '../../../../shared/theme/ThemeContext';
import { getCityCoordinates, LatLng } from '../utils/biharGeo';
import { getRoadCorridorWithFallback, TollPlaza } from '../utils/biharRoadCorridors';
import { Crosshair, Plus, Minus, Layers, ShieldCheck } from 'lucide-react-native';

/**
 * GOOGLE MAPS API KEY CONFIGURATION:
 * Optional: Set in mobile/apps/passenger/app.json under extra.googleMapsApiKey
 * or pass via googleMapsApiKey prop.
 */
export const DEFAULT_GOOGLE_MAPS_KEY = '';

const SafeWebView = React.forwardRef<any, any>((props, ref) => {
  if (Platform.OS === 'web') {
    return (
      <iframe
        ref={ref}
        srcDoc={props.source?.html || ''}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: 'transparent',
        }}
      />
    );
  }
  const Comp: any = WebView;
  return <Comp ref={ref} {...props} />;
});

export interface LiveLocationData {
  lat: number;
  lng: number;
  heading?: number | null;
  speed?: number | null;
}

export interface UberMapViewProps {
  originCity: string;
  destinationCity?: string;
  originCoords?: LatLng;
  destinationCoords?: LatLng;
  liveUserLocation?: LiveLocationData;
  height?: number | string;
  interactive?: boolean;
  showNearbyCabs?: boolean;
  googleMapsApiKey?: string;
  zoomLevel?: number;
  onLocationSelected?: (coords: LatLng, address?: string) => void;
  onRouteCalculated?: (distanceKm: string, durationMin: number, tollsCount?: number, totalTolls?: number) => void;
  onRecenterPress?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

function extractCleanCity(cityOrAddress: string): string {
  if (!cityOrAddress) return '';
  const lower = cityOrAddress.toLowerCase().trim();
  const knownCities = [
    'patna', 'gaya', 'muzaffarpur', 'bhagalpur', 'darbhanga',
    'purnia', 'purnea', 'ara', 'arrah', 'begusarai', 'katihar', 'munger',
    'chhapra', 'bettiah', 'saharsa', 'sasaram', 'hajipur',
    'deoghar', 'ranchi', 'varanasi', 'gorakhpur', 'siliguri', 'kolkata', 'delhi'
  ];
  for (const c of knownCities) {
    if (lower.includes(c)) {
      if (c === 'arrah') return 'ara';
      if (c === 'purnea') return 'purnia';
      return c;
    }
  }
  return lower.split(',')[0].trim();
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hrs`;
}

export const UberMapView: React.FC<UberMapViewProps> = ({
  originCity,
  destinationCity,
  originCoords,
  destinationCoords,
  liveUserLocation,
  height = 360,
  interactive = true,
  showNearbyCabs = true,
  googleMapsApiKey,
  zoomLevel = 17,
  onLocationSelected,
  onRouteCalculated,
  onRecenterPress,
}) => {
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<any>(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [roadInfo, setRoadInfo] = useState<string | null>(null);
  const [tollInfo, setTollInfo] = useState<string | null>(null);

  const activeGmapsKey = (
    googleMapsApiKey ||
    (Constants?.expoConfig?.extra?.googleMapsApiKey as string) ||
    DEFAULT_GOOGLE_MAPS_KEY ||
    ''
  ).trim();

  const cleanOrigin = useMemo(() => extractCleanCity(originCity), [originCity]);
  const cleanDest = useMemo(() => extractCleanCity(destinationCity || ''), [destinationCity]);

  const origin = useMemo(() => {
    if (liveUserLocation && liveUserLocation.lat && liveUserLocation.lng) {
      return { lat: liveUserLocation.lat, lng: liveUserLocation.lng };
    }
    if (originCoords && originCoords.lat && originCoords.lng) {
      return originCoords;
    }
    return getCityCoordinates(cleanOrigin || 'patna') || { lat: 25.5941, lng: 85.1376 };
  }, [liveUserLocation, originCoords, cleanOrigin]);

  const dest = useMemo(() => {
    if (destinationCoords && destinationCoords.lat && destinationCoords.lng) {
      return destinationCoords;
    }
    if (cleanDest) {
      return getCityCoordinates(cleanDest);
    }
    return null;
  }, [destinationCoords, cleanDest]);

  const roadCorridor = useMemo(() => {
    if (!cleanOrigin && !origin) return null;
    if (!cleanDest && !dest) return null;
    return getRoadCorridorWithFallback(cleanOrigin, cleanDest, origin, dest);
  }, [cleanOrigin, cleanDest, origin, dest]);

  useEffect(() => {
    if (roadCorridor) {
      const durText = formatDuration(roadCorridor.durationMin);
      setRoadInfo(`${roadCorridor.distanceKm} km • ~${durText}`);

      if (roadCorridor.tolls && roadCorridor.tolls.length > 0) {
        setTollInfo(`${roadCorridor.tolls.length} FASTag Tolls (₹${roadCorridor.totalTollFastag || 0}) • 100% Included`);
      } else {
        setTollInfo(null);
      }

      if (onRouteCalculated) {
        onRouteCalculated(
          roadCorridor.distanceKm,
          roadCorridor.durationMin,
          roadCorridor.tolls?.length,
          roadCorridor.totalTollFastag
        );
      }
    } else if (!destinationCity) {
      setRoadInfo(null);
      setTollInfo(null);
    }
  }, [roadCorridor, destinationCity, onRouteCalculated]);

  const lastInjectedRef = useRef<{ lat: number; lng: number; heading?: number } | null>(null);

  // Inject live GPS coordinates continuously into WebView without reloading
  useEffect(() => {
    if (liveUserLocation && liveUserLocation.lat && liveUserLocation.lng) {
      const { lat, lng, heading, speed } = liveUserLocation;
      if (lastInjectedRef.current) {
        const dLat = Math.abs(lastInjectedRef.current.lat - lat);
        const dLng = Math.abs(lastInjectedRef.current.lng - lng);
        const dHead = Math.abs((lastInjectedRef.current.heading || 0) - (heading || 0));
        if (dLat < 0.00005 && dLng < 0.00005 && dHead < 5) {
          return;
        }
      }
      lastInjectedRef.current = { lat, lng, heading: heading ?? undefined };
      const script = `
        if (window.updateLiveUserLocation) {
          window.updateLiveUserLocation(${lat}, ${lng}, ${heading !== undefined && heading !== null ? heading : 'null'}, ${speed || 0});
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(script);
    }
  }, [liveUserLocation]);

  const htmlContent = useMemo(() => {
    const origLat = origin.lat;
    const origLng = origin.lng;
    const destLat = dest?.lat ?? null;
    const destLng = dest?.lng ?? null;
    const hasDest = Boolean(destLat !== null && destLng !== null);

    const safeCoordinates = roadCorridor?.coordinates || [];
    const safeDistText = roadCorridor ? `${roadCorridor.distanceKm} km` : '';
    const safeTolls: TollPlaza[] = roadCorridor?.tolls || [];

    const origDisplayName = (cleanOrigin || originCity || 'Pickup').toUpperCase();
    const destDisplayName = (cleanDest || destinationCity || 'Drop').toUpperCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" onerror="this.onerror=null;this.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js" onerror="this.onerror=null;this.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';"></script>
  <style>
    /* ========================================================================= */
    /* UI CUSTOMIZATION: Global Styles & Viewport (Clean 2D Flat - Zero 3D Tilt) */
    /* ========================================================================= */
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: ${isDark ? '#090D16' : '#F8FAFC'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    #map-viewport {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: ${isDark ? '#090D16' : '#F8FAFC'};
    }
    
    #map {
      position: absolute;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      transform: none !important;
      perspective: none !important;
      background: ${isDark ? '#090D16' : '#F8FAFC'};
    }

    /* Obsidian Dark Shader on 100% Free OpenStreetMap */
    ${isDark ? `
    #map:not(.satellite-mode) .leaflet-tile-pane,
    #native-tile-grid:not(.satellite-mode) {
      filter: invert(100%) hue-rotate(180deg) brightness(84%) contrast(95%) saturate(70%);
    }
    ` : ''}

    #native-tile-grid {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 1;
      pointer-events: none;
    }

    #fallback-canvas {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 2;
      pointer-events: none;
      background: transparent;
    }

    .leaflet-container {
      background: ${isDark ? '#090D16' : '#F8FAFC'};
      font-family: inherit;
    }

    /* ========================================================================= */
    /* LUXURY UBER LIVE MOVING GPS PIN & DIRECTIONAL BEAM                         */
    /* ========================================================================= */
    .uber-doorstep-pin {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      pointer-events: none;
      z-index: 100;
      transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1);
    }

    .uber-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: ${isDark ? 'rgba(11, 15, 25, 0.94)' : 'rgba(255, 255, 255, 0.96)'};
      border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)'};
      border-radius: 20px;
      padding: 5px 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      margin-bottom: 4px;
      backdrop-filter: blur(10px);
      white-space: nowrap;
    }

    .uber-pill-badge.drop-pill {
      border-color: ${isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.3)'};
    }

    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
    }

    .badge-dot.drop-dot {
      background: #EF4444;
      box-shadow: 0 0 8px #EF4444;
      border-radius: 2px;
    }

    .badge-label {
      font-size: 10px;
      font-weight: 800;
      color: #10B981;
      letter-spacing: 0.8px;
    }

    .badge-label.drop-label {
      color: #EF4444;
    }

    .badge-city {
      font-size: 10px;
      font-weight: 700;
      color: ${isDark ? '#F8FAFC' : '#0F172A'};
      letter-spacing: 0.4px;
    }

    .pin-beacon {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10B981;
      border: 3.5px solid #FFFFFF;
      box-shadow: 0 4px 12px rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 5;
    }

    .pin-beacon.drop-beacon {
      background: #EF4444;
    }

    .beacon-core {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #FFFFFF;
    }

    .pin-pointer {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #FFFFFF;
      margin-top: -1px;
      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
    }

    /* Directional Navigation Beam (oriented by live compass heading) */
    .nav-heading-beam {
      position: absolute;
      top: 10px;
      left: 50%;
      width: 0;
      height: 0;
      border-left: 14px solid transparent;
      border-right: 14px solid transparent;
      border-top: 34px solid rgba(16, 185, 129, 0.4);
      transform-origin: 50% 0%;
      pointer-events: none;
      filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
      transition: transform 0.4s ease-out;
      opacity: 0;
      z-index: 3;
    }

    /* Doorstep radar pulse ring (ONLY active when locating without destination) */
    .sonar-ring {
      position: absolute;
      bottom: -12px;
      left: 50%;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid rgba(16, 185, 129, 0.7);
      transform: translate(-50%, 50%);
      animation: uberSonar 2.2s infinite ease-out;
      pointer-events: none;
      z-index: 2;
    }

    .sonar-ring.ring-2 {
      animation-delay: 1.1s;
    }

    @keyframes uberSonar {
      0% {
        transform: translate(-50%, 50%) scale(0.35);
        opacity: 0.9;
      }
      100% {
        transform: translate(-50%, 50%) scale(2.2);
        opacity: 0;
      }
    }

    /* ========================================================================= */
    /* HIGHWAY TOLL PLAZAS & FASTAG MARKERS                                   */
    /* ========================================================================= */
    .toll-marker-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      cursor: pointer;
      z-index: 80;
    }

    .toll-marker-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: ${isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.98)'};
      border: 1px solid rgba(245, 158, 11, 0.6);
      border-radius: 14px;
      padding: 3px 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      white-space: nowrap;
      backdrop-filter: blur(8px);
    }

    .fastag-badge {
      background: #F59E0B;
      color: #0F172A;
      font-weight: 900;
      font-size: 8px;
      padding: 1px 4px;
      border-radius: 3px;
      letter-spacing: 0.5px;
    }

    .toll-title {
      font-size: 9px;
      font-weight: 700;
      color: ${isDark ? '#F8FAFC' : '#0F172A'};
    }

    .toll-cost {
      font-size: 9.5px;
      font-weight: 800;
      color: #10B981;
    }

    .toll-stem {
      width: 2px;
      height: 8px;
      background: #F59E0B;
      box-shadow: 0 0 6px rgba(245, 158, 11, 0.8);
      margin-top: -1px;
    }

    .toll-barrier-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #F59E0B;
      box-shadow: 0 0 6px #F59E0B;
    }

    .route-glow {
      filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
    }
  </style>
</head>
<body>
  <div id="map-viewport">
    <div id="map">
      <div id="native-tile-grid"></div>
    </div>
    <canvas id="fallback-canvas"></canvas>
  </div>

  <script>
    var activeGmapsKey = "${activeGmapsKey || ''}";
    var isDark = ${isDark ? 'true' : 'false'};
    var origin = { lat: ${origLat}, lng: ${origLng} };
    var hasDest = ${hasDest ? 'true' : 'false'};
    var dest = hasDest ? { lat: ${destLat}, lng: ${destLng} } : null;
    var corridorCoords = ${JSON.stringify(safeCoordinates)};
    var safeDistText = "${safeDistText}";
    var safeTolls = ${JSON.stringify(safeTolls)};
    var defaultZoom = ${zoomLevel || 17};
    var originCityName = "${origDisplayName}";
    var destCityName = "${destDisplayName}";

    var mapInstance = null;
    var gmapInstance = null;
    var isGoogleMapsActive = false;
    var routePolyline = null;
    var routeCasingLayer = null;
    var pickupMarker = null;
    var destMarker = null;
    var tollMarkers = [];
    var currentLayerType = 'street';
    var osmLayer = null;
    var satLayer = null;
    var isFollowingUser = true;

    // Calculate dynamic initial center & zoom
    var centerLat = origin.lat;
    var centerLng = origin.lng;
    var initialZoom = defaultZoom;

    if (hasDest && dest) {
      centerLat = (origin.lat + dest.lat) / 2;
      centerLng = (origin.lng + dest.lng) / 2;
      var maxDelta = Math.max(Math.abs(origin.lat - dest.lat), Math.abs(origin.lng - dest.lng));
      if (maxDelta > 6.0) initialZoom = 6;
      else if (maxDelta > 2.8) initialZoom = 7;
      else if (maxDelta > 1.4) initialZoom = 8;
      else if (maxDelta > 0.7) initialZoom = 9;
      else if (maxDelta > 0.35) initialZoom = 10;
      else initialZoom = 11;
    }

    // Suppress any Google Maps missing-key alerts
    window.gm_authFailure = function() {
      console.warn('Google Maps note: Using Free GIS engine.');
      isGoogleMapsActive = false;
      initLeafletMap();
    };

    // --- GOOGLE MAPS PLATFORM ENGINE (Optional) ---
    function initGoogleMaps() {
      var key = (activeGmapsKey || '').trim();
      return Boolean(key.length >= 20 && key.startsWith('AIza'));
    }

    function loadGoogleMapsSdk() {
      if (!initGoogleMaps()) return false;
      try {
        var s = document.createElement('script');
        s.src = 'https://maps.googleapis.com/maps/api/js?key=' + activeGmapsKey + '&libraries=places,geometry&callback=onGoogleMapsReady';
        s.async = true;
        s.defer = true;
        s.onerror = function() {
          initLeafletMap();
        };
        document.head.appendChild(s);
        return true;
      } catch (e) {
        return false;
      }
    }

    window.onGoogleMapsReady = function() {
      try {
        var mapEl = document.getElementById('map');
        if (!mapEl || !window.google || !google.maps) return;

        var darkStyles = [
          { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
          { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
          { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
          { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#f8fafc" }] },
          { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
          { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
          { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#059669" }] },
          { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#090d16" }] }
        ];

        gmapInstance = new google.maps.Map(mapEl, {
          center: { lat: centerLat, lng: centerLng },
          zoom: initialZoom,
          disableDefaultUI: true,
          styles: isDark ? darkStyles : []
        });

        isGoogleMapsActive = true;
        var nativeGrid = document.getElementById('native-tile-grid');
        if (nativeGrid) nativeGrid.style.display = 'none';

        pickupMarker = new google.maps.Marker({
          position: { lat: origin.lat, lng: origin.lng },
          map: gmapInstance,
          title: originCityName,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3
          }
        });

        if (hasDest && dest) {
          destMarker = new google.maps.Marker({
            position: { lat: dest.lat, lng: dest.lng },
            map: gmapInstance,
            title: destCityName,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#EF4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            }
          });

          var dirService = new google.maps.DirectionsService();
          var dirRenderer = new google.maps.DirectionsRenderer({
            map: gmapInstance,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#10B981',
              strokeWeight: 5,
              strokeOpacity: 0.95
            }
          });

          dirService.route({
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: dest.lat, lng: dest.lng },
            travelMode: google.maps.TravelMode.DRIVING
          }, function(res, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              dirRenderer.setDirections(res);
              var route = res.routes[0];
              if (route && route.legs && route.legs[0]) {
                var distKm = (route.legs[0].distance.value / 1000).toFixed(1);
                var durMin = Math.round(route.legs[0].duration.value / 60);
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ROUTE_CALCULATED',
                    distance: distKm,
                    duration: durMin
                  }));
                }
              }
            }
          });
        }
      } catch (err) {
        initLeafletMap();
      }
    };

    // --- 100% FREE OFFICIAL OPENSTREETMAP TILES (0ms Instant Render) ---
    function renderNativeSlippyTiles(lat, lng, zoom) {
      if (isGoogleMapsActive) return;
      var mapEl = document.getElementById('map');
      var tileGrid = document.getElementById('native-tile-grid');
      if (!mapEl || !tileGrid) return;

      var n = Math.pow(2, zoom);
      var xCenter = ((lng + 180) / 360) * n;
      var latRad = lat * Math.PI / 180;
      var yCenter = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;

      var cx = Math.floor(xCenter);
      var cy = Math.floor(yCenter);
      var offX = (xCenter - cx) * 256;
      var offY = (yCenter - cy) * 256;

      var w = mapEl.clientWidth || window.innerWidth || 360;
      var h = mapEl.clientHeight || 360;

      tileGrid.innerHTML = '';
      for (var tx = cx - 1; tx <= cx + 1; tx++) {
        for (var ty = cy - 1; ty <= cy + 1; ty++) {
          var img = document.createElement('img');
          img.src = 'https://tile.openstreetmap.org/' + zoom + '/' + tx + '/' + ty + '.png';
          img.style.position = 'absolute';
          img.style.width = '256px';
          img.style.height = '256px';
          img.style.left = ((w / 2) + (tx - cx) * 256 - offX) + 'px';
          img.style.top = ((h / 2) + (ty - cy) * 256 - offY) + 'px';
          tileGrid.appendChild(img);
        }
      }
    }

    function initLeafletMap() {
      if (isGoogleMapsActive) return;
      if (!window.L) {
        setTimeout(initLeafletMap, 150);
        return;
      }
      var mapEl = document.getElementById('map');
      if (!mapEl || mapInstance) return;

      try {
        mapInstance = L.map('map', {
          zoomControl: false,
          attributionControl: false,
          fadeAnimation: true
        }).setView([centerLat, centerLng], initialZoom);

        // Pause auto-follow when user manually drags the map
        mapInstance.on('dragstart', function() {
          isFollowingUser = false;
        });

        // 1. Street layer (OpenStreetMap)
        osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(mapInstance);

        // 2. High-res Satellite layer (ESRI World Imagery - Free & Crisp)
        satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 18
        });

        osmLayer.on('load', function() {
          var nativeGrid = document.getElementById('native-tile-grid');
          if (nativeGrid) nativeGrid.style.display = 'none';
        });

        // LUXURY UBER LIVE GPS MOVING PICKUP PIN
        var pickupHtml = '<div class="uber-doorstep-pin" id="uber-pickup-pin">' +
          '<div class="nav-heading-beam" id="nav-heading-beam"></div>' +
          '<div class="uber-pill-badge pickup-pill">' +
            '<span class="badge-dot pickup-dot"></span>' +
            '<span class="badge-label">PICKUP</span>' +
            '<span class="badge-city" id="pickup-city-label">' + originCityName + '</span>' +
          '</div>' +
          '<div class="pin-beacon pickup-beacon"><div class="beacon-core"></div></div>' +
          '<div class="pin-pointer"></div>' +
          (!hasDest ? '<div class="sonar-ring"></div><div class="sonar-ring ring-2"></div>' : '') +
          '</div>';

        var pickupIcon = L.divIcon({
          className: 'uber-custom-marker',
          html: pickupHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });
        pickupMarker = L.marker([origin.lat, origin.lng], { icon: pickupIcon, zIndexOffset: 1000 }).addTo(mapInstance);

        // LUXURY UBER DROP PIN & HIGHWAY ROUTE
        if (hasDest && dest) {
          var destHtml = '<div class="uber-doorstep-pin">' +
            '<div class="uber-pill-badge drop-pill">' +
              '<span class="badge-dot drop-dot"></span>' +
              '<span class="badge-label drop-label">DROP</span>' +
              '<span class="badge-city">' + destCityName + '</span>' +
            '</div>' +
            '<div class="pin-beacon drop-beacon"><div class="beacon-core drop"></div></div>' +
            '<div class="pin-pointer drop"></div>' +
            '</div>';

          var destIcon = L.divIcon({
            className: 'uber-custom-marker',
            html: destHtml,
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });
          destMarker = L.marker([dest.lat, dest.lng], { icon: destIcon, zIndexOffset: 900 }).addTo(mapInstance);

          fetchRouteAndDraw(origin, dest, corridorCoords);
          renderTollPlazas(safeTolls);
        }

        setTimeout(function() {
          if (mapInstance) mapInstance.invalidateSize();
        }, 150);
        setTimeout(function() {
          if (mapInstance) mapInstance.invalidateSize();
        }, 600);
      } catch (err) {
        console.warn('Leaflet init note:', err);
      }
    }

    // RENDER HIGHWAY TOLL PLAZAS ON MAP
    function renderTollPlazas(tolls) {
      if (!mapInstance || !tolls || tolls.length === 0) return;
      clearTollPlazas();

      tolls.forEach(function(toll) {
        var tollShortName = toll.name.replace(' Toll Plaza', '').replace(' Toll', '');
        var tollHtml = '<div class="toll-marker-container" title="' + toll.name + '">' +
          '<div class="toll-marker-pill">' +
            '<span class="fastag-badge">FASTag</span>' +
            '<span class="toll-title">' + tollShortName + '</span>' +
            '<span class="toll-cost">₹' + toll.fastagRate + '</span>' +
          '</div>' +
          '<div class="toll-stem"></div>' +
          '<div class="toll-barrier-dot"></div>' +
          '</div>';

        var tollIcon = L.divIcon({
          className: 'toll-custom-div-icon',
          html: tollHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        var m = L.marker([toll.lat, toll.lng], { icon: tollIcon, zIndexOffset: 400 }).addTo(mapInstance);
        tollMarkers.push(m);
      });
    }

    function clearTollPlazas() {
      tollMarkers.forEach(function(m) {
        if (mapInstance) mapInstance.removeLayer(m);
      });
      tollMarkers = [];
    }

    // LIVE GPS LOCATION SMOOTH MOTION & GLIDE
    window.updateLiveUserLocation = function(lat, lng, heading, speed) {
      if (!lat || !lng) return;
      origin.lat = lat;
      origin.lng = lng;

      // 1. Move Leaflet marker smoothly
      if (pickupMarker) {
        pickupMarker.setLatLng([lat, lng]);
      }
      if (gmapInstance && pickupMarker) {
        pickupMarker.setPosition({ lat: lat, lng: lng });
      }

      // 2. Adjust directional navigation beam
      var beamEl = document.getElementById('nav-heading-beam');
      if (beamEl) {
        if (heading !== null && heading !== undefined) {
          beamEl.style.transform = 'translate(-50%, -100%) rotate(' + heading + 'deg)';
          beamEl.style.opacity = '1';
        } else {
          beamEl.style.opacity = '0';
        }
      }

      // 3. Auto-follow camera if enabled and no destination
      if (isFollowingUser && !hasDest) {
        if (mapInstance) {
          mapInstance.panTo([lat, lng], { animate: true, duration: 0.8 });
        }
        if (gmapInstance) {
          gmapInstance.panTo({ lat: lat, lng: lng });
        }
      }
    };

    // Autonomous HTML5 geolocation watcher inside WebView
    if (navigator.geolocation && navigator.geolocation.watchPosition) {
      navigator.geolocation.watchPosition(function(pos) {
        if (pos && pos.coords) {
          var c = pos.coords;
          window.updateLiveUserLocation(
            c.latitude,
            c.longitude,
            c.heading,
            c.speed ? Math.round(c.speed * 3.6) : 0
          );
        }
      }, function() {}, { enableHighAccuracy: true, maximumAge: 1200, timeout: 5000 });
    }

    function fetchRouteAndDraw(orig, dst, corridorFallback) {
      // 1. Draw realistic highway corridor instantly (0ms) - Zero straight line waiting
      if (corridorFallback && corridorFallback.length > 1) {
        var initialPts = corridorFallback.map(function(c) { return [c[1], c[0]]; });
        drawRoadPolyline(initialPts);
      }

      // 2. Fetch OSRM in background for turn-by-turn road precision
      var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + 
        orig.lng + ',' + orig.lat + ';' + dst.lng + ',' + dst.lat + 
        '?overview=full&geometries=geojson';

      var ctrl = window.AbortController ? new AbortController() : null;
      var timeoutId = setTimeout(function() { if (ctrl) ctrl.abort(); }, 3500);

      fetch(osrmUrl, { cache: 'force-cache', signal: ctrl ? ctrl.signal : undefined })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          clearTimeout(timeoutId);
          if (data && data.routes && data.routes.length > 0) {
            var route = data.routes[0];
            var coords = route.geometry.coordinates.map(function(pt) {
              return [pt[1], pt[0]];
            });
            drawRoadPolyline(coords);

            var distKm = (route.distance / 1000).toFixed(1);
            var durMin = Math.round(route.duration / 60);
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ROUTE_CALCULATED',
                distance: distKm,
                duration: durMin
              }));
            }
          }
        })
        .catch(function(err) {
          // Corridor is already drawn! Zero straight lines will ever appear!
        });
    }

    function drawRoadPolyline(latLngs) {
      if (!mapInstance || !latLngs || latLngs.length === 0) return;

      if (routeCasingLayer) {
        mapInstance.removeLayer(routeCasingLayer);
      }
      if (routePolyline) {
        mapInstance.removeLayer(routePolyline);
      }

      // Layer 1: Dark Casing Glow (Uber Deep Highway Shadow)
      routeCasingLayer = L.polyline(latLngs, {
        color: isDark ? '#042F2E' : 'rgba(6, 78, 59, 0.45)',
        weight: 9,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstance);

      // Layer 2: Vibrant Electric Emerald Highway Core
      routePolyline = L.polyline(latLngs, {
        color: '#10B981',
        weight: 5,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'route-glow'
      }).addTo(mapInstance);

      // Frame the entire route with padding that respects the bottom sheet
      mapInstance.fitBounds(routePolyline.getBounds(), {
        paddingTopLeft: [45, 35],
        paddingBottomRight: [45, 190],
        maxZoom: 13,
        animate: true
      });
    }

    // Toggle between Clean Street & High-Res Satellite (Always Flat 2D - Zero 3D Tilt)
    window.toggleMapLayer = function(layerType) {
      currentLayerType = layerType;
      var mapEl = document.getElementById('map');
      if (layerType === 'satellite') {
        if (mapInstance && satLayer && osmLayer) {
          mapInstance.removeLayer(osmLayer);
          satLayer.addTo(mapInstance);
          if (mapEl) mapEl.classList.add('satellite-mode');
        }
        if (gmapInstance) {
          gmapInstance.setMapTypeId('satellite');
        }
      } else {
        if (mapInstance && satLayer && osmLayer) {
          mapInstance.removeLayer(satLayer);
          osmLayer.addTo(mapInstance);
          if (mapEl) mapEl.classList.remove('satellite-mode');
        }
        if (gmapInstance) {
          gmapInstance.setMapTypeId('roadmap');
        }
      }
    };

    window.zoomIn = function() {
      if (gmapInstance) gmapInstance.setZoom(gmapInstance.getZoom() + 1);
      else if (mapInstance) mapInstance.zoomIn();
    };

    window.zoomOut = function() {
      if (gmapInstance) gmapInstance.setZoom(gmapInstance.getZoom() - 1);
      else if (mapInstance) mapInstance.zoomOut();
    };

    window.flyToUserLocation = function(lat, lng) {
      isFollowingUser = true;
      if (gmapInstance) {
        gmapInstance.panTo({ lat: lat, lng: lng });
        gmapInstance.setZoom(defaultZoom);
      } else if (mapInstance) {
        mapInstance.flyTo([lat, lng], defaultZoom, { animate: true, duration: 1.2 });
      }
    };

    // --- CANVAS ROUTE OVERLAY (Clean transparent canvas - real routes rendered on roads) ---
    function renderInstantVectorRoute() {
      var canvas = document.getElementById('fallback-canvas');
      if (!canvas) return;
      var w = canvas.width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 360);
      var h = canvas.height = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 360);
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
    }

    // 1. Instantly load clean OpenStreetMap tiles correctly centered (0ms instant render)
    renderNativeSlippyTiles(centerLat, centerLng, initialZoom);
    renderInstantVectorRoute();

    // 2. Dual Engine Loader: Try Google Maps if key provided, otherwise Leaflet Free GIS
    var gmapsLoaded = loadGoogleMapsSdk();
    if (!gmapsLoaded) {
      initLeafletMap();
      setTimeout(initLeafletMap, 250);
      setTimeout(initLeafletMap, 800);
    }
  </script>
</body>
</html>`;
  }, [cleanOrigin, cleanDest, isDark, activeGmapsKey, zoomLevel, originCity, destinationCity, roadCorridor]);

  const handleToggleLayer = () => {
    const nextState = !isSatellite;
    setIsSatellite(nextState);
    const layerType = nextState ? 'satellite' : 'street';
    webViewRef.current?.injectJavaScript(`window.toggleMapLayer && window.toggleMapLayer('${layerType}'); true;`);
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript('window.zoomIn && window.zoomIn(); true;');
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript('window.zoomOut && window.zoomOut(); true;');
  };

  const handleRecenter = () => {
    if (origin.lat && origin.lng) {
      webViewRef.current?.injectJavaScript(`window.flyToUserLocation && window.flyToUserLocation(${origin.lat}, ${origin.lng}); true;`);
    }
    if (onRecenterPress) {
      onRecenterPress();
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ROUTE_CALCULATED' && onRouteCalculated) {
        onRouteCalculated(data.distance, data.duration);
        const durText = formatDuration(data.duration);
        setRoadInfo(`${data.distance} km • ~${durText}`);
      }
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={[styles.container, { height, borderColor: colors.border, backgroundColor: colors.surface }]}>
      <SafeWebView
        key={`uber-map-${isDark ? 'dark' : 'light'}-${cleanOrigin}-${cleanDest || 'doorstep'}`}
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        incognito={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        androidHardwareAccelerationDisabled={false}
        onMessage={handleMessage}
      />

      {/* Floating Route Intelligence Badges: Route Stats + FASTag Toll Guarantee */}
      <View style={styles.topBadgesContainer} pointerEvents="box-none">
        {roadInfo && (
          <View style={[styles.routeBadge, { backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)', borderColor: colors.border }]}>
            <View style={styles.liveDot} />
            <Text style={[styles.routeBadgeText, { color: colors.text }]}>{roadInfo}</Text>
          </View>
        )}

        {tollInfo && (
          <View style={[styles.tollBadge, { backgroundColor: isDark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)', borderColor: 'rgba(245, 158, 11, 0.45)' }]}>
            <ShieldCheck size={13} color="#F59E0B" strokeWidth={2.4} />
            <Text style={[styles.tollBadgeText, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>{tollInfo}</Text>
          </View>
        )}
      </View>

      {interactive && (
        <View style={styles.controlsColumn}>
          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: isSatellite ? colors.primary : colors.surface, borderColor: colors.border }]}
            onPress={handleToggleLayer}
            activeOpacity={0.8}
            accessibilityLabel="Toggle Satellite Layer"
          >
            <Layers size={16} color={isSatellite ? '#ffffff' : colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleRecenter}
            activeOpacity={0.8}
            accessibilityLabel="Recenter Location"
          >
            <Crosshair size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleZoomIn}
            activeOpacity={0.8}
            accessibilityLabel="Zoom In"
          >
            <Plus size={16} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleZoomOut}
            activeOpacity={0.8}
            accessibilityLabel="Zoom Out"
          >
            <Minus size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
    opacity: 0.99,
  },
  controlsColumn: {
    position: 'absolute',
    right: 14,
    bottom: 24,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  controlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  topBadgesContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  routeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  tollBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
