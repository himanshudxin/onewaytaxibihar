import { computeRouteQuote, parseNaturalLanguageTrip, resolveLocation } from '../mobile/shared/utils/fareEngine.ts';

console.log('--- TEST 1: Fixed Corridor (Patna -> Gaya) ---');
const q1 = computeRouteQuote('Patna', 'Gaya');
console.log(q1.origin, '->', q1.destination, 'Dist:', q1.distanceKm, 'km, Toll:', q1.tollEstimate);
q1.tiers.forEach(t => console.log(' ', t.title, 'Price: ₹' + t.price, '15% Adv: ₹' + t.advance15, '85% Bal: ₹' + t.balance85));

console.log('\n--- TEST 2: Inter-District Non-Patna Route (Muzaffarpur -> Darbhanga) ---');
const q2 = computeRouteQuote('Muzaffarpur', 'Darbhanga');
console.log(q2.origin, '->', q2.destination, 'Dist:', q2.distanceKm, 'km, Duration:', q2.durationText);
q2.tiers.forEach(t => console.log(' ', t.title, 'Price: ₹' + t.price, '15% Adv: ₹' + t.advance15, '85% Bal: ₹' + t.balance85));

console.log('\n--- TEST 3: Short Route (Gaya -> Bodh Gaya) ---');
const q3 = computeRouteQuote('Gaya', 'Bodh Gaya');
console.log(q3.origin, '->', q3.destination, 'Dist:', q3.distanceKm, 'km, Duration:', q3.durationText);
q3.tiers.forEach(t => console.log(' ', t.title, 'Price: ₹' + t.price));

console.log('\n--- TEST 4: Long Route (Patna -> Purnea Round Trip) ---');
const q4 = computeRouteQuote('Patna', 'Purnea', 'round-trip');
console.log(q4.origin, '->', q4.destination, 'Dist:', q4.distanceKm, 'km (Round Trip)');
q4.tiers.forEach(t => console.log(' ', t.title, 'Price: ₹' + t.price, '15% Adv: ₹' + t.advance15));

console.log('\n--- TEST 5: AI Natural Language Trip Parser ---');
const ai1 = parseNaturalLanguageTrip('Patna to Gaya tomorrow morning 8am sedan');
console.log('Query 1 parsed:', ai1);

const ai2 = parseNaturalLanguageTrip('round trip from Muzaffarpur to Darbhanga evening 7 seater suv');
console.log('Query 2 parsed:', ai2);
