const { safeEqual, makeSession } = require('../lib/auth');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const expected = process.env.SEO_BOT_PASSWORD;
  if (!expected || expected.length < 16 || !process.env.SEO_BOT_SESSION_SECRET) {
    return res.status(503).json({ error: 'SEO bot is not configured securely' });
  }
  const body = typeof req.body === 'object' && req.body ? req.body : {};
  if (!safeEqual(body.password, expected)) return res.status(401).json({ error: 'Invalid password' });
  res.setHeader('Set-Cookie', 'seo_bot_session=' + makeSession() + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800');
  return res.status(200).json({ ok: true });
};
