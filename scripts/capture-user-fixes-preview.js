const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9438;
const tmpDir = path.join(os.tmpdir(), 'chrome-user-fix-' + Date.now());

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

    // Desktop 1440px
    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('owc_theme_preference', 'light');`
    });
    await new Promise(r => setTimeout(r, 500));

    // Check positions of elements
    const posCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const nav = document.querySelector('.navbar');
        const bookingCard = document.querySelector('.booking-widget-card');
        const heroHeader = document.querySelector('.hero-center-header.below-booking-window');
        const callPill = document.querySelector('.navbar-call-unified-pill');
        const mobileCallPill = document.querySelector('.mobile-nav-call-pill');

        return {
          hasCallPillInHeader: !!callPill,
          hasMobileCallPill: !!mobileCallPill,
          bookingCardTop: bookingCard ? bookingCard.getBoundingClientRect().top : null,
          heroHeaderTop: heroHeader ? heroHeader.getBoundingClientRect().top : null,
          isHeaderBelowBookingCard: (bookingCard && heroHeader) ? heroHeader.getBoundingClientRect().top > bookingCard.getBoundingClientRect().bottom : null
        };
      })()`,
      returnByValue: true
    });
    console.log('POSITION CHECK:', JSON.stringify(posCheck.result.value, null, 2));

    // Capture top screen showing header + booking window
    const shotTop = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-booking-window-top.png'), Buffer.from(shotTop.data, 'base64'));
    console.log('Saved preview-booking-window-top.png');

    // Scroll to title block below booking window
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.hero-center-header.below-booking-window')?.scrollIntoView({ behavior: 'instant', block: 'center' });`
    });
    await new Promise(r => setTimeout(r, 800));

    const shotBelow = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'preview-hero-title-below.png'), Buffer.from(shotBelow.data, 'base64'));
    console.log('Saved preview-hero-title-below.png');

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
