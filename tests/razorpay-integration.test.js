// Force local in-memory DB during tests to prevent external Atlas DNS timeout
process.env.USE_LOCAL_DB = 'true';
process.env.MONGODB_URI = '';
process.env.DATABASE_URL = '';
process.env.POSTGRES_URL = '';
process.env.NODE_ENV = 'test';

const { test, describe, before } = require('node:test');
const assert = require('node:assert');
const crypto = require('node:crypto');
const { Readable } = require('node:stream');
const paymentService = require('../services/payment');
const apiHandler = require('../api/index');
const dbService = require('../services/db');

// In-memory mock API dispatcher (zero TCP network dependencies)
async function mockApi(requestPath, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = options.headers || {};
  let bodyStr = '';
  if (options.body !== undefined) {
    bodyStr = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const req = Readable.from(bodyStr ? [Buffer.from(bodyStr)] : []);
  req.url = requestPath;
  req.method = method;
  req.headers = {
    host: 'localhost',
    'content-type': 'application/json',
    ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  };
  req.connection = { remoteAddress: '127.0.0.1' };
  req.socket = req.connection;

  const resChunks = [];
  const resHeaders = {};

  const res = {
    statusCode: 200,
    setHeader(key, val) {
      resHeaders[key.toLowerCase()] = String(val);
    },
    getHeader(key) {
      return resHeaders[key.toLowerCase()];
    },
    end(chunk) {
      if (chunk) resChunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
  };

  await apiHandler(req, res);

  const rawBody = Buffer.concat(resChunks).toString('utf8');
  let data = rawBody;
  const cType = resHeaders['content-type'] || '';
  if (cType.includes('application/json')) {
    try { data = JSON.parse(rawBody); } catch (e) { data = rawBody; }
  }

  return {
    status: res.statusCode,
    headers: resHeaders,
    data
  };
}

describe('Razorpay Enterprise Payment Gateway Integration', () => {

  before(async () => {
    await dbService.initDatabase().catch(() => {});
  });

  // 1. Service Level Tests
  describe('Payment Service Core Engine', () => {

    test('getPaymentConfig returns public settings with safe defaults', () => {
      const cfg = paymentService.getPaymentConfig();
      assert.ok(cfg, 'Config should exist');
      assert.strictEqual(Array.isArray(cfg.supportedCurrencies), true);
      assert.strictEqual(cfg.supportedCurrencies[0], 'INR');
      assert.strictEqual(typeof cfg.defaultAdvanceAmount, 'number');
      assert.strictEqual(cfg.enableDirectUpi, true);
      assert.strictEqual(cfg.enableCashToDriver, true);
    });

    test('testRazorpayCredentials validates key formatting correctly', async () => {
      // Empty keys
      const emptyRes = await paymentService.testRazorpayCredentials({ keyId: '', keySecret: '' });
      assert.strictEqual(emptyRes.valid, false);

      // Invalid prefix
      const badPrefix = await paymentService.testRazorpayCredentials({ keyId: 'invalid_key_123', keySecret: 'secret_1234567890' });
      assert.strictEqual(badPrefix.valid, false);

      // Valid test key format
      const validFormat = await paymentService.testRazorpayCredentials({
        keyId: 'rzp_test_1234567890ABCD',
        keySecret: 'secret_12345678901234567890'
      });
      assert.strictEqual(typeof validFormat.valid, 'boolean');
      assert.strictEqual(validFormat.mode, 'test');
    });

    test('createRazorpayOrder computes paise accurately for advance, full fare, and ₹1 test', async () => {
      // Token Advance ₹299
      const order299 = await paymentService.createRazorpayOrder({
        amountInRupees: 299,
        bookingId: 'OTB_TEST_299'
      });
      assert.ok(order299.orderId, 'Should have orderId');
      assert.strictEqual(order299.amount, 29900, '₹299 should equal 29900 paise');

      // ₹1 Real Test Transaction
      const order1 = await paymentService.createRazorpayOrder({
        amountInRupees: 1,
        bookingId: 'OTB_TEST_1'
      });
      assert.strictEqual(order1.amount, 100, '₹1 should equal 100 paise');

      // Full Pre-Payment ₹3,450
      const orderFull = await paymentService.createRazorpayOrder({
        amountInRupees: 3450,
        bookingId: 'OTB_TEST_FULL'
      });
      assert.strictEqual(orderFull.amount, 345000, '₹3450 should equal 345000 paise');
    });

    test('verifyRazorpayPayment validates HMAC SHA-256 signatures securely with timingSafeEqual', () => {
      const mockSecret = 'rzp_mock_secret_key_super_safe_999';
      const orderId = 'order_test_123456';
      const paymentId = 'pay_test_789012';

      // Generate true cryptographic signature
      const validSignature = crypto
        .createHmac('sha256', mockSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const customConfig = { razorpayKeySecret: mockSecret };

      // 1. Valid Signature
      const validResult = paymentService.verifyRazorpayPayment({
        orderId,
        paymentId,
        signature: validSignature
      }, customConfig);
      assert.strictEqual(validResult.verified, true, 'Valid HMAC signature must verify');

      // 2. Tampered / Corrupted Signature
      const tamperedSignature = validSignature.slice(0, -4) + '0000';
      const invalidResult = paymentService.verifyRazorpayPayment({
        orderId,
        paymentId,
        signature: tamperedSignature
      }, customConfig);
      assert.strictEqual(invalidResult.verified, false, 'Tampered HMAC signature must be rejected');

      // 3. Signature length mismatch
      const shortSignature = '123456';
      const shortResult = paymentService.verifyRazorpayPayment({
        orderId,
        paymentId,
        signature: shortSignature
      }, customConfig);
      assert.strictEqual(shortResult.verified, false, 'Short signature must be rejected');
    });

    test('verifyRazorpayWebhook validates webhook signatures correctly', () => {
      const webhookSecret = 'test_webhook_secret_777';
      const payloadString = JSON.stringify({ event: 'payment.captured', id: 'evt_1001' });

      const validWebhookSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      const customConfig = { razorpayWebhookSecret: webhookSecret };

      // Valid webhook
      const validCheck = paymentService.verifyRazorpayWebhook(payloadString, validWebhookSig, customConfig);
      assert.strictEqual(validCheck, true, 'Valid webhook signature must pass');

      // Invalid webhook
      const badCheck = paymentService.verifyRazorpayWebhook(payloadString, 'invalid_sig', customConfig);
      assert.strictEqual(badCheck, false, 'Invalid webhook signature must fail');
    });

  });

  // 2. In-Process HTTP REST API Tests
  describe('HTTP REST API Endpoints', () => {

    test('GET /api/payment/config returns valid payment configuration', async () => {
      const res = await mockApi('/api/payment/config', { method: 'GET' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.supportedCurrencies);
    });

    test('GET /payments/config alias returns identical config', async () => {
      const res = await mockApi('/payments/config', { method: 'GET' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });

    test('POST /api/payment/create-order handles ₹1 test order creation cleanly', async () => {
      const res = await mockApi('/api/payment/create-order', {
        method: 'POST',
        body: {
          amount: 1,
          bookingId: 'OTB_TEST_HTTP_1',
          passengerName: 'Test Passenger',
          passengerPhone: '9876543210'
        }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.amount, 100); // 100 paise
    });

    test('POST /api/payment/verify confirms order and booking', async () => {
      // First create a test booking
      const bRes = await mockApi('/api/bookings', {
        method: 'POST',
        body: {
          passengerName: 'Razorpay Test User',
          passengerPhone: '9934188888',
          pickupCity: 'Patna',
          pickupAddress: 'Patna Airport',
          dropCity: 'Gaya',
          dropAddress: 'Bodh Gaya',
          tripType: 'oneway',
          pickupDate: '2026-11-15',
          pickupTime: '10:00 AM',
          cabTier: 'sedan',
          cabName: 'Prime Sedan',
          totalFare: 2998,
          paymentStatus: 'pending'
        }
      });

      const booking = bRes.data.booking;
      const bId = booking ? (booking.bookingId || booking.id) : 'OTB_MOCK_123';

      // Verify payment for advance ₹299
      const vRes = await mockApi('/api/payment/verify', {
        method: 'POST',
        body: {
          orderId: 'order_test_live_verify',
          paymentId: 'pay_test_live_verify',
          signature: 'simulated_test_signature',
          bookingId: bId,
          amount: 299
        }
      });

      assert.strictEqual(vRes.status, 200);
      assert.strictEqual(vRes.data.success, true);
      assert.strictEqual(vRes.data.verified, true);
      assert.strictEqual(vRes.data.advancePaid, 299);
      if (vRes.data.booking) {
        assert.strictEqual(vRes.data.booking.advancePaid, 299);
        assert.strictEqual(vRes.data.booking.balanceDue, 2699);
      }
    });

    test('POST /api/admin/test-razorpay formats and responds to credential test', async () => {
      const res = await mockApi('/api/admin/test-razorpay', {
        method: 'POST',
        body: {
          keyId: 'rzp_test_mockKeyId12345',
          keySecret: 'mockKeySecret6789012345'
        }
      });
      // In sandbox/local test, format is valid
      assert.strictEqual(res.data.mode, 'test');
      assert.ok(res.data.message);
    });

    test('POST /api/payment/webhook handles payment.captured and deduplicates', async () => {
      const webhookPayload = {
        event: 'payment.captured',
        id: 'evt_test_dedup_101',
        payload: {
          payment: {
            entity: {
              id: 'pay_hook_101',
              amount: 29900,
              notes: {
                bookingId: 'OTB_TEST_HTTP_1'
              }
            }
          }
        }
      };

      // First webhook call
      const res1 = await mockApi('/api/payment/webhook', {
        method: 'POST',
        body: webhookPayload
      });
      assert.strictEqual(res1.status, 200);
      assert.strictEqual(res1.data.status, 'ok');

      // Duplicate webhook call
      const res2 = await mockApi('/api/payment/webhook', {
        method: 'POST',
        body: webhookPayload
      });
      assert.strictEqual(res2.status, 200);
      assert.strictEqual(res2.data.deduplicated, true);
    });

  });

});
