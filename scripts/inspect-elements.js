const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9444;

async function waitForChrome(port, maxAttempts = 15) {
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

const os = require('os');
const tmpDir = path.join(os.tmpdir(), 'chrome-dbg-' + Date.now());

async function run() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--disable-gpu',
    '--no-sandbox',
    `--user-data-dir=${tmpDir}`,
    '--window-size=1440,900'
  ]);

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

    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    // Force light theme like in user's screenshot
    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem('owc_theme_preference', 'light');`
    });
    await new Promise(r => setTimeout(r, 500));

    const evalResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.voyago-deal-card');
        const img = document.querySelector('.voyago-deal-img');
        const content = document.querySelector('.voyago-deal-content');
        const pill = document.querySelector('.navbar-call-unified-pill');
        const nav = document.querySelector('.navbar');
        return {
          card: card ? {
            width: window.getComputedStyle(card).width,
            height: window.getComputedStyle(card).height,
            display: window.getComputedStyle(card).display,
            background: window.getComputedStyle(card).backgroundImage || window.getComputedStyle(card).backgroundColor
          } : null,
          img: img ? {
            width: window.getComputedStyle(img).width,
            height: window.getComputedStyle(img).height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            flexShrink: window.getComputedStyle(img).flexShrink,
            objectFit: window.getComputedStyle(img).objectFit
          } : null,
          pill: pill ? {
            display: window.getComputedStyle(pill).display,
            color: window.getComputedStyle(pill).color,
            background: window.getComputedStyle(pill).backgroundColor,
            borderRadius: window.getComputedStyle(pill).borderRadius
          } : null
        };
      })()`,
      returnByValue: true
    });

    console.log('EVAL RESULT:', JSON.stringify(evalResult.result.value, null, 2));

    ws.close();
    chrome.kill('SIGINT');
  } catch (err) {
    console.error('Inspect error:', err);
    chrome.kill('SIGINT');
  }
}

run();
