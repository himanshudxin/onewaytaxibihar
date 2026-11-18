/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Comprehensive Bihar 38-District Dynamic Fare Calculation & AI Trip Engine
 * Synchronized with website calculator.js and master Patna corridors
 */

import type { RouteFare } from '../data/patnaFares';
import { MASTER_PATNA_FARES, findMatchingFare } from '../data/patnaFares';
const citiesJson = require('../data/cities.json');

export interface CityLocation {
  id: string;
  name: string;
  district?: string;
  lat: number;
  lng: number;
  keywords?: string[];
  tollEst?: number;
}

export interface VehicleQuote {
  id: string;
  title: string;
  subTitle: string;
  models: string;
  price: number;
  advance15: number;
  balance85: number;
  badge: string;
  pax: string;
  bags: string;
  ac: boolean;
  desc: string;
  perKmRate: number;
}

export interface RouteQuoteResult {
  origin: string;
  destination: string;
  distanceKm: number;
  durationText: string;
  tollEstimate: number;
  isCorridorMatch: boolean;
  tripType: 'one-way' | 'round-trip';
  tiers: VehicleQuote[];
}

export interface AiParsedTrip {
  success: boolean;
  origin: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  tripType: 'one-way' | 'round-trip';
  recommendedTier: string;
  passengers: number;
  rawQuery: string;
}

const CITIES: CityLocation[] = citiesJson as CityLocation[];

// Normalize city strings for fuzzy matching
function cleanName(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds coordinates and metadata for any Bihar city, district, or landmark
 */
export function resolveLocation(query: string): CityLocation | null {
  if (!query || !query.trim()) return null;
  const q = cleanName(query);

  // 1. Exact match on ID or Name
  const exact = CITIES.find(c => cleanName(c.name) === q || c.id === q);
  if (exact) return exact;

  // 2. Starts with / includes match
  const starts = CITIES.find(c => cleanName(c.name).startsWith(q) || q.startsWith(cleanName(c.name)));
  if (starts) return starts;

  // 3. Keyword / District match
  const keywordMatch = CITIES.find(c => {
    if (c.district && cleanName(c.district) === q) return true;
    if (c.keywords && c.keywords.some(k => cleanName(k).includes(q) || q.includes(cleanName(k)))) return true;
    return false;
  });
  if (keywordMatch) return keywordMatch;

  // 4. Word overlap fallback
  const qWords = q.split(' ').filter(w => w.length >= 3);
  const wordMatch = CITIES.find(c => {
    const cWords = cleanName(c.name).split(' ');
    return qWords.some(qw => cWords.includes(qw));
  });

  return wordMatch || null;
}

/**
 * Computes road distance between two coordinates using Haversine formula + 1.28x Bihar highway tortuosity factor
 */
export function calculateRoadDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Real road distance in Bihar is approximately 1.28x of straight line air distance
  return Math.max(25, Math.round(R * c * 1.28));
}

/**
 * Computes exact duration text for a given km distance
 */
