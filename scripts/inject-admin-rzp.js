const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'admin.html');
let html = fs.readFileSync(targetPath, 'utf8');

const targetMarker = 'id="pay-rzp-secret" placeholder="••••••••••••••••">';
if (html.includes(targetMarker) && !html.includes('id="btn-test-rzp-admin"')) {
  const parts = html.split(targetMarker);
  // Find the next </div></div> which closes the form-group
  const after = parts[1];
  const closeGroupIndex = after.indexOf('</div>\n                    </div>');
  const closeGroupIndexCRLF = after.indexOf('</div>\r\n                    </div>');
  const useCRLF = closeGroupIndexCRLF !== -1 && (closeGroupIndex === -1 || closeGroupIndexCRLF < closeGroupIndex);
  const targetIndex = useCRLF ? closeGroupIndexCRLF : closeGroupIndex;

  if (targetIndex !== -1) {
    const endStr = useCRLF ? '</div>\r\n                    </div>' : '</div>\n                    </div>';
    const beforeClose = after.slice(0, targetIndex + endStr.length);
    const rest = after.slice(targetIndex + endStr.length);

    const extraHtml = `
                    <div style="margin-top: 8px;">
                      <button type="button" class="btn btn-secondary btn-sm" id="btn-test-rzp-admin" onclick="testRazorpayAdminCredentials()">⚡ Test Connection</button>
                    </div>
                    <div class="form-group" style="grid-column: 1/-1; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:12px; margin-top:10px;">
                      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                        <strong style="font-size:12px; color:var(--navy-900);">Razorpay Webhook Endpoint</strong>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="copyWebhookUrl()">📋 Copy URL</button>
                      </div>
                      <code id="rzp-webhook-url" style="display:block; font-size:12px; color:#2563eb; background:#ffffff; padding:6px 10px; border-radius:6px; border:1px solid #e2e8f0; user-select:all;">https://onewaytaxibihar.com/api/payment/webhook</code>
                      <div style="font-size:11px; color:#64748b; margin-top:6px;">Add this URL in Razorpay Dashboard → Settings → Webhooks with events <code>payment.captured</code> and <code>payment.failed</code>.</div>
                    </div>`;

    html = parts[0] + targetMarker + beforeClose + extraHtml + rest;
    fs.writeFileSync(targetPath, html, 'utf8');
    console.log('Successfully injected Test Connection and Webhook into admin.html!');
  } else {
    console.log('Could not find closeGroupIndex');
  }
} else {
  console.log('Already contains btn-test-rzp-admin or targetMarker not found');
}

