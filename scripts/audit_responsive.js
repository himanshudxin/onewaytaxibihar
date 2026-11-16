const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const viewports = [
  { width: 320, height: 600, name: '320px-small-mobile' },
  { width: 360, height: 740, name: '360px-android-standard' },
  { width: 375, height: 812, name: '375px-iphone-se' },
  { width: 390, height: 844, name: '390px-iphone-13' },
  { width: 412, height: 915, name: '412px-pixel-samsung' },
  { width: 430, height: 932, name: '430px-iphone-pro-max' },
  { width: 768, height: 1024, name: '768px-tablet-portrait' },
  { width: 1024, height: 768, name: '1024px-tablet-landscape' },
  { width: 1280, height: 800, name: '1280px-desktop' }
];

const outDir = path.join(__dirname, '../scratch/responsive-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('=== MULTI-VIEWPORT AUDIT STARTING ===');

viewports.forEach(vp => {
  const ssPath = path.join(outDir, `${vp.name}.png`);
  const profileDir = path.join(__dirname, `../scratch/chrome-profile-${vp.width}`);
  
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${profileDir}`,
    `--window-size=${vp.width},${vp.height}`,
    `--screenshot=${ssPath}`,
    'file:///C:/Users/himan/onewaycabs/index.html'
  ];

  const res = spawnSync(chromePath, args, { encoding: 'utf8' });
  const exists = fs.existsSync(ssPath);
  const size = exists ? fs.statSync(ssPath).size : 0;
  console.log(`Viewport ${vp.width}x${vp.height} (${vp.name}): screenshot saved? ${exists} (${size} bytes)`);
});

console.log('=== MULTI-VIEWPORT AUDIT COMPLETE ===');

