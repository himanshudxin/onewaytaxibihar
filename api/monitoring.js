/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Standalone Production Monitoring & Diagnostics Serverless Function for Vercel
 */
const dbService = require('../services/db.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = (url.searchParams.get('action') || url.pathname.split('/').filter(Boolean).pop() || 'health').toLowerCase();

  try {
    let db = {};
    try {
      db = await dbService.getDbAsync();
    } catch (e) {
      db = dbService.getDb() || {};
    }

    if (action === 'metrics') {
      const bookings = db.bookings || [];
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.fare) || 0), 0);
      const advanceCollected = bookings.reduce((sum, b) => sum + (Number(b.advancePaid) || 0), 0);

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        metrics: {
          totalBookings: bookings.length,
          activeTrips: bookings.filter(b => ['DRIVER ASSIGNED', 'ACCEPTED', 'ON THE WAY', 'ARRIVED', 'TRIP STARTED'].includes(b.bookingStatus)).length,
          completedTrips: bookings.filter(b => b.bookingStatus === 'COMPLETED').length,
          totalRevenue,
          advanceCollected,
          driverCount: (db.drivers || []).length,
          openTickets: (db.support_tickets || []).filter(t => t.status === 'OPEN').length,
          unresolvedErrors: (db.error_logs || []).length,
          uptimeSeconds: Math.round(process.uptime())
        },
        timestamp: new Date().toISOString()
      }));
    }

    // Default: health
    const mem = process.memoryUsage();
    const uptimeSec = Math.round(process.uptime());
    const recentErrors = (db.error_logs || []).filter(e => Date.now() - new Date(e.timestamp || 0).getTime() < 3600000).length;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      status: recentErrors > 50 ? 'DEGRADED' : 'HEALTHY',
      platform: 'OneWayTaxiBihar Production API',
      uptimeSeconds: uptimeSec,
      uptimeFormatted: `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`,
      timestamp: new Date().toISOString(),
      database: {
        engine: process.env.MONGODB_URI ? 'MongoDB Atlas Cloud' : 'In-Memory with JSON Fallback',
        state: 'ONLINE',
        collectionsTracked: 15
      },
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024)
      },
      incidentStatus: {
        emergencyPauseActive: Boolean(db.settings?.emergencyBookingPause),
        recentErrorsPastHour: recentErrors,
        openSupportTickets: (db.support_tickets || []).filter(t => t.status === 'OPEN').length
      }
    }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: err.message }));
  }
};
