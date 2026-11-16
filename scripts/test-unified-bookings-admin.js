/**
 * End-to-End Verification: Unified Admin Panel for Website and Mobile App Bookings
 */

try { require('dotenv').config(); } catch (e) {}
const http = require('http');

function postJson(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const bodyStr = JSON.stringify(data);
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr)
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

function getJson(urlStr, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = http.request(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Website Booking Creation ---');
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

  const webRes = await postJson('http://localhost:8080/api/bookings', webPayload);
  console.log('Website booking response status:', webRes.status);
  if (!webRes.data || !webRes.data.success) {
    throw new Error('Web booking creation failed: ' + JSON.stringify(webRes.data));
  }
  const webBookingId = webRes.data.booking.bookingId;
  console.log('✓ Created Website Booking:', webBookingId);

  console.log('\n--- 2. Testing Mobile App Booking Creation ---');
  const appPayload = {
    passengerName: 'Priya Sharma (App User)',
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

  const appRes = await postJson('http://localhost:8080/api/bookings', appPayload);
  console.log('Mobile App booking response status:', appRes.status);
  if (!appRes.data || !appRes.data.success) {
    throw new Error('Mobile App booking creation failed: ' + JSON.stringify(appRes.data));
  }
  const appBookingId = appRes.data.booking.bookingId;
  console.log('✓ Created Mobile App Booking:', appBookingId);

  console.log('\n--- 3. Verifying Unified Admin Bookings API ---');
  // Log in as admin to get token
  const loginRes = await postJson('http://localhost:8080/api/admin/login', {
    username: 'admin',
    password: process.env.ADMIN_PASSWORD || 'Oneway@2026'
  });
  console.log('Login response:', loginRes.status, loginRes.data ? Object.keys(loginRes.data) : 'no data');

  const token = loginRes.data && loginRes.data.token ? loginRes.data.token : null;
  const adminHeaders = token ? { 'Authorization': `Bearer ${token}` } : { 'Cookie': 'admin_logged_in=true' };

  const adminBookingsRes = await getJson('http://localhost:8080/api/admin/bookings', adminHeaders);
  console.log('Admin bookings fetch status:', adminBookingsRes.status);

  if (!adminBookingsRes.data || !adminBookingsRes.data.bookings) {
    throw new Error('Could not retrieve bookings from admin endpoint: ' + JSON.stringify(adminBookingsRes.data));
  }

  const allB = adminBookingsRes.data.bookings;
  console.log('Retrieved bookings count:', allB.length);
  console.log('Sample booking IDs:', allB.slice(0, 5).map(b => b.bookingId || b.id));
  const foundWeb = allB.find(b => b.bookingId === webBookingId);
  const foundApp = allB.find(b => b.bookingId === appBookingId);

  if (!foundWeb) {
    throw new Error(`Website booking ${webBookingId} NOT found in admin bookings list!`);
  }
  if (!foundApp) {
    throw new Error(`Mobile App booking ${appBookingId} NOT found in admin bookings list!`);
  }

  console.log(`✓ Verified Website Booking in Admin Panel:`, {
    bookingId: foundWeb.bookingId,
    passenger: foundWeb.passengerName,
    source: foundWeb.source,
    isApp: foundWeb.isApp
  });

  console.log(`✓ Verified Mobile App Booking in Admin Panel:`, {
    bookingId: foundApp.bookingId,
    passenger: foundApp.passengerName,
    source: foundApp.source,
    isApp: foundApp.isApp
  });

  console.log('\n🎉 SUCCESS: Both Website and Mobile App bookings are present on the EXACT SAME Admin Panel!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
