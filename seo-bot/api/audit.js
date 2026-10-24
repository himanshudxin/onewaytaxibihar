const { validSession } = require('../lib/auth');

const BASE = 'https://onewaytaxibihar.com';
const PAGES = ['/', '/fare-chart', '/cabs', '/patna-airport-taxi', '/outstation-cab-bihar'];

function getMeta(html, key) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const name = (tag.match(/\bname\s*=\s*["']([^"']+)["']/i) || [])[1];
    const content = (tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (name && content !== undefined && name.toLowerCase() === key.toLowerCase()) return content.trim();
  }
  return '';
}
function getCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = (tag.match(/\brel\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    const href = (tag.match(/\bhref\s*=\s*["']([^"']+)["']/i) || [])[1] || '';
    if (rel.toLowerCase().split(/\s+/).includes('canonical')) return href;
  }
  return '';
}
function getTitle(html) {
  return ((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').replace(/<[^>]+>/g, '').trim();
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!validSession(req)) return res.status(401).json({ error: 'Please sign in again' });

  const results = [];
  for (const path of PAGES) {
    try {
      const response = await fetch(BASE + path, {
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'OneWayTaxiBihar-SEO-Audit/0.1 (read-only)' }
      });
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !type.toLowerCase().includes('text/html')) {
        results.push({ path, status: response.status, issues: ['Page did not return successful HTML'] });
        continue;
      }
      const html = (await response.text()).slice(0, 1500000);
      const title = getTitle(html);
      const description = getMeta(html, 'description');
      const canonical = getCanonical(html);
      const h1Count = (html.match(/<h1\b/gi) || []).length;
      const issues = [];
      if (!title) issues.push('Missing title');
      else if (title.length < 20 || title.length > 65) issues.push('Title length outside suggested 20–65 characters');
      if (!description) issues.push('Missing meta description');
      else if (description.length < 70 || description.length > 170) issues.push('Description length outside suggested 70–170 characters');
      if (!canonical) issues.push('Missing canonical URL');
      if (h1Count === 0) issues.push('Missing H1');
      if (h1Count > 1) issues.push('Multiple H1 headings; review manually');
      results.push({ path, status: response.status, title, description, canonical, h1Count, issues });
    } catch {
      results.push({ path, status: 0, issues: ['Audit request failed or timed out'] });
    }
  }
  return res.status(200).json({ site: BASE, mode: 'read-only', scannedAt: new Date().toISOString(), results });
};
