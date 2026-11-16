const fs = require('fs');
let content = fs.readFileSync('local-server.js', 'utf8');

const daemonBlock = `
// Autonomous Background Sweeper Daemon (Hidden Enterprise Backend Feature)
// Continuously monitors trips, expands radii, re-broadcasts ghosted rides, and auto-settles
const autonomousDaemon = setInterval(() => {
  try {
    const dbService = require('./services/db.js');
    const autoEngine = require('./services/autonomousEngine.js');
    const db = dbService.getDb();
    if (db) {
      const sweep = autoEngine.runAutonomousSweep(db);
      if (sweep.mutations > 0) {
        dbService.saveDb(db);
        console.log(\`[AutonomousEngine] Background sweep reconciled \${sweep.mutations} booking state(s).\`);
      }
    }
  } catch (err) {
    // Non-fatal background daemon safeguard
  }
}, 30000);
if (autonomousDaemon && autonomousDaemon.unref) autonomousDaemon.unref();
`;

const target = `process.on('SIGINT', () => gracefulShutdown('SIGINT'));`;
if (content.includes(target)) {
  content = content.replace(target, target + '\n' + daemonBlock);
  fs.writeFileSync('local-server.js', content, 'utf8');
  console.log('local-server.js patched with Autonomous Daemon!');
} else {
  console.log('Target not found in local-server.js');
}

