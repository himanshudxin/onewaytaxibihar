/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Automated Database Backup Engine
 * Creates cryptographically verified, timestamped snapshots of MongoDB Atlas & Local Stores
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dbService = require('../services/db.js');

const BACKUP_ROOT = path.join(__dirname, '..', 'data', 'backups');

async function performBackup() {
  console.log('[Backup Engine] 🛡️ Initiating Automated Database Backup Snapshot...');
  if (!fs.existsSync(BACKUP_ROOT)) {
    fs.mkdirSync(BACKUP_ROOT, { recursive: true });
  }

  // 1. Initialize DB Service & pull latest state
  await dbService.initDatabase();
  const db = await dbService.getDbAsync();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = path.join(BACKUP_ROOT, `snapshot-${timestamp}`);
  fs.mkdirSync(backupFolder, { recursive: true });

  const backupDataPath = path.join(backupFolder, 'database-dump.json');
  const jsonContent = JSON.stringify(db, null, 2);
  fs.writeFileSync(backupDataPath, jsonContent, 'utf8');

  // 2. Generate SHA-256 Checksum for cryptographic tampering detection
  const hash = crypto.createHash('sha256').update(jsonContent).digest('hex');
  fs.writeFileSync(path.join(backupFolder, 'checksum.sha256'), hash, 'utf8');

  // 3. Generate Manifest
  const manifest = {
    platform: 'OneWayTaxiBihar Production Backup Engine',
    timestamp: new Date().toISOString(),
    sha256: hash,
    bytes: Buffer.byteLength(jsonContent, 'utf8'),
    collectionSummary: {
      bookings: (db.bookings || []).length,
      users: (db.users || []).length,
      drivers: (db.drivers || []).length,
      vehicles: (db.vehicles || []).length,
      payments: (db.payments || []).length,
      wallet_ledger: (db.wallet_ledger || []).length,
      leads: (db.leads || []).length,
      notifications: (db.notifications || []).length,
      coupons: (db.coupons || []).length,
      support_tickets: (db.support_tickets || []).length,
      error_logs: (db.error_logs || []).length
    }
  };
  fs.writeFileSync(path.join(backupFolder, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // 4. Also maintain latest pointer
  fs.writeFileSync(path.join(BACKUP_ROOT, 'latest-snapshot.json'), JSON.stringify({
    folder: `snapshot-${timestamp}`,
    timestamp: manifest.timestamp,
    sha256: hash
  }, null, 2), 'utf8');

  console.log(`[Backup Engine] ✅ Backup successfully completed!`);
  console.log(`[Backup Engine] Location: ${backupFolder}`);
  console.log(`[Backup Engine] SHA-256 Checksum: ${hash}`);
  console.log(`[Backup Engine] Bookings preserved: ${manifest.collectionSummary.bookings}`);

  return { backupFolder, hash, manifest };
}

if (require.main === module) {
  performBackup().then(() => process.exit(0)).catch(err => {
    console.error('[Backup Engine Error]:', err);
    process.exit(1);
  });
}

module.exports = { performBackup };
