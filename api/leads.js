try { require('dotenv').config(); } catch (e) {}
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const securityService = require('../services/security.js');

const DEFAULT_MONGODB_URI = 'mongodb+srv://himanshudu255_db_user:Himanshu%40123@cluster0.7pf5pvc.mongodb.net/onewaytaxibihar?retryWrites=true&w=majority&appName=Cluster0';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
let cachedDb = null;
let cachedClient = null;

// Multi-Tier In-Memory Cache for Sub-Millisecond Response (<2ms)
let cachedLeads = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 2500; // 2.5 seconds cache TTL: lightning-fast zero-lag polling

async function connectToDatabase() {
  if (cachedDb && cachedClient) {
    try {
      await cachedDb.command({ ping: 1 });
      return cachedDb;
    } catch (e) {
      cachedDb = null;
      cachedClient = null;
    }
  }
  try {
    cachedClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 25,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    await cachedClient.connect();
    cachedDb = cachedClient.db('onewaytaxibihar');
    return cachedDb;
  } catch (err) {
    console.warn('[Leads DB Connection Warning]:', err.message);
    cachedDb = null;
    cachedClient = null;
    return null;
  }
}

// Fallback to local data/db.json or /tmp/db.json
function getLocalDbPath() {
  const candidates = [
    path.join(process.cwd(), 'data', 'db.json'),
    path.join(__dirname, '..', 'data', 'db.json'),
    '/tmp/db.json'
  ];
  return candidates.find(p => fs.existsSync(p)) || candidates[0];
}

function readLocalLeads() {
  try {
    const fPath = getLocalDbPath();
    if (fs.existsSync(fPath)) {
      const parsed = JSON.parse(fs.readFileSync(fPath, 'utf8').replace(/^\uFEFF/, ''));
      return Array.isArray(parsed.leads) ? parsed.leads : [];
    }
  } catch (e) {}
  return [];
}

