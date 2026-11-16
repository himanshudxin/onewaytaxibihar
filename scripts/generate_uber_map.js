const fs = require('fs');
const path = require('path');

function generateUberMapView(isShared) {
  const themeImport = isShared
    ? "import { useTheme } from '../theme/ThemeContext';"
    : "import { useTheme } from '../../../../shared/theme/ThemeContext';";

  return `import React, { useRef, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
${themeImport}
import { getCityCoordinates, LatLng } from '../utils/biharGeo';
import { Crosshair, Plus, Minus, Layers, Maximize2, Minimize2 } from 'lucide-react-native';

const SafeWebView: any = WebView;

export interface UberMapViewProps {
  originCity: string;
  destinationCity: string;
  originCoords?: LatLng;
  destinationCoords?: LatLng;
  height?: number | string;
  interactive?: boolean;
  showNearbyCabs?: boolean;
  onLocationSelected?: (coords: LatLng, address?: string) => void;
  onRouteCalculated?: (distanceKm: string, durationMin: number) => void;
  onRecenterPress?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

export const UberMapView: React.FC<UberMapViewProps> = ({
  originCity,
  destinationCity,
  originCoords,
  destinationCoords,
  height = 360,
  interactive = true,
  showNearbyCabs = true,
  onLocationSelected,
  onRouteCalculated,
  onRecenterPress,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { colors, isDark } = useTheme();
  const webViewRef = useRef<any>(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [roadInfo, setRoadInfo] = useState<string | null>(null);

  const pickup = useMemo(() => {
    if (originCoords && originCoords.lat && originCoords.lng) return originCoords;
    return getCityCoordinates(originCity);
  }, [originCity, originCoords]);

  const drop = useMemo(() => {
    if (destinationCoords && destinationCoords.lat && destinationCoords.lng) return destinationCoords;
    return getCityCoordinates(destinationCity);
  }, [destinationCity, destinationCoords]);

  const htmlContent = useMemo(() => {
    const pLat = pickup?.lat || 25.5941;
    const pLng = pickup?.lng || 85.1376;
    const dLat = drop?.lat || 24.7914;
    const dLng = drop?.lng || 85.0002;
    const cLat = (pLat + dLat) / 2;
    const cLng = (pLng + dLng) / 2;

    const styleUrl = isDark
      ? 'https://tiles.openfreemap.org/styles/dark'
      : 'https://tiles.openfreemap.org/styles/liberty';

    const bgCanvas = isDark ? '#0B0F19' : '#F8FAFC';
    const primaryAmber = '#F59E0B';
    const emeraldPin = '#10B981';
    const safeDestName = (destinationCity || 'Destination').replace(/'/g, "\\\\'");

    return \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link href="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100%; background: \${bgCanvas}; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #map { width: 100%; height: 100%; }
    .maplibregl-ctrl-bottom-right, .maplibregl-ctrl-attrib { display: none !important; }

    /* Pickup 3D Pin */
    .pickup-3d {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.28);
      border: 2.5px solid \${emeraldPin};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 18px \${emeraldPin};
      animation: pulse3d 2s infinite ease-out;
      cursor: pointer;
    }
    .pickup-core {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.6);
    }
    @keyframes pulse3d {
      0% { transform: scale(0.9); opacity: 1; }
      50% { transform: scale(1.35); opacity: 0.45; }
      100% { transform: scale(0.9); opacity: 1; }
    }

    /* Drop 3D Pin */
    .drop-3d {
      background: \${primaryAmber};
      color: #0F172A;
      font-size: 11px;
      font-weight: 900;
      padding: 5px 10px;
      border-radius: 8px;
      border: 2px solid #FFFFFF;
      box-shadow: 0 8px 18px rgba(0,0,0,0.5), 0 0 12px \${primaryAmber};
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 5px;
      transform: translate(-50%, -100%) translateY(-10px);
      cursor: pointer;
      letter-spacing: -0.2px;
      position: relative;
    }
    .drop-pointer {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid \${primaryAmber};
    }

    /* Cab 3D Markers */
    .cab-3d {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: #0B0F19;
      border: 2px solid \${primaryAmber};
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 8px rgba(245, 158, 11, 0.35);
      transition: transform 0.4s ease;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var pLat = \${pLat}, pLng = \${pLng};
    var dLat = \${dLat}, dLng = \${dLng};
    var cabMarkers = [];
    var pMarker, dMarker;
    var currentRoadCoords = null;

    var map = new maplibregl.Map({
      container: 'map',
      style: '\${styleUrl}',
      center: [\${cLng}, \${cLat}],
      zoom: 11,
      pitch: 58,
      bearing: -16,
      antialias: true,
      attributionControl: false,
      dragRotate: true,
      touchPitch: true
    });

    map.on('load', function() {
      map.resize();

      // 3D Buildings
      if (map.getSource('openmaptiles')) {
        map.addLayer({
          'id': '3d-buildings',
          'source': 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 13,
          'paint': {
            'fill-extrusion-color': '\${isDark ? "#1E293B" : "#CBD5E1"}',
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 16, ['get', 'render_height']],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 16, ['get', 'render_min_height']],
            'fill-extrusion-opacity': 0.8
          }
        });
      }

      // Fetch Real Road Directions from OSRM
      fetchRealRoadRoute([pLng, pLat], [dLng, dLat]);
    });

    // Real-World Road Highway Directions API (OSRM Driving Engine)
    function fetchRealRoadRoute(p, d) {
      var osrmUrl = 'https://router.project-osrm.org/route/v1/driving/' + p[0] + ',' + p[1] + ';' + d[0] + ',' + d[1] + '?overview=full&geometries=geojson';

      fetch(osrmUrl)
        .then(function(res) { return res.json(); })
        .then(function(json) {
          if (json && json.routes && json.routes.length > 0) {
            var coords = json.routes[0].geometry.coordinates;
            currentRoadCoords = coords;
            var distKm = (json.routes[0].distance / 1000).toFixed(1);
            var durationMin = Math.round(json.routes[0].duration / 60);

            // Render exact highway turns
            renderRoadPolyline(coords);

            // Fit camera to the real highway path
            fitBoundsToCoords(coords);

            // Position and drive cabs along this highway
            driveCabsOnRoad(coords);

            // Send real distance & driving time to React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'routeCalculated',
                distanceKm: distKm,
                durationMin: durationMin
              }));
            }
          } else {
            fallbackCurvedRoute(p, d);
          }
        })
        .catch(function(err) {
          fallbackCurvedRoute(p, d);
        });
    }

    function renderRoadPolyline(coordinates) {
      var routeData = {
        'type': 'Feature',
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      };

      if (map.getSource('route')) {
        map.getSource('route').setData(routeData);
      } else {
        map.addSource('route', {
          'type': 'geojson',
          'data': routeData
        });

        // 3D Outer Highway Glow
        map.addLayer({
          'id': 'route-glow',
          'type': 'line',
          'source': 'route',
          'layout': { 'line-join': 'round', 'line-cap': 'round' },
          'paint': {
            'line-color': '\${primaryAmber}',
            'line-width': 10,
            'line-opacity': 0.38,
            'line-blur': 5
          }
        });

        // 3D Inner Core Road Ribbon (Follows every turn and highway curve)
        map.addLayer({
          'id': 'route-core',
          'type': 'line',
          'source': 'route',
          'layout': { 'line-join': 'round', 'line-cap': 'round' },
          'paint': {
            'line-color': '\${primaryAmber}',
            'line-width': 4.8,
            'line-opacity': 0.95
          }
        });
      }
    }

    function fallbackCurvedRoute(p, d) {
      var midLng = (p[0] + d[0]) / 2 - ((d[1] - p[1]) * 0.08);
      var midLat = (p[1] + d[1]) / 2 + ((d[0] - p[0]) * 0.08);
      var simpleCoords = [p, [midLng, midLat], d];
      renderRoadPolyline(simpleCoords);
      fitBoundsToCoords(simpleCoords);
    }

    function fitBoundsToCoords(coordinates) {
      var bounds = new maplibregl.LngLatBounds();
      coordinates.forEach(function(coord) {
        bounds.extend(coord);
      });
      map.fitBounds(bounds, {
        padding: { top: 75, bottom: 65, left: 50, right: 50 },
        pitch: 58,
        bearing: -16,
        duration: 1000
      });
    }

    // 3D Pickup Pin
    var pEl = document.createElement('div');
    pEl.className = 'pickup-3d';
    pEl.innerHTML = '<div class="pickup-core"></div>';
    pMarker = new maplibregl.Marker({ element: pEl, draggable: true })
      .setLngLat([pLng, pLat])
      .addTo(map);

    pMarker.on('dragend', function() {
      var lngLat = pMarker.getLngLat();
      pLng = lngLat.lng;
      pLat = lngLat.lat;
      fetchRealRoadRoute([pLng, pLat], [dLng, dLat]);
      notifyLocation(lngLat);
    });

    // 3D Drop Pin (SVG Pin Icon + Destination text)
    var dEl = document.createElement('div');
    dEl.className = 'drop-3d';
    dEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' +
      '<span>\${safeDestName}</span><div class="drop-pointer"></div>';
    dMarker = new maplibregl.Marker({ element: dEl, anchor: 'bottom' })
      .setLngLat([dLng, dLat])
      .addTo(map);

    // 3D Cabs Driving Along Highway Road Coordinates
    function driveCabsOnRoad(coords) {
      \${showNearbyCabs ? \`
        if (!coords || coords.length < 5) return;
        
        var idx1 = Math.floor(coords.length * 0.12);
        var idx2 = Math.floor(coords.length * 0.38);
        var idx3 = Math.floor(coords.length * 0.68);

        var cabSvg = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';

        var cabPositions = [
          { idx: idx1 },
          { idx: idx2 },
          { idx: idx3 }
        ];

        cabMarkers.forEach(function(m) { m.marker.remove(); });
        cabMarkers = [];

        cabPositions.forEach(function(c) {
          var pt = coords[c.idx] || coords[0];
          var el = document.createElement('div');
          el.className = 'cab-3d';
          el.innerHTML = cabSvg;
          var marker = new maplibregl.Marker({ element: el })
            .setLngLat(pt)
            .addTo(map);
          cabMarkers.push({ marker: marker, currIdx: c.idx });
        });

        if (window.cabDriveInterval) clearInterval(window.cabDriveInterval);
        window.cabDriveInterval = setInterval(function() {
          cabMarkers.forEach(function(item) {
            item.currIdx = (item.currIdx + 1) % coords.length;
            var nextPt = coords[item.currIdx];
            if (nextPt) {
              item.marker.setLngLat(nextPt);
            }
          });
        }, 1600);
      \` : ''}
    }

    // Tap Anywhere on Map to change pickup pin
    map.on('click', function(e) {
      pLng = e.lngLat.lng;
      pLat = e.lngLat.lat;
      pMarker.setLngLat(e.lngLat);
      fetchRealRoadRoute([pLng, pLat], [dLng, dLat]);
      notifyLocation(e.lngLat);
    });

    function notifyLocation(lngLat) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'locationSelected',
          coords: { lat: lngLat.lat, lng: lngLat.lng }
        }));
      }
    }

    // Bridge Functions
    window.mapZoomIn = function() { map.zoomIn({ duration: 350 }); };
    window.mapZoomOut = function() { map.zoomOut({ duration: 350 }); };
    window.setPitch3D = function(is3d) {
      map.easeTo({
        pitch: is3d ? 58 : 0,
        bearing: is3d ? -16 : 0,
        duration: 800
      });
    };
    window.flyToUserLocation = function(lat, lng) {
      pLat = lat;
      pLng = lng;
      pMarker.setLngLat([lng, lat]);
      fetchRealRoadRoute([lng, lat], [dLng, dLat]);
      map.flyTo({
        center: [lng, lat],
        zoom: 15,
        pitch: 58,
        bearing: -16,
        duration: 1400
      });
    };
  </script>
</body>
</html>\`;
  }, [pickup, drop, isDark, showNearbyCabs, destinationCity]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected' && onLocationSelected) {
        onLocationSelected(data.coords);
      }
      if (data.type === 'routeCalculated') {
        setRoadInfo(\`\${data.distanceKm} km • ~\${data.durationMin}m\`);
        if (onRouteCalculated) {
          onRouteCalculated(data.distanceKm, data.durationMin);
        }
      }
    } catch (e) {
      // Ignore parse error
    }
  };

  const handleZoomIn = () => {
    webViewRef.current?.injectJavaScript('window.mapZoomIn && window.mapZoomIn(); true;');
  };

  const handleZoomOut = () => {
    webViewRef.current?.injectJavaScript('window.mapZoomOut && window.mapZoomOut(); true;');
  };

  const handleToggle3D = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);
    webViewRef.current?.injectJavaScript(\`window.setPitch3D && window.setPitch3D(\${nextMode}); true;\`);
  };

  const handleRecenter = () => {
    if (pickup) {
      webViewRef.current?.injectJavaScript(
        \`window.flyToUserLocation && window.flyToUserLocation(\${pickup.lat}, \${pickup.lng}); true;\`
      );
    }
    if (onRecenterPress) {
      onRecenterPress();
    }
  };

  return (
    <View style={[styles.container, { height: height as any, borderColor: colors.cardBorder }]}>
      <SafeWebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        renderLoading={() => (
          <View style={[styles.loader, { backgroundColor: isDark ? '#0B0F19' : '#FFFFFF' }]}>
            <ActivityIndicator size="small" color={colors.accentGold} />
          </View>
        )}
        startInLoadingState={true}
      />

      {/* Floating 3D / 2D Switch Pill */}
      <TouchableOpacity
        style={[
          styles.badge3D,
          {
            backgroundColor: isDark ? 'rgba(11, 15, 25, 0.90)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: is3DMode ? colors.accentGold : colors.cardBorder,
          }
        ]}
        onPress={handleToggle3D}
        activeOpacity={0.8}
      >
        <Layers size={13} color={is3DMode ? colors.accentGold : colors.textMuted} />
        <Text style={[styles.badge3DText, { color: is3DMode ? colors.accentGold : colors.textMuted }]}>
          {is3DMode ? '3D VIEW' : '2D VIEW'}
        </Text>
      </TouchableOpacity>

      {/* Floating Right Map Control Stack: Zoom In, Zoom Out, GPS Recenter */}
      <View style={styles.rightControlStack}>
        <TouchableOpacity
          style={[
            styles.mapControlBtn,
            { backgroundColor: isDark ? '#131B2E' : '#FFFFFF', borderColor: colors.cardBorder }
          ]}
          onPress={handleZoomIn}
          activeOpacity={0.8}
        >
          <Plus size={16} color={colors.textPrimary} strokeWidth={2.6} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mapControlBtn,
            { backgroundColor: isDark ? '#131B2E' : '#FFFFFF', borderColor: colors.cardBorder }
          ]}
          onPress={handleZoomOut}
          activeOpacity={0.8}
        >
          <Minus size={16} color={colors.textPrimary} strokeWidth={2.6} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.mapControlBtn,
            { backgroundColor: isDark ? '#131B2E' : '#FFFFFF', borderColor: colors.cardBorder }
          ]}
          onPress={handleRecenter}
          activeOpacity={0.8}
        >
          <Crosshair size={17} color={colors.accentGold} strokeWidth={2.4} />
        </TouchableOpacity>

        {onToggleExpand && (
          <TouchableOpacity
            style={[
              styles.mapControlBtn,
              { backgroundColor: isDark ? '#131B2E' : '#FFFFFF', borderColor: colors.cardBorder }
            ]}
            onPress={() => onToggleExpand(!isExpanded)}
            activeOpacity={0.8}
          >
            {isExpanded ? (
              <Minimize2 size={15} color={colors.textPrimary} />
            ) : (
              <Maximize2 size={15} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Floating Route Info Pill with Real Road Highway Distance */}
      <View
        style={[
          styles.routeBadge,
          {
            backgroundColor: isDark ? 'rgba(11, 15, 25, 0.90)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: colors.cardBorder,
          }
        ]}
      >
        <View style={styles.dotPulse} />
        <Text style={[styles.routeBadgeText, { color: colors.textPrimary }]}>
          {originCity} <Text style={{ color: colors.accentGold }}>\\u2192</Text> {destinationCity}
          {roadInfo ? (
            <Text style={{ color: colors.accentGold, fontWeight: '800' }}> ({roadInfo})</Text>
          ) : null}
        </Text>
      </View>
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
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge3D: {
    position: 'absolute',
    top: 76,
    left: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5,
  },
  badge3DText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  rightControlStack: {
    position: 'absolute',
    right: 14,
    top: 76,
    flexDirection: 'column',
    gap: 8,
    zIndex: 5,
  },
  mapControlBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 5,
  },
  dotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  routeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
`;
}

// Generate for passenger app
fs.writeFileSync(
  path.join(__dirname, '../mobile/apps/passenger/src/components/UberMapView.tsx'),
  generateUberMapView(false),
  'utf8'
);

// Generate for shared components
fs.writeFileSync(
  path.join(__dirname, '../mobile/shared/components/UberMapView.tsx'),
  generateUberMapView(true),
  'utf8'
);

console.log('Successfully generated UberMapView in both passenger app and shared!');

