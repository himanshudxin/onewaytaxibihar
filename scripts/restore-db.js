/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Automated Database Restore & Recovery Engine
 * Verifies SHA-256 cryptographic integrity before restoring snapshot to Atlas & Local
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dbService = require('../services/db.js');

const BACKUP_ROOT = path.join(__dirname, '..', 'data', 'backups');

async function performRestore(specificSnapshotFolder = null) {
  console.log('[Restore Engine] 🔄 Initiating Database Restore Procedure...');

  let targetFolder = specificSnapshotFolder;
  if (!targetFolder) {
    const latestPointer = path.join(BACKUP_ROOT, 'latest-snapshot.json');
    if (!fs.existsSync(latestPointer)) {
      throw new Error('No backup snapshots found in ' + BACKUP_ROOT);
    }
    const meta = JSON.parse(fs.readFileSync(latestPointer, 'utf8'));
    targetFolder = path.join(BACKUP_ROOT, meta.folder);
  }

  const dataPath = path.join(targetFolder, 'database-dump.json');
  const checksumPath = path.join(targetFolder, 'checksum.sha256');

  if (!fs.existsSync(dataPath) || !fs.existsSync(checksumPath)) {
    throw new Error(`Invalid backup snapshot at ${targetFolder}. Missing data or checksum file.`);
  }

  // 1. Cryptographic Checksum Verification
  const content = fs.readFileSync(dataPath, 'utf8');
  const expectedHash = fs.readFileSync(checksumPath, 'utf8').trim();
  const computedHash = crypto.createHash('sha256').update(content).digest('hex');

  if (computedHash !== expectedHash) {
    throw new Error(`CRITICAL INTEGRITY FAILURE: Backup file checksum mismatch! Expected ${expectedHash}, computed ${computedHash}`);
  }
  console.log('[Restore Engine] ✅ Cryptographic SHA-256 checksum verified perfectly.');

  // 2. Parse and Validate Snapshot Payload
  const restoredDb = JSON.parse(content);
  if (!restoredDb || typeof restoredDb !== 'object') {
    throw new Error('Parsed backup content is not a valid database object');
  }

  // 3. Multi-tier Database Restoration
  await dbService.initDatabase();
  await dbService.saveDbAsync(restoredDb);

  console.log('[Restore Engine] ✅ Multi-tier Database successfully restored to memory, local mirror, and MongoDB Atlas!');
  console.log(`[Restore Engine] Restored summary: Bookings=${(restoredDb.bookings || []).length}, Drivers=${(restoredDb.drivers || []).length}, Vehicles=${(restoredDb.vehicles || []).length}`);

  return { success: true, restoredDb, targetFolder, checksum: computedHash };
}

if (require.main === module) {
  const customFolder = process.argv[2] || null;
  performRestore(customFolder).then(() => process.exit(0)).catch(err => {
    console.error('[Restore Engine Error]:', err);
    process.exit(1);
  });
}

module.exports = { performRestore };
