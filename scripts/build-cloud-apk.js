const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = (process.argv[2] || 'driver').toLowerCase();
console.log(`[EAS Build] Preparing standalone build for: ${target.toUpperCase()}`);

const mobileDir = path.join(__dirname, '..', 'mobile');
const rootAppJson = path.join(mobileDir, 'app.json');
const backupAppJson = path.join(mobileDir, 'app.json.bak');
const targetAppJson = path.join(mobileDir, 'apps', target, 'app.json');

if (!fs.existsSync(targetAppJson)) {
  console.error(`Target app.json not found at: ${targetAppJson}`);
  process.exit(1);
}

// Backup current mobile/app.json
fs.copyFileSync(rootAppJson, backupAppJson);

try {
  const targetConfig = JSON.parse(fs.readFileSync(targetAppJson, 'utf8'));
  targetConfig.expo.extra = targetConfig.expo.extra || {};
  targetConfig.expo.extra.eas = targetConfig.expo.extra.eas || {};
  targetConfig.expo.extra.eas.projectId = 'ee1c401a-e93f-414e-9e57-5845a902305c';
  targetConfig.expo.owner = 'himanshud';
  targetConfig.expo.slug = 'onewaytaxibihar';

  fs.writeFileSync(rootAppJson, JSON.stringify(targetConfig, null, 2), 'utf8');
  console.log(`[EAS Build] Configured mobile/app.json for ${target.toUpperCase()}:`);
  console.log(`  - App Name: ${targetConfig.expo.name}`);
  console.log(`  - Android Package: ${targetConfig.expo.android?.package}`);
  console.log(`  - App Type: ${targetConfig.expo.extra.appType}`);

  const token = '7eWhz4D90dcg93GeuBB6vntrs50MwF33rtKFOiKG';
  const cmd = `cd mobile; $env:EXPO_TOKEN="${token}"; npx --yes eas-cli build -p android --profile preview --non-interactive`;
  console.log(`[EAS Build] Launching EAS cloud build...`);
  execSync(cmd, { shell: 'powershell', stdio: 'inherit' });
} catch (err) {
  console.error('[EAS Build] Build failed or terminated:', err.message);
} finally {
  if (fs.existsSync(backupAppJson)) {
    fs.copyFileSync(backupAppJson, rootAppJson);
    fs.unlinkSync(backupAppJson);
    console.log('[EAS Build] Restored original mobile/app.json');
  }
}

