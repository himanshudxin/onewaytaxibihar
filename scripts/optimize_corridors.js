const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync('mobile/shared/utils/biharRoadCorridors.json', 'utf8'));
const optimized = {};

for (const [key, val] of Object.entries(raw)) {
  const coords = val.coordinates;
  const step = Math.max(1, Math.floor(coords.length / 250));
  const downsampled = [];
  for (let i = 0; i < coords.length; i += step) {
    // 5 decimal places is ~1 meter precision
    downsampled.push([
      Math.round(coords[i][0] * 100000) / 100000,
      Math.round(coords[i][1] * 100000) / 100000
    ]);
  }
  // Ensure last point is exactly destination
  const last = coords[coords.length - 1];
  downsampled.push([
    Math.round(last[0] * 100000) / 100000,
    Math.round(last[1] * 100000) / 100000
  ]);

  optimized[key] = {
    distanceKm: val.distanceKm,
    durationMin: val.durationMin,
    coordinates: downsampled
  };
}

const outShared = path.join(__dirname, '../mobile/shared/utils/biharRoadCorridors.json');
const outPass = path.join(__dirname, '../mobile/apps/passenger/src/utils/biharRoadCorridors.json');

fs.writeFileSync(outShared, JSON.stringify(optimized), 'utf8');
fs.writeFileSync(outPass, JSON.stringify(optimized), 'utf8');

const sizeKb = Math.round(fs.statSync(outShared).size / 1024);
console.log(`Optimized corridors saved! New size: ${sizeKb} KB`);

