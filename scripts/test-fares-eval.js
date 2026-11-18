const fs = require('fs');
const content = fs.readFileSync('mobile/shared/data/patnaFares.ts', 'utf8');
const vm = require('vm');
const ts = require('typescript');
const js = ts.transpile(content);
const sandbox = { module: { exports: {} }, exports: {} };
vm.runInNewContext(js, sandbox);
const { MASTER_PATNA_FARES, findMatchingFare } = sandbox.module.exports;

const tests = [
  ['Patna', 'Gaya'],
  ['Patna', 'Muzaffarpur'],
  ['Patna', 'Darbhanga'],
  ['Patna', 'Bhagalpur'],
  ['Gaya', 'Patna'],
  ['Muzaffarpur', 'Darbhanga'],
  ['Patna', 'Purnea'],
  ['Patna', 'Purnia'],
  ['Patna', 'Katihar'],
  ['Patna', 'Samastipur'],
  ['Patna', 'Bettiah (West Champaran)'],
  ['Patna', 'Chhapra (Saran)'],
  ['Patna', 'Ara (Bhojpur)'],
  ['Patna', 'Sasaram (Rohtas)'],
  ['Patna', 'Nalanda (Bihar Sharif)'],
  ['Patna', 'Bodh Gaya'],
  ['Patna', 'Deoghar (Jharkhand)'],
  ['Patna', 'Varanasi (UP)'],
  ['Patna', 'Ranchi (Jharkhand)'],
  ['Patna', 'Siliguri (WB)']
];

tests.forEach(([o, d]) => {
  const res = findMatchingFare(o, d, MASTER_PATNA_FARES);
  console.log(o + ' -> ' + d + ': ' + (res ? res.distanceKm + 'km, Hatch:' + res.hatchback + ', Sedan:' + res.sedan : 'NOT FOUND'));
});
