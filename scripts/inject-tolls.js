const fs = require('fs');

const TOLL_CORRIDORS = {
  kolkata_to_patna: [
    { id: 'toll-dankuni', name: 'Dankuni Toll Plaza', highway: 'NH-19', lat: 22.6845, lng: 88.2930, fastagRate: 110, state: 'WB' },
    { id: 'toll-palsit', name: 'Palsit Toll Plaza', highway: 'NH-19', lat: 23.2324, lng: 87.8631, fastagRate: 130, state: 'WB' },
    { id: 'toll-panagarh', name: 'Panagarh Toll Plaza', highway: 'NH-19', lat: 23.4410, lng: 87.5240, fastagRate: 115, state: 'WB' },
    { id: 'toll-govindpur', name: 'Govindpur Toll Plaza', highway: 'NH-19', lat: 23.8340, lng: 86.5160, fastagRate: 95, state: 'JH' },
    { id: 'toll-barhi', name: 'Barhi Toll Plaza', highway: 'NH-19', lat: 24.3010, lng: 85.4210, fastagRate: 120, state: 'JH' },
    { id: 'toll-dobhi', name: 'Dobhi Toll Plaza', highway: 'NH-22', lat: 24.5420, lng: 84.9570, fastagRate: 85, state: 'BR' },
    { id: 'toll-masaurhi', name: 'Masaurhi Toll Plaza', highway: 'NH-22', lat: 25.3520, lng: 85.0210, fastagRate: 65, state: 'BR' }
  ],
  patna_to_gaya: [
    { id: 'toll-masaurhi', name: 'Masaurhi-Punpun Toll', highway: 'NH-22', lat: 25.3520, lng: 85.0210, fastagRate: 65, state: 'BR' },
    { id: 'toll-bela', name: 'Makhdumpur-Bela Toll', highway: 'NH-22', lat: 25.0840, lng: 84.9980, fastagRate: 50, state: 'BR' }
  ],
  patna_to_muzaffarpur: [
    { id: 'toll-sarai', name: 'Sarai Toll Plaza', highway: 'NH-22', lat: 25.8200, lng: 85.2800, fastagRate: 85, state: 'BR' }
  ],
  patna_to_darbhanga: [
    { id: 'toll-sarai', name: 'Sarai Toll Plaza', highway: 'NH-22', lat: 25.8200, lng: 85.2800, fastagRate: 85, state: 'BR' },
    { id: 'toll-muzaffarpur', name: 'Muzaffarpur Bypass Toll', highway: 'NH-27', lat: 26.1150, lng: 85.4100, fastagRate: 90, state: 'BR' }
  ],
  patna_to_varanasi: [
    { id: 'toll-dehri', name: 'Dehri-on-Sone Toll', highway: 'NH-19', lat: 24.9120, lng: 84.1870, fastagRate: 95, state: 'BR' },
    { id: 'toll-sasaram', name: 'Sasaram Toll Plaza', highway: 'NH-19', lat: 24.9520, lng: 84.0310, fastagRate: 105, state: 'BR' },
    { id: 'toll-mohania', name: 'Mohania Toll Plaza', highway: 'NH-19', lat: 25.1720, lng: 83.6640, fastagRate: 115, state: 'BR' }
  ],
  ranchi_to_patna: [
    { id: 'toll-ramgarh', name: 'Ramgarh Toll Plaza', highway: 'NH-20', lat: 23.6300, lng: 85.5180, fastagRate: 80, state: 'JH' },
    { id: 'toll-barhi', name: 'Barhi Toll Plaza', highway: 'NH-19', lat: 24.3010, lng: 85.4210, fastagRate: 120, state: 'JH' },
    { id: 'toll-dobhi', name: 'Dobhi Toll Plaza', highway: 'NH-22', lat: 24.5420, lng: 84.9570, fastagRate: 85, state: 'BR' },
    { id: 'toll-masaurhi', name: 'Masaurhi Toll Plaza', highway: 'NH-22', lat: 25.3520, lng: 85.0210, fastagRate: 65, state: 'BR' }
  ],
  patna_to_bhagalpur: [
    { id: 'toll-bakhtiyarpur', name: 'Bakhtiyarpur Toll Plaza', highway: 'NH-31', lat: 25.4600, lng: 85.5200, fastagRate: 75, state: 'BR' },
    { id: 'toll-mokama', name: 'Mokama Bridge Toll', highway: 'NH-31', lat: 25.3900, lng: 85.9100, fastagRate: 85, state: 'BR' }
  ]
};