function saveLocalLead(newLead) {
  try {
    const fPath = getLocalDbPath();
    let db = { leads: [] };
    if (fs.existsSync(fPath)) {
      db = JSON.parse(fs.readFileSync(fPath, 'utf8').replace(/^\uFEFF/, ''));
    }
    if (!db.leads) db.leads = [];
    const idx = db.leads.findIndex(l => l.cleanPhone === newLead.cleanPhone);
    if (idx >= 0) {
      db.leads[idx] = { ...db.leads[idx], ...newLead, updatedAt: new Date().toISOString() };
    } else {
      db.leads.unshift(newLead);
    }
    fs.writeFileSync(fPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {}
}

function deleteLocalLead(leadId) {
  const candidates = [
    path.join(process.cwd(), 'data', 'db.json'),
    path.join(__dirname, '..', 'data', 'db.json'),
    '/tmp/db.json'
  ];
  for (const fPath of candidates) {
    try {
      if (fs.existsSync(fPath)) {
        const db = JSON.parse(fs.readFileSync(fPath, 'utf8').replace(/^\uFEFF/, ''));
        if (Array.isArray(db.leads)) {
          const found = db.leads.find(l => l.id === leadId || l.leadId === leadId || l.cleanPhone === leadId);
          const phone = found ? (found.cleanPhone || (found.phone || '').replace(/\D/g, '').slice(-10)) : leadId.replace(/\D/g, '').slice(-10);
          db.leads = db.leads.filter(l => l.id !== leadId && l.leadId !== leadId && (!phone || (l.cleanPhone !== phone && (l.phone || '').replace(/\D/g, '').slice(-10) !== phone)));
          fs.writeFileSync(fPath, JSON.stringify(db, null, 2), 'utf8');
        }
      }
    } catch (e) {}
  }
}

const handler = async (req, res) => {
  // Ultra-Permissive CORS for seamless Dispatch Console communication
  const reqOrigin = req.headers['origin'] || '*';
  res.setHeader('Access-Control-Allow-Origin', reqOrigin);
  if (reqOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Idempotency-Key, Accept, Origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  // Parse URL & Action
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.toLowerCase();

  // Parse Body Safely
  let body = req.body || {};
  if (typeof body === 'string' && body.trim()) {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  } else if (!req.body && req.method !== 'GET') {
    try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString('utf8');
      body = data ? JSON.parse(data) : {};
    } catch (e) {
      body = {};
    }
  }

  const action = (body.action || url.searchParams.get('action') || '').toLowerCase();

  const sendJson = (status, payload) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(payload));
  };

  // =========================================================================
  // 1. GET: Fetch Live Leads & Inquiries (Zero-Lag In-Memory + Cloud Atlas)
  // =========================================================================
  if (req.method === 'GET') {
    const now = Date.now();
    const forceRefresh = url.searchParams.has('refresh') || url.searchParams.has('t') || req.headers['cache-control'] === 'no-cache';
    // Return cached in-memory response if within TTL for instant <2ms delivery
    if (!forceRefresh && cachedLeads && (now - lastCacheTime < CACHE_TTL_MS)) {
      return sendJson(200, {
        success: true,
        count: cachedLeads.length,
        leads: cachedLeads,
        source: 'memory_cache',
        timestamp: new Date().toISOString()
      });
    }

    try {
      const db = await connectToDatabase();
      if (db) {
        const cloudLeads = await db.collection('leads')
          .find({})
          .sort({ updatedAt: -1, createdAt: -1 })
          .limit(200)
          .toArray();

        // Sanitize MongoDB _id
        let cleanDocs = cloudLeads.map(({ _id, ...rest }) => rest);

        // Also merge any local fallback leads so nothing is ever dropped
        const localLeads = readLocalLeads();
        const knownIds = new Set(cleanDocs.map(l => l.id || l.cleanPhone));
        localLeads.forEach(ll => {
          if (!knownIds.has(ll.id) && !knownIds.has(ll.cleanPhone)) {
            cleanDocs.push(ll);
          }
        });

        // Filter out tombstones if dbService is loaded
        try {
          const dbService = require('../services/db.js');
          if (dbService && typeof dbService.isLeadDeleted === 'function') {
            cleanDocs = cleanDocs.filter(l => !dbService.isLeadDeleted(l.id) && !dbService.isLeadDeleted(l.leadId));
          }
        } catch (e) {}

        cleanDocs.sort((a, b) => {
          const tB = Math.max(new Date(b.updatedAt || 0).getTime(), new Date(b.createdAt || 0).getTime());
          const tA = Math.max(new Date(a.updatedAt || 0).getTime(), new Date(a.createdAt || 0).getTime());
          return tB - tA;
        });

        cachedLeads = cleanDocs;
        lastCacheTime = now;

        return sendJson(200, {
          success: true,
          count: cleanDocs.length,
          leads: cleanDocs,
          source: 'mongodb_atlas_live',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('[Leads Fetch Warning]:', err.message);
    }

    // High-Resilience Fallback to Local Leads
    const fallbackLeads = readLocalLeads();
    cachedLeads = fallbackLeads;
    lastCacheTime = now;
    return sendJson(200, {
      success: true,
      count: fallbackLeads.length,
      leads: fallbackLeads,
      source: 'local_disk_fallback',
      timestamp: new Date().toISOString()
    });
  }

  // =========================================================================
  // 2. POST: Status Update (/api/leads/status or action=status)
  // =========================================================================
  if ((pathname.includes('/status') || action === 'status' || action === 'update-status') && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
    const leadId = (body.leadId || body.id || url.searchParams.get('id') || '').trim();
    const status = (body.status || 'CONTACTED').toUpperCase();
    const note = body.note || body.notes || '';

    if (!leadId) {
      return sendJson(400, { success: false, message: 'Lead ID required' });
    }

    // Extract clean 10-digit phone if ID contains phone (e.g. lead_9431801234_7921)
    let phonePart = '';
    if (leadId.includes('_')) {
      const parts = leadId.split('_');
      phonePart = (parts[1] || '').replace(/\D/g, '').slice(-10);
    } else {
      phonePart = leadId.replace(/\D/g, '').slice(-10);
    }

    try {
      const db = await connectToDatabase();
      if (db) {
        await db.collection('leads').updateOne(
          {
            $or: [
              { id: leadId },
              ...(phonePart && phonePart.length === 10 ? [{ cleanPhone: phonePart }, { phone: `+91 ${phonePart}` }] : [])
            ]
          },
          { $set: { status, notes: note, updatedAt: new Date().toISOString() } }
        );
      }
    } catch (e) {}

    // Invalidate and update local cache
    cachedLeads = null;
    lastCacheTime = 0;

    return sendJson(200, { success: true, message: `Lead status updated to ${status}`, leadId, status });
  }

  // =========================================================================
  // 3. POST: Capture Customer Lead / Fare Inquiry / Login Details
  // =========================================================================
  if (req.method === 'POST') {
    try {
      const rawPhone = (body.phone || body.passengerPhone || body.cleanPhone || body.rawPhone || '').replace(/\D/g, '');
      const cleanPhone = rawPhone.slice(-10);

      if (!cleanPhone || cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'A valid 10-digit mobile number is required.' });
      }

      const leadId = `lead_${cleanPhone}_${Date.now().toString().slice(-4)}`;
      const now = new Date().toISOString();

      function normTier(t) {
        if (!t) return 'sedan';
        const s = String(t).toLowerCase().trim();
        if (s.includes('innova') || s.includes('crysta')) return 'innova_crysta';
        if (s.includes('suv') || s.includes('ertiga') || s.includes('carens') || s.includes('6+1')) return 'suv';
        if (s.includes('hatch') || s.includes('wagon') || s.includes('tiago') || s.includes('celerio')) return 'hatchback';
        if (s.includes('executive') || s.includes('city') || s.includes('ciaz') || s.includes('sedan_prime')) return 'sedan_prime';
        return 'sedan';
      }

      const selectedCab = normTier(body.selectedCab || body.cabTier || body.cabType || 'sedan');
      const cabNameMap = {
        hatchback: 'Go Hatchback',
        sedan: 'Prime Sedan',
        sedan_prime: 'Executive Sedan',
        suv: 'Family SUV (6+1)',
        innova_crysta: 'Toyota Innova Crysta'
      };

      const passengerName = (body.passengerName || body.name || 'Valued Passenger').trim();
      const originCity = body.originCity || 'Patna';
      const destCity = body.destCity || 'Gaya';
      const distanceKm = Number(body.distanceKm) || 104;
      const duration = body.duration || '2h 15m';

      const estFareHatch = Number(body.estFareHatch || 1698);
      const estFareSedan = Number(body.estFareSedan || 2198);
      const estFareSuv = Number(body.estFareSuv || 3398);
      const exactFare = Number(body.cabPrice != null ? body.cabPrice : (body.totalFare != null ? body.totalFare : (body.fare != null ? body.fare : (selectedCab === 'suv' ? estFareSuv : (selectedCab === 'hatchback' ? estFareHatch : estFareSedan)))));

      const newLead = {
        id: leadId,
        phone: `+91 ${cleanPhone}`,
        rawPhone: cleanPhone,
        cleanPhone: cleanPhone,
        passengerName: passengerName,
        originCity: originCity,
        destCity: destCity,
        tripType: body.tripType || 'oneway',
        pickupDate: body.pickupDate || new Date().toISOString().split('T')[0],
        pickupTime: body.pickupTime || 'Immediate',
        distanceKm: distanceKm,
        duration: duration,
        selectedCab: selectedCab,
        cabTier: selectedCab,
        cabType: body.cabName || body.cabType || cabNameMap[selectedCab] || 'Prime Sedan',
        cabName: body.cabName || body.cabType || cabNameMap[selectedCab] || 'Prime Sedan',
        cabPrice: exactFare,
        totalFare: exactFare,
        estFareHatch: estFareHatch,
        estFareSedan: exactFare,
        estFareSuv: estFareSuv,
        source: body.source || 'Website Fare Check',
        status: body.status || 'NEW',
        notes: body.notes || `Inquiry for ${originCity} ➔ ${destCity}`,
        createdAt: now,
        updatedAt: now
      };

      // 1. Upsert to MongoDB Atlas Cloud
      try {
        const db = await connectToDatabase();
        if (db) {
          await db.collection('leads').updateOne(
            { cleanPhone: cleanPhone },
            {
              $set: {
                ...newLead,
                updatedAt: now
              }
            },
            { upsert: true }
          );

          // Also insert push notification for Admin Central Dispatch
          await db.collection('notifications').insertOne({
            id: `NOTIF_${Date.now()}`,
            type: 'NEW_LEAD',
            title: `New Fare Inquiry: ${originCity} ➔ ${destCity}`,
            message: `${passengerName} (+91 ${cleanPhone}) checked fare for ${originCity} ➔ ${destCity} (${distanceKm} KM). Rate: ₹${estFareSedan}.`,
            leadId: newLead.id,
            isRead: false,
            createdAt: now
          }).catch(() => {});
        }
      } catch (dbErr) {
        console.warn('[MongoDB Atlas Lead Write Error]:', dbErr.message);
      }

      // 2. Persist to local backup
      saveLocalLead(newLead);

      // 3. Immediately invalidate memory cache for instant fresh delivery to Admin
      cachedLeads = null;
      lastCacheTime = 0;

      return sendJson(201, {
        success: true,
        lead: newLead,
        message: 'Lead captured successfully!'
      });
    } catch (err) {
      console.error('[Leads Capture Error]:', err);
      return sendJson(500, { success: false, message: err.message });
    }
  }

  // =========================================================================
  // 4. DELETE: Permanently Delete Lead (Requires Verified Admin Authentication)
  // =========================================================================
  if (req.method === 'DELETE') {
    try {
      let token = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
      if (!token && req.headers['cookie']) {
        const cookies = req.headers['cookie'].split(';');
        for (const c of cookies) {
          const [k, v] = c.trim().split('=');
          if (k === 'otb_adm_token' && v) {
            token = decodeURIComponent(v);
            break;
          }
        }
      }

      const delPass = (body.deletePassword || body.password || url.searchParams.get('deletePassword') || url.searchParams.get('password') || '').trim();
      const isPassValid = (delPass === 'deleteit' || delPass === 'harharmahadev@3');

      // Check JWT
      const verifiedAdmin = token ? securityService.verifyJwt(token) : null;
      let isAdmin = Boolean(verifiedAdmin && securityService.hasPermission(verifiedAdmin.role, 'leads'));

      // Check active db.sessions fallback
      if (!isAdmin && token) {
        try {
          const fPath = getLocalDbPath();
          if (fs.existsSync(fPath)) {
            const ldb = JSON.parse(fs.readFileSync(fPath, 'utf8').replace(/^\uFEFF/, ''));
            const session = (ldb.sessions || []).find(s => s.token === token);
            if (session) isAdmin = true;
          }
        } catch (e) {}
      }

      if (!isAdmin && !isPassValid) {
        return sendJson(403, {
          success: false,
          message: 'Access Denied: Authorized Admin credentials or deletion password required to delete leads.'
        });
      }

      const leadId = (body.leadId || body.id || url.searchParams.get('id') || url.searchParams.get('leadId') || '').trim();

      if (!leadId) {
        return sendJson(400, { success: false, message: 'Lead ID is required for deletion.' });
      }

      // Delete from local JSON database
      deleteLocalLead(leadId);

      // Delete from dbService / MongoDB Atlas
      try {
        const dbService = require('../services/db.js');
        if (dbService && typeof dbService.deleteLead === 'function') {
          await dbService.deleteLead(leadId);
        }
      } catch (e) {
        // Fallback direct MongoDB deletion
        try {
          const db = await connectToDatabase();
          if (db) {
            const cleanPhone = leadId.replace(/\D/g, '').slice(-10);
            await db.collection('leads').deleteMany({
              $or: [{ id: leadId }, { cleanPhone: cleanPhone }, { phone: `+91 ${cleanPhone}` }]
            });
          }
        } catch (mErr) {}
      }

      // Invalidate memory cache immediately
      cachedLeads = null;
      lastCacheTime = 0;

      return sendJson(200, {
        success: true,
        message: 'Inquiry lead permanently deleted from database.'
      });
    } catch (err) {
      console.error('[Leads Delete Error]:', err);
      return sendJson(500, { success: false, message: err.message });
    }
  }

  return sendJson(405, { success: false, message: 'Method not allowed' });
};

handler.invalidateCache = () => {
  cachedLeads = null;
  lastCacheTime = 0;
};

module.exports = handler;
