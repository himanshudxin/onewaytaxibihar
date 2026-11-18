const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f';
const PORT = 9445;
const tempProfile = path.join(process.env.TEMP || 'C:\\Users\\himan\\AppData\\Local\\Temp', 'chrome_expo_shot_' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,820'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:' + PORT + '/json');
    const tabs = await res.json();
    const ws = new globalThis.WebSocket(tabs[0].webSocketDebuggerUrl);

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
      await send('Page.navigate', { url: 'http://localhost:8080/three-apps-preview.html' });
      await new Promise(r => setTimeout(r, 2000));

      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 180);' });
      await new Promise(r => setTimeout(r, 800));

      const shot = await send('Page.captureScreenshot', { format: 'png' });
      if (shot && shot.data) {
        fs.writeFileSync(path.join(artifactDir, 'preview-expo-qr-terminal.png'), Buffer.from(shot.data, 'base64'));
        console.log('✅ Captured preview-expo-qr-terminal.png');
      }

      ws.close();
      chrome.kill();
      process.exit(0);
    };
  } catch (err) {
    console.error('Error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 1200);
