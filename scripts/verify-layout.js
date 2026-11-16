const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9436;
const tmpDir = path.join(os.tmpdir(), 'chrome-chk-' + Date.now());

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

    await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
    await new Promise(r => setTimeout(r, 2000));

    const checkResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const pill = document.querySelector('.navbar-call-unified-pill');
        const dot = document.querySelector('.call-pulse-dot');
        const card = document.querySelector('.voyago-deal-card');
        const img = document.querySelector('.voyago-deal-img');
        const appLink = document.querySelector('.nav-link-apps');

        return {
          pill: pill ? {
            display: getComputedStyle(pill).display,
            color: getComputedStyle(pill).color,
            bgColor: getComputedStyle(pill).backgroundColor,
            borderRadius: getComputedStyle(pill).borderRadius,
            height: getComputedStyle(pill).height,
            text: pill.innerText.trim()
          } : null,
          dot: dot ? {
            width: getComputedStyle(dot).width,
            height: getComputedStyle(dot).height,
            bgColor: getComputedStyle(dot).backgroundColor,
            animation: getComputedStyle(dot).animationName
          } : null,
          card: card ? {
            w: card.getBoundingClientRect().width,
            h: card.getBoundingClientRect().height,
            bg: getComputedStyle(card).background.substring(0, 80)
          } : null,
          img: img ? {
            w: img.getBoundingClientRect().width,
            h: img.getBoundingClientRect().height,
            objectFit: getComputedStyle(img).objectFit,
            aspectRatio: (img.getBoundingClientRect().width / img.getBoundingClientRect().height).toFixed(2)
          } : null,
          appLink: appLink ? {
            color: getComputedStyle(appLink).color,
            fontWeight: getComputedStyle(appLink).fontWeight
          } : null
        };
      })()`,
      returnByValue: true
    });

    console.log('FINAL VERIFICATION:', JSON.stringify(checkResult.result?.value, null, 2));

    ws.close();
    chrome.kill('SIGINT');
    process.exit(0);
  } catch (err) {
    console.error('Verify error:', err);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}

run();
