const { spawn } = require('child_process');
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9425',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9425/json');
    const tabs = await listRes.json();
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
      await send('Runtime.enable');
      await send('Page.navigate', { url: 'http://localhost:8080/index.html' });
      await new Promise(r => setTimeout(r, 2000));

      const res = await send('Runtime.evaluate', {
        expression: `(() => {
          const card = document.querySelector('.voyago-deal-card');
          const img = document.querySelector('.voyago-deal-img');
          const content = document.querySelector('.voyago-deal-content');
          const btn = document.querySelector('.voyago-deal-btn');
          const rect = card ? card.getBoundingClientRect() : null;
          const imgRect = img ? img.getBoundingClientRect() : null;
          const contentRect = content ? content.getBoundingClientRect() : null;
          const btnRect = btn ? btn.getBoundingClientRect() : null;
          return {
            card: rect ? { w: rect.width, h: rect.height, bg: getComputedStyle(card).background } : null,
            img: imgRect ? { w: imgRect.width, h: imgRect.height, fit: getComputedStyle(img).objectFit } : null,
            content: contentRect ? { w: contentRect.width, h: contentRect.height } : null,
            btn: btnRect ? { w: btnRect.width, h: btnRect.height } : null,
            errors: window.errors || []
          };
        })()`,
        returnByValue: true
      });

      console.log('COMPUTED LAYOUT:', JSON.stringify(res.result?.value, null, 2));
      ws.close();
      chrome.kill('SIGINT');
      process.exit(0);
    };
  } catch(e) {
    console.error(e);
    chrome.kill('SIGINT');
    process.exit(1);
  }
}, 1500);
