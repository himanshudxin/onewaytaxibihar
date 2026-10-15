const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'img');
const heroSrc = path.join(imgDir, 'hero-placeholder.jpg');
const logoSrc = path.join(imgDir, 'logo-reframed.png');

async function run() {
  console.log('[Images] Optimizing hero images...');
  
  // 1. Mobile WebP (480w)
  await sharp(heroSrc)
    .resize(480)
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(imgDir, 'hero-480.webp'));
  console.log('✓ hero-480.webp:', fs.statSync(path.join(imgDir, 'hero-480.webp')).size, 'bytes');

  // 2. Tablet WebP (800w)
  await sharp(heroSrc)
    .resize(800)
    .webp({ quality: 80, effort: 6 })
    .toFile(path.join(imgDir, 'hero-800.webp'));
  console.log('✓ hero-800.webp:', fs.statSync(path.join(imgDir, 'hero-800.webp')).size, 'bytes');

  // 3. Desktop WebP (1200w)
  await sharp(heroSrc)
    .resize(1200)
    .webp({ quality: 82, effort: 6 })
    .toFile(path.join(imgDir, 'hero-1200.webp'));
  console.log('✓ hero-1200.webp:', fs.statSync(path.join(imgDir, 'hero-1200.webp')).size, 'bytes');

  // Default hero.webp
  fs.copyFileSync(path.join(imgDir, 'hero-1200.webp'), path.join(imgDir, 'hero.webp'));

  // 4. AVIF variants
  await sharp(heroSrc)
    .resize(480)
    .avif({ quality: 70, effort: 6 })
    .toFile(path.join(imgDir, 'hero-480.avif'));
  console.log('✓ hero-480.avif:', fs.statSync(path.join(imgDir, 'hero-480.avif')).size, 'bytes');

  await sharp(heroSrc)
    .resize(800)
    .avif({ quality: 70, effort: 6 })
    .toFile(path.join(imgDir, 'hero-800.avif'));
  console.log('✓ hero-800.avif:', fs.statSync(path.join(imgDir, 'hero-800.avif')).size, 'bytes');

  await sharp(heroSrc)
    .resize(1200)
    .avif({ quality: 72, effort: 6 })
    .toFile(path.join(imgDir, 'hero-1200.avif'));
  console.log('✓ hero-1200.avif:', fs.statSync(path.join(imgDir, 'hero-1200.avif')).size, 'bytes');

  fs.copyFileSync(path.join(imgDir, 'hero-1200.avif'), path.join(imgDir, 'hero.avif'));

  // 5. Compressed JPEG fallback
  const heroBak = path.join(imgDir, 'hero-placeholder.original.jpg');
  if (!fs.existsSync(heroBak)) {
    fs.copyFileSync(heroSrc, heroBak);
  }
  const jpegBuf = await sharp(heroBak)
    .resize(1200)
    .jpeg({ quality: 75, progressive: true, mozjpeg: true })
    .toBuffer();
  fs.writeFileSync(heroSrc, jpegBuf);
  console.log('✓ hero-placeholder.jpg (optimized fallback):', fs.statSync(heroSrc).size, 'bytes');

  // 6. Logo WebP
  const logoBuf = await sharp(logoSrc)
    .webp({ quality: 85, effort: 6 })
    .toBuffer();
  fs.writeFileSync(path.join(imgDir, 'logo-reframed.webp'), logoBuf);
  console.log('✓ logo-reframed.webp:', fs.statSync(path.join(imgDir, 'logo-reframed.webp')).size, 'bytes');

  console.log('✅ Image optimization complete!');
}

run().catch(err => {
  console.error('[Images] Optimization failed:', err);
  process.exit(1);
});
