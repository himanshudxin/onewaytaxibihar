const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';

async function captureModal(width, height, filename) {
  const PORT = 9435;
  const tempProfile = path.join(process.env.TEMP || 'C:\\Users\\himan\\AppData\\Local\\Temp', 'chrome_shot_' + Date.now());

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + tempProfile,
    '--disable-gpu',
    '--no-sandbox',
    `--window-size=${width},${height}`
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const res = await fetch('http://127.0.0.1:' + PORT + '/json');
    const tabs = await res.json();
    const ws = new globalThis.WebSocket(tabs[0].webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      ws.onopen = async () => {
        let id = 1;
        const send = (method, params = {}) => new Promise(r => {
          const mid = id++;
          const h = (e) => {
            const d = JSON.parse(e.data);
            if (d.id === mid) { ws.removeEventListener('message', h); r(d.result); }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: mid, method, params }));
        });

        await send('Page.enable');
        await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
        await new Promise(r => setTimeout(r, 2000));
        await send('Runtime.evaluate', { expression: 'if (window.openCorporateModal) window.openCorporateModal();' });
        await new Promise(r => setTimeout(r, 1200));

        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, filename), Buffer.from(shot.data, 'base64'));
        console.log('[Captured]:', filename);
        ws.close();
        resolve();
      };
      ws.onerror = reject;
    });
  } finally {
    chrome.kill();
  }
}

async function run() {
  await captureModal(1280, 850, 'preview-corporate-desktop-clean.png');
  await new Promise(r => setTimeout(r, 1000));
  await captureModal(412, 915, 'preview-corporate-mobile-clean.png');
  console.log('All modal screenshots captured.');
}

run().catch(console.error);
