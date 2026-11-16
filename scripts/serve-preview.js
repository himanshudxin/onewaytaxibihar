const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5050;
const PREVIEW_FILE = path.join(__dirname, '..', 'mobile', 'previews', 'uber-bolt-preview.html');

const APPS_HUB_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OneWay Taxi Bihar - Standalone Mobile Apps & Production Releases</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0A0E17; color: #F8FAFC; min-height: 100vh; padding: 24px 16px; }
    .container { max-width: 680px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 28px; }
    .brand { display: inline-flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 800; color: #10B981; letter-spacing: 1px; text-transform: uppercase; }
    .title { font-size: 26px; font-weight: 800; margin-top: 8px; }
    .subtitle { font-size: 14px; color: #94A3B8; margin-top: 6px; }
    .app-card { background: #131B2A; border: 1.5px solid #1E293B; border-radius: 18px; padding: 20px; margin-bottom: 20px; }
    .app-card.passenger { border-color: rgba(16, 185, 129, 0.4); }
    .app-card.driver { border-color: rgba(245, 158, 11, 0.4); }
    .app-card.admin { border-color: rgba(59, 130, 246, 0.4); }
    .app-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .app-identity { display: flex; align-items: center; gap: 12px; }
    .app-badge { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; }
    .app-badge.passenger { background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; color: #10B981; }
    .app-badge.driver { background: rgba(245, 158, 11, 0.15); border: 1px solid #F59E0B; color: #F59E0B; }
    .app-badge.admin { background: rgba(59, 130, 246, 0.15); border: 1px solid #3B82F6; color: #3B82F6; }
    .app-title { font-size: 18px; font-weight: 800; }
    .app-package { font-size: 11px; color: #64748B; font-family: monospace; margin-top: 2px; }
    .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
    .status-badge.ready { background: rgba(16, 185, 129, 0.2); color: #10B981; }
    .status-badge.store { background: rgba(59, 130, 246, 0.2); color: #60A5FA; }
    .app-desc { font-size: 13px; color: #94A3B8; line-height: 1.5; margin-bottom: 16px; }
    .button-group { display: flex; flex-direction: column; gap: 8px; }
    .action-btn { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px; color: #FFFFFF; transition: transform 0.1s; }
    .action-btn:active { transform: scale(0.98); }
    .btn-green { background: #059669; }
    .btn-indigo { background: #4F46E5; }
    .btn-amber { background: #D97706; }
    .btn-blue { background: #2563EB; }
    .btn-secondary { background: #1E293B; color: #94A3B8; font-size: 12px; }
    .footer-note { text-align: center; color: #64748B; font-size: 12px; margin-top: 24px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">ONEWAY TAXI BIHAR</div>
      <h1 class="title">Standalone Mobile Apps & Releases</h1>
      <p class="subtitle">Direct downloads for testing APKs and Google Play Store production bundles.</p>
    </div>

    <!-- App 1: Passenger App -->
    <div class="app-card passenger">
      <div class="app-header">
        <div class="app-identity">
          <div class="app-badge passenger">PAX</div>
          <div>
            <div class="app-title">OneWay Taxi (Passenger)</div>
            <div class="app-package">com.onewaytaxibihar.passenger - v1.0.0 (Build 2)</div>
          </div>
        </div>
        <span class="status-badge store">STORE READY</span>
      </div>
      <p class="app-desc">Rider application for outstation taxi booking across all 38 Bihar districts with transparent one-way tariffs, real-time routing, and OTP ride security.</p>
      <div class="button-group">
        <a href="/aab/passenger" class="action-btn btn-indigo">Google Play Store Production Bundle (.AAB - 58 MB)</a>
        <a href="/apk/passenger" class="action-btn btn-green">Download Direct Install APK (82.56 MB)</a>
        <a href="exp://192.168.0.179:8081" class="action-btn btn-secondary">Launch in Expo Go (Development)</a>
      </div>
    </div>

    <!-- App 2: Driver Partner App -->
    <div class="app-card driver">
      <div class="app-header">
        <div class="app-identity">
          <div class="app-badge driver">DRV</div>
          <div>
            <div class="app-title">OneWay Taxi Driver</div>
            <div class="app-package">com.onewaytaxibihar.driver - v1.0.0 (Build 2)</div>
          </div>
        </div>
        <span class="status-badge store">STORE READY</span>
      </div>
      <p class="app-desc">Driver partner console with real-time GPS telemetry, dispatch alerts, turn-by-turn navigation with toll markers, and autonomous trip payouts.</p>
      <div class="button-group">
        <a href="/aab/driver" class="action-btn btn-indigo">Google Play Store Production Bundle (.AAB - 57.78 MB)</a>
        <a href="/apk/driver" class="action-btn btn-amber">Download Direct Install APK (82.91 MB)</a>
        <a href="https://expo.dev/accounts/himanshud/projects/onewaytaxibihar/builds/b5de31da-ae1d-4d0f-a54d-65551283edfc" target="_blank" class="action-btn btn-secondary">View EAS Build Details (b5de31da)</a>
      </div>
    </div>

    <!-- App 3: Admin Command Center -->
    <div class="app-card admin">
      <div class="app-header">
        <div class="app-identity">
          <div class="app-badge admin">ADM</div>
          <div>
            <div class="app-title">OneWay Taxi Admin</div>
            <div class="app-package">com.onewaytaxibihar.admin - v1.0.0 (Build 2)</div>
          </div>
        </div>
        <span class="status-badge store">STORE READY</span>
      </div>
      <p class="app-desc">Executive dispatch & fleet operations command center with live vehicle telemetry, automated sentinel failover, and driver KYC verification.</p>
      <div class="button-group">
        <a href="/aab/admin" class="action-btn btn-indigo">Google Play Store Production Bundle (.AAB - 58.11 MB)</a>
        <a href="/apk/admin" class="action-btn btn-blue">Download Admin APK (82.91 MB)</a>
        <a href="/admin.html" class="action-btn btn-secondary">Open Web Operations Console</a>
      </div>
    </div>

    <div class="footer-note">
      Signed with production keystores - Fully compliant with Google Play 64-bit and targetSDK requirements.<br>
      Zero emojis across all production bundles for corporate enterprise compliance.
    </div>
  </div>
</body>
</html>`;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const cleanUrl = req.url.split('?')[0];

  // Play Store AAB Bundle (Passenger)
  if (cleanUrl === '/aab' || cleanUrl === '/aab/passenger' || cleanUrl === '/download-passenger-aab' || cleanUrl === '/bundle') {
    const aabPath = path.join(__dirname, '..', 'downloads', 'OneWayTaxiBihar-Passenger-Production.aab');
    if (fs.existsSync(aabPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="OneWayTaxiBihar-Passenger-Production.aab"',
        'Content-Length': fs.statSync(aabPath).size
      });
      fs.createReadStream(aabPath).pipe(res);
      return;
    }
  }

  // Play Store AAB Bundle (Driver)
  if (cleanUrl === '/aab/driver' || cleanUrl === '/download-driver-aab') {
    const aabPath = path.join(__dirname, '..', 'downloads', 'OneWayTaxiBihar-Driver-Production.aab');
    if (fs.existsSync(aabPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="OneWayTaxiBihar-Driver-Production.aab"',
        'Content-Length': fs.statSync(aabPath).size
      });
      fs.createReadStream(aabPath).pipe(res);
      return;
    }
  }

  // Play Store AAB Bundle (Admin)
  if (cleanUrl === '/aab/admin' || cleanUrl === '/download-admin-aab') {
    const aabPath = path.join(__dirname, '..', 'downloads', 'OneWayTaxiBihar-Admin-Production.aab');
    if (fs.existsSync(aabPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="OneWayTaxiBihar-Admin-Production.aab"',
        'Content-Length': fs.statSync(aabPath).size
      });
      fs.createReadStream(aabPath).pipe(res);
      return;
    }
  }

  // Passenger APK
  if (cleanUrl === '/apk' || cleanUrl === '/apk/passenger' || cleanUrl === '/download-passenger' || cleanUrl === '/download') {
    const apkPath = fs.existsSync(path.join(__dirname, '..', 'downloads', 'passenger-latest.apk'))
      ? path.join(__dirname, '..', 'downloads', 'passenger-latest.apk')
      : path.join(__dirname, '..', 'downloads', 'onewaytaxi-passenger.apk');
    if (fs.existsSync(apkPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="OneWayTaxiBihar-Passenger.apk"',
        'Content-Length': fs.statSync(apkPath).size
      });
      fs.createReadStream(apkPath).pipe(res);
      return;
    }
  }

  // Driver APK
  if (cleanUrl === '/apk/driver' || cleanUrl === '/download-driver') {
    const apkPath = fs.existsSync(path.join(__dirname, '..', 'downloads', 'driver-latest.apk'))
      ? path.join(__dirname, '..', 'downloads', 'driver-latest.apk')
      : path.join(__dirname, '..', 'downloads', 'onewaytaxi-driver.apk');
    if (fs.existsSync(apkPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="OneWayTaxiBihar-Driver.apk"',
        'Content-Length': fs.statSync(apkPath).size
      });
      fs.createReadStream(apkPath).pipe(res);
      return;
    }
  }

  // Admin APK
  if (cleanUrl === '/apk/admin' || cleanUrl === '/download-admin') {
    const apkPath = fs.existsSync(path.join(__dirname, '..', 'downloads', 'admin-latest.apk'))
      ? path.join(__dirname, '..', 'downloads', 'admin-latest.apk')
      : path.join(__dirname, '..', 'downloads', 'onewaytaxi-admin.apk');
    if (fs.existsSync(apkPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="OneWayTaxiBihar-Admin.apk"',
        'Content-Length': fs.statSync(apkPath).size
      });
      fs.createReadStream(apkPath).pipe(res);
      return;
    } else {
      res.writeHead(302, { Location: 'https://expo.dev/accounts/himanshud/projects/onewaytaxibihar/builds/5a331bfd-837a-483a-8584-133e84c5317e' });
      res.end();
      return;
    }
  }

  // App Download Hub
  if (cleanUrl === '/apps' || cleanUrl === '/hub' || cleanUrl === '/download-center') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(APPS_HUB_HTML);
    return;
  }

  // Previews & Fallback
  if (cleanUrl === '/' || cleanUrl === '/preview' || cleanUrl === '/uber-bolt-preview.html') {
    fs.readFile(PREVIEW_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading preview file: ' + err.message);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } else {
    // Attempt to serve static assets from root or mobile/previews
    const reqPath = cleanUrl.replace(/^\//, '');
    const tryPaths = [
      path.join(__dirname, '..', 'mobile', 'previews', reqPath),
      path.join(__dirname, '..', reqPath)
    ];
    let found = false;
    for (const p of tryPaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const ext = path.extname(p).toLowerCase();
        const mimeMap = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.apk': 'application/vnd.android.package-archive',
          '.aab': 'application/octet-stream'
        };
        if (ext === '.apk' || ext === '.aab') {
          res.setHeader('Content-Disposition', 'attachment; filename="' + path.basename(p) + '"');
        }
        res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
        fs.createReadStream(p).pipe(res);
        found = true;
        break;
      }
    }
    if (!found) {
      fs.readFile(PREVIEW_FILE, 'utf8', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Preview Server] Running at: http://localhost:${PORT}`);
  console.log(`[Preview Server] LAN: http://192.168.0.179:${PORT}`);
  console.log(`[Preview Server] Apps Hub: http://192.168.0.179:${PORT}/apps`);
});
