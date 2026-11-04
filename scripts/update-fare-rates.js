const fs = require('fs');
const path = require('path');

console.log('--- UPDATING FARE RATES ACROSS WEBSITE & APP ---');

// 1. Update api/index.js
const apiPath = path.join(__dirname, '..', 'api', 'index.js');
let apiContent = fs.readFileSync(apiPath, 'utf8');

const oldFleetRates = `const FLEET_RATES = {
  hatchback: { perKm: 21.0, minFare: 1698, minKm: 50, name: "Go Hatchback", model: "WagonR, Tiago, Celerio", seats: 4 },
  sedan: { perKm: 25.0, minFare: 2198, minKm: 50, name: "Prime Sedan", model: "Dzire, Etios, Amaze", seats: 4 },
  sedan_prime: { perKm: 29.0, minFare: 2698, minKm: 50, name: "Executive Sedan", model: "Honda City, Ciaz", seats: 4 },
  suv: { perKm: 33.0, minFare: 3398, minKm: 50, name: "Family SUV (6+1)", model: "Maruti Ertiga, Carens", seats: 6 },
  innova_crysta: { perKm: 44.0, minFare: 4598, minKm: 50, name: "Toyota Innova Crysta", model: "Innova Crysta", seats: 7 }
};`;

const newFleetRates = `const FLEET_RATES = {
  hatchback: { perKm: 20.0, minFare: 1698, minKm: 50, name: "Go Hatchback", model: "WagonR, Tiago, Celerio", seats: 4 },
  sedan: { perKm: 22.0, minFare: 2198, minKm: 50, name: "Prime Sedan", model: "Dzire, Etios, Amaze", seats: 4 },
  sedan_prime: { perKm: 26.0, minFare: 2698, minKm: 50, name: "Executive Sedan", model: "Honda City, Ciaz", seats: 4 },
  suv: { perKm: 27.0, minFare: 3398, minKm: 50, name: "Family SUV (6+1)", model: "Maruti Ertiga, Carens", seats: 6 },
  innova_crysta: { perKm: 34.0, minFare: 4598, minKm: 50, name: "Toyota Innova Crysta", model: "Innova Crysta", seats: 7 }
};`;

