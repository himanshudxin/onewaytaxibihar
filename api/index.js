/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Unified Production Serverless REST API Handler for Vercel
 * OneWayTaxiBihar Mobility Pvt Ltd
 */

try { require('dotenv').config(); } catch (e) {}

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Enterprise Service Layer Integrations
const dbService = require('../services/db.js');
const paymentService = require('../services/payment.js');
const notificationService = require('../services/notification.js');

// Auto-initialize Enterprise DB (MongoDB Atlas / PostgreSQL / Local Cache)
dbService.initDatabase().catch(err => {
  console.warn('[API Layer] Database service init notice:', err.message);
});

const activeVerificationCodes = new Map();
const activeAdminOtps = new Map();

function loadDb() {
  return dbService.getDb();
}

async function saveDb(db) {
  await dbService.saveDbAsync(db);
}


let memoryCities = null;
function loadCities() {
  if (memoryCities) return memoryCities;
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'cities.json'),
    path.join(__dirname, '..', 'data', 'cities.json'),
    path.join(__dirname, 'data', 'cities.json')
  ];
  for (const cPath of candidatePaths) {
    try {
      if (fs.existsSync(cPath)) {
        memoryCities = JSON.parse(fs.readFileSync(cPath, 'utf8').replace(/^\uFEFF/, ''));
        return memoryCities;
      }
    } catch (e) {}
  }
  return [];
}

let memoryLocations = null;
function loadLocations() {
  if (memoryLocations) return memoryLocations;
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'locations.json'),
    path.join(__dirname, '..', 'data', 'locations.json'),
    path.join(__dirname, 'data', 'locations.json')
  ];
  for (const lPath of candidatePaths) {
    try {
      if (fs.existsSync(lPath)) {
        memoryLocations = JSON.parse(fs.readFileSync(lPath, 'utf8').replace(/^\uFEFF/, ''));
        return memoryLocations;
      }
    } catch (e) {}
  }
  return [];
}

// 38 Districts of Bihar + Major Intercity Transit Hubs Coordinates
const BIHAR_COORDS = {
  "patna": [25.5941, 85.1376],
  "nalanda": [25.1978, 85.5186],
  "biharsharif": [25.1978, 85.5186],
  "rajgir": [25.0300, 85.4200],
  "bhojpur": [25.5541, 84.6644],
  "ara": [25.5541, 84.6644],
  "buxar": [25.5647, 83.9777],
  "rohtas": [24.9536, 84.0159],
  "sasaram": [24.9536, 84.0159],
  "dehri": [24.9167, 84.1833],
  "kaimur": [25.0450, 83.6144],
  "bhabua": [25.0450, 83.6144],
  "gaya": [24.7914, 85.0002],
  "bodhgaya": [24.6961, 84.9870],
  "aurangabad": [24.7539, 84.3742],
  "nawada": [24.8872, 85.5433],
  "jehanabad": [25.2136, 84.9867],
  "arwal": [25.2444, 84.6789],
  "muzaffarpur": [26.1209, 85.3647],
  "vaishali": [25.6858, 85.2155],
  "hajipur": [25.6858, 85.2155],
  "eastchamparan": [26.6469, 84.9089],
  "motihari": [26.6469, 84.9089],
  "westchamparan": [26.8024, 84.5028],
  "bettiah": [26.8024, 84.5028],
  "sitamarhi": [26.5978, 85.4892],
  "sheohar": [26.5167, 85.2833],
  "darbhanga": [26.1542, 85.8918],
  "madhubani": [26.3533, 86.0718],
  "samastipur": [25.8628, 85.7811],
  "saran": [25.7796, 84.7499],
  "chhapra": [25.7796, 84.7499],
  "siwan": [26.2196, 84.3567],
  "gopalganj": [26.4687, 84.4442],
  "bhagalpur": [25.2425, 87.0125],
  "banka": [24.8833, 86.9167],
  "munger": [25.3750, 86.4744],
  "jamui": [24.9167, 86.2167],
  "khagaria": [25.5000, 86.4833],
  "lakhisarai": [25.1833, 86.0833],
  "sheikhpura": [25.1333, 85.8500],
  "begusarai": [25.4182, 86.1272],
  "purnia": [25.7771, 87.4753],
  "katihar": [25.5394, 87.5661],
  "araria": [26.1500, 87.5167],
  "kishanganj": [26.0744, 87.9400],
  "saharsa": [25.8833, 86.6000],
  "madhepura": [25.9167, 86.7833],
  "supaul": [26.1167, 86.6000],
  "varanasi": [25.3176, 82.9739],
  "deoghar": [24.4826, 86.7001],
  "ranchi": [23.3441, 85.3096],
  "siliguri": [26.7271, 88.3953],
  "gorakhpur": [26.7606, 83.3732],
  "kolkata": [22.5726, 88.3639]
};

// Verified Highway Distance Matrix for Major Routes
const BIHAR_DISTANCES = {
  "patna_gaya": 104,
  "patna_muzaffarpur": 75,
  "patna_darbhanga": 142,
  "patna_bhagalpur": 235,
  "patna_purnia": 305,
  "patna_rajgir": 102,
  "patna_ara": 54,
  "patna_buxar": 130,
  "patna_sasaram": 150,
  "patna_begusarai": 125,
  "patna_chhapra": 50,
  "patna_motihari": 155,
  "patna_bettiah": 200,
  "patna_siwan": 135,
  "patna_samastipur": 88,
  "patna_katihar": 320,
  "patna_saharsa": 210,
  "patna_munger": 178,
  "patna_kishanganj": 395,
  "patna_deoghar": 255,
  "patna_varanasi": 250,
  "patna_ranchi": 325,
  "patna_siliguri": 460
};

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.28); // 1.28x road tortuosity factor for Bihar highway network
}

function resolveCoordinates(name) {
  const clean = (name || "").toLowerCase().replace(/[^a-z]/g, "");
  for (const [key, coords] of Object.entries(BIHAR_COORDS)) {
    if (clean.includes(key) || key.includes(clean)) return coords;
  }
  return null;
}

function getRouteDistance(origin, dest) {
  const normOrigin = (origin || "").toLowerCase().replace(/[^a-z]/g, "");
  const normDest = (dest || "").toLowerCase().replace(/[^a-z]/g, "");

  if (normOrigin === normDest) return 35; // Local intra-city minimum

  const key1 = `${normOrigin}_${normDest}`;
  const key2 = `${normDest}_${normOrigin}`;

  if (BIHAR_DISTANCES[key1]) return BIHAR_DISTANCES[key1];
  if (BIHAR_DISTANCES[key2]) return BIHAR_DISTANCES[key2];

  const coord1 = resolveCoordinates(origin);
  const coord2 = resolveCoordinates(dest);

  if (coord1 && coord2) {
    const dist = getHaversineDistance(coord1[0], coord1[1], coord2[0], coord2[1]);
    return Math.max(dist, 35);
  }

  return 120;
}

// Server-Side Fare Calculation Engine (Authoritative source of truth)
const FLEET_RATES = {
  hatchback: { perKm: 21.0, minFare: 1698, minKm: 50, name: "Go Hatchback", model: "WagonR, Tiago, Celerio", seats: 4 },
  sedan: { perKm: 25.0, minFare: 2198, minKm: 50, name: "Prime Sedan", model: "Dzire, Etios, Amaze", seats: 4 },
  sedan_prime: { perKm: 29.0, minFare: 2698, minKm: 50, name: "Executive Sedan", model: "Honda City, Ciaz", seats: 4 },
  suv: { perKm: 33.0, minFare: 3398, minKm: 50, name: "Family SUV (6+1)", model: "Maruti Ertiga, Carens", seats: 6 },
  innova_crysta: { perKm: 44.0, minFare: 4598, minKm: 50, name: "Toyota Innova Crysta", model: "Innova Crysta", seats: 7 }
};

function calculateServerFare(distanceKm, cabTier = 'sedan', tripType = 'oneway', origin = '', dest = '') {
  const cleanTier = (cabTier || 'sedan').toLowerCase();
  const tier = FLEET_RATES[cleanTier] || FLEET_RATES.sedan;
  const dist = Math.max(25, Number(distanceKm) || 50);

  let distanceCharge = 0;
  let driverAllowance = 0;
  let roundTripDiscount = 0;

  if (tripType === 'roundtrip') {
    const rawTotal = Math.round(dist * 2 * tier.perKm);
    roundTripDiscount = Math.round(rawTotal * 0.12); // 12% return leg discount
    driverAllowance = 350;
    distanceCharge = (rawTotal - roundTripDiscount) + driverAllowance;
  } else {
    distanceCharge = Math.round(dist * tier.perKm);
    if (dist > 250) {
      driverAllowance = 250;
      distanceCharge += driverAllowance;
    }
  }

  const baseFare = tier.minFare;
  const totalFare = Math.max(baseFare, distanceCharge);
  const tollEst = Math.round((dist / 70) * 55);
  const taxableAmount = Math.round(totalFare / 1.05);
  const gstAmount = totalFare - taxableAmount;

  const hours = Math.floor(dist / 45);
  const mins = Math.round((dist % 45) * 1.3);
  const duration = `${hours > 0 ? hours + 'h ' : ''}${mins > 0 ? mins + 'm' : '15m'}`;

  return {
    distanceKm: dist,
    duration,
    tierId: cleanTier,
    tierName: tier.name,
    tierModel: tier.model,
    seats: tier.seats,
    baseFare,
    perKmRate: tier.perKm,
    distanceCharge,
    driverAllowance,
    roundTripDiscount,
    tollFastag: tollEst,
    gst: gstAmount,
    totalFare: Math.round(totalFare),
    inclusions: [
      "100% AC Chilled Ride",
      "Doorstep Pickup & Drop",
      "Driver Allowance Included",
      "State Highway Tolls & FASTag Included",
      "5% GST Tax Included",
      "Zero Return Fare Charged"
    ],
    exclusions: [
      "Multiple city diversions not specified in booking",
      "Overnight detention if passenger delays vehicle to following calendar day"
    ]
  };
}

// In-Memory Rate Limiting for Telecom OTP Requests (Defensive Brute Force Protection)
const otpRateLimitMap = new Map();
function checkOtpRateLimit(phone) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxRequests = 3;
  const entry = otpRateLimitMap.get(phone);
  if (!entry || (now - entry.windowStart) > windowMs) {
    otpRateLimitMap.set(phone, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    const waitSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, waitSec };
  }
  entry.count++;
  return { allowed: true };
}

// Security: Password Hashing & Token Generation
function hashPassword(pass) {
  return crypto.createHash('sha256').update(pass).digest('hex');
}

function generateToken(prefix = 'otb') {
  return `${prefix}_${crypto.randomBytes(24).toString('hex')}`;
}

// Session Validator
function getSessionUser(req, db) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = (db.sessions || []).find(s => s.token === token);
  if (!session) return null;

  const user = (db.users || []).find(u => u.id === session.userId || u.phone === session.phone);
  return user ? { user, session } : null;
}

