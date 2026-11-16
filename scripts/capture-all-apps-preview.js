const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9492;
const tmpDir = path.join(os.tmpdir(), 'chrome-apps-preview-' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,950'
]);

async function waitForChrome(port, maxAttempts = 25) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        if (tabs && tabs.length > 0) return tabs[0].webSocketDebuggerUrl;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 250));
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
    await send('Network.enable');

    const threeAppsUrl = 'http://localhost:8080/three-apps-preview.html';
    const appDownloadUrl = 'http://localhost:8080/app-download.html';
    const driverUrl = 'http://localhost:8080/driver.html';

    // 1. Triple Apps Preview Hub (Desktop Overview)
    console.log('[1/4] Navigating to Three Apps Preview Hub...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 950,
      deviceScaleFactor: 2,
      mobile: false
    });
    await send('Page.navigate', { url: threeAppsUrl });
    await new Promise(r => setTimeout(r, 2200));
    const shotHub = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-three-apps.png'), Buffer.from(shotHub.data, 'base64'));
    console.log('✅ Saved preview-three-apps.png');

    // 2. Passenger App Focus (Mobile Card View)
    console.log('[2/4] Capturing Passenger App Mobile Simulator...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 480,
      height: 920,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Runtime.evaluate', {
      expression: `if (window.filterApp) window.filterApp('passenger');`
    });
    await new Promise(r => setTimeout(r, 1000));
    const shotPassenger = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-passenger-simulator.png'), Buffer.from(shotPassenger.data, 'base64'));
    console.log('✅ Saved preview-passenger-simulator.png');

    // 3. Driver Partner Cockpit (Mobile View)
    console.log('[3/4] Capturing Driver App Cockpit...');
    await send('Page.navigate', { url: driverUrl });
    await new Promise(r => setTimeout(r, 2000));
    const shotDriver = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-driver-cockpit.png'), Buffer.from(shotDriver.data, 'base64'));
    console.log('✅ Saved preview-driver-cockpit.png');

    // 4. App Download Landing Page
    console.log('[4/4] Capturing App Download Landing Page...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });
    await send('Page.navigate', { url: appDownloadUrl });
    await new Promise(r => setTimeout(r, 1800));
    const shotDl = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-app-download.png'), Buffer.from(shotDl.data, 'base64'));
    console.log('✅ Saved preview-app-download.png');

    ws.close();
    chrome.kill('SIGINT');
    console.log('\n[Preview] All 4 visual app previews successfully captured!');
    process.exit(0);
  } catch (e) {
    console.error('Error during preview capture:', e.message);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
