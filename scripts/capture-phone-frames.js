const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9520;
const tmpDir = path.join(os.tmpdir(), 'chrome-phones-' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,1100'
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
    await send('Runtime.enable');

    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1100,
      deviceScaleFactor: 2,
      mobile: false
    });

    const url = 'http://localhost:8080/three-apps-preview.html';
    console.log('Navigating to:', url);
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2000));

    // Scroll so the 3 phone simulators are fully visible in the frame
    await send('Runtime.evaluate', {
      expression: `
        const el = document.querySelector('.phone-simulator');
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    // Capture the 3 phone simulators side-by-side
    const shotTripleSimulators = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-mobile-simulators.png'), Buffer.from(shotTripleSimulators.data, 'base64'));
    console.log('✅ Saved preview-mobile-simulators.png');

    // Capture Passenger Phone Mockup clipped specifically
    const clipPassenger = await send('Runtime.evaluate', {
      expression: `
        const p = document.querySelector('#card-passenger .phone-simulator').getBoundingClientRect();
        JSON.stringify({ x: p.x, y: p.y, width: p.width, height: p.height });
      `
    });
    if (clipPassenger && clipPassenger.result && clipPassenger.result.value) {
      const rect = JSON.parse(clipPassenger.result.value);
      const shotPassengerPhone = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20, scale: 2 }
      });
      fs.writeFileSync(path.join(artifactDir, 'phone-preview-passenger.png'), Buffer.from(shotPassengerPhone.data, 'base64'));
      console.log('✅ Saved phone-preview-passenger.png');
    }

    // Capture Driver Phone Mockup clipped specifically
    const clipDriver = await send('Runtime.evaluate', {
      expression: `
        const d = document.querySelector('#card-driver .phone-simulator').getBoundingClientRect();
        JSON.stringify({ x: d.x, y: d.y, width: d.width, height: d.height });
      `
    });
    if (clipDriver && clipDriver.result && clipDriver.result.value) {
      const rect = JSON.parse(clipDriver.result.value);
      const shotDriverPhone = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: rect.x - 10, y: rect.y - 10, width: rect.width + 20, height: rect.height + 20, scale: 2 }
      });
      fs.writeFileSync(path.join(artifactDir, 'phone-preview-driver.png'), Buffer.from(shotDriverPhone.data, 'base64'));
      console.log('✅ Saved phone-preview-driver.png');
    }

    ws.close();
    chrome.kill('SIGINT');
    console.log('Done!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
