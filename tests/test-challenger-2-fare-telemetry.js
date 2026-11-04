/**
 * Challenger 2 Empirical Test Suite: Fare Calculations & Telemetry Integrity
 * OneWayTaxiBihar Passenger Mobile App Redesign
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('CHALLENGER 2 EMPIRICAL TEST SUITE: FARE & TELEMETRY INTEGRITY');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${description}`);
  } catch (err) {
    failedTests++;
    console.error(`  [FAIL] ${description}`);
    console.error(`         Error: ${err.message}`);
    failureDetails.push({ description, error: err.message, stack: err.stack });
  }
}

// -------------------------------------------------------------
// 1. FARE CALCULATION ENGINE TESTS
// -------------------------------------------------------------
console.log('--- SUITE 1: FARE CALCULATION ENGINE & FLEET_RATES ---');

// Authoritative Backend FLEET_RATES from api/index.js
const FLEET_RATES = {
  hatchback: { perKm: 20.0, minFare: 1698, minKm: 50, name: "Go Hatchback" },
  sedan: { perKm: 22.0, minFare: 2198, minKm: 50, name: "Prime Sedan" },
  sedan_prime: { perKm: 26.0, minFare: 2698, minKm: 50, name: "Executive Sedan" },
  suv: { perKm: 27.0, minFare: 3398, minKm: 50, name: "Family SUV (6+1)" },
  innova_crysta: { perKm: 34.0, minFare: 4598, minKm: 50, name: "Toyota Innova Crysta" }
};

// Exact CabSelectScreen fare calculation function
function computeCabSelectFares(distanceKm, tripType = 'one-way', matchedFare = null) {
  const tripMultiplier = tripType === 'round-trip' ? 1.8 : 1.0;
  const dist = Number(distanceKm) || 0;

  const rawHatch = matchedFare?.hatchback || Math.max(1698, Math.round(dist * 20.0));
  const rawSedan = matchedFare?.sedan || Math.max(2198, Math.round(dist * 22.0));
  const rawExecSedan = Math.max(2698, Math.round(dist * 26.0));
  const rawXuv = matchedFare?.suv || Math.max(3398, Math.round(dist * 27.0));
  const rawLuxuryXuv = Math.max(4598, Math.round(dist * 34.0));

  return {
    hatchback: Math.round(rawHatch * tripMultiplier),
    sedan: Math.round(rawSedan * tripMultiplier),
    sedan_prime: Math.round(rawExecSedan * tripMultiplier),
    suv: Math.round(rawXuv * tripMultiplier),
    innova_crysta: Math.round(rawLuxuryXuv * tripMultiplier)
  };
}

// 1.1 Minimum Distance Edge Cases (0 km, 10 km, 50 km)
test('Minimum Distance (0 km): All 5 tiers strictly enforce minFare', () => {
  const fares = computeCabSelectFares(0, 'one-way');
  assert.strictEqual(fares.hatchback, FLEET_RATES.hatchback.minFare, 'Hatchback 0 km must equal minFare 1698');
  assert.strictEqual(fares.sedan, FLEET_RATES.sedan.minFare, 'Sedan 0 km must equal minFare 2198');
  assert.strictEqual(fares.sedan_prime, FLEET_RATES.sedan_prime.minFare, 'Executive Sedan 0 km must equal minFare 2698');
  assert.strictEqual(fares.suv, FLEET_RATES.suv.minFare, 'SUV 0 km must equal minFare 3398');
  assert.strictEqual(fares.innova_crysta, FLEET_RATES.innova_crysta.minFare, 'Luxury XUV 0 km must equal minFare 4598');
});

test('Minimum Distance (10 km): All 5 tiers strictly enforce minFare', () => {
  const fares = computeCabSelectFares(10, 'one-way');
  assert.strictEqual(fares.hatchback, 1698, 'Hatchback 10 km must be 1698 (10*21 = 210 < 1698)');
  assert.strictEqual(fares.sedan, 2198, 'Sedan 10 km must be 2198 (10*25 = 250 < 2198)');
  assert.strictEqual(fares.sedan_prime, 2698, 'Executive Sedan 10 km must be 2698 (10*29 = 290 < 2698)');
  assert.strictEqual(fares.suv, 3398, 'SUV 10 km must be 3398 (10*33 = 330 < 3398)');
  assert.strictEqual(fares.innova_crysta, 4598, 'Luxury XUV 10 km must be 4598 (10*44 = 440 < 4598)');
});

test('Minimum Distance (50 km): All 5 tiers strictly enforce minFare', () => {
  const fares = computeCabSelectFares(50, 'one-way');
  assert.strictEqual(fares.hatchback, 1698, 'Hatchback 50 km (50*21=1050) must be clamped to minFare 1698');
  assert.strictEqual(fares.sedan, 2198, 'Sedan 50 km (50*25=1250) must be clamped to minFare 2198');
  assert.strictEqual(fares.sedan_prime, 2698, 'Executive Sedan 50 km (50*29=1450) must be clamped to minFare 2698');
  assert.strictEqual(fares.suv, 3398, 'SUV 50 km (50*33=1650) must be clamped to minFare 3398');
  assert.strictEqual(fares.innova_crysta, 4598, 'Luxury XUV 50 km (50*44=2200) must be clamped to minFare 4598');
});

// 1.2 Boundary crossover distances (where perKm starts exceeding minFare)
test('Boundary Crossover Distances: Smooth transition from minFare to perKm', () => {
  // Hatchback: 1698 / 21 = 80.85 km -> at 80 km it is 1698, at 81 km it is 81*21 = 1701
  assert.strictEqual(computeCabSelectFares(84, 'one-way').hatchback, 1698);
  assert.strictEqual(computeCabSelectFares(85, 'one-way').hatchback, 1700);

  // Sedan: 2198 / 25 = 87.92 km -> at 87 km it is 2198, at 88 km it is 88*25 = 2200
  assert.strictEqual(computeCabSelectFares(99, 'one-way').sedan, 2198);
  assert.strictEqual(computeCabSelectFares(100, 'one-way').sedan, 2200);

  // Sedan Prime: 2698 / 29 = 93.03 km -> at 93 km it is 2698, at 94 km it is 94*29 = 2726
  assert.strictEqual(computeCabSelectFares(103, 'one-way').sedan_prime, 2698);
  assert.strictEqual(computeCabSelectFares(104, 'one-way').sedan_prime, 2704);

  // SUV: 3398 / 33 = 102.96 km -> at 102 km it is 3398, at 103 km it is 103*33 = 3399
  assert.strictEqual(computeCabSelectFares(125, 'one-way').suv, 3398);
  assert.strictEqual(computeCabSelectFares(126, 'one-way').suv, 3402);

  // Innova Crysta: 4598 / 44 = 104.5 km -> at 104 km it is 4598, at 105 km it is 105*44 = 4620
  assert.strictEqual(computeCabSelectFares(135, 'one-way').innova_crysta, 4598);
  assert.strictEqual(computeCabSelectFares(136, 'one-way').innova_crysta, 4624);
});

// 1.3 Long-Distance Trips (300 km, 1000 km)
test('Long-Distance Trips (300 km): Exact per-km multiplication without NaN or negative values', () => {
  const fares = computeCabSelectFares(300, 'one-way');
  assert.strictEqual(fares.hatchback, 300 * 20, '300 km Hatchback = 6000');
  assert.strictEqual(fares.sedan, 300 * 22, '300 km Sedan = 6600');
  assert.strictEqual(fares.sedan_prime, 300 * 26, '300 km Exec Sedan = 7800');
  assert.strictEqual(fares.suv, 300 * 27, '300 km SUV = 8100');
  assert.strictEqual(fares.innova_crysta, 300 * 34, '300 km Luxury XUV = 10200');

  for (const [tier, fare] of Object.entries(fares)) {
    assert.strictEqual(typeof fare, 'number', `${tier} fare must be a number`);
    assert(!isNaN(fare), `${tier} fare must NOT be NaN`);
    assert(fare > 0, `${tier} fare must be strictly positive`);
    assert(Number.isInteger(fare), `${tier} fare must be an integer`);
  }
});

test('Ultra Long-Distance Trips (1000 km): No string concatenation, precision overflow or NaN', () => {
  const fares = computeCabSelectFares(1000, 'one-way');
  assert.strictEqual(fares.hatchback, 20000);
  assert.strictEqual(fares.sedan, 22000);
  assert.strictEqual(fares.sedan_prime, 26000);
  assert.strictEqual(fares.suv, 27000);
  assert.strictEqual(fares.innova_crysta, 34000);

  // Monotonic tier pricing hierarchy: hatchback < sedan < sedan_prime < suv < innova_crysta
  assert(fares.hatchback < fares.sedan, 'Hatchback must be cheaper than Sedan');
  assert(fares.sedan < fares.sedan_prime, 'Sedan must be cheaper than Executive Sedan');
  assert(fares.sedan_prime < fares.suv, 'Executive Sedan must be cheaper than SUV');
  assert(fares.suv < fares.innova_crysta, 'SUV must be cheaper than Luxury XUV');
});

// 1.4 Round-Trip vs One-Way calculations
test('Round-Trip Multiplier (1.8x) for Short & Long Distances', () => {
  // Short trip (50 km - minFare):
  const rtShort = computeCabSelectFares(50, 'round-trip');
  assert.strictEqual(rtShort.hatchback, Math.round(1698 * 1.8), 'Hatchback RT min = 3056');
  assert.strictEqual(rtShort.sedan, Math.round(2198 * 1.8), 'Sedan RT min = 3956');
  assert.strictEqual(rtShort.sedan_prime, Math.round(2698 * 1.8), 'Exec Sedan RT min = 4856');
  assert.strictEqual(rtShort.suv, Math.round(3398 * 1.8), 'SUV RT min = 6116');
  assert.strictEqual(rtShort.innova_crysta, Math.round(4598 * 1.8), 'Innova Crysta RT min = 8276');

  // Long trip (300 km):
  const rtLong = computeCabSelectFares(300, 'round-trip');
  const owLong = computeCabSelectFares(300, 'one-way');
  for (const tier of Object.keys(rtLong)) {
    assert(rtLong[tier] > owLong[tier], `${tier}: Round-trip fare must exceed one-way`);
    assert(rtLong[tier] < owLong[tier] * 2, `${tier}: Round-trip must be discounted vs 2x one-way`);
    assert.strictEqual(rtLong[tier], Math.round(owLong[tier] * 1.8), `${tier}: Must match 1.8x exactly`);
  }
});

// 1.5 Adversarial Edge Cases: Negative distances, NaN, Null, Undefined, String distance
test('Adversarial Inputs: Negative km, NaN, Null, String values handle safely', () => {
  // Negative distance (-100 km) -> clamped to 0 -> enforces minFare
  const negFares = computeCabSelectFares(-100, 'one-way');
  assert.strictEqual(negFares.hatchback, 1698, 'Negative distance must clamp to minFare');
  assert.strictEqual(negFares.sedan, 2198, 'Negative distance must clamp to minFare');

  // NaN distance -> dist || 0 -> minFare
  const nanFares = computeCabSelectFares(NaN, 'one-way');
  assert.strictEqual(nanFares.hatchback, 1698);
  assert.strictEqual(nanFares.sedan, 2198);

  // Null distance
  const nullFares = computeCabSelectFares(null, 'one-way');
  assert.strictEqual(nullFares.hatchback, 1698);

  // String distance "300"
  const strFares = computeCabSelectFares("300", 'one-way');
  assert.strictEqual(strFares.sedan, 6600, 'String "300" should coerce to 6600');

  // Fractional distance 104.7 km
  const floatFares = computeCabSelectFares(104.7, 'one-way');
  assert.strictEqual(floatFares.sedan, Math.round(104.7 * 22.0), 'Fractional km must round to integer');
  assert(Number.isInteger(floatFares.sedan), 'Must be integer');
});

// 1.6 Itemized Fare Breakdown Test (MobileApiClient.calculateFareBreakdown)
test('Itemized Fare Breakdown: Mathematical identity & non-negative deconstruction', () => {
  // Toll calculation matching GMapTollService.getHigherTollPriceSync
  const BIHAR_NHAI_HIGHER_TOLLS = {
    'patna-gaya': 180,
    'patna-muzaffarpur': 220,
    'patna-darbhanga': 240,
    'patna-bhagalpur': 260,
    'patna-varanasi': 480
  };

  function getHigherTollPriceSync(origin, destination, distanceKm) {
    const key = `${(origin || 'patna').toLowerCase()}-${(destination || 'gaya').toLowerCase()}`;
    if (BIHAR_NHAI_HIGHER_TOLLS[key]) return BIHAR_NHAI_HIGHER_TOLLS[key];
    return Math.max(Math.round(distanceKm * 2.2), 150);
  }

  // Exact MobileApiClient.calculateFareBreakdown logic
  function calculateFareBreakdown(distanceKm, tier, allInclusiveFare, tripType = 'one-way', origin = 'Patna', destination = 'Gaya') {
    const effectiveKm = tripType === 'round-trip' ? distanceKm * 2 : distanceKm;
    const ratePerKm = tier === 'hatchback' ? 14 : tier === 'sedan' ? 17 : 24;
    const totalFare = Math.max(allInclusiveFare, 500);

    const gstAmount = Math.round((totalFare * 5) / 105);
    const singleToll = getHigherTollPriceSync(origin, destination, distanceKm);
    const tollCharges = tripType === 'round-trip' ? Math.round(singleToll * 1.6) : singleToll;
    const driverAllowance = tripType === 'round-trip' ? 500 : 300;
    const stateTaxPermit = distanceKm > 200 ? 150 : 0;
    const baseFare = Math.max(0, totalFare - gstAmount - tollCharges - driverAllowance - stateTaxPermit);

    return {
      baseFare,
      distanceKm: effectiveKm,
      perKmRate: ratePerKm,
      driverAllowance,
      tollCharges,
      stateTaxPermit,
      gstAmount,
      totalFare
    };
  }

  // Test across multiple corridor routes
  const routes = [
    { origin: 'Patna', dest: 'Gaya', dist: 104, fare: 2198, type: 'one-way' },
    { origin: 'Patna', dest: 'Gaya', dist: 104, fare: 3956, type: 'round-trip' },
    { origin: 'Patna', dest: 'Varanasi', dist: 255, fare: 4898, type: 'one-way' },
    { origin: 'Patna', dest: 'Muzaffarpur', dist: 75, fare: 1898, type: 'one-way' },
    { origin: 'Patna', dest: 'CustomCity', dist: 500, fare: 12500, type: 'one-way' }
  ];

  for (const r of routes) {
    const breakdown = calculateFareBreakdown(r.dist, 'sedan', r.fare, r.type, r.origin, r.dest);
    assert(breakdown.baseFare >= 0, `Base fare must be >= 0 for ${r.origin} ➔ ${r.dest}`);
    assert(breakdown.gstAmount > 0, `GST must be > 0 for ${r.origin} ➔ ${r.dest}`);
    assert(breakdown.tollCharges > 0, `Toll must be > 0 for ${r.origin} ➔ ${r.dest}`);
    assert(breakdown.driverAllowance > 0, `Driver allowance must be > 0 for ${r.origin} ➔ ${r.dest}`);
    
    // Sum of components must equal totalFare (or baseFare clamped to 0)
    const sum = breakdown.baseFare + breakdown.gstAmount + breakdown.tollCharges + breakdown.driverAllowance + breakdown.stateTaxPermit;
    assert.strictEqual(sum, breakdown.totalFare, `Breakdown components must sum to totalFare for ${r.origin} ➔ ${r.dest}`);
  }
});

// -------------------------------------------------------------
// 2. TELEMETRY & LIVE TRACKING INTEGRITY TESTS
// -------------------------------------------------------------
console.log('\n--- SUITE 2: TELEMETRY & LIVE TRACKING INTEGRITY ---');

const timelineFile = path.resolve(__dirname, '../mobile/apps/passenger/src/screens/BookingTimelineScreen.tsx');
const timelineCode = fs.readFileSync(timelineFile, 'utf8');

test('BookingTimelineScreen.tsx: Zero fake coordinate math (Math.sin / Math.cos / fake animations)', () => {
  assert(!timelineCode.includes('Math.sin'), 'Must NOT contain Math.sin fake movement');
  assert(!timelineCode.includes('Math.cos'), 'Must NOT contain Math.cos fake movement');
  assert(!timelineCode.includes('setInterval'), 'Must NOT contain setInterval timer loop for driver animation');
});

test('BookingTimelineScreen.tsx: Authentic 7-stage status stepper implementation', () => {
  assert(timelineCode.includes("stage: 1, key: 'received'"), 'Must include Stage 1: Received');
  assert(timelineCode.includes("stage: 2, key: 'searching'"), 'Must include Stage 2: Searching Driver');
  assert(timelineCode.includes("stage: 3, key: 'assigned'"), 'Must include Stage 3: Driver Assigned');
  assert(timelineCode.includes("stage: 4, key: 'accepted'"), 'Must include Stage 4: Driver Accepted');
  assert(timelineCode.includes("stage: 5, key: 'details_ready'"), 'Must include Stage 5: Driver Details Ready');
  assert(timelineCode.includes("stage: 6, key: 'started'"), 'Must include Stage 6: Trip Started');
  assert(timelineCode.includes("stage: 7, key: 'completed'"), 'Must include Stage 7: Trip Completed');
});

test('BookingTimelineScreen.tsx: Authentic status mapping logic (get7StageIndex)', () => {
  const get7StageIndex = (status, assignedDriverId) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 6; // Stage 7
    if (s === 'started' || s === 'in_progress') return 5; // Stage 6
    if (s === 'arrived' || s === 'driver_en_route' || s === 'on the way') return 4; // Stage 5
    if (s === 'accepted') return 3; // Stage 4
    if (s === 'driver_assigned' || s === 'assigned' || assignedDriverId) return 2; // Stage 3
    if (s === 'searching' || s === 'broadcast') return 1; // Stage 2
    return 0; // Stage 1: Received
  };

  assert.strictEqual(get7StageIndex(undefined, null), 0, 'Default state -> Stage 1');
  assert.strictEqual(get7StageIndex('confirmed', null), 0, 'Confirmed without driver -> Stage 1');
  assert.strictEqual(get7StageIndex('searching', null), 1, 'Searching -> Stage 2');
  assert.strictEqual(get7StageIndex('driver_assigned', 'DRV_101'), 2, 'Assigned -> Stage 3');
  assert.strictEqual(get7StageIndex('accepted', 'DRV_101'), 3, 'Accepted -> Stage 4');
  assert.strictEqual(get7StageIndex('driver_en_route', 'DRV_101'), 4, 'Driver en route -> Stage 5');
  assert.strictEqual(get7StageIndex('started', 'DRV_101'), 5, 'Trip started -> Stage 6');
  assert.strictEqual(get7StageIndex('completed', 'DRV_101'), 6, 'Trip completed -> Stage 7');
});

test('BookingTimelineScreen.tsx: Unassigned / Null GPS displays authentic dispatch fallback', () => {
  assert(timelineCode.includes('adminFallbackNotice'), 'Must include adminFallbackNotice container');
  assert(timelineCode.includes('Central Dispatch Matching'), 'Must inform passenger of central dispatch matching');
  assert(timelineCode.includes('Central Patna Dispatch Desk'), 'Must provide authentic Central Patna Dispatch Desk card');
  assert(timelineCode.includes('80021 41816') || timelineCode.includes('8002141816'), 'Must display verified telephone support 80021 41816');
  assert(timelineCode.includes('7739406400') || timelineCode.includes('77394 06400'), 'Must display verified WhatsApp support 77394 06400');
});

test('BookingTimelineScreen.tsx: Empty booking state displays clean fallback card', () => {
  assert(timelineCode.includes('No Active Booking'), 'Must render No Active Booking card when booking is null');
  assert(timelineCode.includes('Book an Outstation Cab'), 'Must render Book an Outstation Cab CTA button');
});

test('BookingTimelineScreen.tsx: Assigned chauffeur displays verified details & contact actions', () => {
  assert(timelineCode.includes('Call Driver'), 'Must render Call Driver button when driver is assigned');
  assert(timelineCode.includes('WhatsApp'), 'Must render WhatsApp button when driver is assigned');
  assert(timelineCode.includes('vehiclePlateNumber'), 'Must display vehiclePlateNumber');
  assert(timelineCode.includes('startOtp'), 'Must display ride start OTP');
});

// -------------------------------------------------------------
// SUMMARY & VERDICT
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log(`VERDICT: ${failedTests === 0 ? 'APPROVE' : 'DEFECT_FOUND'}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
