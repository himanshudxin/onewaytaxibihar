const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9430;
const tempProfile = path.join(process.env.TEMP || 'C:\\Users\\himan\\AppData\\Local\\Temp', 'chrome_test_' + Date.now());

const chrome = spawn(CHROME_PATH, [
  '--headless=new',
  '--remote-debugging-port=' + PORT,
  '--user-data-dir=' + tempProfile,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://127.0.0.1:' + PORT + '/json');
    const tabs = await res.json();
    const ws = new globalThis.WebSocket(tabs[0].webSocketDebuggerUrl);
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
      await new Promise(r => setTimeout(r, 1000));
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const m = document.getElementById("modal-corporate");
          const input = document.querySelector("#corp-company") || document.querySelector(".corp-input-control") || document.querySelector("input");
          return {
            isOpen: m ? m.classList.contains("open") : false,
            hasTrusted: document.body.innerText.includes("TRUSTED BY LEADING"),
            hasAiims: document.body.innerText.includes("AIIMS Patna"),
            corpInputCount: document.querySelectorAll(".corp-input-control").length,
            oldInputCount: document.querySelectorAll(".corporate-input").length,
            inputBg: input ? window.getComputedStyle(input).backgroundColor : 'none',
            inputColor: input ? window.getComputedStyle(input).color : 'none',
            modalTitle: document.querySelector(".corporate-modal-title") ? document.querySelector(".corporate-modal-title").innerText : 'none'
          };
        })()`,
        returnByValue: true
      });
      console.log('DOM Evaluation Result:', evalRes.result ? evalRes.result.value : evalRes);
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync('C:\\Users\\himan\\.gemini\\antigravity\\brain\\50053a82-c87a-4f88-9e54-1a8dff9c5c2f\\current-corporate-test.png', Buffer.from(shot.data, 'base64'));
      console.log('Saved current-corporate-test.png');
      chrome.kill();
      process.exit(0);
    };
  } catch(e) {
    console.error('Error:', e);
    chrome.kill();
    process.exit(1);
  }
}, 1500);
