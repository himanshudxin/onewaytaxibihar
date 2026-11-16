const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const url = 'https://expo.dev/artifacts/eas/GtqubPesGSgc3-BWHt83MzSHCu_aczTpPnqwfOwChzM.apk';
const targets = [
  path.join(__dirname, '..', 'downloads', 'onewaytaxi-driver.apk'),
  path.join(__dirname, '..', 'OneWayTaxiDriver-Latest.apk')
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
    console.log('Downloading Driver APK, total size:', (totalBytes / (1024 * 1024)).toFixed(2), 'MB');

    const fileStream = fs.createWriteStream(targets[0]);
    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close(() => {
        console.log('Downloaded to:', targets[0]);
        for (let i = 1; i < targets.length; i++) {
          fs.copyFileSync(targets[0], targets[i]);
          console.log('Copied to:', targets[i]);
        }
        console.log('All Driver APK targets updated successfully!');
      });
    });
  }).on('error', err => {
    console.error('Download error:', err.message);
  });
}

download(url);

