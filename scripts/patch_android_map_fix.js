const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../mobile/apps/passenger/src/components/UberMapView.tsx'),
  path.join(__dirname, '../mobile/shared/components/UberMapView.tsx')
];

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('File does not exist:', file);
    return;
  }

  let code = fs.readFileSync(file, 'utf8');

  // 1. Update SafeWebView props with Android hardware WebGL flags and baseUrl
  const oldWebViewTag = `<SafeWebView
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
      />`;

  const newWebViewTag = `<SafeWebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: 'https://unpkg.com' }}
        style={styles.webView}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        overScrollMode="never"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        mixedContentMode="always"
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
        onError={(syntheticEvent: any) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('[UberMapView] Android WebView Native Error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent: any) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('[UberMapView] Android WebView HTTP Error:', nativeEvent.statusCode, nativeEvent.url);
        }}
        renderLoading={() => (
          <View style={[styles.loader, { backgroundColor: isDark ? '#0B0F19' : '#FFFFFF' }]}>
            <ActivityIndicator size="small" color={colors.accentGold} />
          </View>
        )}
        startInLoadingState={false}
      />`;

  if (code.includes(oldWebViewTag)) {
    code = code.replace(oldWebViewTag, newWebViewTag);
  }

  // 2. Fix the tile sources so OSM.org (which blocks Android WebView) is replaced with Carto subdomains a, b, c
  const oldTiles = `          tiles: [
            isDark
              ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
              : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],`;

  const newTiles = `          tiles: [
            isDark
              ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
              : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            isDark
              ? 'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
              : 'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            isDark
              ? 'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
              : 'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
          ],`;

  if (code.includes(oldTiles)) {
    code = code.replace(oldTiles, newTiles);
  }

  // 3. Inject global error trapping in the HTML script and WebGL fallback
  const oldHeadScript = `<link href="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/3.6.2/maplibre-gl.js"></script>`;

  const newHeadScript = `<link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    window.onerror = function(msg, url, line) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', msg: String(msg), line: line }));
      }
    };
  </script>`;

  if (code.includes(oldHeadScript)) {
    code = code.replace(oldHeadScript, newHeadScript);
  }

  // 4. Update handleMessage to log WebView events in Metro
  const oldHandleMessage = `  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected' && onLocationSelected) {
        onLocationSelected(data.coords);
      }
    } catch (e) {
      // Ignore
    }
  };`;

  const newHandleMessage = `  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected' && onLocationSelected) {
        onLocationSelected(data.coords);
      } else if (data.type === 'error') {
        console.warn('[UberMapView Inside WebView Error]:', data.msg, 'at line', data.line);
      } else if (data.type === 'mapLoaded') {
        // Map successfully rendered
      }
    } catch (e) {
      // Ignore
    }
  };`;

  if (code.includes(oldHandleMessage)) {
    code = code.replace(oldHandleMessage, newHandleMessage);
  }

  // 5. Update WebGL detection and fallback in map initialization
  const oldMapInit = `    var map = new maplibregl.Map({
      container: 'map',
      style: styleDefinition,
      center: [cLng, cLat],
      zoom: 10,
      pitch: 58,
      bearing: -16,
      antialias: true,
      attributionControl: false,
      dragRotate: true,
      touchPitch: true
    });`;

  const newMapInit = `    var map;
    var is3DReady = false;

    function isWebGLSupported() {
      try {
        var canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch(e) {
        return false;
      }
    }

    if (typeof maplibregl !== 'undefined' && isWebGLSupported()) {
      try {
        map = new maplibregl.Map({
          container: 'map',
          style: styleDefinition,
          center: [cLng, cLat],
          zoom: 10,
          pitch: 58,
          bearing: -16,
          antialias: true,
          attributionControl: false,
          dragRotate: true,
          touchPitch: true
        });
        is3DReady = true;
      } catch(e) {
        console.warn('MapLibre 3D failed, falling back to 2D Leaflet:', e);
      }
    }

    if (!is3DReady && typeof L !== 'undefined') {
      // Automatic 2D Canvas Fallback for Android Devices without WebGL
      var lMap = L.map('map', { zoomControl: false, attributionControl: false }).setView([cLat, cLng], 10);
      L.tileLayer(isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        { subdomains: 'abc', maxZoom: 19 }
      ).addTo(lMap);

      if (highwayCoords && highwayCoords.length > 0) {
        // LatLng array for leaflet
        var lCoords = highwayCoords.map(function(pt) { return [pt[1], pt[0]]; });
        L.polyline(lCoords, { color: primaryAmber, weight: 8, opacity: 0.35 }).addTo(lMap);
        L.polyline(lCoords, { color: primaryAmber, weight: 4.5, opacity: 0.95 }).addTo(lMap);
        lMap.fitBounds(L.latLngBounds(lCoords), { padding: [40, 40] });
      }

      var pIcon = L.divIcon({ className: 'p-pin', html: '<div class="pickup-3d"><div class="pickup-core"></div></div>', iconSize: [28, 28], iconAnchor: [14, 14] });
      L.marker([pLat, pLng], { icon: pIcon }).addTo(lMap);

      var dIcon = L.divIcon({ className: 'd-pin', html: '<div class="drop-3d"><span>' + safeDestName + '</span></div>', iconSize: [80, 28], iconAnchor: [40, 28] });
      L.marker([dLat, dLng], { icon: dIcon }).addTo(lMap);

      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapLoaded', engine: 'leaflet-2d' }));
      }
    }`;

  // Check if we need to replace map init
  if (code.includes("var map = new maplibregl.Map({")) {
    // Replace the MapLibre constructor block
    code = code.replace(/var map = new maplibregl\.Map\(\{[\s\S]*?touchPitch: true\s*\}\);/, newMapInit);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log('✓ Successfully patched', file);
});