const tsFiles = [
  'mobile/apps/passenger/src/utils/biharRoadCorridors.ts',
  'mobile/shared/utils/biharRoadCorridors.ts'
];

for (const p of tsFiles) {
  let content = fs.readFileSync(p, 'utf8');

  // Add TollPlaza interface if missing
  if (!content.includes('export interface TollPlaza')) {
    content = content.replace(
      'export interface RoadCorridor {',
      `export interface TollPlaza {\n  id: string;\n  name: string;\n  highway: string;\n  lat: number;\n  lng: number;\n  fastagRate: number;\n  state: string;\n}\n\nexport interface RoadCorridor {\n  tolls?: TollPlaza[];\n  totalTollFastag?: number;`
    );
  }

  // Update getRoadCorridor to attach tolls
  if (!content.includes('attachTollsToCorridor')) {
    const attachCode = `
export const ROUTE_TOLL_PLAZAS: Record<string, TollPlaza[]> = ${JSON.stringify(TOLL_CORRIDORS, null, 2)};

export function attachTollsToCorridor(corridor: RoadCorridor, oKey: string, dKey: string): RoadCorridor {
  const pairKey = \`\${oKey}_to_\${dKey}\`;
  const revKey = \`\${dKey}_to_\${oKey}\`;
  const tolls = ROUTE_TOLL_PLAZAS[pairKey] || ROUTE_TOLL_PLAZAS[revKey] || [];
  const total = tolls.reduce((acc, t) => acc + t.fastagRate, 0);
  return {
    ...corridor,
    tolls: tolls.length > 0 ? (pairKey in ROUTE_TOLL_PLAZAS ? tolls : [...tolls].reverse()) : undefined,
    totalTollFastag: total > 0 ? total : undefined
  };
}
`;
    // Insert before getRoadCorridor
    content = content.replace('export function getRoadCorridor', attachCode + '\nexport function getRoadCorridor');

    // Update return statements in getRoadCorridor to use attachTollsToCorridor
    content = content.replace(
      'return BIHAR_ROAD_CORRIDORS[key];',
      'return attachTollsToCorridor(BIHAR_ROAD_CORRIDORS[key], oKey, dKey);'
    );
    content = content.replace(
      'return {\n        distanceKm: match.distanceKm,\n        durationMin: match.durationMin,\n        coordinates: [...match.coordinates].reverse()\n      };',
      'return attachTollsToCorridor({\n        distanceKm: match.distanceKm,\n        durationMin: match.durationMin,\n        coordinates: [...match.coordinates].reverse()\n      }, oKey, dKey);'
    );

    // Also update generateRealisticRoadCorridor to synthesize tolls
    content = content.replace(
      'return {\n    distanceKm: roadDistKm,\n    durationMin: durationMin,\n    coordinates: coordinates\n  };',
      `const numTolls = Math.max(1, Math.round(Number(roadDistKm) / 75));
  const syntheticTolls: TollPlaza[] = [];
  let totalToll = 0;
  for (let tIdx = 1; tIdx <= numTolls; tIdx++) {
    const fraction = tIdx / (numTolls + 1);
    const coordIdx = Math.min(coordinates.length - 1, Math.round(coordinates.length * fraction));
    const pt = coordinates[coordIdx];
    const rate = 65 + (tIdx % 3) * 20;
    totalToll += rate;
    syntheticTolls.push({
      id: \`toll-\${tIdx}\`,
      name: \`Highway Toll Plaza #\${tIdx}\`,
      highway: 'National Highway',
      lat: pt[1],
      lng: pt[0],
      fastagRate: rate,
      state: 'NHAI'
    });
  }

  return {
    distanceKm: roadDistKm,
    durationMin: durationMin,
    coordinates: coordinates,
    tolls: syntheticTolls,
    totalTollFastag: totalToll
  };`
    );
  }

  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated tolls in', p);
}

// Also update js/bihar-road-corridors.js
let jsContent = fs.readFileSync('js/bihar-road-corridors.js', 'utf8');
if (!jsContent.includes('ROUTE_TOLL_PLAZAS')) {
  jsContent += `\nwindow.ROUTE_TOLL_PLAZAS = ${JSON.stringify(TOLL_CORRIDORS, null, 2)};\n`;
  fs.writeFileSync('js/bihar-road-corridors.js', jsContent, 'utf8');
  console.log('Updated js/bihar-road-corridors.js with toll database');
}

