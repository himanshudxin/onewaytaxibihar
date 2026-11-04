const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'admin.html');
let html = fs.readFileSync(targetPath, 'utf8');

// 1. Locate the Razorpay grid in admin.html
const oldRzpGrid = `<div class="form-grid-2" style="margin-bottom:20px;">
                    <div class="form-group">
                      <label class="form-label">Razorpay Key ID (Test or Live)</label>
                      <input type="text" class="form-control" id="pay-rzp-key-id" placeholder="rzp_test_... or rzp_live_...">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Razorpay Key Secret</label>
                      <div class="masked-secret-field">
                        <input type="password" class="form-control" id="pay-rzp-secret" placeholder="••••••••••••••••">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="toggleSecretInput('pay-rzp-secret')">👁️</button>
                      </div>
                    </div>
                  </div>`;

const newRzpGrid = `<div class="form-grid-2" style="margin-bottom:12px;">
                    <div class="form-group">
                      <label class="form-label">Razorpay Key ID (Test or Live)</label>
                      <input type="text" class="form-control" id="pay-rzp-key-id" placeholder="rzp_test_... or rzp_live_...">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Razorpay Key Secret</label>
                      <div class="masked-secret-field">
                        <input type="password" class="form-control" id="pay-rzp-secret" placeholder="••••••••••••••••">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="toggleSecretInput('pay-rzp-secret')">👁️</button>
                        <button type="button" class="btn btn-secondary btn-sm" id="btn-test-rzp-admin" onclick="testRazorpayAdminCredentials()" title="Test API Connection">⚡ Test</button>
                      </div>
                    </div>
                    <div class="form-group" style="grid-column: 1/-1; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:12px;">
                      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                        <strong style="font-size:12px; color:var(--navy-900);">Razorpay Webhook Endpoint</strong>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="copyWebhookUrl()">📋 Copy URL</button>
                      </div>
                      <code id="rzp-webhook-url" style="display:block; font-size:12px; color:#2563eb; background:#ffffff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0; user-select:all;">https://onewaytaxibihar.com/api/payment/webhook</code>
                      <div style="font-size:11px; color:#64748b; margin-top:6px;">Add this URL in Razorpay Dashboard → Settings → Webhooks with events <code>payment.captured</code> and <code>payment.failed</code>.</div>
                    </div>
                  </div>`;

if (html.includes(oldRzpGrid)) {
  html = html.replace(oldRzpGrid, newRzpGrid);
  console.log('Added Test Connection button & Webhook Endpoint box to admin.html.');
} else {
  console.log('Razorpay grid not matched or already updated in admin.html.');
}

// 2. Add Javascript helpers to admin.html
const adminJsFunctions = `
    async function testRazorpayAdminCredentials() {
      const btn = document.getElementById("btn-test-rzp-admin");
      const keyId = document.getElementById("pay-rzp-key-id")?.value?.trim();
      const keySecret = document.getElementById("pay-rzp-secret")?.value?.trim();

      if (btn) { btn.disabled = true; btn.dataset.origText = btn.textContent; btn.textContent = "Testing..."; }
      try {
        const res = await adminFetch("/api/admin/test-razorpay", {
          method: "POST",
          body: JSON.stringify({ keyId, keySecret })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(data.message || "Razorpay credentials verified active!", "success");
          const rzpBadge = document.getElementById("badge-rzp-status");
          if (rzpBadge) {
            rzpBadge.textContent = "✓ Razorpay: ACTIVE (" + (data.mode || "live").toUpperCase() + ")";
            rzpBadge.style.background = "#ecfdf5";
            rzpBadge.style.color = "#059669";
            rzpBadge.style.borderColor = "#a7f3d0";
          }
        } else {
          showToast(data.message || "Razorpay verification failed.", "error");
        }
      } catch (e) {
        showToast("Test request error: " + e.message, "error");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.origText || "⚡ Test"; }
      }
    }

    function copyWebhookUrl() {
      const urlEl = document.getElementById("rzp-webhook-url");
      const text = urlEl ? urlEl.textContent : "https://onewaytaxibihar.com/api/payment/webhook";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => showToast("Webhook URL copied to clipboard!", "info"));
      } else {
        showToast("Webhook URL: " + text, "info");
      }
    }
`;

if (!html.includes('testRazorpayAdminCredentials')) {
  const insertMarker = 'async function handleQrFileUpload(e) {';
  if (html.includes(insertMarker)) {
    html = html.replace(insertMarker, adminJsFunctions + '\n    ' + insertMarker);
    console.log('Added testRazorpayAdminCredentials and copyWebhookUrl JS to admin.html.');
  }
}

fs.writeFileSync(targetPath, html, 'utf8');
console.log('Successfully updated admin.html');

