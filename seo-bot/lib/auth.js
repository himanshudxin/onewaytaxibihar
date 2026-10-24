const crypto = require('node:crypto');

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function secret() {
  const value = process.env.SEO_BOT_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SEO_BOT_SESSION_SECRET must be at least 32 characters');
  return value;
}

function sign(value) {
  return crypto.createHmac('sha256', secret()).update(value).digest('base64url');
}

function makeSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  return payload + '.' + sign(payload);
}

function validSession(req) {
  const cookie = String(req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('seo_bot_session='));
  if (!cookie) return false;
  const parts = cookie.slice('seo_bot_session='.length).split('.');
  if (parts.length !== 2) return false;
  try {
    if (!safeEqual(sign(parts[0]), parts[1])) return false;
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch { return false; }
}

function makeClearCookie() {
  return 'seo_bot_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

function validateOrigin(req) {
  const host = req.headers.host;
  if (!host) return true;
  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) return false;
    } catch { return false; }
  }
  const referer = req.headers.referer;
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) return false;
    } catch { return false; }
  }
  return true;
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  const xri = req.headers['x-real-ip'];
  if (xri) return String(xri).trim();
  return req.socket?.remoteAddress || '127.0.0.1';
}

// In-memory sliding window for failed login attempts
const failedAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record || record.resetAt <= now) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}

function recordFailedAttempt(ip) {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record || record.resetAt <= now) {
    failedAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    record.count++;
  }
}

function resetRateLimit(ip) {
  failedAttempts.delete(ip);
}

module.exports = {
  safeEqual,
  makeSession,
  validSession,
  makeClearCookie,
  validateOrigin,
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit
};
