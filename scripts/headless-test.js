const http = require('http');

const endpoints = [
  '/',
  '/index.html',
  '/admin.html',
  '/driver.html',
  '/patna-to-gaya-cab.html',
  '/patna-to-muzaffarpur-cab.html',
  '/patna-to-darbhanga-cab.html',
  '/patna-to-bhagalpur-cab.html',
  '/404.html',
  '/500.html',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
  '/driver-manifest.json',
  '/.well-known/assetlinks.json',
  '/favicon.svg',
  '/driver-icon.svg',
  '/img/logo-reframed.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/driver-icon-192.png',
  '/images/driver-icon-512.png',
  '/images/phonepe-qr.png',
  '/css/style.css',
  '/css/components.css',
  '/js/data.js',
  '/js/calculator.js',
  '/js/map.js',
  '/js/api.js',
  '/js/datetime-picker.js',
  '/js/firebase-otp.js',
  '/js/booking.js',
  '/js/app.js',
  '/data/cities.json',
  '/data/locations.json',
  '/data/popular_routes.json',
  '/api/health'
];

let allOk = true;

async function check(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:8080${path}`, (res) => {
      const ok = res.statusCode === 200;
      if (!ok) allOk = false;
      const statusIcon = ok ? '✓' : '❌';
      console.log(`${statusIcon} ${path} -> ${res.statusCode} (${res.headers['content-type']})`);
      res.resume();
      resolve();
    }).on('error', (err) => {
      console.error(`❌ ${path} -> ERROR:`, err.message);
      allOk = false;
      resolve();
    });
  });
}

async function run() {
  console.log('=== VERIFYING ALL CORE ENDPOINTS & ASSETS ===\n');
  for (const ep of endpoints) {
    await check(ep);
  }
  if (allOk) {
    console.log('\n🎉 ALL CORE ENDPOINTS ARE 100% HEALTHY (200 OK)!');
  } else {
    console.error('\n❌ Some endpoints failed!');
    process.exit(1);
  }
}

run();
