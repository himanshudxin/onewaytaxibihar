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
module.exports = { safeEqual, makeSession, validSession };
