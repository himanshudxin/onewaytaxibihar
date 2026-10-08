/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Standalone Customer Support Ticketing API for Vercel
 */
const dbService = require('../services/db.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const sendJson = (status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  };

  try {
    let db = await dbService.getDbAsync();
    const method = req.method.toUpperCase();

    if (method === 'POST') {
      let body = {};
      if (req.body && typeof req.body === 'object') {
        body = req.body;
      } else {
        const buffers = [];
        for await (const chunk of req) buffers.push(chunk);
        const data = Buffer.concat(buffers).toString('utf8');
        body = data ? JSON.parse(data) : {};
      }

      const cleanPhone = (body.phone || body.passengerPhone || '').toString().replace(/\D/g, '').slice(-10);
      const message = (body.message || body.complaint || body.issue || '').toString().trim();
      const bookingId = (body.bookingId || body.rideId || '').toString().trim().toUpperCase();

      if (!cleanPhone || cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Valid 10-digit customer mobile number required.' });
      }
      if (!message || message.length < 5) {
        return sendJson(400, { success: false, message: 'Please provide a detailed description of your issue (minimum 5 characters).' });
      }

      const ticketId = `TCK-${Date.now().toString().slice(-6)}`;
      const newTicket = {
        id: ticketId,
        ticketId,
        bookingId: bookingId || null,
        passengerPhone: `+91 ${cleanPhone}`,
        cleanPhone,
        passengerName: (body.passengerName || body.name || 'Valued Passenger').trim().slice(0, 80),
        category: (body.category || 'GENERAL').toUpperCase(),
        priority: (body.priority || 'NORMAL').toUpperCase(),
        subject: (body.subject || `Support Request regarding ${bookingId || 'OneWayTaxiBihar'}`).slice(0, 120),
        message,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!db.support_tickets) db.support_tickets = [];
      db.support_tickets.unshift(newTicket);
      await dbService.saveDbAsync(db);

      return sendJson(200, {
        success: true,
        ticketId,
        ticket: newTicket,
        message: 'Your ticket has been registered with priority. Our Patna Central Dispatch Desk will contact you within 15 minutes.'
      });
    }

    if (method === 'GET') {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const phoneParam = (url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10);
      let tickets = db.support_tickets || [];
      if (phoneParam) {
        tickets = tickets.filter(t => t.cleanPhone === phoneParam);
      }
      return sendJson(200, { success: true, count: tickets.length, tickets });
    }

    return sendJson(405, { success: false, message: 'Method Not Allowed' });
  } catch (err) {
    return sendJson(500, { success: false, message: err.message });
  }
};
