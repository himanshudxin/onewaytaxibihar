const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'api', 'index.js');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Config route
const oldConfig = `if (pathname === '/payments/config' && method === 'GET') {`;
const newConfig = `if (['/payments/config', '/payment/config', '/api/payments/config', '/api/payment/config'].includes(pathname) && method === 'GET') {`;

if (code.includes(oldConfig)) {
  code = code.replace(oldConfig, newConfig);
  console.log('Harmonized payment config route.');
} else {
  console.log('Config route already updated or different.');
}

// 2. Create order route
const oldCreate = `if ((pathname === '/payments/create-order' || pathname === '/payment/create-order') && method === 'POST') {`;
const newCreate = `if (['/payments/create-order', '/payment/create-order', '/api/payments/create-order', '/api/payment/create-order'].includes(pathname) && method === 'POST') {`;

if (code.includes(oldCreate)) {
  code = code.replace(oldCreate, newCreate);
  console.log('Harmonized create-order route.');
} else {
  console.log('Create order route already updated or different.');
}

// 3. Verify route
const oldVerify = `if (pathname === '/payments/verify' && method === 'POST') {`;
const newVerify = `if (['/payments/verify', '/payment/verify', '/api/payments/verify', '/api/payment/verify'].includes(pathname) && method === 'POST') {`;

if (code.includes(oldVerify)) {
  code = code.replace(oldVerify, newVerify);
  console.log('Harmonized payment verify route.');
} else {
  console.log('Payment verify route already updated or different.');
}

// 4. Test credentials endpoint
const testCredentialsSnippet = `
    if (['/admin/test-razorpay', '/api/admin/test-razorpay', '/payment/test-credentials', '/api/payment/test-credentials'].includes(pathname) && method === 'POST') {
      const paymentSettings = db.settings?.payment || {};
      const keyId = body.keyId || paymentSettings.razorpayKeyId;
      const keySecret = body.keySecret || paymentSettings.razorpayKeySecret;

      const result = await paymentService.testRazorpayCredentials({ keyId, keySecret });
      return sendJson(result.valid ? 200 : 400, result);
    }
`;

if (!code.includes("'/admin/test-razorpay'")) {
  const insertMarker = "if (pathname === '/admin/payment-settings' && method === 'GET') {";
  if (code.includes(insertMarker)) {
    code = code.replace(insertMarker, testCredentialsSnippet + '\n    ' + insertMarker);
    console.log('Added test-razorpay admin/payment route.');
  }
} else {
  console.log('test-razorpay route already exists.');
}

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully updated api/index.js');

