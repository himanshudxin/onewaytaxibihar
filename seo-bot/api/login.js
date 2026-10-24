const {
  safeEqual,
  makeSession,
  validateOrigin,
  getClientIp,
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit
} = require('../lib/auth');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cross-site request forgery check
  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden cross-origin request' });
  }

  // Brute-force rate limiting check
  const ip = getClientIp(req);
  const rateStatus = checkRateLimit(ip);
  if (!rateStatus.allowed) {
    res.setHeader('Retry-After', String(rateStatus.retryAfter));
    return res.status(429).json({
      error: `Too many failed login attempts. Please wait ${rateStatus.retryAfter} seconds before retrying.`
    });
  }

  const expected = process.env.SEO_BOT_PASSWORD;
  if (!expected || expected.length < 16 || !process.env.SEO_BOT_SESSION_SECRET) {
    return res.status(503).json({ error: 'SEO bot is not configured securely' });
  }

  // Resilient JSON body parsing for diverse serverless environments
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  } else if (Buffer.isBuffer(body)) {
    try {
      body = JSON.parse(body.toString('utf8'));
    } catch {
      body = {};
    }
  } else if (!body || typeof body !== 'object') {
    body = {};
  }

  if (!body.password || !safeEqual(body.password, expected)) {
    recordFailedAttempt(ip);
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Successful login clears failed attempt count
  resetRateLimit(ip);
  res.setHeader(
    'Set-Cookie',
    'seo_bot_session=' + makeSession() + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800'
  );
  return res.status(200).json({ ok: true });
};
