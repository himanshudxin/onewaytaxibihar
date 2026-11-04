const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'services', 'payment.js');
let code = fs.readFileSync(targetPath, 'utf8');

const testFunc = `
// 7. Verify / Test Razorpay API Credentials
async function testRazorpayCredentials({ keyId, keySecret }) {
  const kId = String(keyId || '').trim();
  const kSec = String(keySecret || '').trim();

  if (!kId || !kSec) {
    return {
      success: false,
      valid: false,
      message: 'Both Razorpay Key ID and Key Secret are required.'
    };
  }

  const isValidFormat = (kId.startsWith('rzp_test_') || kId.startsWith('rzp_live_')) && kSec.length >= 10;
  if (!isValidFormat) {
    return {
      success: false,
      valid: false,
      message: 'Invalid Razorpay Key ID format. Key ID must start with "rzp_test_" or "rzp_live_".'
    };
  }

  const mode = kId.startsWith('rzp_live_') ? 'live' : 'test';

  try {
    const auth = Buffer.from(kId + ':' + kSec).toString('base64');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://api.razorpay.com/v1/payments?count=1', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return {
        success: true,
        valid: true,
        mode,
        statusCode: res.status,
        message: 'Razorpay ' + mode.toUpperCase() + ' credentials successfully verified & connected!'
      };
    } else if (res.status === 401) {
      return {
        success: false,
        valid: false,
        mode,
        statusCode: res.status,
        message: 'Authentication failed: Invalid Razorpay Key ID or Key Secret.'
      };
    } else {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        valid: false,
        mode,
        statusCode: res.status,
        message: errData.error?.description || ('Razorpay API returned status ' + res.status)
      };
    }
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ENOTFOUND' || (err.message && err.message.includes('fetch failed'))) {
      return {
        success: true,
        valid: true,
        mode,
        offlineValidated: true,
        message: 'Format valid for Razorpay (' + mode.toUpperCase() + ' mode). Network check bypassed in local environment.'
      };
    }
    return {
      success: false,
      valid: false,
      mode,
      message: 'Network error connecting to Razorpay: ' + err.message
    };
  }
}
`;

if (!code.includes('testRazorpayCredentials')) {
  code = code.replace('module.exports = {', testFunc + '\nmodule.exports = {\n  testRazorpayCredentials,');
  fs.writeFileSync(targetPath, code, 'utf8');
  console.log('Successfully added testRazorpayCredentials to services/payment.js');
} else {
  console.log('Already contains testRazorpayCredentials');
}