export function calculateDurationText(distanceKm: number): string {
  // Average highway transit speed in Bihar is ~46 km/h including tolls & towns
  const hours = Math.floor(distanceKm / 46);
  const mins = Math.round((distanceKm % 46) * 1.3);
  if (hours === 0) return `${Math.max(25, mins)} mins`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} mins`;
}

/**
 * Comprehensive Fare Engine: computes authentic fares across all 5 vehicle tiers for any route in Bihar
 */
export function computeRouteQuote(
  origin: string,
  destination: string,
  tripType: 'one-way' | 'round-trip' = 'one-way'
): RouteQuoteResult {
  const oClean = cleanName(origin || 'Patna');
  const dClean = cleanName(destination || 'Gaya');
  const isRoundTrip = tripType === 'round-trip';

  // Check if route connects directly with Patna (authoritative fixed corridor matrix)
  const isPatnaConnected = oClean.includes('patna') || dClean.includes('patna');
  let matchedCorridor: RouteFare | null = null;

  if (isPatnaConnected) {
    matchedCorridor = findMatchingFare(origin, destination, MASTER_PATNA_FARES);
  }

  let distanceKm = 104;
  let durationText = '2 hr 30 mins';
  let tollEstimate = 90;
  let isCorridorMatch = false;

  // Base raw vehicle prices
  let rawHatch = 1799;
  let rawSedan = 1999;
  let rawExecSedan = 2249;
  let rawSuv = 2499;
  let rawInnova = 3299;

  if (matchedCorridor && matchedCorridor.distanceKm > 0) {
    isCorridorMatch = true;
    distanceKm = matchedCorridor.distanceKm;
    durationText = calculateDurationText(distanceKm);
    tollEstimate = Math.round((distanceKm / 75) * 60);

    rawSedan = matchedCorridor.sedan || Math.round(distanceKm * 21.0);
    rawHatch = matchedCorridor.hatchback || Math.max(899, rawSedan - 200);
    rawExecSedan = matchedCorridor.execSedan || (rawSedan + 250);
    rawSuv = matchedCorridor.suv || (rawSedan + 450);
    rawInnova = matchedCorridor.luxSuv || (rawSedan + 800);
  } else {
    // Dynamic inter-district calculation across all 38 Bihar districts
    const oLoc = resolveLocation(origin);
    const dLoc = resolveLocation(destination);

    if (oLoc && dLoc) {
      distanceKm = calculateRoadDistanceKm(oLoc.lat, oLoc.lng, dLoc.lat, dLoc.lng);
      durationText = calculateDurationText(distanceKm);
      tollEstimate = Math.round((distanceKm / 75) * 60);
    } else {
      distanceKm = 110;
      durationText = '2 hr 45 mins';
      tollEstimate = 90;
    }

    // Dynamic per-km rate algorithm matching website calculator.js
    // Hatchback: ₹899 base (first 40 km) + ₹11.0/km
    const hatchExtraKm = Math.max(0, distanceKm - 40);
    rawHatch = Math.max(899, Math.round(899 + hatchExtraKm * 11.0));

    // Sedan: ₹999 base (first 40 km) + ₹13.0/km
    const sedanExtraKm = Math.max(0, distanceKm - 40);
    rawSedan = Math.max(999, Math.round(999 + sedanExtraKm * 13.0));

    // Executive Sedan: ₹1,249 base + ₹15.0/km
    rawExecSedan = Math.round(rawSedan + 250);

    // SUV (Ertiga / Bolero Neo): ₹1,499 base + ₹17.5/km
    const suvExtraKm = Math.max(0, distanceKm - 40);
    rawSuv = Math.max(1499, Math.round(1499 + suvExtraKm * 17.5));

    // Innova Crysta: ₹2,199 base + ₹23.0/km
    const innovaExtraKm = Math.max(0, distanceKm - 40);
    rawInnova = Math.max(2199, Math.round(2199 + innovaExtraKm * 23.0));
  }

  // Round-trip logic: 2x distance with 12% return leg discount
  const applyRoundTrip = (oneWayPrice: number, explicitTwoWay?: number) => {
    if (!isRoundTrip) return oneWayPrice;
    if (explicitTwoWay && explicitTwoWay > 0) return explicitTwoWay;
    return Math.round(oneWayPrice * 1.76); // 12% discount on 2x = 1.76x
  };

  const finalHatch = applyRoundTrip(rawHatch, matchedCorridor?.twoWay?.hatchback);
  const finalSedan = applyRoundTrip(rawSedan, matchedCorridor?.twoWay?.sedan);
  const finalExecSedan = applyRoundTrip(rawExecSedan, matchedCorridor?.twoWay?.execSedan);
  const finalSuv = applyRoundTrip(rawSuv, matchedCorridor?.twoWay?.suv);
  const finalInnova = applyRoundTrip(rawInnova, matchedCorridor?.twoWay?.luxSuv);

  const effectiveDistance = isRoundTrip ? distanceKm * 2 : distanceKm;

  const buildTier = (
    id: string,
    title: string,
    subTitle: string,
    models: string,
    price: number,
    badge: string,
    pax: string,
    bags: string,
    perKmRate: number,
    desc: string
  ): VehicleQuote => {
    const advance15 = Math.round(price * 0.15);
    const balance85 = price - advance15;
    return {
      id,
      title,
      subTitle,
      models,
      price,
      advance15,
      balance85,
      badge,
      pax,
      bags,
      ac: true,
      perKmRate,
      desc
    };
  };

  const tiers: VehicleQuote[] = [
    buildTier(
      'hatchback',
      'Hatchback',
      isRoundTrip ? 'Round-Trip Return Included' : 'One-Way Drop • No Return Fare',
      'Maruti WagonR, Tata Tiago, Celerio',
      finalHatch,
      'BEST VALUE',
      '4 Passengers',
      '2 Medium Bags',
      11.0,
      'Affordable compact hatchback for budget travelers.'
    ),
    buildTier(
      'sedan',
      'Sedan',
      isRoundTrip ? 'Round-Trip Return Included' : 'Prime Sedan • No Return Fare',
      'Maruti Dzire, Toyota Etios, Honda Amaze',
      finalSedan,
      'MOST POPULAR',
      '4 Passengers',
      '3-4 Large Bags',
      13.0,
      'Comfortable prime sedan with spacious trunk and extra legroom.'
    ),
    buildTier(
      'sedan_prime',
      'Executive Sedan',
      isRoundTrip ? 'Round-Trip Return Included' : 'Executive Business Class',
      'Maruti Ciaz, Hyundai Verna, Honda City',
      finalExecSedan,
      'PREMIUM EXECUTIVE',
      '4 Passengers',
      '4 Large Bags',
      15.0,
      'High-end executive sedan for corporate and VIP travel.'
    ),
    buildTier(
      'suv',
      'SUV (6+1)',
      isRoundTrip ? 'Round-Trip Return Included' : 'Spacious Family Outstation',
      'Maruti Ertiga, Kia Carens, Bolero Neo',
      finalSuv,
      'SPACIOUS 6+1',
      '6 Passengers',
      '4-5 Large Bags',
      17.5,
      'Spacious MUV/SUV for large families and luggage.'
    ),
    buildTier(
      'innova_crysta',
      'Innova Crysta',
      isRoundTrip ? 'Round-Trip Return Included' : 'Ultra Luxury Highway Captain',
      'Toyota Innova Crysta (Rear Captain Seats)',
      finalInnova,
      'ULTRA LUXURY',
      '6-7 Passengers',
      '5+ Large Bags',
      23.0,
      'The gold standard of highway comfort with dual AC and plush captain recliners.'
    )
  ];

  return {
    origin,
    destination,
    distanceKm: effectiveDistance,
    durationText,
    tollEstimate,
    isCorridorMatch,
    tripType,
    tiers
  };
}

/**
 * AI Natural Language Trip Parser: parses natural language queries and extracts trip intent
 * e.g. "Patna to Gaya tomorrow 8am sedan" -> { origin: "Patna", destination: "Gaya", date: "Tomorrow", ... }
 */
export function parseNaturalLanguageTrip(query: string, defaultOrigin: string = 'Patna'): AiParsedTrip {
  const cleanQ = String(query || '').trim();
  const lowerQ = cleanQ.toLowerCase();

  let origin = defaultOrigin || 'Patna';
  let destination = '';
  let pickupDate = 'Today';
  let pickupTime = 'Immediate (Next 15-30m)';
  let tripType: 'one-way' | 'round-trip' = 'one-way';
  let recommendedTier = 'sedan';
  let passengers = 4;

  // 1. Detect Round Trip
  if (/\b(round trip|roundtrip|return|two way|both side)\b/i.test(lowerQ)) {
    tripType = 'round-trip';
  }

  // 2. Detect Date
  if (/\b(tomorrow|kal)\b/i.test(lowerQ)) {
    pickupDate = 'Tomorrow';
  } else if (/\b(day after|parso)\b/i.test(lowerQ)) {
    pickupDate = 'Day After';
  } else if (/\b(weekend|sunday|saturday)\b/i.test(lowerQ)) {
    pickupDate = 'This Weekend';
  }

  // 3. Detect Time
  if (/\b(morning|subah|dawn)\b/i.test(lowerQ)) {
    pickupTime = '06:30 AM (Morning Departure)';
  } else if (/\b(evening|shaam|dusk)\b/i.test(lowerQ)) {
    pickupTime = '06:30 PM (Evening)';
  } else if (/\b(afternoon|dopahar|noon)\b/i.test(lowerQ)) {
    pickupTime = '12:30 PM (Noon Transit)';
  } else if (/\b(night|raat|late)\b/i.test(lowerQ)) {
    pickupTime = '10:30 PM (Night Express)';
  } else {
    // Specific time regex e.g. "8am", "8:30 am", "4 pm"
    const timeMatch = lowerQ.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
    if (timeMatch) {
      const hh = timeMatch[1].padStart(2, '0');
      const mm = timeMatch[2] || '00';
      const mer = timeMatch[3].toUpperCase();
      pickupTime = `${hh}:${mm} ${mer}`;
    }
  }

  // 4. Detect Vehicle Tier
  if (/\b(hatchback|wagonr|tiago|celerio|small car|budget)\b/i.test(lowerQ)) {
    recommendedTier = 'hatchback';
    passengers = 4;
  } else if (/\b(innova|crysta|luxury|captain)\b/i.test(lowerQ)) {
    recommendedTier = 'innova_crysta';
    passengers = 7;
  } else if (/\b(suv|ertiga|carens|bolero|6 seater|7 seater|family)\b/i.test(lowerQ)) {
    recommendedTier = 'suv';
    passengers = 6;
  } else if (/\b(executive|ciaz|verna|city)\b/i.test(lowerQ)) {
    recommendedTier = 'sedan_prime';
    passengers = 4;
  } else {
    recommendedTier = 'sedan';
    passengers = 4;
  }

  // 5. Detect Origin and Destination
  // Check "from X to Y"
  const fromToMatch = cleanQ.match(/from\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
  if (fromToMatch) {
    const rawOrigin = fromToMatch[1].trim();
    const rawDest = fromToMatch[2].split(/\s+(tomorrow|today|at|in|by|for|sedan|suv|hatchback|car|cab)\b/i)[0].trim();
    const oLoc = resolveLocation(rawOrigin);
    const dLoc = resolveLocation(rawDest);
    if (oLoc) origin = oLoc.name;
    if (dLoc) destination = dLoc.name;
  } else {
    // Check "X to Y"
    const toMatch = cleanQ.match(/([a-zA-Z\s]+?)\s+to\s+([a-zA-Z\s]+)/i);
    if (toMatch) {
      const rawOrigin = toMatch[1].trim();
      const rawDest = toMatch[2].split(/\s+(tomorrow|today|at|in|by|for|sedan|suv|hatchback|car|cab)\b/i)[0].trim();
      const oLoc = resolveLocation(rawOrigin);
      const dLoc = resolveLocation(rawDest);
      if (oLoc) origin = oLoc.name;
      if (dLoc) destination = dLoc.name;
    } else {
      // Look for any known city mentioned in query
      for (const city of CITIES) {
        if (lowerQ.includes(cleanName(city.name))) {
          if (!destination) {
            destination = city.name;
          } else if (destination !== city.name && origin === 'Patna') {
            origin = destination;
            destination = city.name;
          }
        }
      }
    }
  }

  // If no destination detected, default to Gaya
  if (!destination) {
    destination = 'Gaya';
  }

  return {
    success: Boolean(destination),
    origin: origin || 'Patna',
    destination,
    pickupDate,
    pickupTime,
    tripType,
    recommendedTier,
    passengers,
    rawQuery: query
  };
}
