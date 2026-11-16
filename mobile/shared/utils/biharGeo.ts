export interface LatLng {
  lat: number;
  lng: number;
}

export const BIHAR_CITY_COORDINATES: Record<string, LatLng> = {
  patna: { lat: 25.5941, lng: 85.1376 },
  gaya: { lat: 24.7955, lng: 85.0002 },
  bodhgaya: { lat: 24.6961, lng: 84.9870 },
  muzaffarpur: { lat: 26.1209, lng: 85.3647 },
  darbhanga: { lat: 26.1542, lng: 85.8918 },
  bhagalpur: { lat: 25.2425, lng: 86.9842 },
  begusarai: { lat: 25.4182, lng: 86.1272 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  purnea: { lat: 25.7771, lng: 87.4753 },
  siwan: { lat: 26.2196, lng: 84.3567 },
  rajgir: { lat: 25.0194, lng: 85.4217 },
  nalanda: { lat: 25.1357, lng: 85.4578 },
  samastipur: { lat: 25.8560, lng: 85.7868 },
  chapra: { lat: 25.7796, lng: 84.7499 },
  chhapra: { lat: 25.7796, lng: 84.7499 },
  saran: { lat: 25.7796, lng: 84.7499 },
  motihari: { lat: 26.6470, lng: 84.9089 },
  eastchamparan: { lat: 26.6470, lng: 84.9089 },
  bettiah: { lat: 26.8016, lng: 84.5029 },
  westchamparan: { lat: 26.8016, lng: 84.5029 },
  munger: { lat: 25.3757, lng: 86.4744 },
  saharsa: { lat: 25.8835, lng: 86.6006 },
  deoghar: { lat: 24.4826, lng: 86.7001 },
  ranchi: { lat: 23.3441, lng: 85.3096 },
  arrah: { lat: 25.5560, lng: 84.6603 },
  ara: { lat: 25.5560, lng: 84.6603 },
  bhojpur: { lat: 25.5560, lng: 84.6603 },
  sasaram: { lat: 24.9522, lng: 84.0322 },
  rohtas: { lat: 24.9522, lng: 84.0322 },
  buxar: { lat: 25.5647, lng: 83.9777 },
  madhubani: { lat: 26.3533, lng: 86.0719 },
  sitamarhi: { lat: 26.5954, lng: 85.4891 },
  katihar: { lat: 25.5434, lng: 87.5683 },
  kishanganj: { lat: 26.0967, lng: 87.9427 },
  hajipur: { lat: 25.6858, lng: 85.2146 },
  vaishali: { lat: 25.6858, lng: 85.2146 },
  biharsharif: { lat: 25.1982, lng: 85.5149 },
  jehanabad: { lat: 25.2136, lng: 84.9866 },
  aurangabad: { lat: 24.7539, lng: 84.3742 },
  nawada: { lat: 24.8872, lng: 85.5413 },
  jamui: { lat: 24.9213, lng: 86.2223 },
  banka: { lat: 24.8860, lng: 86.9209 },
  khagaria: { lat: 25.5034, lng: 86.4727 },
  madhepura: { lat: 25.9261, lng: 86.7937 },
  supaul: { lat: 26.1260, lng: 86.5950 },
  araria: { lat: 26.1495, lng: 87.5140 },
  gopalganj: { lat: 26.4687, lng: 84.4428 },
  arwal: { lat: 25.2435, lng: 84.6738 },
  lakhisarai: { lat: 25.1764, lng: 86.0945 },
  sheikhpura: { lat: 25.1384, lng: 85.8569 },
  bhabua: { lat: 25.0487, lng: 83.6152 },
  kaimur: { lat: 25.0487, lng: 83.6152 },
  sheohar: { lat: 26.5165, lng: 85.2952 },
  gorakhpur: { lat: 26.7606, lng: 83.3732 },
  siliguri: { lat: 26.7271, lng: 88.3953 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  kolkata: { lat: 22.5726, lng: 88.3639 }
};

export function getCityCoordinates(cityName: string, fallback: LatLng = { lat: 25.5941, lng: 85.1376 }): LatLng {
  if (!cityName) return fallback;
  const raw = String(cityName).trim().toLowerCase();
  const withoutParens = raw.replace(/\(.*?\)/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
  const fullClean = raw.replace(/[^a-z]/g, '');
  const tokens = withoutParens.split(' ').filter(w => w.length >= 3);

  // 1. Direct key match on clean name
  if (BIHAR_CITY_COORDINATES[withoutParens.replace(/\s+/g, '')]) {
    return BIHAR_CITY_COORDINATES[withoutParens.replace(/\s+/g, '')];
  }
  if (BIHAR_CITY_COORDINATES[fullClean]) {
    return BIHAR_CITY_COORDINATES[fullClean];
  }

  // 2. Token match
  for (const token of tokens) {
    if (BIHAR_CITY_COORDINATES[token]) {
      return BIHAR_CITY_COORDINATES[token];
    }
  }

  // 3. Substring match
  for (const [k, coords] of Object.entries(BIHAR_CITY_COORDINATES)) {
    if (fullClean.includes(k) || k.includes(fullClean) || tokens.some(t => t.includes(k) || k.includes(t))) {
      return coords;
    }
  }

  return fallback;
}
