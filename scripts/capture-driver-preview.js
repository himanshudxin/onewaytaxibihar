const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';

console.log('[Driver Preview] Launching headless Chrome...');
const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  '--remote-debugging-port=9415',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=412,915'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9415/json');
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

      console.log('[Driver Preview] Navigating to http://localhost:8080/driver.html...');
      await send('Page.navigate', { url: 'http://localhost:8080/driver.html' });
      await new Promise(r => setTimeout(r, 2200));

      console.log('[Driver Preview] Capturing preview-driver.png...');
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (shot && shot.data) {
        const buffer = Buffer.from(shot.data, 'base64');
        const dest = path.join(artifactDir, 'preview-driver.png');
        fs.writeFileSync(dest, buffer);
        console.log(`✅ [Preview Saved]: ${dest} (${(buffer.length / 1024).toFixed(1)} KB)`);
      }

      ws.close();
      chrome.kill('SIGINT');
      process.exit(0);
    };
  } catch (err) {
    console.error('[Driver Preview] Error:', err.message);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}, 1500);
