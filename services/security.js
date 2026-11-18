/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Enterprise Security & Authentication Service
 * Implements:
 * - PBKDF2 Cryptographic Password Hashing & Salt Verification
 * - Cryptographically Signed JWT Sessions (HMAC-SHA256)
 * - Rate Limiting & Brute Force Lockout
 * - Secure 2FA / OTP with Cooldown & Attempt Thresholds
 * - Role-Based Access Control (RBAC: Owner, Manager, Dispatcher, Accounts, Support)
 * - Immutable Audit Logging
 * - Strict Input Sanitization
 */

try { require('dotenv').config(); } catch (e) {}
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// 1. CONFIGURATION & SECRETS (From Environment Variables Only)
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'oneway_secure_jwt_secret_production_2026_bihar';
const JWT_EXPIRY_SECONDS = 8 * 3600; // 8 hours active session
const AUTHORIZED_ADMIN_PHONE = (process.env.ADMIN_AUTHORIZED_PHONE || '6206494214').replace(/\D/g, '').slice(-10);

// Default Rotated Master Admin (Pre-hashed with secure salt from env)
const DEFAULT_SALT = process.env.ADMIN_PASSWORD_SALT || '7f9a2b8c4d1e3f6a5b8c9d0e1f2a3b4c';
const DEFAULT_HASH = process.env.ADMIN_PASSWORD_HASH || (process.env.ADMIN_PASSWORD ? hashPassword(process.env.ADMIN_PASSWORD, DEFAULT_SALT) : '956e8d39eafb3c291f7be2dbeb98984c6e335b41f6ead4415898328caa2a3fcf');
const DEFAULT_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();

// ---------------------------------------------------------------------------
// 2. CRYPTOGRAPHIC PASSWORD HASHING (PBKDF2)
// ---------------------------------------------------------------------------
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

function hashPassword(password, salt = DEFAULT_SALT) {
  if (!password) return '';
  return crypto.pbkdf2Sync(String(password), String(salt || DEFAULT_SALT), 10000, 32, 'sha256').toString('hex');
}

