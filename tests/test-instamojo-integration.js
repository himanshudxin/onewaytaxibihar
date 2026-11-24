/**
 * Comprehensive Instamojo Payment Gateway Integration Test Suite
 */
const assert = require('assert');
const paymentService = require('../services/payment');

async function runTests() {
  console.log('================================================================');
  console.log('🚀 RUNNING INSTAMOJO PAYMENT GATEWAY TEST SUITE');
  console.log('================================================================\n');

  // Test 1: Instamojo Public Config
  console.log('Test 1: Public Payment Config Defaults...');
  const pubCfg = paymentService.getPaymentConfig();
  assert.strictEqual(pubCfg.primaryPaymentMode, 'instamojo');
  assert.strictEqual(pubCfg.enableInstamojo, true);
  assert.strictEqual(pubCfg.enableRazorpay, false);
  console.log(' [PASS] Public Payment Config has Instamojo active and Razorpay disabled.');

  // Test 2: Instamojo Order Creation (15% Advance Calculation)
  console.log('\nTest 2: Instamojo Order Creation (Advance Token)...');
  const orderRes = await paymentService.createInstamojoOrder({
    amountInRupees: 299,
    bookingId: 'OTB_IM_TEST_101',
    passengerName: 'Rohit Sharma',
    passengerPhone: '9801123456'
  });
  assert.strictEqual(orderRes.success, true);
  assert.strictEqual(orderRes.provider, 'instamojo');
  assert.strictEqual(orderRes.advanceAmount, 299);
  assert.strictEqual(orderRes.amount, 29900); // in paise
  assert.ok(orderRes.orderId, 'Order ID must be generated');
  assert.ok(orderRes.paymentUrl, 'Payment URL must be present');
  console.log(` [PASS] Instamojo Order created: ID=${orderRes.orderId}, URL=${orderRes.paymentUrl}`);

  // Test 3: Instamojo Payment Verification (Sandbox / In-Page Verified)
  console.log('\nTest 3: Instamojo Payment Verification...');
  const verifyRes = await paymentService.verifyInstamojoPayment({
    orderId: orderRes.orderId,
    paymentId: 'MOJO_LIVE_TEST_9999',
    paymentRequestId: orderRes.orderId
  });
  assert.strictEqual(verifyRes.verified, true);
  assert.strictEqual(verifyRes.gateway, 'instamojo');
  console.log(` [PASS] Payment verified: ${verifyRes.paymentId} (Status: ${verifyRes.status})`);

  // Test 4: Instamojo Webhook MAC Verification
  console.log('\nTest 4: Instamojo Webhook MAC Signature Verification...');
  const crypto = require('crypto');
  const salt = 'test_salt_secret_12345';
  const webhookPayload = {
    payment_id: 'MOJO_PAY_123456',
    status: 'Credit',
    amount: '299.00',
    buyer_name: 'Rohit Sharma',
    buyer_phone: '9801123456',
    purpose: 'Advance 15% Token - Cab Booking #OTB_IM_TEST_101'
  };
  const keys = Object.keys(webhookPayload).filter(k => k !== 'mac').sort();
  const rawString = keys.map(k => webhookPayload[k]).join('|');
  const generatedMac = crypto.createHmac('sha1', salt).update(rawString).digest('hex');
  webhookPayload.mac = generatedMac;

  const isValidMac = paymentService.verifyInstamojoWebhook(webhookPayload, { instamojoPrivateSalt: salt });
  assert.strictEqual(isValidMac, true, 'Valid MAC must pass verification');

  const isInvalidMac = paymentService.verifyInstamojoWebhook({ ...webhookPayload, mac: 'bad_mac_123' }, { instamojoPrivateSalt: salt });
  assert.strictEqual(isInvalidMac, false, 'Invalid MAC must fail verification');
  console.log(' [PASS] Webhook HMAC SHA-1 verification functions accurately.');

  // Test 5: Credentials Formatting Test
  console.log('\nTest 5: Instamojo Credentials Validation Test...');
  const testRes = await paymentService.testInstamojoCredentials({
    apiKey: 'test_sample_api_key',
    authToken: 'test_sample_auth_token',
    env: 'sandbox'
  });
  assert.strictEqual(testRes.configured, true);
  console.log(` [PASS] Credentials test returned valid format notice: ${testRes.message}`);

  console.log('\n================================================================');
  console.log('🏆 ALL 5 / 5 INSTAMOJO INTEGRATION TESTS PASSED 100%!');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('Instamojo test error:', err);
  process.exit(1);
});
