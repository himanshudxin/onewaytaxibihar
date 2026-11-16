/**
 * scripts/capture-previews.js
 * Multi-portal CDP screenshot capture utility for OneWayTaxiBihar.
 * Captures high-res screenshots of Preview Hub, Production Website, Driver Cockpit, and Admin Desk.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9418;

console.log('[Preview] Launching headless Chrome on port ' + PORT + '...');
const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

const targets = [
  { name: 'Triple Apps Preview Hub', url: 'http://localhost:8080/three-apps-preview.html', file: 'preview-three-apps.png', width: 1440, height: 900, delay: 1800 },
  { name: 'Production Website Homepage', url: 'http://localhost:8080/index.html', file: 'preview-website.png', width: 1440, height: 900, delay: 1800 },
  { name: 'Driver Partner Cockpit', url: 'http://localhost:8080/driver.html', file: 'preview-driver.png', width: 412, height: 915, delay: 2000 },
  { name: 'Admin Operations Console', url: 'http://localhost:8080/admin.html', file: 'preview-admin.png', width: 1440, height: 900, delay: 1800 }
];

setTimeout(async () => {
  try {
    const listRes = await fetch(`http://127.0.0.1:${PORT}/json`);
    const tabs = await listRes.json();
    const wsUrl = tabs[0].webSocketDebuggerUrl;

    const ws = new globalThis.WebSocket(wsUrl);
    ws.onopen = async () => {
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

      for (const t of targets) {
        console.log(`[Preview] Navigating to: ${t.name} (${t.url})...`);
        await send('Emulation.setDeviceMetricsOverride', {
          width: t.width,
          height: t.height,
          deviceScaleFactor: 2,
          mobile: t.width < 600
        });

        await send('Page.navigate', { url: t.url });
        await new Promise(r => setTimeout(r, t.delay));

        console.log(`[Preview] Capturing screenshot for ${t.file}...`);
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        if (shot && shot.data) {
          const buffer = Buffer.from(shot.data, 'base64');
          const dest = path.join(artifactDir, t.file);
          fs.writeFileSync(dest, buffer);
          console.log(`✅ [Preview Saved]: ${dest} (${(buffer.length / 1024).toFixed(1)} KB)`);
        }
      }

      console.log('\n[Preview] All previews successfully captured!');
      ws.close();
      chrome.kill('SIGINT');
      process.exit(0);
    };
  } catch (err) {
    console.error('[Preview] Error:', err.message);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}, 1500);
