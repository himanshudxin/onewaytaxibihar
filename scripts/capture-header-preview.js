const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9437;
const tmpDir = path.join(os.tmpdir(), 'chrome-hdr-' + Date.now());

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

    // 1. Desktop 1440px Light Mode
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('owc_theme_preference', 'light');`
    });
    await new Promise(r => setTimeout(r, 500));

    // Inspect layout metrics
    const metrics1440 = await send('Runtime.evaluate', {
      expression: `(() => {
        const nav = document.querySelector('.navbar');
        const content = document.querySelector('.nav-content');
        const links = document.querySelector('.nav-links');
        const actions = document.querySelector('.nav-actions');
        const authBtn = document.querySelector('#nav-auth-slot button');
        const themeBtn = document.querySelector('#theme-switch-btn');
        const contentRect = content.getBoundingClientRect();
        const authRect = authBtn ? authBtn.getBoundingClientRect() : null;
        const themeRect = themeBtn ? themeBtn.getBoundingClientRect() : null;
        
        return {
          windowWidth: window.innerWidth,
          navContentWidth: contentRect.width,
          navContentRight: contentRect.right,
          authBtnRight: authRect ? authRect.right : null,
          themeBtnRight: themeRect ? themeRect.right : null,
          isClipped: themeRect ? themeRect.right > window.innerWidth : false
        };
      })()`,
      returnByValue: true
    });
    console.log('METRICS AT 1440px:', JSON.stringify(metrics1440.result.value, null, 2));

    const shot1440 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-pro-header-1440.png'), Buffer.from(shot1440.data, 'base64'));
    console.log('Saved preview-pro-header-1440.png');

    // 2. Laptop / Split View 1180px Light Mode (User Screen Simulation)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1180,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 800));

    const metrics1180 = await send('Runtime.evaluate', {
      expression: `(() => {
        const content = document.querySelector('.nav-content');
        const authBtn = document.querySelector('#nav-auth-slot button');
        const themeBtn = document.querySelector('#theme-switch-btn');
        const contentRect = content.getBoundingClientRect();
        const authRect = authBtn ? authBtn.getBoundingClientRect() : null;
        const themeRect = themeBtn ? themeBtn.getBoundingClientRect() : null;
        
        return {
          windowWidth: window.innerWidth,
          navContentWidth: contentRect.width,
          navContentRight: contentRect.right,
          authBtnRight: authRect ? authRect.right : null,
          themeBtnRight: themeRect ? themeRect.right : null,
          isClipped: themeRect ? themeRect.right > window.innerWidth : false
        };
      })()`,
      returnByValue: true
    });
    console.log('METRICS AT 1180px:', JSON.stringify(metrics1180.result.value, null, 2));

    const shot1180 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-pro-header-1180.png'), Buffer.from(shot1180.data, 'base64'));
    console.log('Saved preview-pro-header-1180.png');

    // 3. Dark Mode 1440px
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('owc_theme_preference', 'dark');`
    });
    await new Promise(r => setTimeout(r, 500));

    const shotDark = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-pro-header-dark.png'), Buffer.from(shotDark.data, 'base64'));
    console.log('Saved preview-pro-header-dark.png');

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
