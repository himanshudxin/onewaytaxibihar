const fs = require('fs');
const https = require('https');
const path = require('path');

const cities = {
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

const pairs = [
  ['patna', 'gaya'],
  ['patna', 'muzaffarpur'],
  ['patna', 'darbhanga'],
  ['patna', 'bhagalpur'],
  ['patna', 'begusarai'],
  ['patna', 'varanasi'],
  ['patna', 'purnea'],
  ['patna', 'siwan'],
  ['gaya', 'patna'],
  ['muzaffarpur', 'patna'],
  ['darbhanga', 'patna'],
  ['bhagalpur', 'patna'],
  ['begusarai', 'patna']
];

function fetchRoute(origin, dest) {
  return new Promise((resolve, reject) => {
    const o = cities[origin];
    const d = cities[dest];
    const options = {
      hostname: 'router.project-osrm.org',
      path: `/route/v1/driving/${o[0]},${o[1]};${d[0]},${d[1]}?overview=full&geometries=geojson`,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.routes && json.routes[0]) {
            const r = json.routes[0];
            resolve({
              distanceKm: (r.distance / 1000).toFixed(1),
              durationMin: Math.round(r.duration / 60),
              coordinates: r.geometry.coordinates
            });
          } else {
            reject(new Error('No route in response: ' + data.substring(0, 100)));
          }
        } catch (e) {
          reject(new Error(e.message + ' - ' + data.substring(0, 100)));
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  const result = {};
  for (const [o, d] of pairs) {
    const key = `${o}_to_${d}`;
    try {
      console.log(`Fetching route: ${key}...`);
      const route = await fetchRoute(o, d);
      result[key] = route;
      console.log(`  -> OK: ${route.distanceKm} km, ${route.durationMin} min, ${route.coordinates.length} pts`);
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      console.error(`  -> Failed for ${key}:`, e.message);
    }
  }

  const outPath = path.join(__dirname, '../mobile/shared/utils/biharRoadCorridors.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');

  // Also copy to passenger app src/utils/
  const passengerOutPath = path.join(__dirname, '../mobile/apps/passenger/src/utils/biharRoadCorridors.json');
  fs.writeFileSync(passengerOutPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`Saved ${Object.keys(result).length} road corridors successfully!`);
}

run();
