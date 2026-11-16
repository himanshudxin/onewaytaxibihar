const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('mobile/shared/utils/biharRoadCorridors.json', 'utf8'));

const tsContent = `// Real Bihar Highway Driving Corridors (NH 22, NH 31, NH 27, Ganga Bridges)
export interface RoadCorridor {
  distanceKm: string;
  durationMin: number;
  coordinates: [number, number][];
}

export const BIHAR_ROAD_CORRIDORS: Record<string, RoadCorridor> = ${JSON.stringify(data, null, 2)};

export function getRoadCorridor(origin: string, dest: string): RoadCorridor | null {
  if (!origin || !dest) return null;
  const oKey = origin.trim().toLowerCase().replace(/[^a-z]/g, '');
  const dKey = dest.trim().toLowerCase().replace(/[^a-z]/g, '');
  
  // Direct match
  for (const key of Object.keys(BIHAR_ROAD_CORRIDORS)) {
    const parts = key.split('_to_');
    if ((oKey.includes(parts[0]) || parts[0].includes(oKey)) &&
        (dKey.includes(parts[1]) || parts[1].includes(dKey))) {
      return BIHAR_ROAD_CORRIDORS[key];
    }
  }

  // Reverse match
  for (const key of Object.keys(BIHAR_ROAD_CORRIDORS)) {
    const parts = key.split('_to_');
    if ((dKey.includes(parts[0]) || parts[0].includes(dKey)) &&
        (oKey.includes(parts[1]) || parts[1].includes(oKey))) {
      const match = BIHAR_ROAD_CORRIDORS[key];
      return {
        distanceKm: match.distanceKm,
        durationMin: match.durationMin,
        coordinates: [...match.coordinates].reverse()
      };
    }
  }

  return null;
}
`;

fs.writeFileSync(path.join(__dirname, '../mobile/shared/utils/biharRoadCorridors.ts'), tsContent, 'utf8');
fs.writeFileSync(path.join(__dirname, '../mobile/apps/passenger/src/utils/biharRoadCorridors.ts'), tsContent, 'utf8');
console.log('Successfully generated biharRoadCorridors.ts in both shared and passenger!');

