const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const url = 'https://expo.dev/artifacts/eas/Lnnd_N2T4W1VuOjZ9yFx24Lwtxf0iuSIZYuEwVuOPv4.apk';
const targets = [
  path.join(__dirname, '..', 'downloads', 'OneWayTaxiBihar-Latest.apk'),
  path.join(__dirname, '..', 'downloads', 'onewaytaxi-passenger.apk'),
  path.join(__dirname, '..', 'OneWayTaxiBihar-Latest.apk')
];

function download(fileUrl) {
  const client = fileUrl.startsWith('https') ? https : http;
  client.get(fileUrl, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      return download(res.headers.location);
    }
    if (res.statusCode !== 200) {
      console.error('Download failed with status:', res.statusCode);
      return;
    }

    const totalBytes = parseInt(res.headers['content-length'] || '0', 10);
    console.log('Downloading APK, total size:', (totalBytes / (1024 * 1024)).toFixed(2), 'MB');

    const fileStream = fs.createWriteStream(targets[0]);
    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close(() => {
        console.log('Downloaded to:', targets[0]);
        // Copy to the other targets
        for (let i = 1; i < targets.length; i++) {
          fs.copyFileSync(targets[0], targets[i]);
          console.log('Copied to:', targets[i]);
        }
        console.log('All APK targets updated successfully!');
      });
    });
  }).on('error', err => {
    console.error('Download error:', err.message);
  });
}

download(url);

