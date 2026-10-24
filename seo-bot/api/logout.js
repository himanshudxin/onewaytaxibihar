const { makeClearCookie, validateOrigin } = require('../lib/auth');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cross-site request forgery protection
  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden cross-origin request' });
  }

  // Expire and clear the session cookie
  res.setHeader('Set-Cookie', makeClearCookie());
  return res.status(200).json({ ok: true });
};
