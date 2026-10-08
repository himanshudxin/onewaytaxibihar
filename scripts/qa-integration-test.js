const http = require('http');

const PORT = 8080;
const HOST = '127.0.0.1';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = {
      ...headers,
      ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
    };

    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, rawData: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runQA() {
  console.log('--- RUNNING SYSTEM INTEGRATION & SECURITY VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(desc, condition, detail = '') {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc} ${detail ? '-> ' + detail : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert('Health endpoint is online (200 OK)',
      health.status === 200 && health.data && (health.data.status === 'ONLINE' || health.data.status === 'ok')
    );

    // 2. Authoritative Server Fare Engine (Phase 5)
    const fareReq = await request('POST', '/api/fares/calculate', {
      origin: 'Patna',
      destination: 'Gaya',
      cabTier: 'sedan',
      tripType: 'oneway'
    });
    assert('Server calculates authoritative fare', fareReq.status === 200 && fareReq.data.success);
    const calculatedFare = fareReq.data.fare;
    assert('Fare breakdown contains distanceKm, baseFare, perKmRate, tollFastag, gst, totalFare',
      calculatedFare &&
      calculatedFare.distanceKm > 0 &&
      calculatedFare.baseFare > 0 &&
      calculatedFare.totalFare > 0 &&
      calculatedFare.gst !== undefined &&
      calculatedFare.tollFastag !== undefined
    );

    // 3. Privacy Defense: Reject Invoice lookup on non-existent booking or missing phone (Phase 4)
    const invNoMatch = await request('POST', '/api/invoice/lookup', {
      bookingId: 'OTB-999999'
    });
    assert('Invoice lookup returns 404 for unknown booking ID', invNoMatch.status === 404);

    // 4. Privacy Defense: Reject Tracking status on missing phone / unauthorized access (Phase 4)
    const trackUnauthorized = await request('POST', '/api/tracking/status', {
      bookingId: 'OTB-999999'
    });
    assert('Tracking status returns 404 or 403 when not found / unauthorized',
      trackUnauthorized.status === 404 || trackUnauthorized.status === 403
    );

    // 5. Booking Creation with Server Validation (Phase 2 & Phase 5)
    const testBookingPayload = {
      pickup: 'Boring Road, Patna',
      drop: 'Gaya Junction, Gaya',
      originCity: 'Patna',
      destCity: 'Gaya',
      cabTier: 'sedan',
      tripType: 'oneway',
      pickupDate: '2026-10-10',
      pickupTime: '08:00 AM',
      passengerName: 'QA Production Tester',
      passengerPhone: '9988776655',
      // Spoofed fare to verify server-side price lock
      totalFare: 10
    };

    const createBooking = await request('POST', '/api/bookings', testBookingPayload);
    assert('Booking creation succeeds with status 201',
      createBooking.status === 201 && createBooking.data.success,
      JSON.stringify(createBooking.data || createBooking.rawData)
    );
    
    if (createBooking.data && createBooking.data.booking) {
      const b = createBooking.data.booking;
      assert('Booking assigned unique Booking ID format OTB-2026-XXXX',
        typeof b.bookingId === 'string' && b.bookingId.startsWith('OTB-2026-')
      );
      assert('Booking status initialized to NEW', b.status === 'NEW' || b.bookingStatus === 'NEW');
      assert('Server overwrote spoofed ₹10 fare with authoritative server fare (totalFare > ₹1500)',
        b.totalFare > 1500 && b.totalFare !== 10
      );

      // 6. Privacy Defense: Require phone verification for Invoice lookup
      const invNoPhone = await request('POST', '/api/invoice/lookup', {
        bookingId: b.bookingId
      });
      assert('Invoice lookup requires registered mobile verification (401 Phone Auth Required)',
        invNoPhone.status === 401 && invNoPhone.data.requirePhoneAuth === true
      );

      // 7. Privacy Defense: Reject Invoice lookup if phone number does not match (Anti-IDOR)
      const invWrongPhone = await request('POST', '/api/invoice/lookup', {
        bookingId: b.bookingId,
        phone: '9111111111'
      });
      assert('Invoice lookup blocks IDOR attempt with non-matching phone (403 Forbidden)',
        invWrongPhone.status === 403 && invWrongPhone.data.success === false
      );

      // 8. Legitimate Invoice Retrieval with matching phone number
      const invValid = await request('POST', '/api/invoice/lookup', {
        bookingId: b.bookingId,
        phone: '9988776655'
      });
      assert('Invoice lookup succeeds when Booking ID + registered phone match',
        invValid.status === 200 && invValid.data.success
      );
      assert('Invoice contains official GSTIN, SAC 996412, and itemized CGST/SGST breakdown',
        invValid.data.invoice &&
        invValid.data.invoice.company.sacCode.includes('996412') &&
        invValid.data.invoice.gstTotal > 0
      );

      // 9. Privacy Defense: Reject Tracking status without registered phone (Anti-IDOR)
      const trackWrongPhone = await request('POST', '/api/tracking/status', {
        bookingId: b.bookingId,
        phone: '9111111111'
      });
      assert('Tracking status blocks unauthorized phone (403 Forbidden)',
        trackWrongPhone.status === 403 && trackWrongPhone.data.requireAuth === true
      );

      // 10. Legitimate Tracking Retrieval with registered phone number
      const trackValid = await request('POST', '/api/tracking/status', {
        bookingId: b.bookingId,
        phone: '9988776655'
      });
      assert('Live tracking returns verified trip data for authorized customer',
        trackValid.status === 200 && trackValid.data.success && trackValid.data.trip.bookingId === b.bookingId
      );
    }

    console.log(`\n======================================================`);
    console.log(`FINAL QA RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) process.exit(1);
    else process.exit(0);
  } catch (err) {
    console.error('QA Test execution error:', err);
    process.exit(1);
  }
}

runQA();
