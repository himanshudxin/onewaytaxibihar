const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

function cleanNum(val, fallback = 0) {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const cleaned = String(val).replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

function computeDerivedTiers(sedanPrice, distanceKm) {
  const sedan = Math.round(cleanNum(sedanPrice, 1199));
  const dist = Math.max(1, Math.round(cleanNum(distanceKm, 50)));

  const hatchback = Math.max(499, sedan - 200);
  const execSedan = sedan + 250;
  const suv = sedan + 400;
  const luxSuv = sedan + 700;

  const twoWay = {
    hatchback: Math.max(998, (hatchback * 2) - 400),
    sedan: Math.max(1398, (sedan * 2) - 400),
    execSedan: Math.max(1898, (execSedan * 2) - 400),
    suv: Math.max(2198, (suv * 2) - 400),
    luxSuv: Math.max(2798, (luxSuv * 2) - 400)
  };

  const perKm = {
    hatchback: parseFloat((hatchback / dist).toFixed(2)),
    sedan: parseFloat((sedan / dist).toFixed(2)),
    suv: parseFloat((suv / dist).toFixed(2)),
    execSedan: parseFloat((execSedan / dist).toFixed(2)),
    luxSuv: parseFloat((luxSuv / dist).toFixed(2))
  };

  return {
    hatchback,
    sedan,
    execSedan,
    suv,
    luxSuv,
    twoWay,
    perKm
  };
}

function parseFaresFromExcel(bufferOrBase64) {
  let buf;
  if (Buffer.isBuffer(bufferOrBase64)) {
    buf = bufferOrBase64;
  } else if (typeof bufferOrBase64 === 'string') {
    const base64Data = bufferOrBase64.replace(/^data:.*?;base64,/, '');
    buf = Buffer.from(base64Data, 'base64');
  } else {
    throw new Error('Invalid input: Buffer or base64 string expected');
  }

  const wb = xlsx.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames.find(n => n.toLowerCase().includes('per-km') || n.toLowerCase().includes('costing') || n.toLowerCase().includes('fare')) || wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error('No valid sheet found in Excel workbook');

  const rawRows = xlsx.utils.sheet_to_json(ws);
  if (!rawRows || rawRows.length === 0) throw new Error('Excel sheet contains no data rows');

  const parsedFares = [];

  for (const r of rawRows) {
    // Find destination name
    const dest = r['Destination from Patna'] || r['Destination'] || r['destination'] || r['City'] || r['destCity'] || r['Route'];
    if (!dest || typeof dest !== 'string' || !dest.trim()) continue;

    const cleanDest = dest.trim();
    const region = r['Region'] || r['region'] || r['State'] || 'Bihar districts';
    const dist = cleanNum(r['Road distance one-way (km)'] || r['Distance'] || r['distanceKm'] || r['distance'], 50);

    const sedanBase = cleanNum(
      r['Sedan base fare (₹)'] ||
      r['Sedan one-way (₹)'] ||
      r['Sedan'] ||
      r['sedan'],
      1199
    );

    const derived = computeDerivedTiers(sedanBase, dist);

    // If explicit one-way values are present, use them; otherwise use derived
    const hatchback = cleanNum(r['Hatchback one-way (₹)'] || r['Hatchback'] || r['hatchback'], derived.hatchback);
    const sedan = cleanNum(r['Sedan one-way (₹)'] || r['Sedan'] || r['sedan'], derived.sedan);
    const suv = cleanNum(r['XUV one-way (₹)'] || r['SUV one-way (₹)'] || r['SUV'] || r['suv'] || r['XUV'], derived.suv);
    const execSedan = cleanNum(r['Executive Sedan one-way (₹)'] || r['Executive Sedan'] || r['execSedan'], derived.execSedan);
    const luxSuv = cleanNum(r['Luxury XUV one-way (₹)'] || r['Luxury SUV one-way (₹)'] || r['luxSuv'], derived.luxSuv);

    const twoWayHatch = cleanNum(r['Hatchback two-way (₹)'], (hatchback * 2) - 400);
    const twoWaySedan = cleanNum(r['Sedan two-way (₹)'], (sedan * 2) - 400);
    const twoWaySuv = cleanNum(r['XUV two-way (₹)'] || r['SUV two-way (₹)'], (suv * 2) - 400);
    const twoWayExec = cleanNum(r['Executive Sedan two-way (₹)'], (execSedan * 2) - 400);
    const twoWayLux = cleanNum(r['Luxury XUV two-way (₹)'] || r['Luxury SUV two-way (₹)'], (luxSuv * 2) - 400);

    const destCity = (r['City'] || r['destCity'] || cleanDest.split('(')[0]).trim();
    const district = (r['District'] || r['district'] || (cleanDest.includes('(') ? cleanDest.split('(')[1].replace(')', '') : destCity)).trim();

    const routeId = `patna-${destCity.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    parsedFares.push({
      id: routeId,
      origin: "Patna",
      destination: cleanDest,
      destCity: destCity,
      district: district,
      region: String(region).trim(),
      distanceKm: Math.round(dist),
      hatchback: Math.round(hatchback),
      sedan: Math.round(sedan),
      execSedan: Math.round(execSedan),
      suv: Math.round(suv),
      luxSuv: Math.round(luxSuv),
      twoWay: {
        hatchback: Math.round(twoWayHatch),
        sedan: Math.round(twoWaySedan),
        execSedan: Math.round(twoWayExec),
        suv: Math.round(twoWaySuv),
        luxSuv: Math.round(twoWayLux)
      },
      perKm: {
        hatchback: parseFloat((hatchback / dist).toFixed(2)),
        sedan: parseFloat((sedan / dist).toFixed(2)),
        suv: parseFloat((suv / dist).toFixed(2))
      },
      marketComparison: r['Market Comparison'] || `${Math.round(sedan * 1.8)}–${Math.round(sedan * 2.2)}`,
      note: r['Distance/source status'] || 'Master costing reference',
      active: true,
      updatedAt: new Date().toISOString()
    });
  }

  return parsedFares;
}

function generateFaresExcelBuffer(faresList) {
  const wb = xlsx.utils.book_new();

  // Sheet 1: Per-km costing
  const rows = faresList.map(f => {
    const isObj = typeof f === 'object' && f !== null;
    const dist = f.distanceKm || f.distance || 50;
    const sedan = f.sedan || 1199;
    const hatch = f.hatchback || (sedan - 200);
    const suv = f.suv || (sedan + 400);
    const exec = f.execSedan || (sedan + 250);
    const lux = f.luxSuv || (sedan + 700);

    const twoWayHatch = f.twoWay?.hatchback || ((hatch * 2) - 400);
    const twoWaySedan = f.twoWay?.sedan || ((sedan * 2) - 400);
    const twoWaySuv = f.twoWay?.suv || ((suv * 2) - 400);
    const twoWayExec = f.twoWay?.execSedan || ((exec * 2) - 400);
    const twoWayLux = f.twoWay?.luxSuv || ((lux * 2) - 400);

    return {
      'Region': f.region || 'Bihar districts',
      'Destination from Patna': f.destination || f.destCity,
      'Road distance one-way (km)': dist,
      'Sedan base fare (₹)': sedan,
      'Hatchback one-way (₹)': `₹${hatch.toLocaleString('en-IN')}`,
      'Sedan one-way (₹)': `₹${sedan.toLocaleString('en-IN')}`,
      'XUV one-way (₹)': `₹${suv.toLocaleString('en-IN')}`,
      'Executive Sedan one-way (₹)': `₹${exec.toLocaleString('en-IN')}`,
      'Luxury XUV one-way (₹)': `₹${lux.toLocaleString('en-IN')}`,
      'Hatchback two-way (₹)': `₹${twoWayHatch.toLocaleString('en-IN')}`,
      'Sedan two-way (₹)': `₹${twoWaySedan.toLocaleString('en-IN')}`,
      'XUV two-way (₹)': `₹${twoWaySuv.toLocaleString('en-IN')}`,
      'Executive Sedan two-way (₹)': `₹${twoWayExec.toLocaleString('en-IN')}`,
      'Luxury XUV two-way (₹)': `₹${twoWayLux.toLocaleString('en-IN')}`,
      'Hatchback ₹/km (one-way)': `₹${(hatch / dist).toFixed(2)}`,
      'Sedan ₹/km (one-way)': `₹${(sedan / dist).toFixed(2)}`,
      'XUV ₹/km (one-way)': `₹${(suv / dist).toFixed(2)}`,
      'Executive Sedan ₹/km (one-way)': `₹${(exec / dist).toFixed(2)}`,
      'Luxury XUV ₹/km (one-way)': `₹${(lux / dist).toFixed(2)}`,
      'Distance/source status': f.note || 'Verified road reference'
    };
  });

  const ws = xlsx.utils.json_to_sheet(rows);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 22 }, // Region
    { wch: 26 }, // Destination
    { wch: 24 }, // Distance
    { wch: 18 }, // Sedan base
    { wch: 20 }, // Hatchback 1w
    { wch: 18 }, // Sedan 1w
    { wch: 18 }, // XUV 1w
    { wch: 24 }, // Exec Sedan 1w
    { wch: 22 }, // Luxury XUV 1w
    { wch: 20 }, // Hatchback 2w
    { wch: 18 }, // Sedan 2w
    { wch: 18 }, // XUV 2w
    { wch: 24 }, // Exec Sedan 2w
    { wch: 22 }, // Luxury XUV 2w
    { wch: 22 }, // Hatchback /km
    { wch: 20 }, // Sedan /km
    { wch: 20 }, // XUV /km
    { wch: 24 }, // Exec Sedan /km
    { wch: 22 }, // Luxury XUV /km
    { wch: 35 }  // Status
  ];

  xlsx.utils.book_append_sheet(wb, ws, 'Per-km costing');

  // Sheet 2: Read me & Pricing Rules
  const readmeData = [
    { 'Topic': 'Platform', 'Details': 'OneWayTaxiBihar Master Costing Matrix (Patna Outstation)' },
    { 'Topic': 'Helpline', 'Details': '+91 80021 41816 | WhatsApp: +91 77394 06400' },
    { 'Topic': 'Origin Hub', 'Details': 'Patna (City limits, Patna Airport, Patna Junction, Danapur, Rajendra Nagar)' },
    { 'Topic': 'Hatchback Formula', 'Details': 'Sedan Fare − ₹200 (WagonR / Tiago / Celerio)' },
    { 'Topic': 'Executive Sedan Formula', 'Details': 'Sedan Fare + ₹250 (Honda City / Ciaz / Verna)' },
    { 'Topic': 'SUV (Ertiga) Formula', 'Details': 'Sedan Fare + ₹400 (Ertiga / Triber / Carens)' },
    { 'Topic': 'Luxury SUV Formula', 'Details': 'Sedan Fare + ₹700 (Innova Crysta / XUV700)' },
    { 'Topic': 'Round-Trip / Two-Way Discount', 'Details': '(One-Way Fare × 2) − ₹400 Guaranteed Return Savings' },
    { 'Topic': 'Effective Per-KM Rate', 'Details': 'Total One-Way Fare ÷ One-Way Road Distance (KM)' }
  ];
  const readmeWs = xlsx.utils.json_to_sheet(readmeData);
  readmeWs['!cols'] = [{ wch: 30 }, { wch: 60 }];
  xlsx.utils.book_append_sheet(wb, readmeWs, 'Read me');

  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function syncFaresToFiles(faresList) {
  if (!Array.isArray(faresList) || faresList.length === 0) return false;

  // 1. Save data/patna_fares.json
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'patna_fares.json'),
    path.join(__dirname, '..', 'data', 'patna_fares.json')
  ];
  for (const p of candidatePaths) {
    try {
      fs.writeFileSync(p, JSON.stringify(faresList, null, 2), 'utf8');
    } catch (e) {}
  }

  // 2. Update js/data.js
  try {
    const dataJsPath = path.join(process.cwd(), 'js', 'data.js');
    if (fs.existsSync(dataJsPath)) {
      let dataJs = fs.readFileSync(dataJsPath, 'utf8');
      const regex = /\/\/ 10\. Official Patna Master Costing & Fixed Fare Matrix[\s\S]*?const OTB_PATNA_FARES = \[[\s\S]*?\n\];/;
      if (regex.test(dataJs)) {
        const replacement = '// 10. Official Patna Master Costing & Fixed Fare Matrix (98 Destinations)\nconst OTB_PATNA_FARES = ' + JSON.stringify(faresList, null, 2) + ';';
        dataJs = dataJs.replace(regex, replacement);
        fs.writeFileSync(dataJsPath, dataJs, 'utf8');
      }
    }
  } catch (e) {}

  return true;
}

module.exports = {
  computeDerivedTiers,
  parseFaresFromExcel,
  generateFaresExcelBuffer,
  syncFaresToFiles
};