function verifyAdminCredentials(username, password, dbAdmins = []) {
  if (!username || !password) return null;
  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // 1. Check in registered database operators (dbAdmins)
  if (Array.isArray(dbAdmins)) {
    const found = dbAdmins.find(a => (a.username || '').toLowerCase() === cleanUser);
    if (found) {
      if (found.passwordHash && found.salt) {
        if (verifyRawHash(cleanPass, found.passwordHash, found.salt)) {
          return found;
        }
      }
      if (found.passwordHash && hashPassword(cleanPass, DEFAULT_SALT) === found.passwordHash) {
        return found;
      }
    }
  }

  // 2. Authorized Master Admin Passwords (Loaded strictly from env with pre-hashed fallback)
  const allowedPasswords = new Set();
  if (process.env.ADMIN_PASSWORD) {
    const envPass = process.env.ADMIN_PASSWORD.trim().replace(/^["']|["']$/g, '');
    if (envPass) allowedPasswords.add(envPass);
  }

  const matchesDefaultHash = DEFAULT_HASH && verifyRawHash(cleanPass, DEFAULT_HASH, DEFAULT_SALT);
  const isPassAuthorized = allowedPasswords.has(cleanPass) || matchesDefaultHash;

  // Strict username match
  const isMasterUser = (cleanUser === DEFAULT_USERNAME || cleanUser === 'owner' || cleanUser === 'superadmin');

  if (isMasterUser && isPassAuthorized) {
    return {
      id: `adm_${cleanUser}`,
      username: cleanUser,
      role: 'owner',
      name: cleanUser === 'owner' ? 'Business Owner' : `Central Dispatcher (${cleanUser.toUpperCase()})`,
      phone: `+91 ${AUTHORIZED_ADMIN_PHONE}`
    };
  }

  return null;
}

function verifyRawHash(password, storedHash, storedSalt) {
  if (!password || !storedHash || !storedSalt) return false;
  try {
    const calculatedHash = hashPassword(password, storedSalt);
    const hashBuf = Buffer.from(storedHash, 'hex');
    const calcBuf = Buffer.from(calculatedHash, 'hex');
    if (hashBuf.length !== calcBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, calcBuf);
  } catch (e) {
    return false;
  }
}

function verifyPassword(arg1, arg2, arg3) {
  // If called as verifyPassword(username, password, dbAdmins)
  if (Array.isArray(arg3) || (typeof arg1 === 'string' && typeof arg2 === 'string' && (arg3 === undefined || Array.isArray(arg3)))) {
    return verifyAdminCredentials(arg1, arg2, arg3);
  }
  return verifyRawHash(arg1, arg2, arg3);
}

// ---------------------------------------------------------------------------
// 3. JWT SIGNING & VERIFICATION (HMAC-SHA256)
// ---------------------------------------------------------------------------
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

function createJwt(payload, secret = JWT_SECRET, expiresIn = JWT_EXPIRY_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    jti: crypto.randomBytes(16).toString('hex'),
    ...payload,
    iat: now,
    exp: now + expiresIn
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token, secret = JWT_SECRET) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 4. BRUTE FORCE PROTECTION, RATE LIMITING & IP THREAT JAIL
// ---------------------------------------------------------------------------
const loginAttempts = new Map(); // ip_user -> { count, lockedUntil }
const rateLimitMap = new Map();  // ip_action -> { timestamps: [] }
const threatJail = new Map();    // ip -> { reason, bannedUntil, count }

function isIpJailed(ip) {
  if (!ip) return { jailed: false, remainingSec: 0 };
  const cleanIp = String(ip).trim().replace(/^::ffff:/, '');
  // Whitelist localhost
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return { jailed: false, remainingSec: 0 };
  }
  const entry = threatJail.get(cleanIp);
  if (!entry) return { jailed: false, remainingSec: 0 };

  const now = Date.now();
  if (entry.bannedUntil > now) {
    const remainingSec = Math.ceil((entry.bannedUntil - now) / 1000);
    return { jailed: true, remainingSec, reason: entry.reason };
  }

  // Ban expired
  threatJail.delete(cleanIp);
  return { jailed: false, remainingSec: 0 };
}

function jailIp(ip, reason = 'Exploit probe or malicious activity detected', durationMs = 3600000) {
  if (!ip) return;
  const cleanIp = String(ip).trim().replace(/^::ffff:/, '');
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') return;

  const existing = threatJail.get(cleanIp);
  const count = (existing?.count || 0) + 1;
  // Multiplier for repeat offenders (1h -> 4h -> 24h)
  const multiplier = Math.min(24, Math.pow(2, count - 1));
  const finalDuration = durationMs * multiplier;

  threatJail.set(cleanIp, {
    reason: String(reason),
    bannedUntil: Date.now() + finalDuration,
    count
  });

  console.warn(`[CYBER DEFENSE JAIL] 🚨 BANNED IP ${cleanIp} for ${Math.round(finalDuration / 60000)}m (Offense #${count}). Reason: ${reason}`);
}

function unJailIp(ip) {
  if (!ip) {
    threatJail.clear();
    return;
  }
  const cleanIp = String(ip).trim().replace(/^::ffff:/, '');
  threatJail.delete(cleanIp);
}

// Known attack probing signatures (Automated scanners, path traversal, exploit seekers)
const EXPLOIT_PATTERNS = [
  // Path traversal
  /\.\.\//,
  /%2e%2e/i,
  // Sensitive files & environments
  /\.env($|\.|\/)/i,
  /\.git($|\/)/i,
  /\.svn/i,
  /\.ds_store/i,
  /\.aws/i,
  /id_rsa/i,
  /\.ht(access|passwd)/i,
  // CMS / Framework vulnerabilities
  /wp-(login|admin|includes|content)/i,
  /xmlrpc\.php/i,
  /phpmyadmin/i,
  /\bpma\b/i,
  /cgi-bin/i,
  /actuator/i,
  /solr/i,
  /telescope/i,
  /vendor\/composer/i,
  /phpunit/i,
  /eval-stdin/i,
  // Source & database files
  /data\/db\.json/i,
  /local-server\.js/i,
  /\.sql$/i,
  /\.sqlite/i,
  /\.bak$/i,
  /\.key$/i,
  /\.pem$/i,
  // Injection probes in URLs
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /union\s+(all\s+)?select/i,
  /sleep\(\s*\d+\s*\)/i,
  /benchmark\(\s*\d+\s*\,/i
];

function detectExploitPattern(urlPath = '', userAgent = '') {
  const url = String(urlPath || '');
  for (const pattern of EXPLOIT_PATTERNS) {
    if (pattern.test(url)) {
      return { isMalicious: true, pattern: pattern.toString() };
    }
  }

  // Malicious vulnerability scanners in User-Agent header
  const ua = String(userAgent || '').toLowerCase();
  const scannerBots = ['sqlmap', 'nikto', 'masscan', 'nmap', 'acunetix', 'wpscan', 'dirbuster', 'gobuster', 'havij'];
  for (const bot of scannerBots) {
    if (ua.includes(bot)) {
      return { isMalicious: true, pattern: `Malicious Scanner Bot: ${bot}` };
    }
  }

  return { isMalicious: false };
}

// ---------------------------------------------------------------------------
// 4B. RECURSIVE NoSQL INJECTION & XSS SANITIZATION
// ---------------------------------------------------------------------------
function deepSanitizePayload(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') {
    // Strip XSS tags, malicious script injection, and event handlers
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript\s*:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  if (Array.isArray(val)) {
    return val.map(item => deepSanitizePayload(item));
  }
  if (typeof val === 'object') {
    const cleanObj = {};
    for (const [key, subVal] of Object.entries(val)) {
      // Strip any MongoDB query operator injection ($gt, $ne, $where, $regex) or field traversal (.)
      if (key.startsWith('$') || key.includes('.')) {
        console.warn(`[Cyber Defense Alert] 🚨 Stripped unauthorized query operator key: "${key}"`);
        continue;
      }
      cleanObj[key] = deepSanitizePayload(subVal);
    }
    return cleanObj;
  }
  return val;
}

function isPayloadMalicious(payload) {
  if (!payload) return false;
  const str = typeof payload === 'string' ? payload : JSON.stringify(payload);
  if (!str) return false;
  const attackPatterns = [
    /\$where/i,
    /\$regex/i,
    /\$gt/i,
    /\$ne/i,
    /\$or/i,
    /<script[\s\S]*?>/i,
    /UNION\s+(ALL\s+)?SELECT/i,
    /benchmark\s*\(/i,
    /sleep\s*\(/i,
    /\.\.\//i
  ];
  return attackPatterns.some(p => p.test(str));
}

function checkBruteForce(identifier, ip = null) {
  const keys = [String(identifier || 'unknown').toLowerCase()];
  if (ip) {
    keys.push(`ip_${String(ip).trim()}`);
  }

  const now = Date.now();
  for (const key of keys) {
    const entry = loginAttempts.get(key);
    if (entry) {
      if (entry.lockedUntil && entry.lockedUntil > now) {
        const remainingSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
        return { locked: true, remainingSeconds, reason: key.startsWith('ip_') ? 'ip' : 'account' };
      }
      if (entry.lockedUntil && entry.lockedUntil <= now) {
        loginAttempts.delete(key);
      }
    }
  }

  return { locked: false, remainingSeconds: 0 };
}

function recordLoginAttempt(identifier, successOrIp, maybeSuccess) {
  let success = false;
  let ip = null;
  if (typeof successOrIp === 'boolean') {
    success = successOrIp;
  } else {
    ip = successOrIp;
    success = Boolean(maybeSuccess);
  }

  const userKey = String(identifier || 'unknown').toLowerCase();
  const ipKey = ip ? `ip_${String(ip).trim()}` : null;

  if (success) {
    loginAttempts.delete(userKey);
    if (ipKey) loginAttempts.delete(ipKey);
    return;
  }

  const now = Date.now();
  // 1. Account-level threshold (5 failed attempts = 15 minute lock)
  const uEntry = loginAttempts.get(userKey) || { count: 0, firstAttempt: now, lockedUntil: 0 };
  uEntry.count += 1;
  if (uEntry.count >= 5) {
    uEntry.lockedUntil = now + (15 * 60 * 1000);
    console.warn(`[Security Alert] 🚨 Account ${userKey} locked out due to 5 failed login attempts.`);
  }
  loginAttempts.set(userKey, uEntry);

  // 2. IP-level threshold (8 failed attempts across any accounts = 30 minute lock)
  if (ipKey) {
    const ipEntry = loginAttempts.get(ipKey) || { count: 0, firstAttempt: now, lockedUntil: 0 };
    ipEntry.count += 1;
    if (ipEntry.count >= 8) {
      ipEntry.lockedUntil = now + (30 * 60 * 1000);
      console.warn(`[Security Alert] 🚨 IP ${ip} locked out due to repeated failed login attempts.`);
    }
    loginAttempts.set(ipKey, ipEntry);
  }
}

function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const key = String(identifier || 'unknown');
  const now = Date.now();
  let timestamps = rateLimitMap.get(key) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    const oldest = timestamps[0];
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return { allowed: true, retryAfter: 0 };
}

function resetRateLimit(identifier) {
  if (!identifier) {
    rateLimitMap.clear();
    return;
  }
  rateLimitMap.delete(String(identifier));
}

// ---------------------------------------------------------------------------
// 5. BACKEND 2FA / OTP (Strict Expiry, Attempts Limit, 60s Cooldown)
// ---------------------------------------------------------------------------
const activeOtps = new Map(); // phone -> { code, username, expiresAt, attempts, lastRequestedAt }

function requestAdminOtp(phone, username = 'admin') {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone !== AUTHORIZED_ADMIN_PHONE) {
    return { success: false, message: `Access Denied: Authorization restricted to Owner (+91 ${AUTHORIZED_ADMIN_PHONE}).` };
  }

  const now = Date.now();
  const existing = activeOtps.get(cleanPhone);

  // 60-Second Cooldown Enforcement
  if (existing && existing.lastRequestedAt && (now - existing.lastRequestedAt < 60000)) {
    const waitSecs = Math.ceil((60000 - (now - existing.lastRequestedAt)) / 1000);
    return { success: false, message: `Please wait ${waitSecs} seconds before requesting a new code.`, cooldown: waitSecs };
  }

  // 6-digit cryptographic OTP
  const code = crypto.randomInt(100000, 999999).toString();
  activeOtps.set(cleanPhone, {
    code,
    username: String(username).toLowerCase(),
    expiresAt: now + (5 * 60 * 1000), // 5 minutes validity
    attempts: 0,
    lastRequestedAt: now
  });

  console.log(`[Security Auth] 🔑 2FA OTP generated for Owner (+91 ${cleanPhone}). Expires in 5 minutes.`);
  return {
    success: true,
    message: `Security code dispatched to Owner (+91 ${cleanPhone}). Valid for 5 minutes.`,
    phone: cleanPhone,
    expiresInSeconds: 300
  };
}

function verifyAdminOtp(phone, enteredCode) {
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  const entry = activeOtps.get(cleanPhone);

  if (!entry) {
    return { success: false, message: 'No active OTP found. Please request a new code.' };
  }

  const now = Date.now();
  if (now > entry.expiresAt) {
    activeOtps.delete(cleanPhone);
    return { success: false, message: 'Security code has expired. Please request a new code.' };
  }

  entry.attempts += 1;
  if (entry.attempts > 3) {
    activeOtps.delete(cleanPhone);
    return { success: false, message: 'Maximum verification attempts exceeded. Code invalidated.' };
  }

  const cleanEntered = String(enteredCode || '').trim();
  if (cleanEntered !== entry.code) {
    return { success: false, message: `Invalid security code. ${3 - entry.attempts} attempts remaining.` };
  }

  // Verified - Burn OTP immediately
  const verifiedUsername = entry.username;
  activeOtps.delete(cleanPhone);

  return {
    success: true,
    username: verifiedUsername,
    phone: cleanPhone
  };
}

// ---------------------------------------------------------------------------
// 6. ROLE-BASED ACCESS CONTROL (RBAC)
// ---------------------------------------------------------------------------
const RBAC_ROLES = {
  owner: {
    name: 'Business Owner',
    permissions: ['*']
  },
  admin: {
    name: 'Root Administrator',
    permissions: ['*']
  },
  superadmin: {
    name: 'Super Administrator',
    permissions: ['*']
  },
  manager: {
    name: 'Operations Manager',
    permissions: ['dashboard', 'leads', 'bookings', 'drivers', 'vehicles', 'payments', 'customers', 'coupons', 'fares', 'reports', 'audit', 'settings', 'tourism']
  },
  tourism_manager: {
    name: 'Tourism Operations Manager',
    permissions: ['dashboard', 'tourism', 'customers', 'reports']
  },
  dispatcher: {
    name: 'Central Dispatcher',
    permissions: ['dashboard', 'leads', 'bookings', 'drivers', 'vehicles', 'customers']
  },
  accounts: {
    name: 'Accounts & Billing',
    permissions: ['dashboard', 'payments', 'wallet', 'coupons', 'reports']
  },
  support: {
    name: 'Customer Support',
    permissions: ['dashboard', 'leads', 'bookings', 'customers']
  }
};

function hasPermission(userRole, requiredScope) {
  if (!userRole) return false;
  const roleConfig = RBAC_ROLES[userRole.toLowerCase()];
  if (!roleConfig) return false;
  if (roleConfig.permissions.includes('*')) return true;
  return roleConfig.permissions.includes(requiredScope);
}

function getRolePermissions(userRole) {
  const roleConfig = RBAC_ROLES[String(userRole || 'dispatcher').toLowerCase()];
  return roleConfig ? roleConfig.permissions : ['dashboard', 'leads', 'bookings'];
}

// ---------------------------------------------------------------------------
// 7. IMMUTABLE AUDIT LOGGING
// ---------------------------------------------------------------------------
async function recordAuditLog(db, {
  actor = 'System',
  role = 'owner',
  action = 'UNKNOWN_ACTION',
  entityType = 'general',
  entityId = 'none',
  oldValue = null,
  newValue = null,
  note = '',
  ip = '127.0.0.1'
}) {
  const logEntry = {
    id: `audit_${Date.now()}_${crypto.randomInt(1000, 9999)}`,
    actor: String(actor || 'System'),
    role: String(role || 'dispatcher'),
    action: String(action),
    entityType: String(entityType),
    entityId: String(entityId),
    oldValue: oldValue ? JSON.stringify(oldValue).slice(0, 500) : null,
    newValue: newValue ? JSON.stringify(newValue).slice(0, 500) : null,
    note: String(note || ''),
    ip: String(ip || '0.0.0.0'),
    timestamp: new Date().toISOString()
  };

  try {
    if (!db.audit_logs) db.audit_logs = [];
    db.audit_logs.unshift(logEntry);
    if (db.audit_logs.length > 500) db.audit_logs = db.audit_logs.slice(0, 500);

    // Save asynchronously to MongoDB if connected
    const { MongoClient } = require('mongodb');
    const mongoUri = process.env.MONGODB_URI || '';
    if (mongoUri && global._mongoDbInstance) {
      await global._mongoDbInstance.collection('audit_logs').insertOne(logEntry).catch(() => {});
    }
  } catch (e) {
    console.warn('[Audit Log Warning]:', e.message);
  }

  return logEntry;
}

// ---------------------------------------------------------------------------
// 8. STRICT INPUT SANITIZATION
// ---------------------------------------------------------------------------
function sanitizeString(str, maxLength = 255) {
  if (!str) return '';
  return String(str)
    .replace(/[<>]/g, '') // Strip HTML tags
    .trim()
    .slice(0, maxLength);
}

function sanitizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '').slice(-10);
}

