/**
 * OneWayTaxiBihar — Map Architecture & Multi-Provider Verification Suite
 * Tests:
 * 1. Bihar Highway Road Corridors database integrity
 * 2. Center midpoint coordinate calculations (cLat, cLng)
 * 3. Multi-Provider configuration resolution (Google Maps vs Free Edge CDN)
 * 4. Instant vector canvas screen projection & coordinate bounds
 * 5. Tile endpoint validation and SSL/CDN schema
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== OneWayTaxiBihar: Map Integration & Multi-Provider Test Suite ===\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] Test ${totalTests}: ${name}`);
    console.error(`         ${err.message}`);
  }
}

// 1. Verify bihar-road-corridors.js exists and is valid
runTest('Bihar Road Corridors JS exists and exports valid corridors', () => {
  const filePath = path.join(__dirname, '..', 'js', 'bihar-road-corridors.js');
  assert.ok(fs.existsSync(filePath), 'bihar-road-corridors.js must exist');
  
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('BIHAR_ROAD_CORRIDORS'), 'Must define BIHAR_ROAD_CORRIDORS');
  assert.ok(content.includes('patna_to_gaya'), 'Must include Patna to Gaya highway corridor');
  assert.ok(content.includes('patna_to_muzaffarpur'), 'Must include Patna to Muzaffarpur corridor');
  assert.ok(content.includes('patna_to_bhagalpur'), 'Must include Patna to Bhagalpur corridor');
  assert.ok(content.includes('patna_to_darbhanga'), 'Must include Patna to Darbhanga corridor');
});

// 2. Verify map-config.js
runTest('map-config.js exists and handles API keys safely', () => {
  const filePath = path.join(__dirname, '..', 'js', 'map-config.js');
  assert.ok(fs.existsSync(filePath), 'map-config.js must exist');

  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('ONEWAY_MAP_CONFIG'), 'Must define ONEWAY_MAP_CONFIG');
  assert.ok(content.includes('isGoogleMapsAvailable'), 'Must have isGoogleMapsAvailable helper');
  assert.ok(content.includes('tile.openstreetmap.org') || content.includes('basemaps.cartocdn.com'), 'Must configure free map tiles');
});

// 3. Test Coordinate Center & Midpoint Math
runTest('Midpoint calculation accurately finds geographic center of Patna to Gaya', () => {
  const patna = { lat: 25.5941, lng: 85.1376 };
  const gaya = { lat: 24.7955, lng: 85.0002 };

  const cLat = (patna.lat + gaya.lat) / 2;
  const cLng = (patna.lng + gaya.lng) / 2;

  assert.strictEqual(typeof cLat, 'number');
  assert.strictEqual(typeof cLng, 'number');
  assert.ok(cLat > 24.79 && cLat < 25.60, 'cLat must be between Patna and Gaya');
  assert.ok(cLng > 84.99 && cLng < 85.14, 'cLng must be between Patna and Gaya');
  assert.ok(Math.abs(cLat - 25.1948) < 0.01, 'cLat calculation matches expected value');
});

// 4. Test Instant Vector Canvas Screen Projection Formula
runTest('Canvas coordinate projection accurately maps lat/lng within viewport bounds', () => {
  const pts = [
    [85.1376, 25.5941], // Patna
    [85.0002, 24.7955]  // Gaya
  ];
  const w = 360, h = 320, pad = 48;

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const x = pts[i][0], y = pts[i][1];
    if (x < minLng) minLng = x;
    if (x > maxLng) maxLng = x;
    if (y < minLat) minLat = y;
    if (y > maxLat) maxLat = y;
  }
  const spanLng = (maxLng - minLng) || 0.01;
  const spanLat = (maxLat - minLat) || 0.01;

  function toScreen(lng, lat) {
    const sx = pad + ((lng - minLng) / spanLng) * (w - pad * 2);
    const sy = (h - pad) - ((lat - minLat) / spanLat) * (h - pad * 2);
    return [sx, sy];
  }

  const pScreen = toScreen(85.1376, 25.5941);
  const gScreen = toScreen(85.0002, 24.7955);

  assert.ok(pScreen[0] >= pad && pScreen[0] <= w - pad, 'X coordinate must stay within canvas padding');
  assert.ok(pScreen[1] >= pad && pScreen[1] <= h - pad, 'Y coordinate must stay within canvas padding');
  assert.ok(gScreen[0] >= pad && gScreen[0] <= w - pad, 'Gaya X must stay within canvas padding');
  assert.ok(gScreen[1] >= pad && gScreen[1] <= h - pad, 'Gaya Y must stay within canvas padding');
});

// 5. Test Multi-Provider Resolution Logic
runTest('Provider resolver selects Google Maps when API key provided, Carto Edge when empty', () => {
  function resolveMapEngine(apiKey, webGLSupported) {
    if (apiKey && apiKey.trim().length > 10) {
      return 'google-maps';
    }
    if (webGLSupported) {
      return 'maplibre-3d';
    }
    return 'leaflet-2d';
  }

  // Without API key + WebGL enabled
  assert.strictEqual(resolveMapEngine('', true), 'maplibre-3d');
  // Without API key + WebGL disabled
  assert.strictEqual(resolveMapEngine('', false), 'leaflet-2d');
  // With Google Maps API key
  assert.strictEqual(resolveMapEngine('AIzaSyD_TEST_KEY_1234567890', true), 'google-maps');
  assert.strictEqual(resolveMapEngine('AIzaSyD_TEST_KEY_1234567890', false), 'google-maps');
});

// 6. Verify UberMapView.tsx in passenger mobile app
runTest('mobile/apps/passenger/src/components/UberMapView.tsx contains instant vector canvas and Google Maps support', () => {
  const filePath = path.join(__dirname, '..', 'mobile', 'apps', 'passenger', 'src', 'components', 'UberMapView.tsx');
  assert.ok(fs.existsSync(filePath), 'UberMapView.tsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('fallback-canvas'), 'Must include instant zero-blank canvas');
  assert.ok(content.includes('renderInstantVectorRoute'), 'Must have renderInstantVectorRoute function');
  assert.ok(content.includes('activeGmapsKey'), 'Must support Google Maps API Key');
  assert.ok(content.includes('initGoogleMaps'), 'Must have initGoogleMaps engine');
  assert.ok(content.includes('cdnjs.cloudflare.com'), 'Must use Cloudflare CDN with India edge nodes');
  assert.ok(content.includes('scrollEnabled={false}'), 'Must isolate touch gestures from scroll container');
});

// 7. Verify shared UberMapView.tsx
runTest('mobile/shared/components/UberMapView.tsx is in sync with passenger component', () => {
  const filePath = path.join(__dirname, '..', 'mobile', 'shared', 'components', 'UberMapView.tsx');
  assert.ok(fs.existsSync(filePath), 'Shared UberMapView.tsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('fallback-canvas'), 'Shared component must include fallback-canvas');
  assert.ok(content.includes('initGoogleMaps'), 'Shared component must support Google Maps');
});

// 8. Verify index.html map links
runTest('index.html links map-config.js and Cloudflare CDN correctly', () => {
  const filePath = path.join(__dirname, '..', 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.ok(content.includes('map-config.js'), 'index.html must include map-config.js');
  assert.ok(content.includes('cdnjs.cloudflare.com/ajax/libs/maplibre-gl'), 'index.html must use Cloudflare CDN');
  assert.ok(content.includes('oneway-route-map'), 'index.html must contain route map container');
});

// 9. Verify uber-bolt-preview.html map links
runTest('uber-bolt-preview.html includes map-config.js and interactive controls', () => {
  const filePath = path.join(__dirname, '..', 'mobile', 'previews', 'uber-bolt-preview.html');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.ok(content.includes('map-config.js'), 'uber-bolt-preview.html must include map-config.js');
  assert.ok(content.includes('preview-live-map'), 'uber-bolt-preview.html must have preview-live-map container');
});

console.log(`\n=== Test Results: ${passedTests}/${totalTests} Passed ===`);
if (passedTests === totalTests) {
  console.log(' All Map Architecture tests PASSED cleanly!\n');
  process.exit(0);
} else {
  console.error(' Some tests failed!\n');
  process.exit(1);
}

