const dbService = require('../services/db.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  let dbStatus = {};
  try {
    await dbService.initDatabase();
    dbStatus = dbService.getDatabaseStatus();
  } catch (e) {
    dbStatus = { error: e.message };
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: true,
    status: 'ONLINE',
    version: '2026.10.13-prod',
    platform: 'OneWayTaxiBihar Production Cloud',
    domain: 'onewaytaxibihar.com',
    engine: dbStatus.engine === 'mongodb' ? 'MongoDB Atlas Active' : (dbStatus.engine || 'Local Sync Active'),
    database: dbStatus,
    timestamp: new Date().toISOString()
  }));
};
