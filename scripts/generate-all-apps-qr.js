const path = require('path');
const QRCode = require(path.join(__dirname, '..', 'mobile', 'node_modules', 'qrcode'));

const brainDir = 'C:/Users/himan/.gemini/antigravity/brain/d19e8aba-9d53-4930-8d6e-d61fe536a54d';

const targets = [
  {
    url: 'http://192.168.0.179:5050/apps',
    file: path.join(brainDir, 'apps-hub-qr.png')
  },
  {
    url: 'http://192.168.0.179:5050/apk/passenger',
    file: path.join(brainDir, 'passenger-apk-qr.png')
  },
  {
    url: 'http://192.168.0.179:5050/apk/driver',
    file: path.join(brainDir, 'driver-apk-qr.png')
  }
];

async function generate() {
  for (const t of targets) {
    await QRCode.toFile(t.file, t.url, { width: 340, margin: 2 });
    console.log(`Generated QR for ${t.url} -> ${t.file}`);
  }
}

generate().catch(console.error);
