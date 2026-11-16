const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const storeAssetsDir = path.resolve(__dirname, '..', 'store-assets');
const PORT = 9600 + Math.floor(Math.random() * 100);
const tmpDir = path.join(os.tmpdir(), 'chrome-store-assets-' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1200,900'
]);

async function waitForChrome(port, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        if (tabs && tabs.length > 0) return tabs[0].webSocketDebuggerUrl;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 400));
  }
  throw new Error('Chrome failed to start on port ' + port);
}

async function run() {
  try {
    const wsUrl = await waitForChrome(PORT);
    const ws = new globalThis.WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let id = 1;
    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const res = JSON.parse(event.data);
        if (res.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');

    // -------------------------------------------------------------
    // 1. Generate Passenger App Icon (512x512)
    // -------------------------------------------------------------
    await send('Emulation.setDeviceMetricsOverride', {
      width: 512,
      height: 512,
      deviceScaleFactor: 1,
      mobile: false
    });

    const passengerIconHtml = `data:text/html,<!DOCTYPE html>
    <html><head><style>
      body, html { margin: 0; padding: 0; width: 512px; height: 512px; background: #070B13; display: flex; align-items: center; justify-content: center; font-family: -apple-system, sans-serif; overflow: hidden; }
      .icon-card { width: 440px; height: 440px; border-radius: 96px; background: linear-gradient(145deg, #0f172a 0%, #022c22 100%); border: 4px solid #10b981; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 20px 50px rgba(16, 185, 129, 0.35); position: relative; }
      .badge { position: absolute; top: 38px; background: rgba(16,185,129,0.2); border: 1.5px solid #10b981; color: #34d399; font-size: 17px; font-weight: 800; padding: 6px 18px; border-radius: 9999px; letter-spacing: 1px; }
      .cab-svg { width: 180px; height: 180px; margin-top: 28px; }
      .title { color: #ffffff; font-size: 34px; font-weight: 900; margin-top: 14px; letter-spacing: -0.5px; }
      .title span { color: #f59e0b; }
      .sub { color: #94a3b8; font-size: 16px; font-weight: 700; margin-top: 4px; letter-spacing: 0.5px; }
    </style></head><body>
      <div class="icon-card">
        <div class="badge">BIHAR OUTSTATION</div>
        <svg class="cab-svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 11.1 2 11.5V16c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2.5" fill="#10b981"/>
          <circle cx="17" cy="17" r="2.5" fill="#10b981"/>
          <path d="M5 11l1.5-2.5h6l1.5 2.5"/>
        </svg>
        <div class="title">OneWay<span>Taxi</span></div>
        <div class="sub">Pay Only One Way</div>
      </div>
    </body></html>`;

    await send('Page.navigate', { url: passengerIconHtml });
    await new Promise(r => setTimeout(r, 600));
    const shotPassIcon = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'passenger-icon-512.png'), Buffer.from(shotPassIcon.data, 'base64'));
    console.log('Generated store-assets/passenger-icon-512.png');

    // -------------------------------------------------------------
    // 2. Generate Driver Partner Icon (512x512)
    // -------------------------------------------------------------
    const driverIconHtml = `data:text/html,<!DOCTYPE html>
    <html><head><style>
      body, html { margin: 0; padding: 0; width: 512px; height: 512px; background: #070B13; display: flex; align-items: center; justify-content: center; font-family: -apple-system, sans-serif; overflow: hidden; }
      .icon-card { width: 440px; height: 440px; border-radius: 96px; background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%); border: 4px solid #f59e0b; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 20px 50px rgba(245, 158, 11, 0.35); position: relative; }
      .badge { position: absolute; top: 38px; background: rgba(245,158,11,0.2); border: 1.5px solid #f59e0b; color: #fbbf24; font-size: 17px; font-weight: 800; padding: 6px 18px; border-radius: 9999px; letter-spacing: 1px; }
      .driver-svg { width: 180px; height: 180px; margin-top: 28px; }
      .title { color: #ffffff; font-size: 34px; font-weight: 900; margin-top: 14px; letter-spacing: -0.5px; }
      .title span { color: #f59e0b; }
      .sub { color: #34d399; font-size: 16px; font-weight: 750; margin-top: 4px; letter-spacing: 0.5px; }
    </style></head><body>
      <div class="icon-card">
        <div class="badge">CHAUFFEUR PARTNER</div>
        <svg class="driver-svg" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4" stroke="#f59e0b" fill="rgba(245,158,11,0.15)"/>
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
          <circle cx="12" cy="12" r="10" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
        </svg>
        <div class="title">OTB <span>Driver</span></div>
        <div class="sub">Daily Instant Payouts</div>
      </div>
    </body></html>`;

    await send('Page.navigate', { url: driverIconHtml });
    await new Promise(r => setTimeout(r, 600));
    const shotDriverIcon = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'driver-icon-512.png'), Buffer.from(shotDriverIcon.data, 'base64'));
    console.log('Generated store-assets/driver-icon-512.png');

    // -------------------------------------------------------------
    // 3. Generate Passenger Feature Graphic (1024x500)
    // -------------------------------------------------------------
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 500,
      deviceScaleFactor: 1,
      mobile: false
    });

    const passengerGraphicHtml = `data:text/html,<!DOCTYPE html>
    <html><head><style>
      body, html { margin: 0; padding: 0; width: 1024px; height: 500px; background: linear-gradient(135deg, #064e3b 0%, #0f172a 60%, #070B13 100%); display: flex; align-items: center; justify-content: space-between; font-family: -apple-system, sans-serif; overflow: hidden; box-sizing: border-box; padding: 0 60px; position: relative; }
      .glow { position: absolute; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(0,0,0,0) 70%); top: -50px; right: 80px; }
      .left { z-index: 2; max-width: 580px; }
      .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.18); border: 1.5px solid #10b981; color: #34d399; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 9999px; letter-spacing: 0.8px; margin-bottom: 18px; }
      .title { color: #ffffff; font-size: 46px; font-weight: 900; line-height: 1.15; margin: 0 0 16px 0; letter-spacing: -1px; }
      .title span { color: #34d399; }
      .title em { color: #f59e0b; font-style: normal; }
      .desc { color: #cbd5e1; font-size: 18px; line-height: 1.5; margin-bottom: 24px; }
      .pills { display: flex; gap: 12px; flex-wrap: wrap; }
      .pill { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #f1f5f9; font-size: 13.5px; font-weight: 700; padding: 6px 14px; border-radius: 8px; }
      .right { z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.7); border: 2px solid rgba(16,185,129,0.4); border-radius: 28px; padding: 36px 32px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); text-align: center; }
      .fare-tag { font-size: 14px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .fare-val { font-size: 48px; font-weight: 900; color: #34d399; margin: 4px 0; }
      .fare-sub { font-size: 14px; color: #f59e0b; font-weight: 800; }
    </style></head><body>
      <div class="glow"></div>
      <div class="left">
        <div class="badge">BIHAR'S DEDICATED ONE-WAY TAXI</div>
        <h1 class="title">Save <span>50%</span> Across <em>38 Districts</em></h1>
        <p class="desc">Pay only for one-way distance with guaranteed zero return fare. Commercial yellow-plate fleet & 24×7 customer care.</p>
        <div class="pills">
          <div class="pill">✓ Zero Return Fare</div>
          <div class="pill">✓ Patna Airport 24×7</div>
          <div class="pill">✓ Police-Verified Captains</div>
        </div>
      </div>
      <div class="right">
        <div class="fare-tag">Patna to Gaya Outstation</div>
        <div class="fare-val">₹2,199</div>
        <div class="fare-sub">Zero Return Fare Guaranteed</div>
      </div>
    </body></html>`;

    await send('Page.navigate', { url: passengerGraphicHtml });
    await new Promise(r => setTimeout(r, 600));
    const shotPassGraphic = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'passenger-feature-graphic-1024x500.png'), Buffer.from(shotPassGraphic.data, 'base64'));
    console.log('Generated store-assets/passenger-feature-graphic-1024x500.png');

    // -------------------------------------------------------------
    // 4. Generate Driver Feature Graphic (1024x500)
    // -------------------------------------------------------------
    const driverGraphicHtml = `data:text/html,<!DOCTYPE html>
    <html><head><style>
      body, html { margin: 0; padding: 0; width: 1024px; height: 500px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #070B13 100%); display: flex; align-items: center; justify-content: space-between; font-family: -apple-system, sans-serif; overflow: hidden; box-sizing: border-box; padding: 0 60px; position: relative; }
      .glow { position: absolute; width: 450px; height: 450px; border-radius: 50%; background: radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(0,0,0,0) 70%); top: -50px; right: 80px; }
      .left { z-index: 2; max-width: 580px; }
      .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,158,11,0.18); border: 1.5px solid #f59e0b; color: #fbbf24; font-size: 13px; font-weight: 800; padding: 6px 16px; border-radius: 9999px; letter-spacing: 0.8px; margin-bottom: 18px; }
      .title { color: #ffffff; font-size: 46px; font-weight: 900; line-height: 1.15; margin: 0 0 16px 0; letter-spacing: -1px; }
      .title span { color: #fbbf24; }
      .title em { color: #34d399; font-style: normal; }
      .desc { color: #cbd5e1; font-size: 18px; line-height: 1.5; margin-bottom: 24px; }
      .pills { display: flex; gap: 12px; flex-wrap: wrap; }
      .pill { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #f1f5f9; font-size: 13.5px; font-weight: 700; padding: 6px 14px; border-radius: 8px; }
      .right { z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.7); border: 2px solid rgba(245,158,11,0.4); border-radius: 28px; padding: 36px 32px; box-shadow: 0 25px 60px rgba(0,0,0,0.5); text-align: center; }
      .fare-tag { font-size: 14px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
      .fare-val { font-size: 48px; font-weight: 900; color: #fbbf24; margin: 4px 0; }
      .fare-sub { font-size: 14px; color: #34d399; font-weight: 800; }
    </style></head><body>
      <div class="glow"></div>
      <div class="left">
        <div class="badge">OFFICIAL DRIVER PARTNER APP</div>
        <h1 class="title">Earn <span>₹45,000+</span> Monthly Across <em>Bihar</em></h1>
        <p class="desc">High-value outstation trips, guaranteed return booking assistance, and daily instant settlements directly to your bank account.</p>
        <div class="pills">
          <div class="pill">✓ Daily Direct Payouts</div>
          <div class="pill">✓ 0% Hidden Commissions</div>
          <div class="pill">✓ 24×7 Chauffeur Helpline</div>
        </div>
      </div>
      <div class="right">
        <div class="fare-tag">Average Daily Driver Payout</div>
        <div class="fare-val">₹3,450</div>
        <div class="fare-sub">Instant UPI Bank Transfer</div>
      </div>
    </body></html>`;

    await send('Page.navigate', { url: driverGraphicHtml });
    await new Promise(r => setTimeout(r, 600));
    const shotDriverGraphic = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'driver-feature-graphic-1024x500.png'), Buffer.from(shotDriverGraphic.data, 'base64'));
    console.log('Generated store-assets/driver-feature-graphic-1024x500.png');

    // -------------------------------------------------------------
    // 5. Generate Phone Screenshots (1080x1920)
    // -------------------------------------------------------------
    await send('Emulation.setDeviceMetricsOverride', {
      width: 412,
      height: 869,
      deviceScaleFactor: 2.625, // Produces 1080 x 2280
      mobile: true
    });

    // Passenger Screen 1: Home Booking
    await send('Page.navigate', { url: 'http://localhost:8080/passenger.html' });
    await new Promise(r => setTimeout(r, 2000));
    const shotPass1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'screenshot-passenger-1-home.png'), Buffer.from(shotPass1.data, 'base64'));
    console.log('Generated store-assets/screenshot-passenger-1-home.png');

    // Passenger Screen 2: Cabs & Fleet
    await send('Page.navigate', { url: 'http://localhost:8080/cabs.html' });
    await new Promise(r => setTimeout(r, 2000));
    const shotPass2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'screenshot-passenger-2-fleet.png'), Buffer.from(shotPass2.data, 'base64'));
    console.log('Generated store-assets/screenshot-passenger-2-fleet.png');

    // Driver Screen 1: Cockpit / Duty
    await send('Page.navigate', { url: 'http://localhost:8080/driver.html' });
    await new Promise(r => setTimeout(r, 2000));
    const shotDriver1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(storeAssetsDir, 'screenshot-driver-1-duty.png'), Buffer.from(shotDriver1.data, 'base64'));
    console.log('Generated store-assets/screenshot-driver-1-duty.png');

    ws.close();
    chrome.kill('SIGINT');
    console.log('All Play Store graphics generated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating assets:', err);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