if (apiContent.includes(oldFleetRates)) {
  apiContent = apiContent.replace(oldFleetRates, newFleetRates);
  fs.writeFileSync(apiPath, apiContent, 'utf8');
  console.log('✓ api/index.js FLEET_RATES updated successfully');
} else {
  console.log('! api/index.js exact match not found, checking regex replacement');
  apiContent = apiContent.replace(/hatchback:\s*\{\s*perKm:\s*21\.0/, 'hatchback: { perKm: 20.0')
    .replace(/sedan:\s*\{\s*perKm:\s*25\.0/, 'sedan: { perKm: 22.0')
    .replace(/sedan_prime:\s*\{\s*perKm:\s*29\.0/, 'sedan_prime: { perKm: 26.0')
    .replace(/suv:\s*\{\s*perKm:\s*33\.0/, 'suv: { perKm: 27.0')
    .replace(/innova_crysta:\s*\{\s*perKm:\s*44\.0/, 'innova_crysta: { perKm: 34.0');
  fs.writeFileSync(apiPath, apiContent, 'utf8');
  console.log('✓ api/index.js FLEET_RATES updated via regex');
}

// 2. Update js/data.js
const dataPath = path.join(__dirname, '..', 'js', 'data.js');
let dataContent = fs.readFileSync(dataPath, 'utf8');
dataContent = dataContent
  .replace(/(id:\s*"hatchback"[\s\S]*?ratePerKm:\s*)21\.0/, '$120.0')
  .replace(/(id:\s*"sedan"[\s\S]*?ratePerKm:\s*)25\.0/, '$122.0')
  .replace(/(id:\s*"sedan_prime"[\s\S]*?ratePerKm:\s*)29\.0/, '$126.0')
  .replace(/(id:\s*"suv"[\s\S]*?ratePerKm:\s*)33\.0/, '$127.0')
  .replace(/(id:\s*"innova_crysta"[\s\S]*?ratePerKm:\s*)44\.0/, '$134.0');
fs.writeFileSync(dataPath, dataContent, 'utf8');
console.log('✓ js/data.js OTB_FLEET rates updated');

// 3. Update cabs.html
const cabsPath = path.join(__dirname, '..', 'cabs.html');
let cabsContent = fs.readFileSync(cabsPath, 'utf8');
cabsContent = cabsContent
  .replace(/(id:\s*"hatchback"[\s\S]*?ratePerKm:\s*)21\.0/, '$120.0')
  .replace(/(id:\s*"sedan"[\s\S]*?ratePerKm:\s*)25\.0/, '$122.0')
  .replace(/(id:\s*"sedan_prime"[\s\S]*?ratePerKm:\s*)29\.0/, '$126.0')
  .replace(/(id:\s*"suv"[\s\S]*?ratePerKm:\s*)33\.0/, '$127.0')
  .replace(/(id:\s*"innova_crysta"[\s\S]*?ratePerKm:\s*)44\.0/, '$134.0');
fs.writeFileSync(cabsPath, cabsContent, 'utf8');
console.log('✓ cabs.html fleet rates updated');

// 4. Update index.html voyago vehicle rates
const indexPath = path.join(__dirname, '..', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent
  .replace(/<div class="voyago-vehicle-rate">₹11\/km<\/div>/, '<div class="voyago-vehicle-rate">₹22/km</div>')
  .replace(/<div class="voyago-vehicle-rate">₹14\/km<\/div>/, '<div class="voyago-vehicle-rate">₹27/km</div>')
  .replace(/<div class="voyago-vehicle-rate">₹18\/km<\/div>/, '<div class="voyago-vehicle-rate">₹34/km</div>');
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✓ index.html voyago cards updated');

// 5. Update mobile/apps/passenger/src/screens/CabSelectScreen.tsx
const cabSelectPath = path.join(__dirname, '..', 'mobile', 'apps', 'passenger', 'src', 'screens', 'CabSelectScreen.tsx');
let cabSelectContent = fs.readFileSync(cabSelectPath, 'utf8');

cabSelectContent = cabSelectContent
  .replace(/distanceKm \* 21\.0/, 'distanceKm * 20.0')
  .replace(/distanceKm \* 25\.0/, 'distanceKm * 22.0')
  .replace(/distanceKm \* 29\.0/, 'distanceKm * 26.0')
  .replace(/distanceKm \* 33\.0/, 'distanceKm * 27.0')
  .replace(/distanceKm \* 44\.0/, 'distanceKm * 34.0')
  .replace(/subTitle: 'Go Hatchback'/, "subTitle: 'Go Hatchback • ₹20/km'")
  .replace(/subTitle: 'Prime Sedan'/, "subTitle: 'Prime Sedan • ₹22/km'")
  .replace(/subTitle: 'Family SUV \(6\+1\)'/, "subTitle: 'Family XUV (6+1) • ₹27/km'")
  .replace(/subTitle: 'Corporate Prime'/, "subTitle: 'Executive Sedan • ₹26/km'")
  .replace(/subTitle: 'Toyota Innova Crysta'/, "subTitle: 'Luxury XUV (Innova Crysta) • ₹34/km'");

fs.writeFileSync(cabSelectPath, cabSelectContent, 'utf8');
console.log('✓ mobile/apps/passenger/src/screens/CabSelectScreen.tsx updated');

// 6. Update mobile/shared/services/api.ts
const mobileApiPath = path.join(__dirname, '..', 'mobile', 'shared', 'services', 'api.ts');
let mobileApiContent = fs.readFileSync(mobileApiPath, 'utf8');
mobileApiContent = mobileApiContent.replace(
  /const ratePerKm = tier === 'hatchback' \? 14 : tier === 'sedan' \? 17 : 24;/,
  "const ratePerKm = tier === 'hatchback' ? 20 : tier === 'sedan' ? 22 : tier === 'sedan_prime' ? 26 : tier === 'suv' ? 27 : 34;"
);
fs.writeFileSync(mobileApiPath, mobileApiContent, 'utf8');
console.log('✓ mobile/shared/services/api.ts ratePerKm updated');

// 7. Update mobile/previews/passenger-app-preview.html
const previewPath = path.join(__dirname, '..', 'mobile', 'previews', 'passenger-app-preview.html');
let previewContent = fs.readFileSync(previewPath, 'utf8');
previewContent = previewContent
  .replace(/WagonR, Tiago, Celerio<\/div>/, 'WagonR, Tiago, Celerio • ₹20/km</div>')
  .replace(/Dzire, Etios, Amaze<\/div>/, 'Dzire, Etios, Amaze • ₹22/km</div>')
  .replace(/Maruti Ertiga, Carens, Scorpio<\/div>/, 'Maruti Ertiga, Carens, Scorpio • ₹27/km</div>')
  .replace(/Honda City, Ciaz, Verna<\/div>/, 'Honda City, Ciaz, Verna • ₹26/km</div>')
  .replace(/Toyota Innova Crysta<\/div>/, 'Toyota Innova Crysta • ₹34/km</div>');
fs.writeFileSync(previewPath, previewContent, 'utf8');
console.log('✓ mobile/previews/passenger-app-preview.html updated');

// 8. Update tests/test-challenger-2-fare-telemetry.js
const testChallengerPath = path.join(__dirname, '..', 'tests', 'test-challenger-2-fare-telemetry.js');
if (fs.existsSync(testChallengerPath)) {
  let testContent = fs.readFileSync(testChallengerPath, 'utf8');
  testContent = testContent
    .replace(/hatchback:\s*\{\s*perKm:\s*21\.0/, 'hatchback: { perKm: 20.0')
    .replace(/sedan:\s*\{\s*perKm:\s*25\.0/, 'sedan: { perKm: 22.0')
    .replace(/sedan_prime:\s*\{\s*perKm:\s*29\.0/, 'sedan_prime: { perKm: 26.0')
    .replace(/suv:\s*\{\s*perKm:\s*33\.0/, 'suv: { perKm: 27.0')
    .replace(/innova_crysta:\s*\{\s*perKm:\s*44\.0/, 'innova_crysta: { perKm: 34.0')
    .replace(/300 \* 21/, '300 * 20')
    .replace(/300 \* 25/, '300 * 22')
    .replace(/300 \* 29/, '300 * 26')
    .replace(/300 \* 33/, '300 * 27')
    .replace(/300 \* 44/, '300 * 34')
    .replace(/6300/, '6000')
    .replace(/7500/, '6600')
    .replace(/8700/, '7800')
    .replace(/9900/, '8100')
    .replace(/13200/, '10200')
    .replace(/assert\.strictEqual\(fares\.hatchback,\s*21000\);/, 'assert.strictEqual(fares.hatchback, 20000);')
    .replace(/assert\.strictEqual\(fares\.sedan,\s*25000\);/, 'assert.strictEqual(fares.sedan, 22000);')
    .replace(/assert\.strictEqual\(fares\.sedan_prime,\s*29000\);/, 'assert.strictEqual(fares.sedan_prime, 26000);')
    .replace(/assert\.strictEqual\(fares\.suv,\s*33000\);/, 'assert.strictEqual(fares.suv, 27000);')
    .replace(/assert\.strictEqual\(fares\.innova_crysta,\s*44000\);/, 'assert.strictEqual(fares.innova_crysta, 34000);')
    .replace(/String "300" should coerce to 7500'\);/, 'String "300" should coerce to 6600\');')
    .replace(/assert\.strictEqual\(strFares\.sedan,\s*7500/, 'assert.strictEqual(strFares.sedan, 6600')
    .replace(/Math\.round\(104\.7 \* 25\.0\)/, 'Math.round(104.7 * 22.0)')
    .replace(/computeCabSelectFares\(80,\s*'one-way'\)\.hatchback,\s*1698/, 'computeCabSelectFares(84, \'one-way\').hatchback, 1698')
    .replace(/computeCabSelectFares\(81,\s*'one-way'\)\.hatchback,\s*1701/, 'computeCabSelectFares(85, \'one-way\').hatchback, 1700')
    .replace(/computeCabSelectFares\(87,\s*'one-way'\)\.sedan,\s*2198/, 'computeCabSelectFares(99, \'one-way\').sedan, 2198')
    .replace(/computeCabSelectFares\(88,\s*'one-way'\)\.sedan,\s*2200/, 'computeCabSelectFares(100, \'one-way\').sedan, 2200')
    .replace(/computeCabSelectFares\(93,\s*'one-way'\)\.sedan_prime,\s*2698/, 'computeCabSelectFares(103, \'one-way\').sedan_prime, 2698')
    .replace(/computeCabSelectFares\(94,\s*'one-way'\)\.sedan_prime,\s*2726/, 'computeCabSelectFares(104, \'one-way\').sedan_prime, 2704')
    .replace(/computeCabSelectFares\(102,\s*'one-way'\)\.suv,\s*3398/, 'computeCabSelectFares(125, \'one-way\').suv, 3398')
    .replace(/computeCabSelectFares\(103,\s*'one-way'\)\.suv,\s*3399/, 'computeCabSelectFares(126, \'one-way\').suv, 3402')
    .replace(/computeCabSelectFares\(104,\s*'one-way'\)\.innova_crysta,\s*4598/, 'computeCabSelectFares(135, \'one-way\').innova_crysta, 4598')
    .replace(/computeCabSelectFares\(105,\s*'one-way'\)\.innova_crysta,\s*4620/, 'computeCabSelectFares(136, \'one-way\').innova_crysta, 4624');
  fs.writeFileSync(testChallengerPath, testContent, 'utf8');
  console.log('✓ tests/test-challenger-2-fare-telemetry.js updated');
}

console.log('ALL FARES UPDATED SUCCESSFULLY!');