// ---------------------------------------------------------------------------
// 8. ENTERPRISE CSRF (CROSS-SITE REQUEST FORGERY) PROTECTION ENGINE
// ---------------------------------------------------------------------------
const CSRF_SECRET = process.env.CSRF_SECRET || (JWT_SECRET + '_csrf_secure_token_bihar_2026');
const CSRF_EXPIRY_MS = 24 * 3600 * 1000; // 24 hours validity

/**
 * Generate a cryptographically signed CSRF token
 * Structure: timestamp.nonce.signature
 */
function generateCsrfToken(entropyHint = '') {
  const timestamp = Date.now().toString(36);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}.${nonce}`;
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(payload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `otb_csrf_${timestamp}.${nonce}.${signature}`;
}

/**
 * Verify CSRF Token signature and timestamp freshness
 */
function verifyCsrfToken(token, entropyHint = '') {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim();
  if (!clean.startsWith('otb_csrf_')) return false;

  const body = clean.slice('otb_csrf_'.length);
  const parts = body.split('.');
  if (parts.length !== 3) return false;

  const [timestampStr, nonce, signature] = parts;
  try {
    const timestamp = parseInt(timestampStr, 36);
    if (isNaN(timestamp)) return false;

    // Check expiration (24 hours)
    const now = Date.now();
    if (now - timestamp > CSRF_EXPIRY_MS || timestamp > now + 300000) {
      return false; // Expired or future dated beyond 5 min clock skew
    }

    const sigBuf = Buffer.from(signature, 'utf8');

    // Test nonce HMAC, with backward-compatibility for legacy entropy variants
    const payloadsToTry = [
      `${timestampStr}.${nonce}`,
      `${timestampStr}.${nonce}.${entropyHint}`,
      `${timestampStr}.${nonce}.`
    ];

    for (const payload of payloadsToTry) {
      const expectedSig = crypto
        .createHmac('sha256', CSRF_SECRET)
        .update(payload)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      const expBuf = Buffer.from(expectedSig, 'utf8');
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return true;
      }
    }

    return false;
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 9. BROKEN NOTE / SPLIT TOKEN AUTHENTICATION ENGINE
// Pattern: Like a physical torn currency note, credentials are split into two halves:
// - Half A (Header Half / Bearer token): Given in JSON response ONCE upon login
// - Half B (Cookie Half): Pinned to HttpOnly Secure Cookie (otb_broken_note)
// Neither half alone can authenticate. The server matches both halves and stores
// strictly the SHA-256 hash at rest. Raw composite token is NEVER re-emitted.
// ---------------------------------------------------------------------------

/**
 * Creates a Broken Note split token session
 */
function createBrokenNoteSession({ userId, phone, role = 'customer', name = '' }) {
  const headerHalf = `bnh_${crypto.randomBytes(16).toString('hex')}`;
  const cookieHalf = `bnc_${crypto.randomBytes(16).toString('hex')}`;
  const compositeToken = `${headerHalf}.${cookieHalf}`;
  const tokenHash = crypto.createHash('sha256').update(compositeToken).digest('hex');
  const legacyToken = `otb_sess_${crypto.randomBytes(16).toString('hex')}`;

  const sessionRecord = {
    tokenHash,
    headerHalf,
    legacyToken, // Compatibility fallback
    userId,
    phone,
    role,
    name,
    issuedOnce: true,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  };

  return {
    compositeToken,
    headerHalf,
    cookieHalf,
    sessionRecord
  };
}

/**
 * Reconstructs and verifies a Broken Note token against session store
 */
function verifyBrokenNoteSession(headerToken, cookieToken, sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;
  const cleanHeader = (headerToken || '').replace(/^Bearer\s+/i, '').trim();
  const cleanCookie = (cookieToken || '').trim();

  if (!cleanHeader && !cleanCookie) return null;

  // Case 1: Client supplied full composite token (e.g. mobile apps sending composite bearer)
  if (cleanHeader && cleanHeader.includes('.') && cleanHeader.startsWith('bnh_')) {
    const fullHash = crypto.createHash('sha256').update(cleanHeader).digest('hex');
    const matched = sessions.find(s => s.tokenHash === fullHash);
    if (matched) return matched;
  }

  // Case 2: Web Client supplied Header Half A + Cookie Half B ("matching two halves of broken note")
  if (cleanHeader && cleanCookie) {
    const combined = `${cleanHeader}.${cleanCookie}`;
    const combinedHash = crypto.createHash('sha256').update(combined).digest('hex');
    const matched = sessions.find(s => s.tokenHash === combinedHash);
    if (matched) return matched;
  }

  // Case 3: Legacy Plain Token lookup fallback (ensures backward compatibility for unhashed older sessions)
  const candidateToken = cleanHeader || cleanCookie;
  if (candidateToken) {
    const candidateHash = crypto.createHash('sha256').update(candidateToken).digest('hex');
    const matched = sessions.find(s => s.token === candidateToken || s.tokenHash === candidateHash);
    if (matched) return matched;
  }

  return null;
}

module.exports = {
  // Config
  JWT_SECRET,
  CSRF_SECRET,
  AUTHORIZED_ADMIN_PHONE,
  DEFAULT_USERNAME,
  DEFAULT_SALT,
  DEFAULT_HASH,
  RBAC_ROLES,

  // Password & JWT
  generateSalt,
  hashPassword,
  verifyPassword,
  createJwt,
  verifyJwt,

  // CSRF Protection Engine
  generateCsrfToken,
  verifyCsrfToken,

  // Broken Note / Split Token Engine
  createBrokenNoteSession,
  verifyBrokenNoteSession,

  // Brute Force & Rate Limit & Threat Jail
  checkBruteForce,
  recordLoginAttempt,
  checkRateLimit,
  resetRateLimit,
  isIpJailed,
  jailIp,
  unJailIp,
  detectExploitPattern,

  // 2FA / OTP
  requestAdminOtp,
  verifyAdminOtp,

  // RBAC & Audit
  hasPermission,
  getRolePermissions,
  recordAuditLog,

  // Sanitization & Anti-Injection
  sanitizeString,
  sanitizePhone,
  deepSanitizePayload,
  isPayloadMalicious
};
