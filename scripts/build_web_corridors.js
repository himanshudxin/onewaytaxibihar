const fs = require('fs');
const path = require('path');

const corridors = require('../mobile/apps/passenger/src/utils/biharRoadCorridors.ts').BIHAR_ROAD_CORRIDORS;

let jsContent = `/**
 * Real Bihar Highway Corridors Database for OneWayTaxiBihar (Web & Mobile)
 * Authentic highway coordinates for NH-22, NH-31, NH-83, NH-27, Gandhi Setu, JP Ganga Path
 */

window.BIHAR_ROAD_CORRIDORS = ${JSON.stringify(corridors, null, 2)};

window.getRoadCorridor = function(origin, dest) {
  if (!origin || !dest) return null;
  var oKey = (typeof origin === 'string' ? origin : (origin.name || '')).trim().toLowerCase().replace(/[^a-z]/g, '');
  var dKey = (typeof dest === 'string' ? dest : (dest.name || '')).trim().toLowerCase().replace(/[^a-z]/g, '');
  
  var c = window.BIHAR_ROAD_CORRIDORS;
  for (var key in c) {
    var parts = key.split('_to_');
    if ((oKey.indexOf(parts[0]) !== -1 || parts[0].indexOf(oKey) !== -1) &&
        (dKey.indexOf(parts[1]) !== -1 || parts[1].indexOf(dKey) !== -1)) {
      return c[key];
    }
  }

  for (var rKey in c) {
    var rParts = rKey.split('_to_');
    if ((dKey.indexOf(rParts[0]) !== -1 || rParts[0].indexOf(dKey) !== -1) &&
        (oKey.indexOf(rParts[1]) !== -1 || rParts[1].indexOf(oKey) !== -1)) {
      var match = c[rKey];
      return {
        distanceKm: match.distanceKm,
        durationMin: match.durationMin,
        coordinates: match.coordinates.slice().reverse()
      };
    }
  }

  return null;
};
`;

fs.writeFileSync(path.join(__dirname, '../js/bihar-road-corridors.js'), jsContent, 'utf8');
console.log('Successfully created js/bihar-road-corridors.js, length:', jsContent.length);