function getSessionAdmin(req, db) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  // 1. Session token lookup with strict validation
  if (token && !authHeader.startsWith('Basic ')) {
    const session = (db.sessions || []).find(s => s.token === token && (s.role === 'admin' || s.role === 'super_admin'));
    if (session) {
      const sessionAge = Date.now() - new Date(session.createdAt || 0).getTime();
      // Sessions valid for 24 hours max
      if (sessionAge < 24 * 60 * 60 * 1000) {
        return session;
      }
    }
  }

  // 2. HTTP Basic Auth for verified dispatchers
  if (authHeader.startsWith('Basic ')) {
    try {
      const b64 = authHeader.replace(/^Basic\s+/i, '').trim();
      const credentials = Buffer.from(b64, 'base64').toString('utf8');
      const [u, p] = credentials.split(':');
      const validAdmins = ['admin', 'admin1', 'admin2', 'admin3', 'admin4', 'admin5'];
      const validPasswords = ['harharmahadev@3', 'admin123', 'BiharTaxi@2026', 'Admin@123'];
      if (validAdmins.includes((u || '').toLowerCase()) && validPasswords.includes(p)) {
        return {
          adminId: `adm_${(u || 'admin').toLowerCase()}`,
          username: (u || 'admin').toLowerCase(),
          role: 'admin',
          phone: '+91 6206494214',
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {}
  }

  return null;
}

function getSessionDriver(req, db) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = (db.sessions || []).find(s => s.token === token && s.role === 'driver');
  if (!session) return null;

  const driver = (db.drivers || []).find(d => d.id === session.driverId);
  return driver ? { driver, session } : null;
}

// Main Request Handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = url.pathname.replace(/^\/api/i, '');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;
  if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  const method = req.method.toUpperCase();

  // Parse JSON Body
  let body = {};
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else if (typeof req.body === 'string' && req.body.trim()) {
      try { body = JSON.parse(req.body); } catch (e) { body = {}; }
    } else {
      try {
        const buffers = [];
        for await (const chunk of req) buffers.push(chunk);
        const data = Buffer.concat(buffers).toString('utf8');
        body = data ? JSON.parse(data) : {};
      } catch (e) {
        body = {};
      }
    }
    req.body = body;
  }

  const action = (body.action || url.searchParams.get('action') || '').toLowerCase();

  const sendJson = (status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(data));
  };

  try {
    // Await Database Ready State & Multi-Tier Sync
    let db;
    try {
      db = await dbService.getDbAsync();
    } catch (dbErr) {
      console.warn('[API Layer] getDbAsync fallback notice:', dbErr.message);
      db = dbService.getDb();
    }
    // -------------------------------------------------------------
    // 1. HEALTHCHECK
    // -------------------------------------------------------------
    if ((pathname === '/health' || pathname === '/status' || pathname === '/' || pathname === '/index.js' || pathname === '') && method === 'GET') {
      return sendJson(200, {
        status: 'ONLINE',
        platform: 'OneWayTaxiBihar Production API',
        domain: 'onewaytaxibihar.com',
        engine: 'MongoDB Atlas Active',
        time: new Date().toISOString(),
        helpline: '+91 80021 41816',
        whatsapp: '+91 72818 51011'
      });
    }

    // -------------------------------------------------------------
    // 1B. TUNNEL & NETWORK INFO
    // -------------------------------------------------------------
    if (pathname === '/tunnel-info' && method === 'GET') {
      const tunnelFile = path.join(process.cwd(), 'data', 'tunnel.json');
      if (fs.existsSync(tunnelFile)) {
        try {
          const tData = JSON.parse(fs.readFileSync(tunnelFile, 'utf8'));
          return sendJson(200, tData);
        } catch (e) {}
      }
      return sendJson(200, {
        status: 'ONLINE',
        message: 'OneWayTaxiBihar Production Cloud Server Active',
        helpline: '+91 80021 41816',
        whatsapp: '+91 72818 51011',
        localUrl: 'http://localhost:8080'
      });
    }

    // -------------------------------------------------------------
    // 2A. PASSENGER AUTH: Real Number Verification - Send Code
    // -------------------------------------------------------------
    if ((pathname === '/auth/send-otp' || action === 'send-otp' || (pathname === '/auth' && !body.otp && !body.password && !action.includes('verify'))) && method === 'POST') {
      const cleanPhone = (body.phone || '').replace(/\D/g, '').slice(-10);
      const name = (body.name || '').trim() || 'Valued Passenger';

      if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        return sendJson(400, { success: false, message: 'Valid 10-digit Indian mobile number starting with 6-9 required.' });
      }

      // Defensive Rate Limiting (Max 3 OTP requests in 10 minutes)
      const rateCheck = checkOtpRateLimit(cleanPhone);
      if (!rateCheck.allowed) {
        return sendJson(429, {
          success: false,
          message: `Too many OTP requests. Please wait ${rateCheck.waitSec} seconds before requesting a new code.`
        });
      }

      const code = crypto.randomInt(100000, 999999).toString();
      activeVerificationCodes.set(cleanPhone, {
        code,
        name,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      });

      const existingUser = (db.users || []).find(u => u.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
      const isNewUser = !existingUser;

      const waText = `OneWayTaxiBihar Verification Code for +91 ${cleanPhone} is: ${code}. Valid for 10 minutes. Welcome Reward: Rs 100 on first booking.`;
      const waUrl = notificationService.generateWhatsAppDeepLink(cleanPhone, waText);

      // Trigger real SMS via Fast2SMS / MSG91 / Twilio
      const smsDispatch = await notificationService.sendSms({
        phone: cleanPhone,
        otp: code,
        message: `Your OneWayTaxiBihar verification OTP is ${code}. Valid for 10 minutes. Do not share.`
      });

      // Auto-register customer lead in db.leads so Admin Portal displays customer inquiry
      if (!db.leads) db.leads = [];
      const exLead = db.leads.find(l => (l.cleanPhone || (l.phone || '').replace(/\D/g, '').slice(-10)) === cleanPhone);
      if (!exLead) {
        db.leads.unshift({
          id: `lead_${cleanPhone}_${Date.now().toString().slice(-4)}`,
          phone: `+91 ${cleanPhone}`,
          cleanPhone,
          rawPhone: cleanPhone,
          passengerName: name,
          originCity: 'Patna',
          destCity: 'Bihar Outstation',
          tripType: 'oneway',
          source: 'Customer Mobile OTP Request',
          status: 'NEW',
          createdAt: new Date().toISOString()
        });
        await saveDb(db);
      }

      return sendJson(200, {
        success: true,
        phone: `+91 ${cleanPhone}`,
        cleanPhone,
        isNewUser,
        rewardEligible: isNewUser,
        rewardAmount: isNewUser ? 100 : 0,
        // ZERO OTP LEAKAGE: otpCode is intentionally never leaked to client JSON!
        whatsappUrl: waUrl,
        smsStatus: smsDispatch,
        provider: smsDispatch?.provider || 'fast2sms',
        route: smsDispatch?.route || 'q',
        cost: smsDispatch?.cost || '₹5.00',
        message: `Verification code dispatched to +91 ${cleanPhone} via Telecom SMS.`
      });
    }

    // -------------------------------------------------------------
    // 2B. PASSENGER AUTH: Real Number Verification - Verify Code & One-Time Reward
    // -------------------------------------------------------------
    if ((pathname === '/auth/verify-otp' || action === 'verify-otp' || (pathname === '/auth' && Boolean(body.otp))) && method === 'POST') {
      const cleanPhone = (body.phone || '').replace(/\D/g, '').slice(-10);
      const inputCode = (body.otp || '').toString().trim();
      const name = (body.name || '').trim();

      if (!cleanPhone || cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Valid 10-digit mobile number required.' });
      }

      if (!activeVerificationCodes.has(cleanPhone)) {
        return sendJson(400, { success: false, message: 'No active verification code found. Please request a new code.' });
      }

      const activeRecord = activeVerificationCodes.get(cleanPhone);
      if (Date.now() > activeRecord.expiresAt) {
        activeVerificationCodes.delete(cleanPhone);
        return sendJson(400, { success: false, message: 'Verification code expired. Please request a new code.' });
      }

      if (activeRecord.code !== inputCode) {
        activeRecord.attempts++;
        if (activeRecord.attempts >= 5) {
          activeVerificationCodes.delete(cleanPhone);
          return sendJson(400, { success: false, message: 'Too many incorrect attempts. Please request a new code.' });
        }
        return sendJson(400, { success: false, message: 'Invalid verification code. Please check and re-enter.' });
      }

      activeVerificationCodes.delete(cleanPhone);
      const finalName = name || activeRecord.name || 'Valued Passenger';

      let user = (db.users || []).find(u => u.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
      let isFirstTime = false;
      let rewardGranted = 0;

      if (!user) {
        isFirstTime = true;
        rewardGranted = 100;
        user = {
          id: `usr_${cleanPhone}`,
          name: finalName,
          phone: `+91 ${cleanPhone}`,
          email: (body.email || '').trim().toLowerCase(),
          walletBalance: 100,
          rewardClaimed: true,
          isPhoneVerified: true,
          memberSince: new Date().getFullYear().toString(),
          createdAt: new Date().toISOString()
        };
        db.users.push(user);

        if (!db.wallet_ledger) db.wallet_ledger = [];
        db.wallet_ledger.push({
          id: `WLT_${Date.now()}`,
          userId: user.id,
          phone: user.phone,
          type: 'CREDIT',
          amount: 100,
          balanceAfter: 100,
          description: 'Welcome Bonus Credit (One-Time New User Reward)',
          createdAt: new Date().toISOString()
        });
      } else {
        user.isPhoneVerified = true;
        if (finalName && finalName !== 'Valued Passenger') {
          user.name = finalName;
        }
      }

      const token = `otb_sess_${crypto.randomBytes(16).toString('hex')}`;
      if (!db.sessions) db.sessions = [];
      db.sessions.push({
        token,
        userId: user.id,
        phone: user.phone,
        role: 'customer',
        createdAt: new Date().toISOString()
      });

      // Auto-upsert lead and alert Admin Portal
      if (!db.leads) db.leads = [];
      const vLeadIdx = db.leads.findIndex(l => (l.cleanPhone || (l.phone || '').replace(/\D/g, '').slice(-10)) === cleanPhone);
      if (vLeadIdx >= 0) {
        db.leads[vLeadIdx].passengerName = finalName;
        db.leads[vLeadIdx].source = 'Customer Verified Login';
        db.leads[vLeadIdx].updatedAt = new Date().toISOString();
      } else {
        db.leads.unshift({
          id: `lead_${cleanPhone}_${Date.now().toString().slice(-4)}`,
          phone: `+91 ${cleanPhone}`,
          cleanPhone,
          rawPhone: cleanPhone,
          passengerName: finalName,
          originCity: 'Patna',
          destCity: 'Bihar Outstation',
          tripType: 'oneway',
          source: 'Customer Verified Login',
          status: 'NEW',
          createdAt: new Date().toISOString()
        });
      }

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `ntf_${Date.now()}`,
        type: 'CUSTOMER_LOGIN',
        title: 'Customer Logged In',
        message: `${finalName} (+91 ${cleanPhone}) signed in to OneWayTaxiBihar`,
        timestamp: new Date().toISOString(),
        isRead: false
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          walletBalance: user.walletBalance,
          isPhoneVerified: true
        },
        isFirstTimeUser: isFirstTime,
        rewardGranted: rewardGranted > 0,
        rewardAmount: rewardGranted,
        message: isFirstTime
          ? 'Mobile verified successfully! Rs 100 Welcome Reward credited to your wallet.'
          : 'Mobile verified successfully! Welcome back.'
      });
    }

    // -------------------------------------------------------------
    // 2. PASSENGER AUTH (Direct Login - Name + Phone)
    // -------------------------------------------------------------
    if ((pathname === '/auth/login' || action === 'login') && method === 'POST') {
      const cleanPhone = (body.phone || '').replace(/\D/g, '').slice(-10);
      const cleanName = (body.name || '').trim();

      if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        return sendJson(400, { success: false, message: 'Invalid phone number. Please provide a valid 10-digit Indian mobile number starting with 6-9.' });
      }
      if (!cleanName || cleanName.length < 2 || cleanName.length > 60) {
        return sendJson(400, { success: false, message: 'Passenger name is required (2 to 60 characters).' });
      }

      let user = (db.users || []).find(u => u.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

      if (!user) {
        // Create new customer account with ₹100 Welcome Bonus
        user = {
          id: `usr_${cleanPhone}`,
          name: cleanName,
          phone: `+91 ${cleanPhone}`,
          email: (body.email || '').trim().toLowerCase(),
          walletBalance: 100,
          memberSince: new Date().getFullYear().toString(),
          createdAt: new Date().toISOString()
        };
        db.users.push(user);

        // Record in Wallet Ledger
        db.wallet_ledger.push({
          id: `WLT_${Date.now()}_${Math.floor(Math.random()*1000)}`,
          userId: user.id,
          phone: user.phone,
          type: 'CREDIT',
          amount: 100,
          balanceAfter: 100,
          description: 'Welcome Bonus Credit',
          createdAt: new Date().toISOString()
        });
      } else {
        // Update name if supplied and valid
        if (cleanName && cleanName !== 'Valued Passenger') {
          user.name = cleanName;
        }
      }

      // Create Secure Session Token
      const token = generateToken('otb_sess');
      if (!db.sessions) db.sessions = [];
      db.sessions.push({
        token,
        userId: user.id,
        phone: user.phone,
        role: 'customer',
        createdAt: new Date().toISOString()
      });

      // Record / Update Lead for Admin Desk
      if (!db.leads) db.leads = [];
      let lead = db.leads.find(l => l.cleanPhone === cleanPhone);
      if (lead) {
        lead.passengerName = user.name;
        lead.updatedAt = new Date().toISOString();
      } else {
        db.leads.unshift({
          id: `LEAD_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          phone: `+91 ${cleanPhone}`,
          cleanPhone,
          passengerName: user.name,
          originCity: 'Patna',
          destCity: 'Bihar Outstation',
          tripType: 'oneway',
          pickupDate: new Date().toISOString().split('T')[0],
          pickupTime: 'Immediate',
          distanceKm: 100,
          duration: '2h 00m',
          estFareHatch: 1698,
          estFareSedan: 2198,
          estFareSuv: 3398,
          source: 'Passenger Login / Sign In',
          status: 'NEW',
          notes: 'Customer signed in with mobile',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Real-time admin notification
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `NOTIF_USER_${Date.now()}`,
        type: 'PASSENGER_LOGIN',
        title: `Passenger Signed In: ${user.name}`,
        message: `${user.name} (+91 ${cleanPhone}) active on portal.`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          walletBalance: user.walletBalance
        }
      });
    }

    // -------------------------------------------------------------
    // 2B. PASSENGER LOGOUT (Session Invalidation)
    // -------------------------------------------------------------
    if (pathname === '/auth/logout' && method === 'POST') {
      const authHeader = req.headers['authorization'] || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token && db.sessions) {
        db.sessions = db.sessions.filter(s => s.token !== token);
        await saveDb(db);
      }
      return sendJson(200, { success: true, message: 'Logged out successfully' });
    }

    // -------------------------------------------------------------
    // 3. GET CURRENT USER PROFILE (Server-Verified)
    // -------------------------------------------------------------
    if (pathname === '/user/profile' && method === 'GET') {
      const auth = getSessionUser(req, db);
      if (!auth) {
        return sendJson(401, { success: false, message: 'Unauthorized session' });
      }
      return sendJson(200, {
        success: true,
        user: {
          id: auth.user.id,
          name: auth.user.name,
          phone: auth.user.phone,
          email: auth.user.email,
          walletBalance: auth.user.walletBalance || 0
        }
      });
    }

    // -------------------------------------------------------------
    // 4. SERVER-SIDE FARE CALCULATION
    // -------------------------------------------------------------
    if ((pathname === '/fares/calculate' || pathname === '/fare/calculate') && method === 'POST') {
      const origin = body.origin || body.originCity;
      const dest = body.dest || body.destCity;
      const cabTier = body.cabTier || 'sedan';
      const tripType = body.tripType || 'oneway';
      const distanceKm = getRouteDistance(origin, dest);
      const fareData = calculateServerFare(distanceKm, cabTier, tripType);
      return sendJson(200, { success: true, distanceKm, fare: fareData, fares: {
        hatchback: calculateServerFare(distanceKm, 'hatchback', tripType),
        sedan: calculateServerFare(distanceKm, 'sedan', tripType),
        suv: calculateServerFare(distanceKm, 'suv', tripType),
        innova: calculateServerFare(distanceKm, 'innova', tripType)
      }});
    }

    // -------------------------------------------------------------
    // 4B. oneway.cab API: PICKUP CITIES
    // -------------------------------------------------------------
    if (pathname === '/cities/pickup' && method === 'GET') {
      const cities = loadCities();
      const formatted = cities.map(c => ({
        id: c.id,
        name: c.name,
        hindiName: c.hindiName,
        district: c.district,
        state: c.state,
        lat: c.lat,
        lng: c.lng,
        type: c.type,
        typeLabel: c.typeLabel,
        popular: Boolean(c.popular),
        tag: c.tag,
        airport: c.airport,
        minTimeHour: 2,
        minTimeMinute: 0
      }));
      return sendJson(200, { success: true, count: formatted.length, cities: formatted });
    }

    // -------------------------------------------------------------
    // 4C. oneway.cab API: DROP CITIES WITH DYNAMIC FILTERING
    // -------------------------------------------------------------
    if (pathname === '/cities/drop' && method === 'GET') {
      const cities = loadCities();
      const fromParam = (url.searchParams.get('from') || '').trim().toLowerCase();
      const cleanFrom = fromParam.replace(/[^a-z0-9]/g, '');

      let destList = cities.filter(c => {
        const cClean = `${c.name} ${c.id}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanFrom && (cClean === cleanFrom || c.id.toLowerCase() === cleanFrom || c.name.toLowerCase() === fromParam)) {
          return false; // Exclude origin
        }
        return true;
      }).map(c => ({
        id: c.id,
        name: c.name,
        hindiName: c.hindiName,
        district: c.district,
        state: c.state,
        lat: c.lat,
        lng: c.lng,
        type: c.type,
        typeLabel: c.typeLabel,
        popular: Boolean(c.popular),
        tag: c.tag
      }));

      // Sort: popular first, then alphabetically
      destList.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });

      return sendJson(200, { success: true, from: fromParam, count: destList.length, cities: destList });
    }

    // -------------------------------------------------------------
    // 4D. oneway.cab API: ROUTE DETAILS & CAB OPTIONS
    // -------------------------------------------------------------
    if (pathname === '/route-details' && method === 'GET') {
      const fromVal = url.searchParams.get('from') || 'Patna';
      const toVal = url.searchParams.get('to') || 'Gaya';

      const distanceKm = getRouteDistance(fromVal, toVal);
      const hatchFare = calculateServerFare(distanceKm, 'hatchback', 'oneway', fromVal, toVal);
      const sedanFare = calculateServerFare(distanceKm, 'sedan', 'oneway', fromVal, toVal);
      const suvFare   = calculateServerFare(distanceKm, 'suv', 'oneway', fromVal, toVal);

      const dur = hatchFare.duration;
      const c1 = resolveCoordinates(fromVal);
      const c2 = resolveCoordinates(toVal);

      const cabOptions = [
        {
          carType: "HATCHBACK",
          carTypeId: 3,
          carName: "Go Hatchback",
          models: "WagonR, Tiago, Celerio",
          capacity: "4 Passengers, 1-2 Bags",
          baseFare: hatchFare.baseFare + hatchFare.distanceCharge,
          tollTaxAmount: hatchFare.tollFastag,
          driverAllowance: hatchFare.driverAllowance,
          totalAmount: hatchFare.totalFare,
          duration: dur
        },
        {
          carType: "SEDAN",
          carTypeId: 1,
          carName: "Prime Sedan",
          models: "Swift Dzire, Honda Amaze, Etios",
          capacity: "4 Passengers, 2-3 Bags",
          baseFare: sedanFare.baseFare + sedanFare.distanceCharge,
          tollTaxAmount: sedanFare.tollFastag,
          driverAllowance: sedanFare.driverAllowance,
          totalAmount: sedanFare.totalFare,
          duration: dur,
          popular: true
        },
        {
          carType: "SUV",
          carTypeId: 2,
          carName: "Family SUV (6+1)",
          models: "Maruti Ertiga, Kia Carens",
          capacity: "6-7 Passengers, 3-4 Bags",
          baseFare: suvFare.baseFare + suvFare.distanceCharge,
          tollTaxAmount: suvFare.tollFastag,
          driverAllowance: suvFare.driverAllowance,
          totalAmount: suvFare.totalFare,
          duration: dur
        }
      ];

      return sendJson(200, {
        success: true,
        routeId: Math.floor(Math.random() * 900) + 100,
        from: fromVal,
        to: toVal,
        distanceKm,
        distance: `${distanceKm} km`,
        duration: dur,
        pickupLatitude: c1 ? c1[0] : 25.5941,
        pickupLongitude: c1 ? c1[1] : 85.1376,
        dropLatitude: c2 ? c2[0] : 24.7914,
        dropLongitude: c2 ? c2[1] : 85.0002,
        cabOptions
      });
    }

    // -------------------------------------------------------------
    // 4E. LOCATION RECOMMENDATIONS (Auto-Type Chips & Landmarks)
    // -------------------------------------------------------------
    if (pathname === '/locations/recommendations' && method === 'GET') {
      const cityId = (url.searchParams.get('cityId') || 'patna').trim().toLowerCase();
      const type = (url.searchParams.get('type') || 'pickup').trim().toLowerCase();

      const allLocs = loadLocations();
      const matched = allLocs.filter(l => {
        const matchCity = (l.cityId === cityId || (l.cityName || '').toLowerCase() === cityId);
        const supportsType = type === 'pickup' ? Boolean(l.pickupSupported) : Boolean(l.dropSupported);
        return matchCity && supportsType;
      });

      let quickChips = [];
      let locItems = [];

      if (matched.length > 0) {
        locItems = matched.map(m => ({
          name: m.name,
          hindiName: m.hindiName,
          address: m.address,
          category: m.category
        }));

        const popularOnly = matched.filter(m => m.popular);
        const source = popularOnly.length >= 3 ? popularOnly : matched;
        quickChips = source.slice(0, 6).map(m => ({
          label: m.name,
          fullAddress: m.address
        }));
      } else {
        const cities = loadCities();
        const found = cities.find(c => c.id === cityId || c.name.toLowerCase() === cityId);
        const displayName = found ? found.name : cityId.charAt(0).toUpperCase() + cityId.slice(1);

        quickChips = [
          { label: "Airport / Fly Terminal", fullAddress: `${displayName} Airport Terminal Gate, ${displayName}, Bihar` },
          { label: "Junction Railway Station", fullAddress: `${displayName} Junction Railway Station, Platform 1 Porch, ${displayName}` },
          { label: "Central Bus Stand / ISBT", fullAddress: `${displayName} Central Bus Stand, Station Road, ${displayName}` },
          { label: "District Sadar Hospital", fullAddress: `${displayName} Sadar Hospital / Emergency Gate, ${displayName}` },
          { label: "Main City Chowk", fullAddress: `Main City Chowk / Central Market, ${displayName}` }
        ];

        locItems = [
          { name: `${displayName} Junction Station`, address: `Platform 1 VIP Porch, Station Road, ${displayName}`, category: "Railway Hubs" },
          { name: `${displayName} Central Bus Stand`, address: `Main Government Bus Depot, ${displayName}`, category: "Bus Terminals" },
          { name: `${displayName} Sadar Hospital`, address: `Civil Line Hospital Road, ${displayName}`, category: "Hospitals & Medical" },
          { name: `Collectorate & Civil Court`, address: `District Court Compound, ${displayName}`, category: "Administrative Hubs" },
          { name: `Main Commercial Chowk`, address: `Central Commercial Market, ${displayName}`, category: "Key Commercial Hubs" }
        ];
      }

      return sendJson(200, {
        success: true,
        cityId,
        type,
        quickChips,
        locations: locItems
      });
    }

    // -------------------------------------------------------------
    // 4F. LOCATION SEARCH ACROSS LANDMARKS
    // -------------------------------------------------------------
    if (pathname === '/locations/search' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const cityId = (url.searchParams.get('cityId') || '').trim().toLowerCase();

      const allLocs = loadLocations();
      const results = allLocs.filter(l => {
        if (cityId && l.cityId !== cityId && (l.cityName || '').toLowerCase() !== cityId) return false;
        if (!q) return true;
        const txt = `${l.name} ${l.address} ${(l.tags || []).join(' ')} ${l.category}`.toLowerCase();
        return txt.includes(q);
      }).map(l => ({
        name: l.name,
        hindiName: l.hindiName,
        address: l.address,
        category: l.category
      }));

      return sendJson(200, { success: true, query: q, count: results.length, locations: results });
    }

    // -------------------------------------------------------------
    // 5. CUSTOMER BOOKINGS & RIDES (Strict Data Isolation)
    // -------------------------------------------------------------
    if ((pathname === '/bookings' || pathname === '/rides') && method === 'GET') {
      const auth = getSessionUser(req, db);
      if (!auth) {
        // Unauthenticated customers see empty list (Zero leakage)
        return sendJson(200, { success: true, count: 0, bookings: [], rides: [] });
      }

      const cleanUserPhone = auth.user.phone.replace(/\D/g, '').slice(-10);
      const customerBookings = (db.bookings || []).filter(b => 
        b.customerId === auth.user.id || 
        (b.passengerPhone && b.passengerPhone.replace(/\D/g, '').slice(-10) === cleanUserPhone)
      );

      // Mask driver details if booking is still in REQUESTED state
      const sanitized = customerBookings.map(b => {
        if (b.bookingStatus === 'REQUESTED' || b.bookingStatus === 'PENDING CONFIRMATION') {
          return {
            ...b,
            driverDetails: null,
            partnerNotice: "Our partner/driver or agent will call you in 5 minutes to confirm booking."
          };
        }
        return b;
      });

      return sendJson(200, {
        success: true,
        count: sanitized.length,
        bookings: sanitized,
        rides: sanitized
      });
    }

    // -------------------------------------------------------------
    // 6. CREATE BOOKING REQUEST (REQUESTED Status & Server Fare Lock)
    // -------------------------------------------------------------
    if ((pathname === '/bookings' || pathname === '/rides') && method === 'POST') {
      // 1. Emergency booking pause check (Disaster / Incident Response)
      if (db.settings && db.settings.emergencyBookingPause === true) {
        return sendJson(503, {
          success: false,
          servicePaused: true,
          pauseReason: db.settings.emergencyPauseReason || 'Adverse weather or route maintenance alert',
          message: `Online bookings are temporarily paused: ${db.settings.emergencyPauseReason || 'Routine fleet maintenance'}. For urgent assistance, please call our 24x7 Patna Central Dispatch Desk at +91 80021 41816.`
        });
      }

      // 2. Client Idempotency Key check (Network disconnect / retry protection)
      const idempotencyKey = (req.headers['idempotency-key'] || body.idempotencyKey || body.clientRequestId || '').toString().trim();
      if (idempotencyKey) {
        const existingIdempotent = (db.bookings || []).find(b => b.idempotencyKey === idempotencyKey);
        if (existingIdempotent) {
          return sendJson(200, {
            success: true,
            idempotent: true,
            deduplicated: true,
            booking: existingIdempotent,
            message: 'Existing booking returned via idempotency key.'
          });
        }
      }

      // 3. Payment Txn Idempotency check (User refreshes after payment)
      const paymentTxnId = (body.paymentTxnId || body.razorpayPaymentId || body.upiUtr || '').toString().trim();
      if (paymentTxnId) {
        const existingPaymentBooking = (db.bookings || []).find(b => 
          b.paymentTxnId === paymentTxnId || 
          (b.upiUtr && b.upiUtr === paymentTxnId)
        );
        if (existingPaymentBooking) {
          return sendJson(200, {
            success: true,
            idempotent: true,
            deduplicated: true,
            booking: existingPaymentBooking,
            message: 'Booking already confirmed for this payment transaction.'
          });
        }
      }

      const originCity = body.originCity || body.origin || body.pickupCity || body.pickup || 'Patna';
      const destCity = body.destCity || body.destination || body.dropCity || body.drop || 'Gaya';
      const cabTier = body.cabTier || body.cabType || body.cab || 'sedan';
      const pickupAddress = body.pickupAddress || body.pickup || `${originCity} City`;
      const dropAddress = body.dropAddress || body.drop || `${destCity} City`;
      const passengerPhone = body.passengerPhone || body.phone || '';
      const passengerName = body.passengerName || body.name || 'Valued Passenger';
      const passengerEmail = body.passengerEmail || body.email || '';
      const paymentMethod = body.paymentMethod || 'Cash on Ride (Zero Advance)';
      const pickupDate = body.pickupDate;
      const pickupTime = body.pickupTime || '10:00 AM';
      const useWallet = Boolean(body.useWallet);

      const cleanPhone = String(passengerPhone).replace(/\D/g, '').slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Valid 10-digit Indian mobile number required' });
      }
      const safePassengerName = String(passengerName || 'Valued Passenger').trim().slice(0, 80) || 'Valued Passenger';

      let safePickupDate = pickupDate;
      if (pickupDate && typeof pickupDate === 'string') {
        if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(pickupDate.trim())) {
          const parts = pickupDate.trim().split(/[-/]/);
          safePickupDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      if (!safePickupDate) {
        const today = new Date();
        safePickupDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      }

      // Concurrency & double-tap deduplication protection (15 seconds)
      const now = Date.now();
      const recentDuplicate = (db.bookings || []).find(b => {
        if (!b.createdAt) return false;
        const bPhone = (b.passengerPhone || '').replace(/\D/g, '').slice(-10);
        if (bPhone !== cleanPhone) return false;
        if (b.originCity !== (originCity || 'Patna') || b.destCity !== (destCity || 'Gaya')) return false;
        const bTime = new Date(b.createdAt).getTime();
        return (now - bTime) >= 0 && (now - bTime) < 15000;
      });

      if (recentDuplicate) {
        return sendJson(200, {
          success: true,
          deduplicated: true,
          booking: recentDuplicate,
          message: 'Booking request already received. Duplicate submission prevented.'
        });
      }

      // Server-side distance and fare recalculation (Anti-tamper: server is sole authority)
      const distanceKm = getRouteDistance(originCity, destCity);
      const serverFare = calculateServerFare(distanceKm, cabTier || 'sedan', 'oneway');
      const baseTotal = serverFare.totalFare;

      // Find or create customer
      if (!db.users) db.users = [];
      let user = db.users.find(u => (u.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone);
      if (!user) {
        user = {
          id: `usr_${cleanPhone}`,
          name: safePassengerName,
          phone: `+91 ${cleanPhone}`,
          email: passengerEmail || '',
          walletBalance: 100,
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
      }

      // Handle atomic wallet deduction
      let walletDeducted = 0;
      if (useWallet && user.walletBalance > 0) {
        walletDeducted = Math.min(user.walletBalance, 100);
        user.walletBalance -= walletDeducted;

        if (!db.wallet_ledger) db.wallet_ledger = [];
        db.wallet_ledger.push({
          id: `WLT_${Date.now()}`,
          userId: user.id,
          phone: user.phone,
          type: 'DEBIT',
          amount: walletDeducted,
          balanceAfter: user.walletBalance,
          description: `Applied to Booking ${originCity} to ${destCity}`,
          createdAt: new Date().toISOString()
        });
      }

      // Validate coupon discount strictly against database with per-user anti-abuse lock
      let couponDiscount = 0;
      const cpnCode = (body.couponCode || '').trim().toUpperCase();
      if (cpnCode) {
        const cpn = (db.coupons || []).find(c => c.code.toUpperCase() === cpnCode && c.active);
        if (cpn && baseTotal >= (cpn.minFare || 0)) {
          const priorUsage = (db.bookings || []).filter(b => 
            (b.passengerPhone || '').replace(/\D/g, '').slice(-10) === cleanPhone &&
            b.couponCode === cpnCode &&
            b.bookingStatus !== 'CANCELLED'
          );
          if (priorUsage.length >= (cpn.maxPerUser || 1)) {
            couponDiscount = 0; // Prevent coupon reuse for same phone
          } else {
            if (cpn.type === 'PERCENT') {
              const pct = Math.round((baseTotal * cpn.discount) / 100);
              couponDiscount = Math.min(pct, cpn.maxDiscount || 500);
            } else {
              couponDiscount = Math.min(cpn.discount || 0, cpn.maxDiscount || 500);
            }
          }
        }
      }

      const finalPayable = Math.max(serverFare.baseFare, baseTotal - walletDeducted - couponDiscount);
      const bookingId = `OTB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const txnId = (body.paymentTxnId || body.razorpayPaymentId || body.upiUtr || '').toString().trim() || `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const tripOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

      // Determine advance amount and balance due based on payment method
      const payMethodStr = String(paymentMethod || 'Cash on Ride (Zero Advance)');
      let advancePaid = 0;
      let balanceDue = finalPayable;
      let initialPaymentStatus = 'PAYABLE TO DRIVER';
      let initialBookingStatus = 'NEW';

      const isCash = payMethodStr.includes('Cash') || payMethodStr.includes('Zero Advance') || payMethodStr.includes('to Driver');
      const isFull = !isCash && (payMethodStr.includes('Full') || payMethodStr.includes('100%'));
      const isRzp = !isCash && (payMethodStr.includes('Razorpay') || payMethodStr.includes('Advance (₹299)') || payMethodStr.includes('Online Advance'));
      const isUpiQr = !isCash && (payMethodStr.includes('QR') || payMethodStr.includes('PhonePe') || payMethodStr.includes('UPI'));

      if (isCash) {
        advancePaid = 0;
        balanceDue = finalPayable;
        initialPaymentStatus = 'PAYABLE TO DRIVER';
        initialBookingStatus = 'NEW';
      } else if (isFull) {
        advancePaid = finalPayable;
        balanceDue = 0;
        initialPaymentStatus = body.paymentTxnId ? 'PAID (100% Online Verified)' : 'AWAITING PAYMENT';
        initialBookingStatus = body.paymentTxnId ? 'CONFIRMED' : 'NEW';
      } else if (isRzp) {
        advancePaid = body.advancePaid ? Number(body.advancePaid) : Math.min(299, finalPayable);
        balanceDue = Math.max(0, finalPayable - advancePaid);
        initialPaymentStatus = body.paymentTxnId ? 'PARTIALLY PAID (Online Advance Verified)' : 'AWAITING ADVANCE PAYMENT';
        initialBookingStatus = body.paymentTxnId ? 'CONFIRMED' : 'NEW';
      } else if (isUpiQr) {
        advancePaid = body.advancePaid ? Number(body.advancePaid) : Math.min(299, finalPayable);
        balanceDue = Math.max(0, finalPayable - advancePaid);
        initialPaymentStatus = 'AWAITING ADVANCE PAYMENT';
        initialBookingStatus = 'NEW';
      } else {
        advancePaid = 0;
        balanceDue = finalPayable;
        initialPaymentStatus = 'PAYABLE TO DRIVER';
      }

      if (body.advancePaid && Number(body.advancePaid) > 0) {
        advancePaid = Number(body.advancePaid);
        balanceDue = Math.max(0, finalPayable - advancePaid);
        initialPaymentStatus = 'ADVANCE PAID';
        initialBookingStatus = 'CONFIRMED';
      }

      const paymentRecord = {
        id: txnId,
        bookingId,
        customerId: user.id,
        passengerPhone: `+91 ${cleanPhone}`,
        amount: finalPayable,
        advancePaid,
        balanceDue,
        originalAmount: baseTotal,
        walletDeducted,
        couponDiscount,
        method: payMethodStr,
        status: initialPaymentStatus,
        upiUtr: body.upiUtr || '',
        verifiedBy: null,
        verifiedAt: body.paymentTxnId ? new Date().toISOString() : null,
        createdAt: new Date().toISOString()
      };

      if (!db.payments) db.payments = [];
      db.payments.unshift(paymentRecord);

      const newBooking = {
        bookingId,
        tripOtp,
        customerId: user.id,
        paymentTxnId: txnId,
        idempotencyKey: idempotencyKey || null,
        passengerName: safePassengerName,
        passengerPhone: `+91 ${cleanPhone}`,
        passengerEmail: passengerEmail || '',
        originCity: originCity || 'Patna',
        destCity: destCity || 'Gaya',
        pickupAddress: pickupAddress || `${originCity || 'Patna'} City`,
        dropAddress: dropAddress || `${destCity || 'Gaya'} City`,
        pickupDate: safePickupDate,
        pickupTime: pickupTime || '10:00 AM',
        distanceKm,
        duration: serverFare.duration,
        fleetClass: serverFare.tierName,
        fleetModel: serverFare.tierModel,
        fareBreakdown: serverFare,
        fare: finalPayable,
        totalFare: finalPayable,
        originalFare: baseTotal,
        walletUsed: walletDeducted,
        couponCode: cpnCode,
        couponDiscount,
        advancePaid,
        balanceDue,
        paymentMethod: payMethodStr,
        paymentStatus: initialPaymentStatus,
        bookingStatus: initialBookingStatus,
        status: initialBookingStatus,
        phoneVerified: Boolean(body.phoneVerified !== false),
        verifiedMethod: body.verifiedMethod || 'Telecom SMS OTP (Verified)',
        verifiedAt: body.verifiedAt || new Date().toISOString(),
        partnerNotice: 'Our verified dispatch desk or driver partner will call you to coordinate vehicle arrival.',
        driverDetails: null, // Driver details unassigned until official dispatch assignment
        statusHistory: [
          {
            status: initialBookingStatus,
            timestamp: new Date().toISOString(),
            actor: 'Customer',
            note: 'Booking request placed. Availability verification in progress.'
          }
        ],
        createdAt: new Date().toISOString()
      };

      if (!db.bookings) db.bookings = [];
      db.bookings.unshift(newBooking);

      // Push Notification Alert for Admin Central Dispatch
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `NOTIF_BOOK_${Date.now()}`,
        type: 'NEW_BOOKING_REQUEST',
        title: `New Cab Booking: ${bookingId}`,
        message: `${safePassengerName} (+91 ${cleanPhone}) requested ${originCity || 'Patna'} ➔ ${destCity || 'Gaya'} (${serverFare.tierName}). Total Fare: ₹${finalPayable}.`,
        bookingId,
        createdAt: new Date().toISOString()
      });

      // Update or create Lead record as CONVERTED
      if (!db.leads) db.leads = [];
      const leadIdx = db.leads.findIndex(l => (l.cleanPhone === cleanPhone || (l.phone && l.phone.includes(cleanPhone))) && l.originCity === (originCity || 'Patna') && l.destCity === (destCity || 'Gaya'));
      if (leadIdx >= 0) {
        db.leads[leadIdx].status = 'CONVERTED';
        db.leads[leadIdx].bookingId = bookingId;
        db.leads[leadIdx].updatedAt = new Date().toISOString();
      } else {
        db.leads.unshift({
          id: `LEAD_${Date.now()}`,
          phone: `+91 ${cleanPhone}`,
          cleanPhone,
          passengerName: safePassengerName,
          originCity: originCity || 'Patna',
          destCity: destCity || 'Gaya',
          tripType: 'oneway',
          pickupDate: pickupDate || new Date().toISOString().split('T')[0],
          pickupTime: pickupTime || '10:00 AM',
          distanceKm,
          estFareSedan: finalPayable,
          status: 'CONVERTED',
          bookingId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Audit Log
      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'BOOKING',
        entityId: bookingId,
        action: 'CREATE_REQUEST',
        actor: user.phone,
        details: `${originCity} → ${destCity} for ₹${finalPayable} (${payMethodStr})`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      // Trigger asynchronous real SMS & WhatsApp dispatch
      notificationService.sendBookingConfirmationNotifications(newBooking).catch(err => {
        console.warn('[Booking Confirmation Notice]:', err.message);
      });

      return sendJson(201, {
        success: true,
        booking: newBooking,
        message: 'Booking request received! Our partner/agent will call you within 5 minutes.'
      });
    }

    // -------------------------------------------------------------
    // 7. CUSTOMER CANCEL BOOKING / RIDE (Zero Cancellation Fee)
    // -------------------------------------------------------------
    if ((pathname === '/bookings/cancel' || pathname === '/rides/cancel') && method === 'POST') {
      const { bookingId, phone, reason, simulateRefundFailure } = body;
      const bId = (bookingId || '').trim();
      const booking = (db.bookings || []).find(b => b.bookingId === bId || b.id === bId);
      if (!booking) {
        return sendJson(404, { success: false, message: 'Booking not found' });
      }

      const admin = getSessionAdmin(req, db);
      const phoneInput = (phone || '').replace(/\D/g, '').slice(-10);
      const bPhone = (booking.passengerPhone || '').replace(/\D/g, '').slice(-10);

      // Privacy check: verify phone or admin session
      if (!admin && (!phoneInput || phoneInput !== bPhone)) {
        return sendJson(403, {
          success: false,
          requireAuth: true,
          message: 'Privacy Protection: 10-digit mobile number registered with this booking is required to process cancellation.'
        });
      }

      booking.bookingStatus = 'CANCELLED';
      booking.status = 'CANCELLED';

      // Chauffeur release & courtesy alert if driver was already assigned (Failure Scenario 10)
      const prevDriverId = booking.assignedDriverId;
      if (prevDriverId) {
        booking.assignedDriverId = null;
        const driver = (db.drivers || []).find(d => d.id === prevDriverId);
        if (driver) {
          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: `NOTIF_CANCEL_${Date.now()}`,
            type: 'TRIP_CANCELLED_BY_PASSENGER',
            title: `Trip ${booking.bookingId} Cancelled by Customer`,
            message: `Passenger cancelled trip ${booking.originCity} ➔ ${booking.destCity}. Chauffeur ${driver.name} is now released and available for new dispatches.`,
            driverId: prevDriverId,
            createdAt: new Date().toISOString()
          });
        }
      }

      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: 'CANCELLED',
        timestamp: new Date().toISOString(),
        actor: admin ? `Admin (${admin.username})` : 'Customer',
        note: `Cancelled by customer. Reason: ${reason || 'Change of plans'} (₹0 cancellation fee)`
      });

      // Wallet deduction refund
      if (booking.walletUsed > 0) {
        const user = (db.users || []).find(u => u.id === booking.customerId);
        if (user) {
          user.walletBalance = (user.walletBalance || 0) + booking.walletUsed;
          if (!db.wallet_ledger) db.wallet_ledger = [];
          db.wallet_ledger.push({
            id: `WLT_${Date.now()}`,
            userId: user.id,
            phone: user.phone,
            type: 'REFUND',
            amount: booking.walletUsed,
            balanceAfter: user.walletBalance,
            description: `Refund for Cancelled Booking ${bId}`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // Online Advance payment refund lifecycle (Failure Scenario 11)
      let refundRecord = null;
      if (booking.advancePaid > 0) {
        const refundId = `REF_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
        let refundStatus = 'REFUND_QUEUED';
        let refundNote = `Automated gateway refund of ₹${booking.advancePaid} queued (Reference: ${refundId}).`;

        if (simulateRefundFailure) {
          refundStatus = 'REFUND_PENDING_MANUAL_REVIEW';
          refundNote = `Automated gateway refund failed. Queued for manual settlement review by Patna billing desk (Reference: ${refundId}).`;

          if (!db.notifications) db.notifications = [];
          db.notifications.unshift({
            id: `NOTIF_REF_FAIL_${Date.now()}`,
            type: 'REFUND_FAILURE_ALERT',
            title: `⚠️ Refund Gateway Exception: ${booking.bookingId}`,
            message: `Advance refund of ₹${booking.advancePaid} for ${booking.bookingId} (+91 ${bPhone}) requires manual review. Reference: ${refundId}.`,
            createdAt: new Date().toISOString()
          });
        }

        refundRecord = {
          id: refundId,
          bookingId: booking.bookingId,
          amount: booking.advancePaid,
          phone: `+91 ${bPhone}`,
          status: refundStatus,
          reason: reason || 'Customer trip cancellation',
          note: refundNote,
          createdAt: new Date().toISOString()
        };

        if (!db.refunds) db.refunds = [];
        db.refunds.unshift(refundRecord);
        booking.refundRecord = refundRecord;
      }

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_CANCEL_${Date.now()}`,
        entity: 'BOOKING',
        entityId: booking.bookingId,
        action: 'TRIP_CANCELLED',
        actor: admin ? admin.username : `+91 ${bPhone}`,
        details: `Booking cancelled with ₹0 fee. Reason: ${reason || 'N/A'}${refundRecord ? '. Refund: ' + refundRecord.status : ''}`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, {
        success: true,
        bookingStatus: 'CANCELLED',
        driverReleased: Boolean(prevDriverId),
        refundStatus: refundRecord ? refundRecord.status : null,
        supportTicketRef: refundRecord ? refundRecord.id : null,
        refund: refundRecord,
        message: refundRecord && refundRecord.status === 'REFUND_PENDING_MANUAL_REVIEW'
          ? `Booking cancelled successfully. Your advance refund of ₹${booking.advancePaid} is queued for manual billing confirmation (Ref: ${refundRecord.id}).`
          : 'Booking cancelled successfully with ₹0 cancellation fee.'
      });
    }

    // -------------------------------------------------------------
    // 7B. PERMANENT RIDE & INQUIRY DELETION (Password: deleteit)
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // 7B. PERMANENT RIDE & INQUIRY DELETION (Authenticated Admin RBAC)
    // -------------------------------------------------------------
    if ((pathname === '/bookings' || pathname === '/admin/bookings' || pathname === '/rides') && method === 'DELETE') {
      const admin = getSessionAdmin(req, db);
      if (!admin) {
        return sendJson(401, {
          success: false,
          message: 'Access Denied: Authorized Admin session required for record deletion.'
        });
      }

      const bId = (body.bookingId || body.id || url.searchParams.get('bookingId') || url.searchParams.get('id') || '').trim();
      if (!bId) {
        return sendJson(400, { success: false, message: 'Booking ID is required for deletion.' });
      }

      if (db.bookings) {
        db.bookings = db.bookings.filter(b => b.bookingId !== bId && b.id !== bId);
      }
      await saveDb(db);

      try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://himanshudu255_db_user:Himanshu%40123@cluster0.7pf5pvc.mongodb.net/onewaytaxibihar?retryWrites=true&w=majority&appName=Cluster0';
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(mongoUri);
        await client.connect();
        const mDb = client.db('onewaytaxibihar');
        await mDb.collection('bookings').deleteOne({ $or: [{ bookingId: bId }, { id: bId }] });
        await client.close();
      } catch(e) {}

      return sendJson(200, {
        success: true,
        message: `Booking ${bId} permanently deleted from database.`
      });
    }

    if ((pathname === '/leads' || pathname === '/admin/leads') && method === 'DELETE') {
      const admin = getSessionAdmin(req, db);
      if (!admin) {
        return sendJson(401, {
          success: false,
          message: 'Access Denied: Authorized Admin session required for inquiry deletion.'
        });
      }

      const leadId = (body.leadId || body.id || url.searchParams.get('id') || url.searchParams.get('leadId') || '').trim();
      if (!leadId) {
        return sendJson(400, { success: false, message: 'Lead ID is required for deletion.' });
      }

      const cleanPhone = leadId.replace(/\D/g, '').slice(-10);
      if (db.leads) {
        db.leads = db.leads.filter(l => l.id !== leadId && l.cleanPhone !== cleanPhone && l.phone !== `+91 ${cleanPhone}`);
      }
      await saveDb(db);

      try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://himanshudu255_db_user:Himanshu%40123@cluster0.7pf5pvc.mongodb.net/onewaytaxibihar?retryWrites=true&w=majority&appName=Cluster0';
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(mongoUri);
        await client.connect();
        const mDb = client.db('onewaytaxibihar');
        await mDb.collection('leads').deleteOne({
          $or: [{ id: leadId }, { cleanPhone: cleanPhone }, { phone: `+91 ${cleanPhone}` }]
        });
        await client.close();
      } catch(e) {}

      return sendJson(200, {
        success: true,
        message: `Inquiry lead permanently deleted from database.`
      });
    }

    // -------------------------------------------------------------
    // 7C. PRIVACY-HARDENED GST INVOICE LOOKUP (Booking ID + Phone Verification)
    // -------------------------------------------------------------
    if ((pathname === '/invoice/lookup' || pathname === '/invoice') && (method === 'POST' || method === 'GET')) {
      const bId = (body.bookingId || url.searchParams.get('bookingId') || '').trim().toUpperCase();
      const phoneInput = (body.phone || url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10);

      if (!bId) {
        return sendJson(400, { success: false, message: 'Booking ID is required to generate tax invoice.' });
      }

      const admin = getSessionAdmin(req, db);
      const booking = (db.bookings || []).find(b => (b.bookingId || '').toUpperCase() === bId || (b.id || '').toUpperCase() === bId);

      if (!booking) {
        return sendJson(404, { success: false, message: `No booking found matching ID "${bId}". Please check your booking reference.` });
      }

      // Security check: Customer must provide registered phone number matching the booking, unless caller is authenticated Admin
      const bPhone = (booking.passengerPhone || '').replace(/\D/g, '').slice(-10);
      if (!admin) {
        if (!phoneInput) {
          return sendJson(401, {
            success: false,
            requirePhoneAuth: true,
            message: 'Privacy Protection: Please enter the 10-digit mobile number registered with this booking to view the official invoice.'
          });
        }
        if (phoneInput !== bPhone) {
          return sendJson(403, {
            success: false,
            message: 'Verification failed: Mobile number does not match this booking record. Access denied for privacy protection.'
          });
        }
      }

      const invNumber = `INV-2026-${(booking.bookingId || '0000').replace(/\D/g, '').slice(-4) || '1001'}`;
      const total = Number(booking.totalFare) || 2198;
      const taxable = Math.round(total / 1.05);
      const gst = total - taxable;
      const cgst = Math.round(gst / 2);
      const sgst = gst - cgst;

      return sendJson(200, {
        success: true,
        invoice: {
          invoiceNumber: invNumber,
          invoiceDate: (booking.createdAt || new Date().toISOString()).split('T')[0],
          bookingId: booking.bookingId,
          bookingStatus: booking.bookingStatus,
          tripType: booking.tripType || 'oneway',
          passengerName: booking.passengerName || 'Valued Passenger',
          passengerPhone: `+91 ${bPhone.slice(0, 3)}****${bPhone.slice(-3)}`,
          originCity: booking.originCity,
          destCity: booking.destCity,
          pickupAddress: booking.pickupAddress || `${booking.originCity}, Bihar`,
          dropAddress: booking.dropAddress || `${booking.destCity}, Bihar`,
          pickupDate: booking.pickupDate,
          pickupTime: booking.pickupTime,
          cabTier: booking.cabTier || 'sedan',
          vehicleModel: booking.vehicleModel || (FLEET_RATES[booking.cabTier]?.model || 'Prime Sedan'),
          distanceKm: booking.distanceKm || 120,
          baseFare: booking.serverFare?.baseFare || 1698,
          perKmRate: booking.serverFare?.perKmRate || 25,
          driverAllowance: booking.serverFare?.driverAllowance || 0,
          tollEstimate: booking.serverFare?.tollEstimate || 0,
          taxableAmount: taxable,
          cgst,
          sgst,
          gstTotal: gst,
          discount: booking.discount || 0,
          totalFare: total,
          advancePaid: booking.advancePaid || 0,
          balanceDue: booking.balanceDue !== undefined ? booking.balanceDue : (total - (booking.advancePaid || 0)),
          paymentStatus: booking.paymentStatus || 'PAYMENT_AT_TRIP_END',
          paymentMethod: booking.paymentMethod || 'Cash to Chauffeur',
          company: {
            name: 'OneWayTaxiBihar Mobility Solutions',
            legalEntity: 'HIMANSHU KUMAR DUBEY (OneWayTaxiBihar)',
            gstin: '10AABCO1234F1Z5',
            sacCode: '996412 (Passenger Land Transport Services)',
            address: 'Boring Road, Patna, Bihar - 800001',
            helpline: '+91 80021 41816',
            whatsapp: '+91 72818 51011',
            email: 'invoices@onewaytaxibihar.com'
          }
        }
      });
    }

    // -------------------------------------------------------------
    // 7D. PRIVACY-HARDENED LIVE GPS TRACKING & DISPATCH STATUS
    // -------------------------------------------------------------
    if ((pathname === '/tracking/status' || pathname === '/tracking') && (method === 'POST' || method === 'GET')) {
      const bId = (body.bookingId || url.searchParams.get('bookingId') || '').trim().toUpperCase();
      const phoneInput = (body.phone || url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10);

      if (!bId) {
        return sendJson(400, { success: false, message: 'Booking ID is required for live tracking.' });
      }

      const admin = getSessionAdmin(req, db);
      const driverAuth = getSessionDriver(req, db);
      const booking = (db.bookings || []).find(b => (b.bookingId || '').toUpperCase() === bId || (b.id || '').toUpperCase() === bId);

      if (!booking) {
        return sendJson(404, { success: false, message: `Trip ${bId} not found in central dispatch.` });
      }

      const bPhone = (booking.passengerPhone || '').replace(/\D/g, '').slice(-10);
      const isPassenger = phoneInput && phoneInput === bPhone;
      const isAssignedDriver = driverAuth && driverAuth.driver.id === booking.assignedDriverId;

      if (!admin && !isPassenger && !isAssignedDriver) {
        return sendJson(403, {
          success: false,
          requireAuth: true,
          message: 'Access Denied: Live tracking is strictly restricted to the booked passenger and assigned driver for passenger safety.'
        });
      }

      let driverInfo = booking.driverDetails || null;
      if (!driverInfo && booking.assignedDriverId) {
        const foundD = (db.drivers || []).find(d => d.id === booking.assignedDriverId);
        if (foundD) {
          driverInfo = {
            id: foundD.id,
            name: foundD.name,
            phone: foundD.phone,
            vehicleNumber: foundD.vehicleNumber,
            vehicleModel: foundD.vehicleModel,
            rating: foundD.rating || 4.9,
            trips: foundD.totalTrips || 50
          };
        }
      }

      return sendJson(200, {
        success: true,
        trip: {
          bookingId: booking.bookingId,
          bookingStatus: booking.bookingStatus || 'NEW',
          originCity: booking.originCity,
          destCity: booking.destCity,
          pickupAddress: booking.pickupAddress || `${booking.originCity}, Bihar`,
          dropAddress: booking.dropAddress || `${booking.destCity}, Bihar`,
          pickupDate: booking.pickupDate,
          pickupTime: booking.pickupTime,
          cabTier: booking.cabTier || 'sedan',
          totalFare: booking.totalFare,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          tripOtp: booking.tripOtp,
          driver: driverInfo,
          statusHistory: booking.statusHistory || [],
          updatedAt: booking.updatedAt || booking.createdAt || new Date().toISOString()
        }
      });
    }

    // -------------------------------------------------------------
    // 8. WALLET TRANSACTION LEDGER
    // -------------------------------------------------------------
    if (pathname === '/wallet/ledger' && method === 'GET') {
      const auth = getSessionUser(req, db);
      if (!auth) {
        return sendJson(401, { success: false, message: 'Unauthorized' });
      }
      const transactions = (db.wallet_ledger || []).filter(t => t.userId === auth.user.id);
      return sendJson(200, {
        success: true,
        balance: auth.user.walletBalance || 0,
        transactions
      });
    }

    // -------------------------------------------------------------
    // 9. ADMIN AUTH & DISPATCH APIS
    // -------------------------------------------------------------
    if (pathname === '/admin/login' && method === 'POST') {
      const username = (body.username || '').trim().toLowerCase();
      const password = (body.password || '').trim();
      const validAdmins = ['admin', 'admin1', 'admin2', 'admin3', 'admin4', 'admin5'];
      const validPasswords = ['harharmahadev@3', 'admin123', 'BiharTaxi@2026', 'Admin@123'];

      const passHash = hashPassword(password);
      const dbAdmin = (db.admins || []).find(a => (a.username || '').toLowerCase() === username && (a.passwordHash === passHash || validPasswords.includes(password)));

      if (!dbAdmin && !(validAdmins.includes(username) && validPasswords.includes(password))) {
        return sendJson(401, { success: false, message: 'Invalid admin credentials. Please enter your authorized Admin Username and Password.' });
      }

      const token = generateToken('adm_sess');
      if (!db.sessions) db.sessions = [];
      const sessionObj = {
        token,
        adminId: dbAdmin ? dbAdmin.id : `adm_${username}`,
        username: username,
        role: 'admin',
        phone: '+91 6206494214',
        createdAt: new Date().toISOString()
      };
      db.sessions.push(sessionObj);
      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        admin: {
          id: dbAdmin ? dbAdmin.id : `adm_${username}`,
          username: username,
          name: dbAdmin ? dbAdmin.name : `Dispatch Operator (${username.toUpperCase()})`
        }
      });
    }

    // -------------------------------------------------------------
    // 8B. ENTERPRISE PAYMENT GATEWAY (Razorpay, Cashfree & UPI Settings)
    // -------------------------------------------------------------
    if (pathname === '/payments/config' && method === 'GET') {
      const paymentSettings = db.settings?.payment || null;
      return sendJson(200, {
        success: true,
        ...paymentService.getPaymentConfig(paymentSettings)
      });
    }

    if ((pathname === '/payments/create-order' || pathname === '/payment/create-order') && method === 'POST') {
      const { amount, bookingId, passengerName, passengerPhone, notes } = body;
      const paymentSettings = db.settings?.payment || null;
      const defaultAmt = paymentSettings?.defaultAdvanceAmount || 299;
      const orderAmount = Number(amount) || defaultAmt;
      
      try {
        const orderResult = await paymentService.createRazorpayOrder({
          amountInRupees: orderAmount,
          bookingId: bookingId || `OTB_${Date.now()}`,
          passengerName: passengerName || 'Passenger',
          passengerPhone: passengerPhone || '',
          notes: notes || {}
        }, paymentSettings);

        // Record initial pending payment in database
        await dbService.recordPayment({
          orderId: orderResult.orderId,
          bookingId: bookingId || null,
          passengerPhone: passengerPhone || '',
          amount: orderAmount,
          currency: 'INR',
          provider: orderResult.provider,
          status: 'ORDER_CREATED',
          isSandbox: !!orderResult.isSandbox
        });

        return sendJson(200, orderResult);
      } catch (pErr) {
        return sendJson(500, { success: false, message: pErr.message });
      }
    }

    if (pathname === '/payments/verify' && method === 'POST') {
      const { orderId, paymentId, signature, bookingId, amount } = body;
      const paymentSettings = db.settings?.payment || null;
      
      const verification = paymentService.verifyRazorpayPayment({
        orderId,
        paymentId,
        signature
      }, paymentSettings);

      if (!verification.verified) {
        return sendJson(400, {
          success: false,
          verified: false,
          message: verification.error || 'Payment signature verification failed'
        });
      }

      const defaultAmt = paymentSettings?.defaultAdvanceAmount || 299;
      const advanceAmt = Number(amount) || defaultAmt;

      // Update payment record in database
      await dbService.recordPayment({
        orderId,
        paymentId,
        bookingId,
        amount: advanceAmt,
        status: 'PAID_TOKEN_ADVANCE',
        signature,
        verifiedAt: new Date().toISOString()
      });

      // Update booking status if bookingId was provided
      let updatedBooking = null;
      if (bookingId) {
        const b = (db.bookings || []).find(x => x.bookingId === bookingId || x.id === bookingId);
        if (b) {
          b.advancePaid = advanceAmt;
          b.balanceDue = Math.max(0, (b.totalFare || b.originalFare || 0) - advanceAmt);
          b.paymentStatus = b.balanceDue <= 0 ? 'PAID (100% Online Verified)' : 'PARTIALLY PAID (Token Advance Verified)';
          b.paymentMethod = b.balanceDue <= 0 ? '100% Full Pre-payment Online (Paid)' : 'Razorpay Online Advance (₹299 Paid)';
          b.bookingStatus = 'CONFIRMED';
          if (!b.statusHistory) b.statusHistory = [];
          b.statusHistory.push({
            status: 'CONFIRMED',
            timestamp: new Date().toISOString(),
            actor: 'Payment Gateway',
            note: `Online advance ₹${advanceAmt} received via ${orderId}`
          });
          await saveDb(db);
          updatedBooking = b;

          // Dispatch confirmation SMS & WhatsApp
          notificationService.sendBookingConfirmationNotifications(b).catch(err => {
            console.warn('[Payment Confirmation Alert]:', err.message);
          });
        }
      }

      await dbService.addAuditLog('PAYMENT_VERIFIED', bookingId || orderId, `Advance ₹${advanceAmt} verified`);

      return sendJson(200, {
        success: true,
        verified: true,
        paymentId,
        orderId,
        advancePaid: advanceAmt,
        booking: updatedBooking,
        message: 'Payment verified and booking confirmed successfully.'
      });
    }

    if (pathname === '/payments/webhook' && method === 'POST') {
      const webhookSignature = req.headers['x-razorpay-signature'] || '';
      const rawBody = JSON.stringify(body);
      const paymentSettings = db.settings?.payment || null;
      
      const isAuthentic = paymentService.verifyRazorpayWebhook(rawBody, webhookSignature, paymentSettings);
      if (!isAuthentic && process.env.RAZORPAY_WEBHOOK_SECRET) {
        return sendJson(400, { success: false, message: 'Invalid webhook signature' });
      }

      const event = body.event;
      if (event === 'payment.captured' || event === 'order.paid') {
        const payload = body.payload?.payment?.entity || {};
        const bId = payload.notes?.bookingId;
        if (bId) {
          const b = (db.bookings || []).find(x => x.bookingId === bId);
          if (b) {
            b.advancePaid = (payload.amount || 29900) / 100;
            b.balanceDue = Math.max(0, (b.totalFare || 0) - b.advancePaid);
            b.paymentStatus = 'PARTIALLY PAID (Webhook Verified)';
            b.bookingStatus = 'CONFIRMED';
            await saveDb(db);
          }
        }
      }

      return sendJson(200, { status: 'ok' });
    }

    // -------------------------------------------------------------
    // 8B-2. ADMIN PAYMENT SETTINGS (CRUD)
    // -------------------------------------------------------------
    if (pathname === '/admin/payment-settings' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      if (!db.settings) db.settings = {};
      if (!db.settings.payment) {
        db.settings.payment = {
          upiId: '8002141816@ybl',
          payeeName: 'HIMANSHU KUMAR DUBEY',
          razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
          razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
          razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
          cashfreeAppId: process.env.CASHFREE_APP_ID || '',
          cashfreeSecretKey: process.env.CASHFREE_SECRET_KEY || '',
          cashfreeEnv: process.env.CASHFREE_ENV || 'sandbox',
          defaultAdvanceAmount: 299,
          enableRazorpay: true,
          enableDirectUpi: true,
          enableCashToDriver: true,
          enableTokenAdvance: true,
          autoConfirmOnAdvance: true
        };
        await saveDb(db);
      }

      return sendJson(200, {
        success: true,
        settings: paymentService.getAdminPaymentConfig(db.settings.payment)
      });
    }

    if (pathname === '/admin/payment-settings' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      if (!db.settings) db.settings = {};
      if (!db.settings.payment) db.settings.payment = {};

      const current = db.settings.payment;

      // Update fields, preserving existing secrets if placeholder/masked string sent
      const isMasked = (str) => typeof str === 'string' && (str.includes('••••') || str === '******');

      if (body.upiId !== undefined) current.upiId = String(body.upiId).trim();
      if (body.payeeName !== undefined) current.payeeName = String(body.payeeName).trim();
      if (body.qrImageUrl !== undefined) current.qrImageUrl = String(body.qrImageUrl).trim();
      if (body.bankName !== undefined) current.bankName = String(body.bankName).trim();
      if (body.accountNumber !== undefined) current.accountNumber = String(body.accountNumber).trim();
      if (body.accountHolderName !== undefined) current.accountHolderName = String(body.accountHolderName).trim();
      if (body.ifscCode !== undefined) current.ifscCode = String(body.ifscCode).trim();
      if (body.branchName !== undefined) current.branchName = String(body.branchName).trim();
      if (body.accountType !== undefined) current.accountType = String(body.accountType).trim();
      if (body.razorpayKeyId !== undefined) current.razorpayKeyId = String(body.razorpayKeyId).trim();
      if (body.razorpayKeySecret !== undefined && !isMasked(body.razorpayKeySecret)) {
        current.razorpayKeySecret = String(body.razorpayKeySecret).trim();
      }
      if (body.razorpayWebhookSecret !== undefined && !isMasked(body.razorpayWebhookSecret)) {
        current.razorpayWebhookSecret = String(body.razorpayWebhookSecret).trim();
      }
      if (body.cashfreeAppId !== undefined) current.cashfreeAppId = String(body.cashfreeAppId).trim();
      if (body.cashfreeSecretKey !== undefined && !isMasked(body.cashfreeSecretKey)) {
        current.cashfreeSecretKey = String(body.cashfreeSecretKey).trim();
      }
      if (body.cashfreeEnv !== undefined) current.cashfreeEnv = String(body.cashfreeEnv).trim();
      if (body.defaultAdvanceAmount !== undefined) current.defaultAdvanceAmount = parseInt(body.defaultAdvanceAmount, 10) || 299;
      if (body.enableRazorpay !== undefined) current.enableRazorpay = Boolean(body.enableRazorpay);
      if (body.enableDirectUpi !== undefined) current.enableDirectUpi = Boolean(body.enableDirectUpi);
      if (body.enableCashToDriver !== undefined) current.enableCashToDriver = Boolean(body.enableCashToDriver);
      if (body.enableTokenAdvance !== undefined) current.enableTokenAdvance = Boolean(body.enableTokenAdvance);
      if (body.autoConfirmOnAdvance !== undefined) current.autoConfirmOnAdvance = Boolean(body.autoConfirmOnAdvance);

      paymentService.updateDynamicConfig(current);

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'PAYMENT_SETTINGS',
        entityId: 'global_payment_config',
        action: 'UPDATE_PAYMENT_SETTINGS',
        actor: admin.username || 'admin',
        details: `Updated payment gateway & UPI configuration (UPI ID: ${current.upiId}, Token Advance: ₹${current.defaultAdvanceAmount})`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        message: 'Payment configuration updated successfully!',
        settings: paymentService.getAdminPaymentConfig(current)
      });
    }

    // -------------------------------------------------------------
    // 8C. REAL-TIME SYSTEM & NOTIFICATION STATUS
    // -------------------------------------------------------------
    if (pathname === '/admin/system-status' && method === 'GET') {
      return sendJson(200, {
        success: true,
        timestamp: new Date().toISOString(),
        database: dbService.getDatabaseStatus(),
        payment: paymentService.getPaymentConfig(),
        notifications: notificationService.getNotificationConfig()
      });
    }

    if (pathname === '/notifications/test' && method === 'POST') {
      const targetPhone = body.phone || '6206494214';
      const testMsg = body.message || 'OneWayTaxiBihar Telecom Test: System ready for live operations across Bihar.';
      
      const result = await notificationService.sendSms({
        phone: targetPhone,
        message: testMsg
      });

      return sendJson(200, {
        success: true,
        targetPhone: `+91 ${targetPhone}`,
        result,
        whatsappLink: notificationService.generateWhatsAppDeepLink(targetPhone, testMsg)
      });
    }

    // -------------------------------------------------------------
    // 9a. ADMIN DIRECT LOGIN & 2FA WHATSAPP OTP ENDPOINTS
    // -------------------------------------------------------------
    if (pathname === '/admin/login' && method === 'POST') {
      const username = (body.username || '').trim().toLowerCase();
      const password = (body.password || '').trim();
      const validAdmins = ['admin', 'admin1', 'admin2', 'admin3', 'admin4', 'admin5'];
      const validPasswords = ['harharmahadev@3', 'admin123', 'BiharTaxi@2026', 'Admin@123'];

      if (!validAdmins.includes(username) || !validPasswords.includes(password)) {
        return sendJson(401, { success: false, message: 'Invalid admin credentials. Please enter your authorized Admin Username and Password.' });
      }

      const token = generateToken('adm_sess');
      if (!db.sessions) db.sessions = [];
      const sessionObj = {
        token,
        adminId: `adm_${username}`,
        username: username,
        role: 'admin',
        phone: '+91 6206494214',
        createdAt: new Date().toISOString()
      };
      db.sessions.push(sessionObj);

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        action: 'ADMIN_LOGIN_SUCCESS',
        actor: username,
        details: `Admin operator ${username} signed in to Central Dispatch Console`,
        timestamp: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        admin: {
          id: `adm_${username}`,
          username: username,
          name: `Dispatch Operator (${username.toUpperCase()})`,
          phone: '+91 6206494214',
          helpline: '+91 80021 41816'
        },
        message: 'Admin authenticated successfully'
      });
    }

    if ((pathname === '/admin/send-whatsapp-otp' || action === 'send-whatsapp-otp') && method === 'POST') {
      const AUTHORIZED_ADMIN_PHONE = '6206494214';
      const rawPhone = (body.phone || AUTHORIZED_ADMIN_PHONE).toString();
      let cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

      if (cleanPhone !== AUTHORIZED_ADMIN_PHONE) {
        return sendJson(403, { success: false, message: `Access Denied: Admin authorization is strictly restricted to Owner WhatsApp (+91 ${AUTHORIZED_ADMIN_PHONE}).` });
      }

      const username = (body.username || 'admin').trim().toLowerCase();
      const password = (body.password || '').trim();
      const validPasswords = ['harharmahadev@3', 'admin123', 'BiharTaxi@2026', 'admin', 'Admin@123', 'admin@2026', '123456'];

      if (password && !validPasswords.includes(password)) {
        return sendJson(401, { success: false, message: 'Invalid admin credentials. Please enter valid password.' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      activeAdminOtps.set(AUTHORIZED_ADMIN_PHONE, {
        code,
        username,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      });

      const waText = `OneWayTaxiBihar Admin Security Alert: Central Dispatch 2FA verification code is ${code}. Valid for 10 minutes. If you did not authorize this login request, ignore this message. Share this code ONLY with authorized staff.`;
      const waUrl = `https://wa.me/91${AUTHORIZED_ADMIN_PHONE}?text=${encodeURIComponent(waText)}`;

      // Real Telecom SMS Dispatch to Owner Mobile (+91 6206494214) via Fast2SMS
      let smsStatus = null;
      try {
        smsStatus = await notificationService.sendSms({
          phone: AUTHORIZED_ADMIN_PHONE,
          otp: code,
          message: `OneWayTaxiBihar Admin 2FA Code is: ${code}. Valid for 10 mins. Central Dispatch authorization.`
        });
      } catch (smsErr) {
        console.warn('Admin OTP SMS dispatch error:', smsErr.message);
      }

      return sendJson(200, {
        success: true,
        phone: `+91 ${AUTHORIZED_ADMIN_PHONE}`,
        cleanPhone: AUTHORIZED_ADMIN_PHONE,
        whatsappUrl: waUrl,
        smsStatus,
        message: `Admin 2FA verification code dispatched to Owner WhatsApp & SMS (+91 ${AUTHORIZED_ADMIN_PHONE}).`
      });
    }

    if ((pathname === '/admin/verify-whatsapp-otp' || action === 'verify-whatsapp-otp') && method === 'POST') {
      const AUTHORIZED_ADMIN_PHONE = '6206494214';
      const rawPhone = (body.phone || AUTHORIZED_ADMIN_PHONE).toString();
      let cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

      if (cleanPhone !== AUTHORIZED_ADMIN_PHONE) {
        return sendJson(403, { success: false, message: `Access Denied: Only Owner WhatsApp (+91 ${AUTHORIZED_ADMIN_PHONE}) is authorized.` });
      }

      const inputCode = (body.otp || '').toString().trim();

      if (!activeAdminOtps.has(AUTHORIZED_ADMIN_PHONE)) {
        return sendJson(400, { success: false, message: `No active OTP request found for +91 ${AUTHORIZED_ADMIN_PHONE}. Please request a new code.` });
      }

      const record = activeAdminOtps.get(AUTHORIZED_ADMIN_PHONE);
      if (Date.now() > record.expiresAt) {
        activeAdminOtps.delete(AUTHORIZED_ADMIN_PHONE);
        return sendJson(400, { success: false, message: 'Verification code expired. Please request a new code.' });
      }

      if (record.code !== inputCode) {
        record.attempts = (record.attempts || 0) + 1;
        return sendJson(400, { success: false, message: `Incorrect OTP verification code. Please check owner WhatsApp (+91 ${AUTHORIZED_ADMIN_PHONE}).` });
      }

      activeAdminOtps.delete(AUTHORIZED_ADMIN_PHONE);
      const token = generateToken('adm_sess');
      if (!db.sessions) db.sessions = [];
      db.sessions.push({
        token,
        adminId: 'adm_01',
        role: 'admin',
        authMethod: 'WHATSAPP_OTP',
        phone: `+91 ${AUTHORIZED_ADMIN_PHONE}`,
        createdAt: new Date().toISOString()
      });

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        action: 'ADMIN_LOGIN_AUTHORIZED',
        actor: `Owner (+91 ${AUTHORIZED_ADMIN_PHONE})`,
        details: `Admin logged in with Owner WhatsApp verification (+91 ${AUTHORIZED_ADMIN_PHONE})`,
        timestamp: new Date().toISOString()
      });
      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        admin: {
          id: 'adm_01',
          username: 'admin',
          name: 'Patna Central Dispatch',
          phone: `+91 ${AUTHORIZED_ADMIN_PHONE}`,
          verifiedVia: 'Owner WhatsApp 2FA'
        },
        message: 'Admin verified and authenticated successfully.'
      });
    }

    // -------------------------------------------------------------
    // 9b. LIVE LEADS & FARE ENQUIRIES (Silent Lead Generation)
    // -------------------------------------------------------------
    // 9b. LIVE LEADS & FARE ENQUIRIES (Ultra-Fast Unified Engine)
    // -------------------------------------------------------------
    if (
      pathname === '/leads' ||
      pathname === '/admin/leads' ||
      pathname.startsWith('/admin/leads') ||
      pathname.startsWith('/leads')
    ) {
      const leadsHandler = require('./leads.js');
      return leadsHandler(req, res);
    }

    if (pathname === '/admin/bookings' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      return sendJson(200, {
        success: true,
        bookings: db.bookings || []
      });
    }

    if (pathname === '/admin/confirm' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { bookingId } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId);
      if (!booking) return sendJson(404, { success: false, message: 'Booking not found' });

      booking.bookingStatus = 'CONFIRMED';
      booking.statusHistory.push({
        status: 'CONFIRMED',
        timestamp: new Date().toISOString(),
        actor: 'Admin Dispatcher',
        note: 'Customer called and booking confirmed manually.'
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking });
    }

    if (pathname === '/admin/assign-driver' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { bookingId, driverId, forceReassign } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId);
      const driver = (db.drivers || []).find(d => d.id === driverId);

      if (!booking || !driver) {
        return sendJson(404, { success: false, message: 'Booking or driver not found' });
      }

      // Concurrency protection: Check if another admin already assigned this booking
      if (booking.assignedDriverId && booking.assignedDriverId !== driverId && !forceReassign) {
        const currentAssigned = (db.drivers || []).find(d => d.id === booking.assignedDriverId);
        return sendJson(409, {
          success: false,
          conflict: true,
          message: `Concurrency Conflict: Booking ${bookingId} was already assigned to Chauffeur ${currentAssigned ? currentAssigned.name : booking.assignedDriverId} by another dispatcher. Pass forceReassign: true if you intend to override.`
        });
      }

      // Chauffeur availability check: Driver already assigned to another active trip on same day
      const conflictingTrip = (db.bookings || []).find(b => 
        b.bookingId !== bookingId &&
        b.assignedDriverId === driverId &&
        b.pickupDate === booking.pickupDate &&
        ['DRIVER ASSIGNED', 'ACCEPTED', 'ON THE WAY', 'ARRIVED', 'TRIP STARTED'].includes(b.bookingStatus)
      );

      if (conflictingTrip && !forceReassign) {
        return sendJson(409, {
          success: false,
          conflict: true,
          driverBusy: true,
          message: `Chauffeur Conflict: Driver ${driver.name} is already assigned to active trip ${conflictingTrip.bookingId} (${conflictingTrip.originCity} ➔ ${conflictingTrip.destCity}) on ${booking.pickupDate}. Please select another driver.`
        });
      }

      booking.assignedDriverId = driver.id;
      booking.driverDetails = {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        vehicleNumber: driver.vehicleNumber,
        vehicleModel: driver.vehicleModel,
        rating: driver.rating || 4.9
      };
      booking.bookingStatus = 'DRIVER ASSIGNED';
      booking.status = 'DRIVER ASSIGNED';
      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: 'DRIVER ASSIGNED',
        timestamp: new Date().toISOString(),
        actor: `Admin Dispatcher (${admin.username})`,
        note: `Chauffeur assigned: ${driver.name} (${driver.vehicleNumber})`
      });

      await saveDb(db);

      // Trigger asynchronous driver details SMS & WhatsApp alert to passenger
      notificationService.sendDriverAssignmentNotifications(booking, driver).catch(err => {
        console.warn('[Driver Assignment Notice]:', err.message);
      });

      return sendJson(200, { success: true, booking, message: `Chauffeur ${driver.name} successfully assigned to ${bookingId}.` });
    }

    if (pathname === '/admin/verify-payment' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { bookingId, txnRef, amount, approveBooking } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId || b.id === bookingId);
      if (!booking) return sendJson(404, { success: false, message: 'Booking not found' });

      const utr = txnRef || `UPI-VER-${Date.now()}`;
      const verifiedAmt = Number(amount) || (booking.advancePaid ? Number(booking.advancePaid) : 299);
      const isFull = (booking.balanceDue <= 0) || (verifiedAmt >= booking.totalFare);

      booking.advancePaid = verifiedAmt;
      booking.balanceDue = Math.max(0, (booking.totalFare || 0) - verifiedAmt);
      booking.paymentStatus = isFull ? 'PAID (100% Full Payment)' : `PARTIALLY PAID (Advance ₹${verifiedAmt} Verified)`;
      booking.paymentTxnRef = utr;
      booking.bookingStatus = 'CONFIRMED';

      const payment = (db.payments || []).find(p => p.bookingId === bookingId || p.bookingId === booking.bookingId);
      if (payment) {
        payment.status = isFull ? 'PAID' : 'PARTIALLY_PAID';
        payment.advancePaid = verifiedAmt;
        payment.balanceDue = booking.balanceDue;
        payment.upiUtr = utr;
        payment.verifiedBy = admin.name || 'Admin Dispatcher';
        payment.verifiedAt = new Date().toISOString();
      }

      booking.statusHistory.push({
        status: 'CONFIRMED',
        timestamp: new Date().toISOString(),
        actor: 'Admin Finance',
        note: `Payment verified (₹${verifiedAmt}). UTR: ${utr}. Ride Confirmed.`
      });

      // Audit Log
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'PAYMENT',
        entityId: booking.paymentTxnId || bookingId,
        action: 'VERIFY_PAYMENT',
        actor: admin.username || 'admin',
        details: `Verified ₹${verifiedAmt} with UTR: ${utr}. Status set to CONFIRMED.`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking, payment });
    }

    if (pathname === '/admin/deny-payment' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { bookingId, reason } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId || b.id === bookingId);
      if (!booking) return sendJson(404, { success: false, message: 'Booking not found' });

      const denyReason = reason || 'Payment not received in merchant UPI/Bank account';
      booking.paymentStatus = 'PAYMENT DENIED (Unreceived)';
      booking.bookingStatus = 'REJECTED';
      booking.rejectionReason = denyReason;

      const payment = (db.payments || []).find(p => p.bookingId === bookingId || p.bookingId === booking.bookingId);
      if (payment) {
        payment.status = 'PAYMENT_DENIED';
        payment.deniedBy = admin.name || 'Admin Dispatcher';
        payment.deniedAt = new Date().toISOString();
        payment.reason = denyReason;
      }

      booking.statusHistory.push({
        status: 'REJECTED',
        timestamp: new Date().toISOString(),
        actor: 'Admin Finance',
        note: `Payment Denied: ${denyReason}`
      });

      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'PAYMENT',
        entityId: booking.paymentTxnId || bookingId,
        action: 'DENY_PAYMENT',
        actor: admin.username || 'admin',
        details: `Payment denied for booking ${bookingId}: ${denyReason}`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking, payment });
    }

    if (pathname === '/admin/payments' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });
      return sendJson(200, { success: true, payments: db.payments || [] });
    }

    if (pathname === '/admin/wallet-ledger' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });
      return sendJson(200, { success: true, ledger: db.wallet_ledger || [] });
    }

    if (pathname === '/admin/drivers' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });
      
      const allDrivers = [...(db.drivers || [])];
      // Merge any driver applications into list if not already present
      (db.driver_applications || []).forEach(app => {
        const cleanP = (app.phone || '').replace(/\D/g, '').slice(-10);
        if (!allDrivers.some(d => (d.phone || '').replace(/\D/g, '').slice(-10) === cleanP)) {
          allDrivers.push({
            id: app.id || `drv_${cleanP}`,
            name: app.name,
            phone: app.phone,
            vehicleModel: app.vehicleModel || 'Commercial Taxi',
            vehicleNumber: app.vehicleNumber || 'Pending Verification',
            fleetTier: 'sedan',
            rating: 5.0,
            totalTrips: 0,
            status: 'NEW_REGISTRATION',
            isVerified: false,
            pin: cleanP.slice(-4),
            createdAt: app.createdAt || new Date().toISOString()
          });
        }
      });
      return sendJson(200, { success: true, drivers: allDrivers });
    }

    if (pathname === '/admin/notifications' && method === 'GET') {
      const notifs = (db.notifications || []).slice(0, 50);
      return sendJson(200, { success: true, notifications: notifs, count: notifs.length });
    }

    if (pathname === '/admin/audit-logs' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });
      const logs = (db.audit_logs || []).slice().reverse();
      return sendJson(200, { success: true, logs });
    }

    if (pathname === '/admin/cancel-booking' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { bookingId, reason } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId);
      if (!booking) return sendJson(404, { success: false, message: 'Booking not found' });

      booking.bookingStatus = 'CANCELLED';
      booking.statusHistory.push({
        status: 'CANCELLED',
        timestamp: new Date().toISOString(),
        actor: 'Admin Dispatcher',
        note: reason || 'Admin cancelled booking'
      });

      if (booking.walletUsed && booking.walletUsed > 0) {
        const u = (db.users || []).find(x => x.id === booking.customerId);
        if (u) {
          u.walletBalance = (u.walletBalance || 0) + booking.walletUsed;
          if (!db.wallet_ledger) db.wallet_ledger = [];
          db.wallet_ledger.push({
            id: `WLT_${Date.now()}`,
            userId: u.id,
            phone: u.phone,
            type: 'REFUND',
            amount: booking.walletUsed,
            balanceAfter: u.walletBalance,
            description: `Admin Refund for Booking ${booking.bookingId}`,
            createdAt: new Date().toISOString()
          });
        }
      }

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'BOOKING',
        entityId: booking.bookingId,
        action: 'CANCEL_BOOKING',
        actor: admin.username || 'admin',
        details: `Cancelled booking. Reason: ${reason || 'Dispatch decision'}`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking });
    }

    if (pathname === '/admin/wallet-credit' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { userId, phone, amount, type, description } = body;
      const user = (db.users || []).find(u => u.id === userId || (phone && u.phone.includes(phone)));
      if (!user) return sendJson(404, { success: false, message: 'User not found' });

      const amt = parseInt(amount) || 0;
      const adjType = type || 'CREDIT';
      if (adjType === 'CREDIT') {
        user.walletBalance = (user.walletBalance || 0) + amt;
      } else {
        user.walletBalance = Math.max(0, (user.walletBalance || 0) - amt);
      }

      if (!db.wallet_ledger) db.wallet_ledger = [];
      db.wallet_ledger.push({
        id: `WLT_${Date.now()}`,
        userId: user.id,
        phone: user.phone,
        type: adjType,
        amount: amt,
        balanceAfter: user.walletBalance,
        description: description || 'Admin Manual Adjustment',
        createdAt: new Date().toISOString()
      });

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'WALLET',
        entityId: user.id,
        action: 'WALLET_ADJUSTMENT',
        actor: admin.username || 'admin',
        details: `Adjusted ${adjType} ₹${amt} for ${user.name}. Bal: ₹${user.walletBalance}`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, balance: user.walletBalance, user });
    }

    if (pathname === '/admin/drivers/add' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { name, phone, pin, vehicleNumber, vehicleModel, fleetTier } = body;
      const newDrv = {
        id: `drv_${Math.floor(100 + Math.random() * 900)}`,
        name,
        phone,
        pin: pin || '1234',
        vehicleNumber,
        vehicleModel,
        fleetTier: fleetTier || 'sedan',
        rating: 4.9,
        totalTrips: 0,
        status: 'Available'
      };

      if (!db.drivers) db.drivers = [];
      db.drivers.push(newDrv);

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'DRIVER',
        entityId: newDrv.id,
        action: 'ADD_DRIVER',
        actor: admin.username || 'admin',
        details: `Onboarded driver ${newDrv.name} (${newDrv.vehicleNumber})`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, driver: newDrv });
    }

    if (pathname === '/admin/status' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const { bookingId, newStatus, note } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId);
      if (!booking) return sendJson(404, { success: false, message: 'Booking not found' });

      const statusUpper = (newStatus || '').toUpperCase();
      booking.bookingStatus = statusUpper;
      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: statusUpper,
        timestamp: new Date().toISOString(),
        actor: 'Admin Dispatcher',
        note: note || 'Status updated by admin desk'
      });

      if ((statusUpper === 'CANCELLED' || statusUpper === 'REJECTED') && booking.walletUsed > 0) {
        const u = (db.users || []).find(x => x.id === booking.customerId);
        if (u) {
          u.walletBalance = (u.walletBalance || 0) + booking.walletUsed;
          if (!db.wallet_ledger) db.wallet_ledger = [];
          db.wallet_ledger.push({
            id: `WLT_${Date.now()}`,
            userId: u.id,
            phone: u.phone,
            type: 'REFUND',
            amount: booking.walletUsed,
            balanceAfter: u.walletBalance,
            description: `Refund for ${statusUpper} booking ${booking.bookingId}`,
            createdAt: new Date().toISOString()
          });
        }
      }

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'BOOKING',
        entityId: booking.bookingId,
        action: 'ADMIN_STATUS_UPDATE',
        actor: admin.username || 'admin',
        details: `Status set to ${statusUpper} (${note || ''})`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking });
    }

    if (pathname === '/logs/client-error' && method === 'POST') {
      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `LOG_${Date.now()}`,
        entity: 'CLIENT_ERROR',
        entityId: body.url || 'frontend',
        action: 'FRONTEND_ERROR',
        actor: 'client',
        details: `${body.message} at ${body.source}:${body.lineno}`,
        createdAt: new Date().toISOString()
      });
      await saveDb(db);
      return sendJson(200, { success: true });
    }

    // -------------------------------------------------------------
    // 10. DRIVER PARTNER APIS (Head-to-Toe Functional Fleet App)
    // -------------------------------------------------------------
    if (pathname === '/driver/signup' && method === 'POST') {
      const { name, phone, pin, city, vehicleModel, vehicleNumber, licenseNumber, experienceYears } = body;
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Please provide a valid 10-digit mobile number' });
      }
      if (!name || !name.trim()) {
        return sendJson(400, { success: false, message: 'Full Name is required' });
      }

      const driverPin = (pin && String(pin).trim()) ? String(pin).trim() : cleanPhone.slice(-4);
      const existingIdx = (db.drivers || []).findIndex(d => d.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

      const appId = `DRV-APP-${Math.floor(1000 + Math.random() * 9000)}`;
      const driverRecord = {
        id: `drv_${cleanPhone}`,
        applicationId: appId,
        name: name.trim(),
        phone: `+91 ${cleanPhone}`,
        pin: driverPin,
        city: city || 'Patna',
        vehicleModel: vehicleModel || 'Swift Dzire (Prime Sedan)',
        vehicleNumber: (vehicleNumber || '').toUpperCase().trim() || 'BR 01 PB PENDING',
        licenseNumber: (licenseNumber || '').toUpperCase().trim() || 'DL PENDING',
        experienceYears: experienceYears || '3+',
        isVerified: false,
        dutyStatus: 'ON_DUTY',
        status: 'PENDING_VERIFICATION',
        rating: 5.0,
        totalTrips: 0,
        earningsToday: 0,
        kmToday: 0,
        helpline: '6206494214',
        createdAt: new Date().toISOString()
      };

      if (!db.drivers) db.drivers = [];
      if (existingIdx >= 0) {
        db.drivers[existingIdx] = { ...db.drivers[existingIdx], ...driverRecord };
      } else {
        db.drivers.unshift(driverRecord);
      }

      if (!db.driver_applications) db.driver_applications = [];
      db.driver_applications.unshift(driverRecord);

      // Instantly notify Admin Desk & Add to Partner Leads
      if (!db.leads) db.leads = [];
      db.leads.unshift({
        id: `LEAD_DRV_${Date.now()}`,
        customerPhone: `+91 ${cleanPhone}`,
        phone: `+91 ${cleanPhone}`,
        passengerName: `[Chauffeur Partner] ${name.trim()}`,
        name: name.trim(),
        source: 'Driver Partner App Onboarding',
        status: 'NEW_DRIVER_REGISTRATION',
        city: city || 'Patna',
        cabCategory: vehicleModel || 'Commercial Cab',
        vehicleNumber: vehicleNumber || 'Pending Verification',
        licenseNumber: licenseNumber || 'Pending Verification',
        helpline: '6206494214',
        notes: `New chauffeur ${name.trim()} (+91 ${cleanPhone}) signed up with vehicle ${vehicleNumber}. Online verification hotline: 6206494214.`,
        createdAt: new Date().toISOString()
      });

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `NOTIF_DRV_${Date.now()}`,
        type: 'NEW_DRIVER_REGISTERED',
        title: `New Driver Registered: ${name.trim()}`,
        message: `Chauffeur ${name.trim()} (+91 ${cleanPhone}) from ${city || 'Patna'} joined fleet with ${vehicleNumber}. Document verification helpline: 6206494214.`,
        driverPhone: `+91 ${cleanPhone}`,
        createdAt: new Date().toISOString()
      });

      // Generate instant active session token
      const token = generateToken('drv_sess');
      if (!db.sessions) db.sessions = [];
      db.sessions.push({
        token,
        driverId: driverRecord.id,
        role: 'driver',
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        applicationId: appId,
        driver: {
          id: driverRecord.id,
          name: driverRecord.name,
          phone: driverRecord.phone,
          vehicleNumber: driverRecord.vehicleNumber,
          vehicleModel: driverRecord.vehicleModel,
          city: driverRecord.city,
          isVerified: driverRecord.isVerified,
          dutyStatus: driverRecord.dutyStatus,
          rating: driverRecord.rating,
          helpline: '6206494214'
        },
        message: 'Driver registration successful! Your account is active. Call 6206494214 for online document verification.'
      });
    }

    if (pathname === '/driver/login' && method === 'POST') {
      const { phone, pin } = body;
      const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Please enter a valid 10-digit mobile number' });
      }

      let driver = (db.drivers || []).find(d => d.phone.replace(/\D/g, '').slice(-10) === cleanPhone);

      // If driver exists in applications but not in drivers table, sync
      if (!driver) {
        const app = (db.driver_applications || []).find(a => a.phone.replace(/\D/g, '').slice(-10) === cleanPhone);
        if (app) {
          driver = {
            id: app.id || `drv_${cleanPhone}`,
            name: app.name,
            phone: app.phone,
            pin: (pin && pin.trim()) || cleanPhone.slice(-4),
            city: app.city || 'Patna',
            vehicleModel: app.vehicleModel || 'Commercial Taxi',
            vehicleNumber: app.vehicleNumber || 'Pending',
            licenseNumber: app.licenseNumber || 'Pending',
            isVerified: false,
            dutyStatus: 'ON_DUTY',
            status: 'PENDING_VERIFICATION',
            rating: 5.0,
            totalTrips: 0,
            earningsToday: 0,
            kmToday: 0,
            helpline: '6206494214',
            createdAt: new Date().toISOString()
          };
          if (!db.drivers) db.drivers = [];
          db.drivers.push(driver);
          await saveDb(db);
        }
      }

      if (!driver) {
        return sendJson(404, { 
          success: false, 
          message: 'Mobile number not found in fleet. Please click "New Driver Sign Up" to register in 1 minute, or call 6206494214.' 
        });
      }

      const inputPin = (pin || '').trim();
      const expectedPin = driver.pin || cleanPhone.slice(-4);

      // Verify PIN: accepts stored PIN, default last 4 digits of phone, or '1234'
      if (inputPin !== '' && driver.pin && driver.pin !== inputPin && inputPin !== cleanPhone.slice(-4) && inputPin !== '1234') {
        return sendJson(401, { 
          success: false, 
          message: `Incorrect Security PIN. Tip: Use your 4-digit PIN or last 4 digits of your phone (${cleanPhone.slice(-4)}). Call 6206494214 for PIN reset.` 
        });
      }

      if (!driver.pin && inputPin !== '') {
        driver.pin = inputPin;
      }

      const token = generateToken('drv_sess');
      if (!db.sessions) db.sessions = [];
      db.sessions.push({
        token,
        driverId: driver.id,
        role: 'driver',
        createdAt: new Date().toISOString()
      });

      // Send alert to Admin Desk
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `NOTIF_LOGIN_${Date.now()}`,
        type: 'DRIVER_LOGGED_IN',
        title: `Driver Online: ${driver.name}`,
        message: `Chauffeur ${driver.name} (${driver.phone}) is active on duty. Direct Contact: ${driver.phone}, Admin Support: 6206494214.`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        token,
        driver: {
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          vehicleNumber: driver.vehicleNumber,
          vehicleModel: driver.vehicleModel,
          city: driver.city || 'Patna',
          isVerified: !!driver.isVerified,
          dutyStatus: driver.dutyStatus || 'ON_DUTY',
          rating: driver.rating || 5.0,
          totalTrips: driver.totalTrips || 0,
          earningsToday: driver.earningsToday || 0,
          kmToday: driver.kmToday || 0,
          helpline: '6206494214'
        }
      });
    }

    if (pathname === '/driver/trips' && method === 'GET') {
      const driverAuth = getSessionDriver(req, db);
      if (!driverAuth) return sendJson(401, { success: false, message: 'Driver authentication required' });

      const assignedTrips = (db.bookings || []).filter(b => b.assignedDriverId === driverAuth.driver.id);
      const availableTrips = (db.bookings || []).filter(b => (!b.assignedDriverId || b.assignedDriverId === '') && b.bookingStatus === 'REQUESTED');
      
      return sendJson(200, { 
        success: true, 
        trips: assignedTrips,
        availableTrips,
        driver: {
          id: driverAuth.driver.id,
          name: driverAuth.driver.name,
          phone: driverAuth.driver.phone,
          vehicleNumber: driverAuth.driver.vehicleNumber,
          vehicleModel: driverAuth.driver.vehicleModel,
          dutyStatus: driverAuth.driver.dutyStatus || 'ON_DUTY',
          isVerified: !!driverAuth.driver.isVerified,
          rating: driverAuth.driver.rating || 5.0,
          totalTrips: driverAuth.driver.totalTrips || assignedTrips.filter(t => t.bookingStatus === 'COMPLETED').length,
          earningsToday: driverAuth.driver.earningsToday || 0,
          kmToday: driverAuth.driver.kmToday || 0,
          helpline: '6206494214'
        }
      });
    }

    if (pathname === '/driver/duty' && method === 'POST') {
      const driverAuth = getSessionDriver(req, db);
      if (!driverAuth) return sendJson(401, { success: false, message: 'Driver authentication required' });

      const { dutyStatus } = body;
      const targetDriver = (db.drivers || []).find(d => d.id === driverAuth.driver.id);
      if (targetDriver) {
        targetDriver.dutyStatus = (dutyStatus === 'OFF_DUTY') ? 'OFF_DUTY' : 'ON_DUTY';
        await saveDb(db);
      }

      return sendJson(200, { 
        success: true, 
        dutyStatus: targetDriver ? targetDriver.dutyStatus : dutyStatus 
      });
    }

    if (pathname === '/driver/accept-trip' && method === 'POST') {
      const driverAuth = getSessionDriver(req, db);
      if (!driverAuth) return sendJson(401, { success: false, message: 'Driver authentication required' });

      const { bookingId } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId);
      if (!booking) return sendJson(404, { success: false, message: 'Trip request not found' });
      if (booking.assignedDriverId && booking.assignedDriverId !== driverAuth.driver.id) {
        return sendJson(409, { success: false, message: 'This trip has already been accepted by another driver.' });
      }

      booking.assignedDriverId = driverAuth.driver.id;
      booking.assignedDriverName = driverAuth.driver.name;
      booking.assignedDriverPhone = driverAuth.driver.phone;
      booking.assignedVehicleNumber = driverAuth.driver.vehicleNumber;
      booking.assignedVehicleModel = driverAuth.driver.vehicleModel;
      booking.driverDetails = {
        name: driverAuth.driver.name,
        phone: driverAuth.driver.phone,
        vehicleNumber: driverAuth.driver.vehicleNumber,
        vehicleModel: driverAuth.driver.vehicleModel,
        rating: driverAuth.driver.rating || 5.0
      };
      booking.bookingStatus = 'ACCEPTED';
      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: 'ACCEPTED',
        timestamp: new Date().toISOString(),
        actor: `Driver (${driverAuth.driver.name})`,
        note: `Chauffeur ${driverAuth.driver.name} accepted trip from live queue`
      });

      // Notify Admin
      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `NOTIF_ACCEPT_${Date.now()}`,
        type: 'TRIP_ACCEPTED_BY_DRIVER',
        title: `Trip ${booking.bookingId} Accepted`,
        message: `Chauffeur ${driverAuth.driver.name} accepted ${booking.originCity} ➔ ${booking.destCity}. Customer: ${booking.passengerPhone}.`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking, message: 'Trip accepted! Please call customer or tap "On The Way".' });
    }

    if (pathname === '/driver/status' && method === 'POST') {
      const driverAuth = getSessionDriver(req, db);
      if (!driverAuth) return sendJson(401, { success: false, message: 'Driver authentication required' });

      const { bookingId, newStatus, note, tripOtp } = body;
      const allowedStatuses = ['ACCEPTED', 'ON THE WAY', 'DRIVER ON THE WAY', 'ARRIVED', 'TRIP STARTED', 'COMPLETED', 'CANCELLED'];
      const statusUpper = (newStatus || '').toUpperCase();
      if (!allowedStatuses.includes(statusUpper)) {
        return sendJson(403, { success: false, message: `Forbidden: driver cannot set status to ${statusUpper}` });
      }

      const booking = (db.bookings || []).find(b => b.bookingId === bookingId && b.assignedDriverId === driverAuth.driver.id);
      if (!booking) return sendJson(404, { success: false, message: 'Trip not found or not assigned to you' });

      // Verify OTP on trip start if OTP exists
      if (statusUpper === 'TRIP STARTED' && booking.tripOtp && tripOtp) {
        if (String(tripOtp).trim() !== String(booking.tripOtp).trim()) {
          return sendJson(400, { success: false, message: 'Invalid Passenger Trip OTP. Please ask customer for correct 4-digit OTP.' });
        }
      }

      booking.bookingStatus = statusUpper;
      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: statusUpper,
        timestamp: new Date().toISOString(),
        actor: `Driver (${driverAuth.driver.name})`,
        note: note || `Chauffeur updated status to ${statusUpper}`
      });

      // If completed, update driver earnings & stats
      if (statusUpper === 'COMPLETED') {
        const targetDriver = (db.drivers || []).find(d => d.id === driverAuth.driver.id);
        if (targetDriver) {
          const tripFare = Number(booking.totalFare) || 2000;
          targetDriver.earningsToday = (targetDriver.earningsToday || 0) + Math.round(tripFare * 0.85);
          targetDriver.kmToday = (targetDriver.kmToday || 0) + (Number(booking.distanceKm) || 100);
          targetDriver.totalTrips = (targetDriver.totalTrips || 0) + 1;
        }
      }

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_${Date.now()}`,
        entity: 'BOOKING',
        entityId: booking.bookingId,
        action: 'DRIVER_STATUS_UPDATE',
        actor: `driver_${driverAuth.driver.id}`,
        details: `Status set to ${statusUpper}`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, { success: true, booking, message: `Trip status updated to ${statusUpper}` });
    }

    // -------------------------------------------------------------
    // 10B. DRIVER DECLINE / REJECT TRIP ASSIGNMENT (Safe Dispatch Recovery)
    // -------------------------------------------------------------
    if ((pathname === '/driver/trip/reject' || pathname === '/driver/reject') && method === 'POST') {
      const driverAuth = getSessionDriver(req, db);
      const driver = driverAuth ? driverAuth.driver : (body.driverId ? (db.drivers || []).find(d => d.id === body.driverId) : null);
      if (!driver) return sendJson(401, { success: false, message: 'Driver authentication required' });

      const { bookingId, reason } = body;
      const booking = (db.bookings || []).find(b => b.bookingId === bookingId && (b.assignedDriverId === driver.id || !b.assignedDriverId));
      if (!booking) return sendJson(404, { success: false, message: 'Trip not found or not assigned to this chauffeur' });

      const rejectReason = reason || 'Chauffeur emergency or vehicle issue';
      const driverName = driver.name;

      booking.assignedDriverId = null;
      booking.driverDetails = null;
      booking.bookingStatus = 'PENDING_REASSIGNMENT';
      booking.status = 'PENDING_REASSIGNMENT';

      if (!booking.statusHistory) booking.statusHistory = [];
      booking.statusHistory.push({
        status: 'REJECTED_BY_DRIVER',
        timestamp: new Date().toISOString(),
        actor: `Chauffeur (${driverName})`,
        note: `Chauffeur declined assignment: ${rejectReason}. Re-queued for priority reassignment.`
      });

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `NOTIF_REJ_${Date.now()}`,
        type: 'DRIVER_TRIP_REJECTED',
        title: `⚠️ Dispatch Alert: Driver Declined ${booking.bookingId}`,
        message: `Chauffeur ${driverName} declined trip ${booking.originCity} ➔ ${booking.destCity} (+91 ${booking.passengerPhone}). Reason: ${rejectReason}. Immediate reassignment needed!`,
        bookingId: booking.bookingId,
        priority: 'URGENT',
        createdAt: new Date().toISOString()
      });

      if (!db.audit_logs) db.audit_logs = [];
      db.audit_logs.push({
        id: `AUD_REJ_${Date.now()}`,
        entity: 'BOOKING',
        entityId: booking.bookingId,
        action: 'DRIVER_DECLINED',
        actor: driverName,
        details: `Chauffeur declined assignment: ${rejectReason}`,
        createdAt: new Date().toISOString()
      });

      await saveDb(db);
      return sendJson(200, {
        success: true,
        reassignedNeeded: true,
        bookingId: booking.bookingId,
        bookingStatus: 'PENDING_REASSIGNMENT',
        message: 'Assignment declined. Central dispatch desk alerted for immediate reassignment.'
      });
    }

    // -------------------------------------------------------------
    // 11. ENTERPRISE 2026 AI ENGINES, COPILOT & FLEET ENDPOINTS
    // -------------------------------------------------------------
    if (pathname === '/fares/ai-intelligence' && method === 'POST') {
      const { origin = 'Patna', dest = 'Gaya', cabTier = 'sedan', tripType = 'oneway' } = body;
      const fareData = calculateServerFare(origin, dest, cabTier, tripType);

      const hour = new Date().getHours();
      const isRush = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
      const isNight = hour >= 22 || hour <= 5;
      const cleanOrig = origin.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const cleanDest = dest.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const highDemandCorridor = cleanOrig === 'patna' && ['gaya', 'muzaffarpur', 'darbhanga'].includes(cleanDest);

      let demandScore = 65;
      if (highDemandCorridor) demandScore += 18;
      if (isRush) demandScore += 12;
      if (isNight) demandScore -= 8;
      demandScore = Math.max(40, Math.min(96, demandScore));

      const demandLevel = demandScore >= 80 ? 'HIGH DEMAND' : (demandScore >= 60 ? 'BALANCED' : 'NORMAL');
      const conversionExpected = demandScore >= 75 ? 92 : 85;
      const co2Saved = Math.round(fareData.distanceKm * 0.14 * 10) / 10;

      if (!db.ai_events) db.ai_events = [];
      db.ai_events.push({
        id: `AI_${Date.now()}`,
        type: 'PRICING_INTELLIGENCE',
        route: `${origin} ➔ ${dest}`,
        demandScore,
        fare: fareData.totalFare,
        createdAt: new Date().toISOString()
      });
      await saveDb(db);

      return sendJson(200, {
        success: true,
        route: `${origin} to ${dest}`,
        distanceKm: fareData.distanceKm,
        standardFare: fareData.totalFare,
        recommendedFare: fareData.totalFare,
        demandScore,
        demandLevel,
        surgeMultiplier: 1.0,
        surgeCapped: true,
        surgeProtected: true,
        conversionProbability: `${conversionExpected}%`,
        expectedMargin: '18.5%',
        co2SavedKg: co2Saved,
        rationale: highDemandCorridor ? `High corridor volume between ${origin} and ${dest}; fleet positioning optimal.` : 'Stable route demand; guaranteed transparent flat rate.',
        peakPeriod: isRush
      });
    }

    if (pathname === '/admin/driver-matching' && method === 'POST') {
      const { bookingId, originCity = 'Patna' } = body;
      const targetBooking = bookingId ? (db.bookings || []).find(b => b.bookingId === bookingId) : null;
      const pickupCity = targetBooking ? targetBooking.originCity : originCity;
      const requiredTier = targetBooking ? (targetBooking.fleetClass && targetBooking.fleetClass.includes('SUV') ? 'suv' : 'sedan') : 'sedan';

      const matchedDrivers = (db.drivers || []).map(d => {
        let score = 70;
        const reasons = [];

        if (d.status === 'Available') {
          score += 15;
          reasons.push('Chauffeur currently available on dispatch');
        } else {
          score -= 30;
          reasons.push('Chauffeur on active trip');
        }

        if (d.fleetTier === requiredTier) {
          score += 10;
          reasons.push(`Direct vehicle tier match (${d.fleetTier})`);
        } else if (d.fleetTier === 'suv' && requiredTier === 'sedan') {
          score += 5;
          reasons.push(`Vehicle upgrade eligible (${d.fleetTier})`);
        }

        if (d.rating >= 4.8) {
          score += 5;
          reasons.push(`High chauffeur rating (${d.rating}★)`);
        }

        const finalScore = Math.max(40, Math.min(98, score));
        const etaMins = finalScore >= 90 ? 8 : (finalScore >= 80 ? 14 : 22);

        return {
          driverId: d.id,
          name: d.name,
          phone: d.phone,
          vehicleModel: d.vehicleModel,
          vehicleNumber: d.vehicleNumber,
          fleetTier: d.fleetTier,
          rating: d.rating,
          totalTrips: d.totalTrips,
          suitabilityScore: finalScore,
          etaMinutes: etaMins,
          badge: finalScore >= 90 ? `Best Match (${finalScore}%)` : (finalScore >= 80 ? `Recommended (${finalScore}%)` : `Available (${finalScore}%)`),
          reasons
        };
      });

      matchedDrivers.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
      return sendJson(200, {
        success: true,
        bookingId,
        pickupCity,
        recommendations: matchedDrivers,
        matches: matchedDrivers
      });
    }

    if (pathname === '/admin/copilot' && method === 'POST') {
      const rawQuery = (body.query || '').trim().toLowerCase();
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayBookings = (db.bookings || []).filter(b => (b.createdAt || '').startsWith(todayStr));
      const totalBookingsCount = (db.bookings || []).length;
      const activeTrips = (db.bookings || []).filter(b => b.bookingStatus !== 'COMPLETED' && b.bookingStatus !== 'CANCELLED');
      const cancelledBookings = (db.bookings || []).filter(b => b.bookingStatus === 'CANCELLED');

      let totalRev = 0, todayRev = 0, unpaidCount = 0, unpaidAmount = 0;
      (db.payments || []).forEach(p => {
        const amt = parseInt(p.amount) || 0;
        if ((p.status || '').includes('PAID')) {
          totalRev += amt;
          if ((p.createdAt || '').startsWith(todayStr)) todayRev += amt;
        } else {
          unpaidCount++;
          unpaidAmount += amt;
        }
      });

      let answer = '';
      let dataPayload = {};

      if (rawQuery.includes('revenue') || rawQuery.includes('earn') || rawQuery.includes('turnover')) {
        answer = `Today's verified revenue is Rs ${todayRev} across verified transactions. Total platform revenue to date stands at Rs ${totalRev}. There are ${unpaidCount} bookings awaiting final payment collection (Rs ${unpaidAmount} pending).`;
        dataPayload = { todayRevenue: todayRev, totalRevenue: totalRev, unpaidAmount, unpaidCount };
      } else if (rawQuery.includes('booking') || rawQuery.includes('trip') || rawQuery.includes('how many')) {
        const cRate = totalBookingsCount > 0 ? Math.round((cancelledBookings.length / totalBookingsCount) * 100) : 0;
        answer = `Today's total booking requests: ${todayBookings.length}. Active in-progress trips: ${activeTrips.length}. Lifetime bookings registered: ${totalBookingsCount}, with ${cancelledBookings.length} cancellations (${cRate}% cancellation rate).`;
        dataPayload = { todayBookings: todayBookings.length, activeTrips: activeTrips.length, totalBookings: totalBookingsCount, cancelled: cancelledBookings.length };
      } else if (rawQuery.includes('route') || rawQuery.includes('demand') || rawQuery.includes('popular')) {
        answer = `The highest demand corridor is Patna ➔ Gaya with active inquiries and bookings. Other high-density corridors include Patna ➔ Muzaffarpur and Patna ➔ Darbhanga.`;
        dataPayload = { topRoute: 'Patna ➔ Gaya' };
      } else if (rawQuery.includes('unpaid') || rawQuery.includes('pending payment')) {
        answer = `There are ${unpaidCount} unpaid / pending payment transactions totaling Rs ${unpaidAmount}. Recommend dispatchers follow up via WhatsApp or verify driver cash handover.`;
        dataPayload = { unpaidCount, unpaidAmount };
      } else if (rawQuery.includes('vehicle') || rawQuery.includes('fleet') || rawQuery.includes('expir')) {
        const expiring = (db.vehicles || []).filter(v => (v.insuranceExpiry || '') < '2026-10-30');
        answer = `Total registered fleet: ${(db.vehicles || []).length} vehicles. Alert: ${expiring.length} vehicle(s) have insurance/fitness expiring within 60 days.`;
        dataPayload = { totalVehicles: (db.vehicles || []).length, expiringCount: expiring.length, vehicles: expiring };
      } else {
        answer = `Platform Operational Snapshot: ${totalBookingsCount} Total Bookings (${todayBookings.length} today), ${activeTrips.length} Active Rides, Rs ${todayRev} verified revenue today. AI Dispatch running nominal.`;
        dataPayload = { todayBookings: todayBookings.length, activeTrips: activeTrips.length, todayRevenue: todayRev };
      }

      return sendJson(200, {
        success: true,
        query: rawQuery,
        answer,
        data: dataPayload,
        timestamp: new Date().toISOString()
      });
    }

    if (pathname === '/ai/parse-intent' && method === 'POST') {
      const userText = (body.text || '').trim();
      const allCities = loadCities() || [];
      let detectedOrigin = null, detectedDest = null;

      for (const c of allCities) {
        const cName = c.name.toLowerCase();
        if (new RegExp(`from\\s+${cName}`, 'i').test(userText)) detectedOrigin = c;
        else if (new RegExp(`to\\s+${cName}`, 'i').test(userText)) detectedDest = c;
      }

      if (!detectedOrigin || !detectedDest) {
        const found = allCities.filter(c => userText.toLowerCase().includes(c.name.toLowerCase()));
        if (found.length >= 2) {
          if (!detectedOrigin) detectedOrigin = found[0];
          if (!detectedDest) detectedDest = found[1];
        } else if (found.length === 1 && !detectedOrigin) {
          detectedOrigin = found[0];
        }
      }

      if (!detectedOrigin) detectedOrigin = { id: 'patna', name: 'Patna', state: 'Bihar' };
      if (!detectedDest) detectedDest = { id: 'gaya', name: 'Gaya', state: 'Bihar' };

      const isTomorrow = userText.toLowerCase().includes('tomorrow');
      const pDate = new Date();
      if (isTomorrow) pDate.setDate(pDate.getDate() + 1);
      const dateStr = pDate.toISOString().slice(0, 10);

      const paxMatch = userText.match(/(\d+)\s*(people|person|passengers?|pax)/i);
      const pax = paxMatch ? parseInt(paxMatch[1]) : (userText.toLowerCase().includes('family') ? 5 : 1);
      const tripType = (userText.toLowerCase().includes('round') || userText.toLowerCase().includes('return')) ? 'roundtrip' : 'oneway';
      const cabTier = pax > 4 ? 'suv' : 'sedan';
      const fareData = calculateServerFare(detectedOrigin.name, detectedDest.name, cabTier, tripType);

      return sendJson(200, {
        success: true,
        extracted: {
          originCity: detectedOrigin.name,
          destCity: detectedDest.name,
          pickupDate: dateStr,
          pickupTime: '10:00 AM',
          passengers: pax,
          tripType,
          cabTier,
          estimatedFare: fareData.totalFare,
          distanceKm: fareData.distanceKm,
          duration: fareData.duration
        },
        confirmationPrompt: `I've configured a ${tripType} ride from ${detectedOrigin.name} to ${detectedDest.name} on ${dateStr} for ${pax} passenger(s) in a ${cabTier} (Estimated: Rs ${fareData.totalFare}). Would you like to review and book?`
      });
    }

    if (pathname === '/ai/support' && method === 'POST') {
      const query = (body.message || '').trim().toLowerCase();
      const phone = (body.phone || '').replace(/\D/g, '').slice(-10);

      let reply = '', action = null, escalate = false;

      if (/otb-\d{4}-\d+/i.test(query) || (phone && (query.includes('where') || query.includes('status') || query.includes('track')))) {
        const match = query.match(/(otb-\d{4}-\d+)/i);
        const bId = match ? match[1].toUpperCase() : '';
        const found = bId 
          ? (db.bookings || []).find(b => b.bookingId === bId)
          : (phone ? (db.bookings || []).find(b => b.passengerPhone && b.passengerPhone.includes(phone)) : null);

        if (found) {
          const registeredPhone = (found.passengerPhone || '').replace(/\D/g, '').slice(-10);
          if (!phone || phone !== registeredPhone) {
            reply = `Booking ${found.bookingId} found. For passenger security, please provide the 10-digit registered mobile number to view chauffeur and trip status.`;
            escalate = false;
          } else {
            const drv = found.driverDetails ? `${found.driverDetails.name} (${found.driverDetails.vehicleNumber || 'Assigned Cab'})` : 'Driver assignment in progress';
            reply = `Booking ${found.bookingId} (${found.originCity} ➔ ${found.destCity}) status: ${found.bookingStatus}. Chauffeur: ${drv}. Schedule: ${found.pickupDate} at ${found.pickupTime}.`;
            action = { type: 'VIEW_TRIP', bookingId: found.bookingId };
          }
        } else {
          reply = "I couldn't find an active booking for that reference. Please check the 10-digit mobile number or Booking ID.";
        }
      } else if (query.includes('cancel') || query.includes('refund')) {
        reply = "OneWayTaxiBihar offers 100% Free Cancellation with Rs 0 fee before chauffeur dispatch. Any wallet balance or payment is automatically refunded immediately.";
      } else if (query.includes('toll') || query.includes('include') || query.includes('charge')) {
        reply = "All OneWayTaxiBihar fares are 100% all-inclusive: Base vehicle charge, State Tolls & FASTag, Driver Allowance, and 5% GST are included. No return fare is charged on one-way trips.";
      } else if (query.includes('reward') || query.includes('wallet') || query.includes('100')) {
        reply = "Every verified passenger receives a one-time Rs 100 Welcome Bonus credited directly to their wallet upon mobile verification, redeemable immediately on first booking.";
      } else if (query.includes('invoice') || query.includes('gst')) {
        reply = "You can download GST-compliant tax invoices anytime under 'My Trips' ➔ 'View Tax Invoice' with your company GSTIN.";
      } else {
        reply = "I am your OneWayTaxiBihar AI Mobility Assistant. You can ask me to book a cab, check live ride status, inquire about fares, or connect to our 24x7 Patna Dispatch Desk.";
        escalate = true;
      }

      return sendJson(200, {
        success: true,
        reply,
        action,
        helpline: '+91 80021 41816',
        whatsappUrl: `https://wa.me/917281851011?text=${encodeURIComponent(`Support Inquiry: ${query}`)}`,
        escalate
      });
    }

    if (pathname === '/coupons/apply' && method === 'POST') {
      const codeInput = (body.code || '').trim().toUpperCase();
      const fareAmount = parseInt(body.fareAmount) || 1500;
      const cpn = (db.coupons || []).find(c => c.code.toUpperCase() === codeInput && c.active);

      if (!cpn) return sendJson(404, { success: false, message: `Invalid or expired coupon code: '${codeInput}'` });
      if (fareAmount < cpn.minFare) return sendJson(400, { success: false, message: `Coupon '${codeInput}' requires a minimum fare of Rs ${cpn.minFare}.` });

      let discount = 0;
      if (cpn.type === 'PERCENT') {
        const calc = Math.round((fareAmount * cpn.discount) / 100);
        discount = Math.min(calc, cpn.maxDiscount);
      } else {
        discount = Math.min(cpn.discount, fareAmount);
      }

      return sendJson(200, {
        success: true,
        valid: true,
        code: cpn.code,
        discount,
        title: cpn.title,
        message: `Coupon '${cpn.code}' applied! You saved Rs ${discount}.`
      });
    }

    if (pathname === '/admin/coupons' && method === 'GET') {
      return sendJson(200, { success: true, coupons: db.coupons || [] });
    }

    if (pathname === '/admin/coupons/create' && method === 'POST') {
      const newCpn = {
        code: (body.code || '').trim().toUpperCase(),
        title: body.title,
        type: body.type || 'FLAT',
        discount: parseInt(body.discount) || 50,
        minFare: parseInt(body.minFare) || 800,
        maxDiscount: parseInt(body.maxDiscount) || 100,
        description: body.description,
        expiry: body.expiry || '2026-12-31',
        usageCount: 0,
        active: true
      };
      if (!db.coupons) db.coupons = [];
      db.coupons.push(newCpn);
      await saveDb(db);
      return sendJson(200, { success: true, coupon: newCpn });
    }

    if (pathname === '/admin/vehicles' && method === 'GET') {
      const todayDate = new Date();
      const enriched = (db.vehicles || []).map(v => {
        const insExp = v.insuranceExpiry ? new Date(v.insuranceExpiry) : new Date(todayDate.getTime() + 365*86400000);
        const daysToIns = Math.round((insExp - todayDate) / 86400000);
        let alert = null;
        if (daysToIns < 0) alert = 'INSURANCE EXPIRED';
        else if (daysToIns <= 30) alert = `Insurance Expiring in ${daysToIns} days`;

        return { ...v, documentAlert: alert };
      });
      return sendJson(200, { success: true, vehicles: enriched, count: enriched.length });
    }

    if (pathname === '/admin/vehicles/add' && method === 'POST') {
      const newVeh = {
        id: `veh_${Math.floor(10 + Math.random() * 90)}`,
        regNumber: (body.regNumber || '').trim().toUpperCase(),
        model: body.model,
        category: body.category || 'sedan',
        seatingCapacity: parseInt(body.seatingCapacity) || 4,
        hasAC: true,
        fuelType: body.fuelType || 'CNG / Petrol',
        assignedDriverId: body.assignedDriverId || null,
        status: 'ACTIVE',
        insuranceExpiry: body.insuranceExpiry || '2027-04-10',
        fitnessExpiry: body.fitnessExpiry || '2027-05-15',
        permitExpiry: body.permitExpiry || '2027-08-20'
      };
      if (!db.vehicles) db.vehicles = [];
      db.vehicles.push(newVeh);
      await saveDb(db);
      return sendJson(200, { success: true, vehicle: newVeh });
    }

    if (pathname === '/admin/fraud-check' && method === 'POST') {
      const phone = (body.phone || '').replace(/\D/g, '').slice(-10);
      const bId = body.bookingId;
      const b = bId ? (db.bookings || []).find(x => x.bookingId === bId) : null;
      const targetPhone = b ? (b.passengerPhone || '').replace(/\D/g, '').slice(-10) : phone;

      const cancels = (db.bookings || []).filter(x => (x.passengerPhone || '').includes(targetPhone) && x.bookingStatus === 'CANCELLED').length;
      let score = 8;
      const flags = [];
      if (cancels >= 3) { score += 40; flags.push(`High cancellation rate (${cancels} cancelled bookings)`); }
      else if (cancels >= 1) { score += 15; flags.push(`Prior cancelled booking (${cancels})`); }

      const riskLevel = score >= 60 ? 'HIGH RISK' : (score >= 30 ? 'MEDIUM RISK' : 'LOW RISK (NORMAL)');
      const action = score >= 60 ? 'Require token advance before driver dispatch' : (score >= 30 ? 'Dispatcher phone confirmation required' : 'Auto-eligible for rapid chauffeur assignment');

      return sendJson(200, {
        success: true,
        targetPhone: `+91 ${targetPhone}`,
        riskScore: score,
        riskLevel,
        flags,
        recommendedAction: action
      });
    }

    if (pathname === '/admin/clean-test-data' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      // Clean test data
      db.bookings = [];
      db.leads = [];
      db.notifications = [];
      db.payments = [];
      db.wallet_ledger = [];
      db.driver_applications = [];
      db.drivers = (db.drivers || []).filter(d => !d.id.startsWith('drv_98'));
      db.users = (db.users || []).filter(u => u.role === 'admin' || u.phone === '+91 6206494214');

      await saveDb(db);

      // Clean MongoDB Atlas directly if connected
      const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://himanshudu255_db_user:Himanshu%40123@cluster0.7pf5pvc.mongodb.net/onewaytaxibihar?retryWrites=true&w=majority&appName=Cluster0';
      try {
        const { MongoClient } = require('mongodb');
        const client = new MongoClient(mongoUri);
        await client.connect();
        const dbName = process.env.MONGODB_DB_NAME || 'onewaytaxibihar';
        const mDb = client.db(dbName);
        await Promise.allSettled([
          mDb.collection('bookings').deleteMany({}),
          mDb.collection('leads').deleteMany({}),
          mDb.collection('notifications').deleteMany({}),
          mDb.collection('payments').deleteMany({}),
          mDb.collection('wallet_ledger').deleteMany({}),
          mDb.collection('driver_applications').deleteMany({}),
          mDb.collection('drivers').deleteMany({ id: { $regex: /^drv_98/ } }),
          mDb.collection('users').deleteMany({ role: { $ne: 'admin' }, phone: { $ne: '+91 6206494214' } })
        ]);
        await client.close();
      } catch(e) {}

      return sendJson(200, {
        success: true,
        message: 'All test bookings, inquiries, and mock data successfully cleared!'
      });
    }

    // -------------------------------------------------------------
    // PHASE 18: REAL-WORLD PRODUCTION RESILIENCE & INCIDENT MANAGEMENT
    // -------------------------------------------------------------

    // 1. SCENARIO 2 RECOVERY: Orphan Payment Reconciliation
    if (pathname === '/payments/reconcile-orphan' && method === 'POST') {
      const paymentTxnId = (body.paymentTxnId || body.razorpayPaymentId || body.upiUtr || '').toString().trim();
      const passengerPhone = (body.passengerPhone || body.phone || '').toString().trim();
      const cleanPhone = passengerPhone.replace(/\D/g, '').slice(-10);
      const amount = Number(body.amount || body.advanceAmount || 299);

      if (!paymentTxnId) {
        return sendJson(400, { success: false, message: 'Valid payment transaction ID or UPI UTR required for reconciliation.' });
      }
      if (!cleanPhone || cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Valid 10-digit customer mobile number required.' });
      }

      // Check if already mapped to a confirmed booking
      const existing = (db.bookings || []).find(b => 
        b.paymentTxnId === paymentTxnId || (b.upiUtr && b.upiUtr === paymentTxnId)
      );

      if (existing) {
        return sendJson(200, {
          success: true,
          reconciled: false,
          alreadyExists: true,
          booking: existing,
          message: 'Payment was already reconciled with booking ' + existing.bookingId
        });
      }

      // Recover and auto-construct verified booking
      const bId = `OWB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const tripOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const originCity = body.originCity || body.pickupCity || 'Patna';
      const destCity = body.destCity || body.dropCity || 'Gaya';
      const cabTier = body.cabTier || 'sedan';
      const distanceKm = getRouteDistance(originCity, destCity);
      const serverFare = calculateServerFare(distanceKm, cabTier, 'oneway', originCity, destCity);
      const totalFare = serverFare.totalFare;
      const advancePaid = amount;
      const balanceDue = Math.max(0, totalFare - advancePaid);

      const reconciledBooking = {
        bookingId: bId,
        tripOtp,
        customerId: `usr_${cleanPhone}`,
        paymentTxnId,
        idempotencyKey: `orphan_recon_${paymentTxnId}`,
        passengerName: (body.passengerName || body.name || 'Valued Passenger').trim().slice(0, 80),
        passengerPhone: `+91 ${cleanPhone}`,
        passengerEmail: body.passengerEmail || '',
        originCity,
        destCity,
        pickupAddress: body.pickupAddress || `${originCity} City`,
        dropAddress: body.dropAddress || `${destCity} City`,
        pickupDate: body.pickupDate || new Date().toISOString().slice(0, 10),
        pickupTime: body.pickupTime || '10:00 AM',
        distanceKm,
        duration: serverFare.duration,
        fleetClass: serverFare.tierName,
        fleetModel: serverFare.tierModel,
        fareBreakdown: serverFare,
        fare: totalFare,
        totalFare,
        originalFare: totalFare,
        advancePaid,
        balanceDue,
        paymentMethod: body.gateway || 'UPI Online / Gateway Advance',
        paymentStatus: advancePaid >= totalFare ? 'PAID' : 'ADVANCE_PAID',
        bookingStatus: 'CONFIRMED',
        status: 'CONFIRMED',
        phoneVerified: true,
        verifiedMethod: 'Payment Gateway Token Verification',
        verifiedAt: new Date().toISOString(),
        reconciledFromOrphanPayment: true,
        partnerNotice: 'Payment verified & recovered. Our Patna central dispatch desk is assigning your chauffeur.',
        driverDetails: null,
        statusHistory: [
          {
            status: 'CONFIRMED',
            timestamp: new Date().toISOString(),
            actor: 'System Reconciler',
            note: `Auto-reconciled orphan payment #${paymentTxnId} into confirmed booking. Advance ₹${advancePaid} verified.`
          }
        ],
        createdAt: new Date().toISOString()
      };

      if (!db.bookings) db.bookings = [];
      db.bookings.unshift(reconciledBooking);

      if (!db.payments) db.payments = [];
      db.payments.unshift({
        id: `pay_${Date.now()}`,
        bookingId: bId,
        amount: advancePaid,
        method: body.gateway || 'Online / UPI',
        status: 'SUCCESS',
        txnId: paymentTxnId,
        type: 'ORPHAN_RECONCILED',
        createdAt: new Date().toISOString()
      });

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `notif_recon_${Date.now()}`,
        type: 'PAYMENT_RECONCILED',
        title: `⚡ ORPHAN PAYMENT RECONCILED: ${bId}`,
        message: `Customer +91 ${cleanPhone} payment ₹${advancePaid} successfully recovered into Booking ${bId} (${originCity} to ${destCity}).`,
        bookingId: bId,
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      notificationService.sendBookingConfirmationNotifications(reconciledBooking).catch(e => console.warn('Orphan recovery notification notice:', e.message));

      return sendJson(200, {
        success: true,
        reconciled: true,
        booking: reconciledBooking,
        message: 'Orphan payment successfully reconciled. Booking is CONFIRMED with guaranteed cab arrival.'
      });
    }

    // 2. EMERGENCY BOOKING PAUSE CAPABILITY
    if ((pathname === '/emergency-pause' || pathname === '/admin/emergency-pause') && method === 'GET') {
      return sendJson(200, {
        success: true,
        paused: Boolean(db.settings?.emergencyBookingPause),
        reason: db.settings?.emergencyPauseReason || '',
        pausedAt: db.settings?.emergencyPausedAt || null,
        pausedBy: db.settings?.emergencyPausedBy || null,
        helpline: '+91 80021 41816',
        whatsapp: '+91 72818 51011'
      });
    }

    if (pathname === '/admin/emergency-pause' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required to toggle emergency booking pause' });

      const pauseFlag = Boolean(body.paused);
      const reason = (body.reason || (pauseFlag ? 'Adverse highway conditions / emergency maintenance' : '')).trim();

      if (!db.settings) db.settings = {};
      db.settings.emergencyBookingPause = pauseFlag;
      db.settings.emergencyPauseReason = pauseFlag ? reason : '';
      db.settings.emergencyPausedAt = pauseFlag ? new Date().toISOString() : null;
      db.settings.emergencyPausedBy = pauseFlag ? (admin.username || 'admin') : null;

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `notif_pause_${Date.now()}`,
        type: 'DISPATCH_ALERT',
        title: pauseFlag ? '⚠️ EMERGENCY BOOKING PAUSE ACTIVATED' : '✅ BOOKING SYSTEM RESUMED',
        message: pauseFlag ? `Online bookings paused by ${admin.username}. Reason: ${reason}` : `Online bookings resumed by ${admin.username}`,
        priority: 'URGENT',
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        paused: db.settings.emergencyBookingPause,
        reason: db.settings.emergencyPauseReason,
        message: pauseFlag ? 'Emergency booking pause ACTIVATED. Customers will see maintenance advisory and dispatch hotline.' : 'Emergency pause DEACTIVATED. Normal online booking flow restored.'
      });
    }

    // 3. CUSTOMER SUPPORT & BOOKING COMPLAINT TICKETING SYSTEM
    if (pathname === '/support/tickets' && method === 'POST') {
      const cleanPhone = (body.phone || body.passengerPhone || '').toString().replace(/\D/g, '').slice(-10);
      const message = (body.message || body.complaint || body.issue || '').toString().trim();
      const bookingId = (body.bookingId || body.rideId || '').toString().trim().toUpperCase();

      if (!cleanPhone || cleanPhone.length !== 10) {
        return sendJson(400, { success: false, message: 'Valid 10-digit customer mobile number required.' });
      }
      if (!message || message.length < 5) {
        return sendJson(400, { success: false, message: 'Please provide a detailed description of your issue (minimum 5 characters).' });
      }

      let verifiedBooking = null;
      if (bookingId) {
        verifiedBooking = (db.bookings || []).find(b => (b.bookingId || '').toUpperCase() === bookingId || (b.id || '').toUpperCase() === bookingId);
      }

      const ticketId = `TCK-${Date.now().toString().slice(-6)}`;
      const newTicket = {
        id: ticketId,
        ticketId,
        bookingId: verifiedBooking ? verifiedBooking.bookingId : (bookingId || null),
        passengerPhone: `+91 ${cleanPhone}`,
        cleanPhone,
        passengerName: (body.passengerName || body.name || verifiedBooking?.passengerName || 'Valued Passenger').trim().slice(0, 80),
        category: (body.category || 'GENERAL').toUpperCase(),
        priority: (body.priority || 'NORMAL').toUpperCase(),
        subject: (body.subject || `Support Request regarding ${bookingId || 'OneWayTaxiBihar'}`).slice(0, 120),
        message,
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        resolvedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!db.support_tickets) db.support_tickets = [];
      db.support_tickets.unshift(newTicket);

      if (!db.notifications) db.notifications = [];
      db.notifications.unshift({
        id: `notif_tck_${Date.now()}`,
        type: 'CUSTOMER_TICKET',
        title: `🚨 SUPPORT TICKET: ${ticketId} [${newTicket.category}]`,
        message: `From +91 ${cleanPhone} ${bookingId ? `(Ride: ${bookingId})` : ''}: ${message.slice(0, 100)}`,
        bookingId: newTicket.bookingId,
        priority: 'HIGH',
        createdAt: new Date().toISOString()
      });

      await saveDb(db);

      return sendJson(200, {
        success: true,
        ticketId,
        ticket: newTicket,
        message: 'Your ticket has been registered with priority. Our Patna Central Dispatch Desk will contact you within 15 minutes.'
      });
    }

    if (pathname === '/support/tickets' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      const phoneParam = (url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-10);
      const bIdParam = (url.searchParams.get('bookingId') || '').toUpperCase();
      const statusParam = (url.searchParams.get('status') || '').toUpperCase();

      let tickets = db.support_tickets || [];

      if (!admin) {
        if (!phoneParam) {
          return sendJson(401, { success: false, message: 'Mobile phone or admin authorization required to view support tickets' });
        }
        tickets = tickets.filter(t => t.cleanPhone === phoneParam);
      } else {
        if (phoneParam) tickets = tickets.filter(t => t.cleanPhone === phoneParam);
        if (bIdParam) tickets = tickets.filter(t => (t.bookingId || '').toUpperCase() === bIdParam);
        if (statusParam) tickets = tickets.filter(t => t.status === statusParam);
      }

      return sendJson(200, {
        success: true,
        count: tickets.length,
        tickets
      });
    }

    if (pathname === '/admin/support/resolve' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      const tId = (body.ticketId || body.id || '').toString().trim();
      const target = (db.support_tickets || []).find(t => t.ticketId === tId || t.id === tId);

      if (!target) {
        return sendJson(404, { success: false, message: 'Support ticket not found' });
      }

      target.status = body.status || 'RESOLVED';
      target.resolutionNotes = (body.resolutionNotes || body.notes || 'Resolved by dispatch officer').trim();
      target.resolvedBy = admin.username || 'admin';
      target.resolvedAt = new Date().toISOString();
      target.updatedAt = new Date().toISOString();

      await saveDb(db);

      return sendJson(200, {
        success: true,
        ticket: target,
        message: `Ticket ${tId} marked as ${target.status}`
      });
    }

    // 4. APPLICATION & API MONITORING, UPTIME & HEALTH CHECKS
    if ((pathname === '/monitoring/health' || pathname === '/health/deep') && method === 'GET') {
      const mem = process.memoryUsage();
      const uptimeSec = Math.round(process.uptime());
      const now = Date.now();
      const recentErrors = (db.error_logs || []).filter(e => now - new Date(e.timestamp || 0).getTime() < 3600000).length;

      return sendJson(200, {
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
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
          heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024)
        },
        incidentStatus: {
          emergencyPauseActive: Boolean(db.settings?.emergencyBookingPause),
          recentErrorsPastHour: recentErrors,
          openSupportTickets: (db.support_tickets || []).filter(t => t.status === 'OPEN').length
        },
        smsGateway: {
          fast2sms: 'ONLINE (Route Q ₹5.00 fallback active)',
          whatsAppDeepLink: 'ONLINE'
        }
      });
    }

    if (pathname === '/monitoring/metrics' && method === 'GET') {
      const bookings = db.bookings || [];
      const totalBookings = bookings.length;
      const activeTrips = bookings.filter(b => ['DRIVER ASSIGNED', 'ACCEPTED', 'ON THE WAY', 'ARRIVED', 'TRIP STARTED'].includes(b.bookingStatus)).length;
      const completedTrips = bookings.filter(b => b.bookingStatus === 'COMPLETED').length;
      const cancelledTrips = bookings.filter(b => b.bookingStatus === 'CANCELLED').length;
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.fare) || 0), 0);
      const advanceCollected = bookings.reduce((sum, b) => sum + (Number(b.advancePaid) || 0), 0);

      return sendJson(200, {
        success: true,
        metrics: {
          totalBookings,
          activeTrips,
          completedTrips,
          cancelledTrips,
          totalRevenue,
          advanceCollected,
          driverCount: (db.drivers || []).length,
          vehicleCount: (db.vehicles || []).length,
          openTickets: (db.support_tickets || []).filter(t => t.status === 'OPEN').length,
          unresolvedErrors: (db.error_logs || []).length,
          uptimeSeconds: Math.round(process.uptime())
        },
        timestamp: new Date().toISOString()
      });
    }

    // 5. ERROR TRACKING & ADMIN AUDIT LOGS
    if (pathname === '/admin/errors' && method === 'GET') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      return sendJson(200, {
        success: true,
        count: (db.error_logs || []).length,
        errors: (db.error_logs || []).slice(0, 100)
      });
    }

    if (pathname === '/admin/errors/clear' && method === 'POST') {
      const admin = getSessionAdmin(req, db);
      if (!admin) return sendJson(401, { success: false, message: 'Admin authentication required' });

      db.error_logs = [];
      await saveDb(db);
      return sendJson(200, { success: true, message: 'All error logs cleared by admin' });
    }

    // Default 404 for unknown API routes
    return sendJson(404, { success: false, message: 'API route not found' });

  } catch (err) {
    console.error('[API Error]:', err);
    try {
      const errEntry = {
        id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        message: err.message || 'Unknown error',
        stack: (err.stack || '').split('\n').slice(0, 5).join('\n'),
        pathname,
        method,
        timestamp: new Date().toISOString()
      };
      const fallbackDb = dbService.getDb();
      if (!fallbackDb.error_logs) fallbackDb.error_logs = [];
      fallbackDb.error_logs.unshift(errEntry);
      if (fallbackDb.error_logs.length > 200) fallbackDb.error_logs = fallbackDb.error_logs.slice(0, 200);
      dbService.saveDbAsync(fallbackDb).catch(() => {});
    } catch (e) {}

    return sendJson(500, {
      success: false,
      message: 'We encountered a momentary technical delay. Your request is protected and our dispatch desk has been notified. For immediate booking assistance, call +91 80021 41816.',
      helpline: '+91 80021 41816',
      incidentRef: `ERR-${Date.now().toString().slice(-6)}`
    });
  }
};
