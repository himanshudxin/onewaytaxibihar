const fs = require('fs');
const path = require('path');
const https = require('https');

const fonts = [
  {
    name: 'inter-400.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2'
  },
  {
    name: 'inter-600.woff2',
    url: 'https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2'
  },
  {
    name: 'playfair-600.woff2',
    url: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2'
  }
];

const fontsDir = path.join(__dirname, '..', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

function download(file, url) {
  return new Promise((resolve, reject) => {
    const dest = path.join(fontsDir, file);
    const stream = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`✓ Downloaded ${file} (${fs.statSync(dest).size} bytes)`);
        resolve();
      });
    }).on('error', err => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

(async () => {
  for (const f of fonts) {
    await download(f.name, f.url);
  }
  console.log('✅ All fonts downloaded successfully.');
})();
