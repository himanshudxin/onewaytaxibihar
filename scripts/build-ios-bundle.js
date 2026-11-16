/**
 * build-ios-bundle.js
 * Initiates iOS production / TestFlight build on EAS Cloud
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = (process.argv[2] || 'passenger').toLowerCase();
console.log(`[EAS iOS Build] Preparing Apple App Store / TestFlight build for: ${target.toUpperCase()}`);

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

  // Ensure iOS buildNumber is set
  targetConfig.expo.ios = targetConfig.expo.ios || {};
  targetConfig.expo.ios.buildNumber = targetConfig.expo.ios.buildNumber || '1';

  fs.writeFileSync(rootAppJson, JSON.stringify(targetConfig, null, 2), 'utf8');
  console.log(`[EAS iOS Build] Configured mobile/app.json for ${target.toUpperCase()}:`);
  console.log(`  - App Name: ${targetConfig.expo.name}`);
  console.log(`  - iOS Bundle ID: ${targetConfig.expo.ios?.bundleIdentifier}`);
  console.log(`  - Version: ${targetConfig.expo.version} (buildNumber: ${targetConfig.expo.ios.buildNumber})`);

  const token = '7eWhz4D90dcg93GeuBB6vntrs50MwF33rtKFOiKG';
  const cmd = `cd mobile; $env:EXPO_TOKEN="${token}"; npx --yes eas-cli build -p ios --profile production --non-interactive`;
  console.log(`[EAS iOS Build] Launching EAS Cloud iOS Build...`);
  execSync(cmd, { shell: 'powershell', stdio: 'inherit' });
} catch (err) {
  console.error('[EAS iOS Build] Note:', err.message);
} finally {
  if (fs.existsSync(backupAppJson)) {
    fs.copyFileSync(backupAppJson, rootAppJson);
    fs.unlinkSync(backupAppJson);
    console.log('[EAS iOS Build] Restored original mobile/app.json');
  }
}

