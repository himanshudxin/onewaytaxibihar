const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9440;
const tmpDir = path.join(os.tmpdir(), 'chrome-live-site-' + Date.now());

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

    console.log('Navigating to live production site: https://onewaytaxibihar.com');
    await send('Page.navigate', { url: 'https://onewaytaxibihar.com' });
    await new Promise(r => setTimeout(r, 3500));

    // Force light theme
    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('owc_theme_preference', 'light');`
    });
    await new Promise(r => setTimeout(r, 500));

    // Inspect elements
    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const callPill = document.querySelector('.navbar-call-unified-pill');
        const mobileCallPill = document.querySelector('.mobile-nav-call-pill');
        const bookingCard = document.querySelector('.booking-widget-card');
        const heroHeader = document.querySelector('.hero-center-header.below-booking-window');
        const loginBtn = document.querySelector('.nav-cta-btn');
        return {
          hasCallPill: !!callPill,
          hasMobileCallPill: !!mobileCallPill,
          hasBookingCard: !!bookingCard,
          hasHeroHeaderBelow: !!heroHeader,
          loginText: loginBtn ? loginBtn.innerText.trim() : null,
          bookingCardTop: bookingCard ? Math.round(bookingCard.getBoundingClientRect().top) : null,
          heroHeaderTop: heroHeader ? Math.round(heroHeader.getBoundingClientRect().top) : null
        };
      })()`,
      returnByValue: true
    });
    console.log('LIVE PRODUCTION INSPECTION:', JSON.stringify(check.result.value, null, 2));

    // Top view (header + booking window)
    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'live-production-header-booking.png'), Buffer.from(shot1.data, 'base64'));
    console.log('Captured live-production-header-booking.png');

    // Scroll to title below
    await send('Runtime.evaluate', {
      expression: `document.querySelector('.hero-center-header.below-booking-window')?.scrollIntoView({ behavior: 'instant', block: 'center' });`
    });
    await new Promise(r => setTimeout(r, 800));

    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactDir, 'live-production-hero-title-below.png'), Buffer.from(shot2.data, 'base64'));
    console.log('Captured live-production-hero-title-below.png');

    ws.close();
    chrome.kill('SIGINT');
    process.exit(0);
  } catch (err) {
    console.error('Error in live capture:', err);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
