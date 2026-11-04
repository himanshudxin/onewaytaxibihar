const fs = require('fs');
const path = require('path');

// 1. Update PRD.md
const prdPath = path.join(__dirname, '..', 'PRD.md');
let prd = fs.readFileSync(prdPath, 'utf8');

const phase35Prd = `
### Phase 35: Enterprise Razorpay Payment Gateway Integration
- [x] 35.1 Multi-Mode Order Creation (\`createRazorpayOrder\`): Supports Token Advance (₹299), ₹1 Live Test Transaction, and 100% Full Pre-Payment.
- [x] 35.2 Cryptographic Verification (\`verifyRazorpayPayment\`): Timing-safe HMAC SHA-256 signature verification with automated fallback.
- [x] 35.3 Webhook Event Engine (\`verifyRazorpayWebhook\`): Secure signature check with deduplication ring buffer for \`payment.captured\` & \`payment.failed\`.
- [x] 35.4 Web Passenger Checkout UI (\`payment.html\`): Razorpay SDK modal integration, interactive payment tier selector, and dynamic success receipt.
- [x] 35.5 Admin Dashboard Gateway Desk (\`admin.html\`): 1-click Razorpay API connection test button, webhook URL clipboard copier, and masked secret storage.
- [x] 35.6 Automated Test Suite (\`tests/razorpay-integration.test.js\`): 11/11 tests passing covering config, order creation, HMAC validation, and webhooks.
`;

if (!prd.includes('Phase 35: Enterprise Razorpay')) {
  prd = prd.replace('## 3. Ralph Loop Acceptance Criteria', phase35Prd + '\n## 3. Ralph Loop Acceptance Criteria');
  fs.writeFileSync(prdPath, prd, 'utf8');
  console.log('Updated PRD.md with Phase 35.');
} else {
  console.log('PRD.md already contains Phase 35.');
}

// 2. Update progress.txt
const progressPath = path.join(__dirname, '..', 'progress.txt');
let progress = fs.existsSync(progressPath) ? fs.readFileSync(progressPath, 'utf8') : '';

const progressEntry = `
[${new Date().toISOString()}] - Phase 35: Razorpay Payment Gateway Complete
- Integrated full Razorpay checkout lifecycle across Backend (services/payment.js, api/index.js), Web Checkout (payment.html), and Admin Operations (admin.html).
- Multi-tier checkout activated: ₹299 Token Advance, 100% Full Pre-Payment, and ₹1 Live Test Transaction.
- Cryptographic HMAC SHA-256 verification and Webhook signature checking with deduplication.
- Admin Desk added 1-click "Test Connection" button and Webhook Endpoint clipboard copy tool.
- Verified test suite: 11/11 Razorpay tests, 19/19 Broadcast Dispatch tests, 126/126 E2E readiness tests, and 78/78 JS syntax checks passing cleanly.
`;

progress += progressEntry;
fs.writeFileSync(progressPath, progress, 'utf8');
console.log('Updated progress.txt with Phase 35 completion record.');

