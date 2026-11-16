const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\himan\\.gemini\\antigravity\\brain\\d19e8aba-9d53-4930-8d6e-d61fe536a54d';
const scratchDir = path.join(__dirname, '../scratch/responsive-screenshots');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const viewports = [
  { width: 320, height: 640, label: '320px (iPhone SE 1st / Ultra-Compact)' },
  { width: 360, height: 740, label: '360px (Standard Android / Galaxy)' },
  { width: 375, height: 812, label: '375px (iPhone SE 2/3 / iPhone 13 mini)' },
  { width: 390, height: 844, label: '390px (iPhone 14 / iPhone 15)' },
  { width: 412, height: 915, label: '412px (Samsung Galaxy S23 / Pixel 7)' },
  { width: 430, height: 932, label: '430px (iPhone 15 / 16 Pro Max)' },
  { width: 768, height: 1024, label: '768px (iPad Mini / Portrait Tablet)' },
  { width: 1024, height: 768, label: '1024px (iPad Pro / Landscape Tablet)' },
  { width: 1280, height: 800, label: '1280px (Standard Desktop / Laptop)' }
];

console.log('=== GENERATING RESPONSIVE SCREENSHOTS FOR ALL 9 VIEWPORTS ===\n');

const results = [];

viewports.forEach((vp, idx) => {
  const filename = `responsive-${vp.width}px.png`;
  const scratchFile = path.join(scratchDir, filename);
  const artifactFile = path.join(artifactDir, filename);
  const profileDir = path.join(__dirname, `../scratch/chrome-run-${vp.width}`);

  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${profileDir}`,
    `--window-size=${vp.width},${vp.height}`,
    `--screenshot=${scratchFile}`,
    'file:///C:/Users/himan/onewaycabs/index.html'
  ];

  spawnSync(chromePath, args, { encoding: 'utf8' });

  if (fs.existsSync(scratchFile)) {
    // Copy to artifacts directory so it can be embedded
    fs.copyFileSync(scratchFile, artifactFile);
    const size = fs.statSync(artifactFile).size;
    console.log(`✓ [${idx + 1}/9] ${vp.label}: ${filename} saved (${size} bytes)`);
    results.push({
      width: vp.width,
      height: vp.height,
      label: vp.label,
      filename: filename,
      path: artifactFile,
      size: size
    });
  } else {
    console.error(`❌ Failed to capture screenshot for ${vp.label}`);
  }
});

console.log(`\n=== COMPLETED: Captured ${results.length}/9 responsive viewports successfully! ===`);

