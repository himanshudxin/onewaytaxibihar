/**
 * Direct Unit & Integration Test for Unified Website & App Bookings on Admin Panel
 */

const { EventEmitter } = require('events');
const apiHandler = require('../api/index.js');
const dbService = require('../services/db.js');

function createMockReqRes(method, path, body = {}, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = path;
  req.body = body; // Directly passed
  req.headers = {
    'content-type': 'application/json',
    'host': 'localhost:8080',
    ...headers
  };

  const res = new EventEmitter();
  res.statusCode = 200;
  res._headers = {};
  res._data = '';
  res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v; };
  res.getHeader = (k) => res._headers[k.toLowerCase()];
  res.writeHead = (code, headers) => {
    res.statusCode = code;
    if (headers) Object.assign(res._headers, headers);
  };
  res.write = (chunk) => { res._data += chunk; };
  res.end = (chunk) => {
    if (chunk) res._data += chunk;
    res.emit('finish');
  };

  const promise = new Promise((resolve) => {
    res.on('finish', () => {
      let parsed = null;
      try {
        parsed = JSON.parse(res._data);
      } catch (e) {
        parsed = res._data;
      }
      resolve({ statusCode: res.statusCode, headers: res._headers, body: parsed });
    });
  });

  return { req, res, promise };
}

async function dispatch(method, path, body = {}, headers = {}) {
  const { req, res, promise } = createMockReqRes(method, path, body, headers);
  apiHandler(req, res);
  return promise;
}

async function run() {
  console.log('--- 1. Testing Direct Website Booking via API Handler ---');
  const webPayload = {
    passengerName: 'Anil Kumar (Web User)',
    passengerPhone: '9876543210',
    originCity: 'Patna',
    destCity: 'Gaya',
    pickupAddress: 'Patna Junction Platform 1',
    dropAddress: 'Bodh Gaya Temple Road',
    pickupDate: '2026-11-20',
    pickupTime: '11:00 AM',
    cabTier: 'sedan',
    source: 'Website',
    bookingSource: 'Website',
    channel: 'Website Portal',
    isApp: false
  };

  const webRes = await dispatch('POST', '/bookings', webPayload);
  console.log('Website booking status:', webRes.statusCode);
  if (!webRes.body || !webRes.body.success) {
    throw new Error('Web booking failed: ' + JSON.stringify(webRes.body));
  }
  const webBookingId = webRes.body.booking.bookingId;
  console.log('✓ Created Website Booking:', webBookingId);

  console.log('\n--- 2. Testing Direct Mobile App Booking via API Handler ---');
  const appPayload = {
    passengerName: 'Priya Sharma (Mobile App User)',
    passengerPhone: '9812345678',
    originCity: 'Patna',
    destCity: 'Muzaffarpur',
    pickupAddress: 'Boring Road Chauraha, Patna',
    dropAddress: 'Bhagwanpur Chowk, Muzaffarpur',
    pickupDate: '2026-11-21',
    pickupTime: '02:30 PM',
    cabTier: 'suv',
    source: 'Mobile App',
    bookingSource: 'Mobile App',
    channel: 'Mobile App',
    isApp: true
  };

  const appRes = await dispatch('POST', '/bookings', appPayload);
  console.log('Mobile App booking status:', appRes.statusCode);
  if (!appRes.body || !appRes.body.success) {
    throw new Error('App booking failed: ' + JSON.stringify(appRes.body));
  }
  const appBookingId = appRes.body.booking.bookingId;
  console.log('✓ Created Mobile App Booking:', appBookingId);

  console.log('\n--- 3. Verifying GET /admin/bookings returns BOTH ---');
  const db = await dbService.getDbAsync();
  if (!db.admins) db.admins = [];
  const adminUser = db.admins[0] || { id: 'adm_1', username: 'admin', role: 'SUPER_ADMIN' };
  if (!db.sessions) db.sessions = [];
  const token = 'test_token_' + Date.now();
  db.sessions.push({
    token,
    userId: adminUser.id,
    role: 'SUPER_ADMIN',
    expiresAt: new Date(Date.now() + 3600000).toISOString()
  });
  await dbService.saveDb(db);

  const adminRes = await dispatch('GET', '/admin/bookings', {}, {
    'authorization': `Bearer ${token}`
  });

  console.log('Admin bookings fetch status:', adminRes.statusCode);
  if (!adminRes.body || !adminRes.body.bookings) {
    throw new Error('Admin fetch failed: ' + JSON.stringify(adminRes.body));
  }

  const allBookings = adminRes.body.bookings;
  const foundWeb = allBookings.find(b => b.bookingId === webBookingId);
  const foundApp = allBookings.find(b => b.bookingId === appBookingId);

  if (!foundWeb) throw new Error(`Website booking ${webBookingId} missing from admin!`);
  if (!foundApp) throw new Error(`App booking ${appBookingId} missing from admin!`);

  console.log('✓ Found Website Booking in Admin Panel:', {
    bookingId: foundWeb.bookingId,
    passenger: foundWeb.passengerName,
    source: foundWeb.source,
    channel: foundWeb.channel,
    isApp: foundWeb.isApp
  });

  console.log('✓ Found Mobile App Booking in Admin Panel:', {
    bookingId: foundApp.bookingId,
    passenger: foundApp.passengerName,
    source: foundApp.source,
    channel: foundApp.channel,
    isApp: foundApp.isApp
  });

  if (foundWeb.isApp !== false) throw new Error('Web booking isApp should be false');
  if (foundApp.isApp !== true) throw new Error('App booking isApp should be true');

  console.log('\n🎉 ALL CHECKS PASSED: Website and App bookings are stored together in the same backend database and return together on the same Admin Panel!');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Direct test failed:', err);
  process.exit(1);
});
