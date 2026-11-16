const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9535;
const tmpDir = path.join(os.tmpdir(), 'chrome-clean-screens-' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tmpDir}`,
  '--window-size=440,920'
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

    const url = 'http://localhost:8080/three-apps-preview.html';
    await send('Page.navigate', { url });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Focus Passenger App
    await send('Runtime.evaluate', {
      expression: `
        if (window.filterApp) window.filterApp('passenger');
        const phone = document.querySelector('#card-passenger .phone-simulator');
        if (phone) phone.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 1000));
    const shotPass = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-passenger-phone.png'), Buffer.from(shotPass.data, 'base64'));
    console.log('✅ Saved preview-passenger-phone.png');

    // 2. Focus Driver Partner App
    await send('Runtime.evaluate', {
      expression: `
        if (window.filterApp) window.filterApp('driver');
        const phone = document.querySelector('#card-driver .phone-simulator');
        if (phone) phone.scrollIntoView({ behavior: 'instant', block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 1000));
    const shotDriver = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-driver-phone.png'), Buffer.from(shotDriver.data, 'base64'));
    console.log('✅ Saved preview-driver-phone.png');

    ws.close();
    chrome.kill('SIGINT');
    console.log('Done capturing clean phone screens!');
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
