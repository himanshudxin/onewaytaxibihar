const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateAllAssets() {
  const masterPath = 'C:\\Users\\himan\\.gemini\\antigravity-ide\\brain\\bf0c9cf0-5882-430e-b134-94a5f3e80d40\\.user_uploaded\\media_1792123562295.png';
  const imgDir = path.join(__dirname, '..', 'img');
  const rootDir = path.join(__dirname, '..');

  console.log('Loading master image from:', masterPath);
  const { data, info } = await sharp(masterPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // 1. Flood fill white background outside squircle
  const isBg = new Uint8Array(w * h);
  const queue = [];
  function check(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (isBg[idx]) return;
    const pIdx = idx * 4;
    // Check if near white
    if (data[pIdx] > 200 && data[pIdx + 1] > 200 && data[pIdx + 2] > 200) {
      isBg[idx] = 1;
      queue.push((y << 16) | x);
    }
  }
  for (let x = 0; x < w; x++) { check(x, 0); check(x, h - 1); }
  for (let y = 0; y < h; y++) { check(0, y); check(w - 1, y); }
  let head = 0;
  while (head < queue.length) {
    const val = queue[head++];
    const x = val & 0xFFFF;
    const y = val >>> 16;
    check(x + 1, y);
    check(x - 1, y);
    check(x, y + 1);
    check(x, y - 1);
  }

  // 2. High-precision alpha antialiasing on squircle edge
  const squircleData = Buffer.from(data);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const pIdx = idx * 4;
      if (isBg[idx]) {
        const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
        if (r >= 245 && g >= 245 && b >= 245) {
          squircleData[pIdx + 3] = 0;
        } else {
          const brightness = (r + g + b) / 3.0;
          const greenBrightness = (1 + 144 + 77) / 3.0;
          const alpha = Math.max(0, Math.min(255, Math.round(255 * (255 - brightness) / (255 - greenBrightness))));
          squircleData[pIdx + 3] = alpha;
          squircleData[pIdx] = 1;
          squircleData[pIdx + 1] = 144;
          squircleData[pIdx + 2] = 77;
        }
      }
    }
  }

  // 3. Crop to squircle bounds with 12px margin
  const minX = 88, maxX = 936, minY = 94, maxY = 929;
  const rawSize = Math.max(maxX - minX + 1, maxY - minY + 1);
  const cx = Math.round((minX + maxX) / 2);
  const cy = Math.round((minY + maxY) / 2);
  const pad = 12;
  const finalSize = rawSize + pad * 2;
  const left = cx - Math.round(finalSize / 2);
  const top = cy - Math.round(finalSize / 2);

  const baseSquircleBuffer = await sharp(squircleData, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: Math.max(0, left), top: Math.max(0, top), width: finalSize, height: finalSize })
    .png()
    .toBuffer();

  // Generate 512x512 master PNG & WebP
  await sharp(baseSquircleBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(imgDir, 'logo-reframed.png'));
  console.log('✓ img/logo-reframed.png (512x512)');

  await sharp(baseSquircleBuffer)
    .resize(512, 512)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo-reframed.webp'));
  console.log('✓ img/logo-reframed.webp (512x512)');

  await sharp(baseSquircleBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(imgDir, 'logo.png'));

  await sharp(baseSquircleBuffer)
    .resize(512, 512)
    .webp({ quality: 95 })
    .toFile(path.join(imgDir, 'logo.webp'));

  // App icon sizes
  await sharp(baseSquircleBuffer).resize(192, 192).png().toFile(path.join(rootDir, 'driver-icon.png'));
  await sharp(baseSquircleBuffer).resize(192, 192).png().toFile(path.join(imgDir, 'logo-192.png'));
  await sharp(baseSquircleBuffer).resize(512, 512).png().toFile(path.join(imgDir, 'logo-512.png'));
  await sharp(baseSquircleBuffer).resize(180, 180).png().toFile(path.join(rootDir, 'apple-touch-icon.png'));
  await sharp(baseSquircleBuffer).resize(32, 32).png().toFile(path.join(rootDir, 'favicon-32x32.png'));
  await sharp(baseSquircleBuffer).resize(16, 16).png().toFile(path.join(rootDir, 'favicon-16x16.png'));
  await sharp(baseSquircleBuffer).resize(32, 32).png().toFile(path.join(rootDir, 'favicon.ico'));

  // 4. Generate standalone isolated white car & green car assets
  // Inside the squircle, extract only the white car pixels
  const carData = Buffer.alloc(w * h * 4, 0); // all transparent
  for (let y = 350; y < 700; y++) {
    for (let x = 140; x < 900; x++) {
      const idx = y * w + x;
      if (!isBg[idx]) {
        const pIdx = idx * 4;
        const r = data[pIdx], g = data[pIdx + 1], b = data[pIdx + 2];
        // White pixels of the car
        if (r > 160 && g > 160 && b > 160) {
          const brightness = (r + g + b) / 3.0;
          const greenBrightness = (1 + 144 + 77) / 3.0;
          const alpha = Math.max(0, Math.min(255, Math.round(255 * (brightness - greenBrightness) / (255 - greenBrightness))));
          carData[pIdx] = 255;
          carData[pIdx + 1] = 255;
          carData[pIdx + 2] = 255;
          carData[pIdx + 3] = alpha;
        }
      }
    }
  }

  // Bounds of car: 153 to 871, 382 to 666
  const carW = 871 - 153 + 1;
  const carH = 666 - 382 + 1;
  const carPad = 8;
  const carLeft = 153 - carPad;
  const carTop = 382 - carPad;
  const carTotalW = carW + carPad * 2;
  const carTotalH = carH + carPad * 2;

  const baseCarBuffer = await sharp(carData, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: carLeft, top: carTop, width: carTotalW, height: carTotalH })
    .png()
    .toBuffer();

  await sharp(baseCarBuffer)
    .resize(360, Math.round(360 * carTotalH / carTotalW))
    .png()
    .toFile(path.join(imgDir, 'car-icon-white.png'));

  // Green car version for light backgrounds
  const greenCarData = Buffer.from(carData);
  for (let i = 0; i < w * h; i++) {
    const pIdx = i * 4;
    if (greenCarData[pIdx + 3] > 0) {
      greenCarData[pIdx] = 1;     // R
      greenCarData[pIdx + 1] = 144; // G
      greenCarData[pIdx + 2] = 77;  // B
    }
  }
  const baseGreenCarBuffer = await sharp(greenCarData, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: carLeft, top: carTop, width: carTotalW, height: carTotalH })
    .png()
    .toBuffer();

  await sharp(baseGreenCarBuffer)
    .resize(360, Math.round(360 * carTotalH / carTotalW))
    .png()
    .toFile(path.join(imgDir, 'car-icon-green.png'));

  // 5. Generate high-res favicon.svg embedding the master squircle
  const base64Png = (await sharp(baseSquircleBuffer).resize(512, 512).png().toBuffer()).toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Png}" width="512" height="512" />
</svg>
`;
  fs.writeFileSync(path.join(rootDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(rootDir, 'driver-icon.svg'), svgContent);
  console.log('✓ favicon.svg and driver-icon.svg');

  console.log('✅ ALL master logo assets successfully created!');
}

generateAllAssets().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
