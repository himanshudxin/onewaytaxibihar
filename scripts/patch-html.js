const fs = require('fs');

// 1. Patch driver.html
let driverHtml = fs.readFileSync('driver.html', 'utf8');
if (!driverHtml.includes('driver-legal-footer')) {
  const addition = `
  <!-- Chauffeur Async Operation Loading Feedback Overlay -->
  <div id="driver-loading-spinner-overlay" class="driver-loading-overlay spinner skeleton" style="display:none;">
    <div class="driver-spinner spinner"></div>
    <div class="loading-label">Loading chauffeur operations...</div>
  </div>

  <!-- Dedicated Chauffeur Legal Footer -->
  <footer class="driver-legal-footer" style="padding: 20px 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; margin-top: auto;">
    <p style="margin: 0 0 6px 0;">OneWayTaxiBihar Chauffeur & Driver Partner Portal</p>
    <p style="margin: 0;">
      <a href="/privacy-policy.html" style="color: #10b981; text-decoration: none; margin-right: 16px; font-weight: 500;">Privacy Policy</a>
      <a href="/terms-of-service.html" style="color: #10b981; text-decoration: none; font-weight: 500;">Terms of Service</a>
    </p>
  </footer>
  <script src="/js/analytics.js"></script>
</body>
</html>`;

  driverHtml = driverHtml.replace(/<script src="\/js\/analytics\.js"><\/script>\s*<\/body>\s*<\/html>/i, addition);
  fs.writeFileSync('driver.html', driverHtml, 'utf8');
  console.log('driver.html patched successfully.');
} else {
  console.log('driver.html already patched.');
}

// 2. Patch admin.html
let adminHtml = fs.readFileSync('admin.html', 'utf8');
if (!adminHtml.includes('privacy-policy.html')) {
  const adminAddition = `
  <footer style="padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; margin-top: 24px;">
    <span>OneWayTaxiBihar Fleet Command Center &bull; </span>
    <a href="/privacy-policy.html" style="color: #94a3b8; text-decoration: none; margin-right: 12px;">Privacy Policy</a>
    <a href="/terms-of-service.html" style="color: #94a3b8; text-decoration: none;">Terms of Service</a>
  </footer>
  <script src="/js/analytics.js"></script>
</body>
</html>`;

  adminHtml = adminHtml.replace(/<script src="\/js\/analytics\.js"><\/script>\s*<\/body>\s*<\/html>/i, adminAddition);
  fs.writeFileSync('admin.html', adminHtml, 'utf8');
  console.log('admin.html patched successfully.');
} else {
  console.log('admin.html already patched.');
}

