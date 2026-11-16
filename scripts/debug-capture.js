const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9435;
const tmpDir = path.join(os.tmpdir(), 'chrome-dbg-' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  `--user-data-dir=${tmpDir}`,
  '--window-size=1440,900'
]);

async function waitForChrome(port, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      if (res.ok) {
        const tabs = await res.json();
        if (tabs && tabs.length > 0) return tabs[0].webSocketDebuggerUrl;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 300));
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

    // 1. Light Mode Capture
    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('owc_theme_preference', 'light');`
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Light Mode Navbar & Hero
    const shotHeroLight = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-hero-light.png'), Buffer.from(shotHeroLight.data, 'base64'));
    console.log('Saved preview-hero-light.png');

    // Scroll to deal card in Light Mode
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.voyago-deal-card')?.scrollIntoView({ behavior: 'instant', block: 'center' });`
    });
    await new Promise(r => setTimeout(r, 800));

    const shotDealLight = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-deal-light.png'), Buffer.from(shotDealLight.data, 'base64'));
    console.log('Saved preview-deal-light.png');

    // 2. Mobile Viewport Light Mode
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await new Promise(r => setTimeout(r, 1500));

    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'light');`
    });
    await new Promise(r => setTimeout(r, 500));

    const shotMobileHero = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-mobile-light-hero.png'), Buffer.from(shotMobileHero.data, 'base64'));
    console.log('Saved preview-mobile-light-hero.png');

    await send('Runtime.evaluate', {
      expression: `document.querySelector('.voyago-deal-card')?.scrollIntoView({ behavior: 'instant', block: 'center' });`
    });
    await new Promise(r => setTimeout(r, 800));

    const shotMobileDeal = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-mobile-light-deal.png'), Buffer.from(shotMobileDeal.data, 'base64'));
    console.log('Saved preview-mobile-light-deal.png');

    ws.close();
    chrome.kill('SIGINT');
    process.exit(0);
  } catch (err) {
    console.error('Capture error:', err);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
