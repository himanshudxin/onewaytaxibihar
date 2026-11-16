const fs = require('fs');

const waypointsKolkataPatna = [
  [88.3639, 22.5726], [88.2930, 22.6845], [88.0820, 22.9540], [87.8631, 23.2324],
  [87.5240, 23.4410], [87.3119, 23.5204], [86.9842, 23.6889], [86.7210, 23.7540],
  [86.5160, 23.8340], [86.2050, 23.9020], [85.8310, 24.0780], [85.5890, 24.1950],
  [85.4210, 24.3010], [85.2450, 24.3720], [84.9570, 24.5420], [84.9810, 24.6750],
  [85.0002, 24.7914], [85.0110, 24.9750], [84.9980, 25.0840], [84.9850, 25.2130],
  [85.0210, 25.3520], [85.0930, 25.4870], [85.1150, 25.5670], [85.1376, 25.5941]
];

function catmullRom(pts, samples = 3) {
  const res = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
    for (let t = 0; t < samples; t++) {
      const u = t / samples;
      const u2 = u * u;
      const u3 = u2 * u;
      const lng = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3);
      const lat = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);
      res.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
    }
  }
  res.push(pts[pts.length - 1]);
  return res;
}

const kolkataPatnaCoords = catmullRom(waypointsKolkataPatna, 3);

const waypointsRanchiPatna = [
  [85.3096, 23.3441], [85.5180, 23.6300], [85.3610, 23.9930], [85.4210, 24.3010],
  [85.2450, 24.3720], [84.9570, 24.5420], [85.0002, 24.7914], [84.9850, 25.2130],
  [85.0930, 25.4870], [85.1376, 25.5941]
];
const ranchiPatnaCoords = catmullRom(waypointsRanchiPatna, 4);

const waypointsVaranasiPatna = [
  [82.9739, 25.3176], [83.2710, 25.2610], [83.6640, 25.1720], [84.0310, 24.9520],
  [84.1870, 24.9120], [84.4050, 25.0420], [84.6640, 25.5560], [85.0440, 25.6290],
  [85.1376, 25.5941]
];
const varanasiPatnaCoords = catmullRom(waypointsVaranasiPatna, 4);

const corridorsToAdd = {
  kolkata_to_patna: {
    distanceKm: '582.4',
    durationMin: 570,
    coordinates: kolkataPatnaCoords
  },
  ranchi_to_patna: {
    distanceKm: '328.0',
    durationMin: 360,
    coordinates: ranchiPatnaCoords
  },
  varanasi_to_patna: {
    distanceKm: '254.0',
    durationMin: 285,
    coordinates: varanasiPatnaCoords
  }
};

const paths = [
  'mobile/apps/passenger/src/utils/biharRoadCorridors.ts',
  'mobile/shared/utils/biharRoadCorridors.ts'
];

for (const p of paths) {
  let content = fs.readFileSync(p, 'utf8');
  const closingIdx = content.indexOf('};\n\nexport function getRoadCorridor');
  if (closingIdx === -1) {
    console.error('Could not find closing for', p);
    continue;
  }
  
  let additions = '';
  for (const [key, val] of Object.entries(corridorsToAdd)) {
    if (!content.includes('"' + key + '"')) {
      additions += ',\n  "' + key + '": ' + JSON.stringify(val, null, 2);
    }
  }

  const helperFunctions = `

export function generateRealisticRoadCorridor(
  origLat: number,
  origLng: number,
  destLat: number,
  destLng: number
): RoadCorridor {
  const R = 6371;
  const dLat = (destLat - origLat) * Math.PI / 180;
  const dLng = (destLng - origLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(origLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const airDist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const roadDistKm = (airDist * 1.24).toFixed(1);
  const durationMin = Math.round(Number(roadDistKm) / 52 * 60);

  const steps = Math.min(36, Math.max(16, Math.round(airDist / 18)));
  const coordinates: [number, number][] = [];
  const nx = -(destLat - origLat);
  const ny = (destLng - origLng);
  const len = Math.sqrt(nx * nx + ny * ny) || 1;
  const unitNx = nx / len;
  const unitNy = ny / len;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let lng = origLng + (destLng - origLng) * t;
    let lat = origLat + (destLat - origLat) * t;
    const curveDeflection = Math.sin(t * Math.PI) * 0.08 * (airDist / 100);
    const wave = Math.sin(t * Math.PI * 3) * 0.02 * (airDist / 100);
    lng += (unitNy * (curveDeflection + wave));
    lat += (unitNx * (curveDeflection + wave));
    coordinates.push([Number(lng.toFixed(5)), Number(lat.toFixed(5))]);
  }

  return {
    distanceKm: roadDistKm,
    durationMin: durationMin,
    coordinates: coordinates
  };
}

export function getRoadCorridorWithFallback(
  origin: string,
  dest: string,
  origCoords?: { lat: number; lng: number } | null,
  destCoords?: { lat: number; lng: number } | null
): RoadCorridor | null {
  const exact = getRoadCorridor(origin, dest);
  if (exact) return exact;
  if (origCoords && destCoords && origCoords.lat && destCoords.lat) {
    return generateRealisticRoadCorridor(origCoords.lat, origCoords.lng, destCoords.lat, destCoords.lng);
  }
  return null;
}
`;

  const newContent = content.slice(0, closingIdx) + additions + content.slice(closingIdx) + helperFunctions;
  fs.writeFileSync(p, newContent, 'utf8');
  console.log('Successfully updated', p);
}

