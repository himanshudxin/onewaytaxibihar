/**
 * OneWayTaxiBihar (onewaytaxibihar.com)
 * Cross-Platform High-Performance Production Node.js Server
 * Built with Native HTTP/Gzip Compression & Zero-Lag Serverless REST Routing
 */

try { require('dotenv').config(); } catch (e) {}

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const apiHandler = require('./api/index.js');
const securityService = require('./services/security.js');

const PORT = parseInt(process.env.PORT || '8080', 10);
const WORKSPACE_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.apk': 'application/vnd.android.package-archive',
  '.aab': 'application/octet-stream'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml']);

// High-Throughput In-Memory Buffer Cache & Pre-Gzipped Asset Store
const staticAssetCache = new Map(); // safePath -> { buffer, gzipBuffer, etag, mtime, contentType, ext }
let activeConnections = 0;
const MAX_CONCURRENT_CONNECTIONS = parseInt(process.env.MAX_CONCURRENT_CONNECTIONS || '1500', 10);

function getCachedAsset(safePath, ext, contentType) {
  try {
    // Memory leak protection: Only cache compressible text assets under 1MB in RAM
    if (!COMPRESSIBLE_EXTS.has(ext)) return null;
    const stat = fs.statSync(safePath);
    if (stat.size > 1024 * 1024) return null; // Stream large assets directly
    const mtime = stat.mtimeMs;
    const cached = staticAssetCache.get(safePath);

    if (cached && cached.mtime === mtime) {
      return cached;
    }

    const buffer = fs.readFileSync(safePath);
    const gzipBuffer = zlib.gzipSync(buffer, { level: 6 });
    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 16);
    const etag = `W/"${hash}-${stat.size}"`;

    const entry = { buffer, gzipBuffer, etag, mtime, contentType, ext };
    // Keep max 100 static text files cached in memory
    if (staticAssetCache.size > 100) {
      staticAssetCache.clear();
    }
    staticAssetCache.set(safePath, entry);
    return entry;
  } catch (err) {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  activeConnections++;
  const cleanupConnection = () => {
    activeConnections = Math.max(0, activeConnections - 1);
  };
  res.on('finish', cleanupConnection);
  res.on('close', cleanupConnection);

  // 1. Client IP Extraction (Behind Cloudflare / Reverse Proxy Support)
  const rawIp = (
    req.headers['cf-connecting-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    '127.0.0.1'
  );
  const clientIp = String(rawIp).replace(/^::ffff:/, '');

  // 2. IP Threat Jail Defense: Instantly drop banned attacker IPs
  const jailStatus = securityService.isIpJailed(clientIp);
  if (jailStatus.jailed) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Connection', 'close');
    return res.end(JSON.stringify({
      success: false,
      error: 'ACCESS_DENIED_SECURITY_JAIL',
      message: 'Your IP address has been flagged and banned by the automated cyber defense gateway.',
      retryAfter: jailStatus.remainingSec
    }));
  }

  // 3. Exploit Probing & Scanner Defense (Blocks .env, .git, SQLi, traversal, scanner bots)
  const exploitCheck = securityService.detectExploitPattern(req.url, req.headers['user-agent']);
  if (exploitCheck.isMalicious) {
    securityService.jailIp(clientIp, `Exploit probe attempt: ${exploitCheck.pattern}`);
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Connection', 'close');
    return res.end(JSON.stringify({
      success: false,
      error: 'SECURITY_EXPLOIT_BLOCKED',
      message: 'Unauthorized exploit signature detected. IP address has been jailed.'
    }));
  }

  // 4. Layer-7 Flood / Anti-DDoS Rate Limiter (Max 150 req/min per IP)
  const l7Rate = securityService.checkRateLimit(`l7_burst_${clientIp}`, 150, 60000);
  if (!l7Rate.allowed) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', String(l7Rate.retryAfter));
    res.setHeader('Connection', 'close');
    return res.end(JSON.stringify({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Anti-DDoS traffic threshold reached. Please throttle your requests.',
      retryAfter: l7Rate.retryAfter
    }));
  }

  // Traffic Spike Management & Concurrency Ceiling (Never Crash Under Heavy Load)
  if (activeConnections > MAX_CONCURRENT_CONNECTIONS) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Retry-After', '1');
    res.setHeader('Connection', 'close');
    return res.end(JSON.stringify({
      success: false,
      message: 'Server traffic spike detected. System throttled to protect stability. Please retry in 1 second.',
      retryAfter: 1
    }));
  }

  // CORS & Military-Grade Security Headers
  const reqOrigin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', reqOrigin);
  if (reqOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Idempotency-Key, Accept, Origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 5. Sensitive File Isolation: Block access to source code, databases, environments, scripts
  const lowerPath = pathname.toLowerCase();
  const isPrivateResource =
    lowerPath.includes('.env') ||
    lowerPath.includes('.git') ||
    lowerPath.includes('.svn') ||
    lowerPath.includes('node_modules') ||
    lowerPath.includes('/data/') ||
    lowerPath.includes('/services/') ||
    lowerPath.includes('/scripts/') ||
    lowerPath.endsWith('.ts') ||
    lowerPath.endsWith('.tsx') ||
    lowerPath.endsWith('.log') ||
    lowerPath.endsWith('.sql') ||
    lowerPath.endsWith('.bak') ||
    lowerPath.endsWith('.key') ||
    lowerPath.endsWith('.pem') ||
    lowerPath.endsWith('.ps1') ||
    lowerPath.endsWith('.sh') ||
    lowerPath === '/package.json' ||
    lowerPath === '/tsconfig.json' ||
    lowerPath === '/local-server.js' ||
    (lowerPath.endsWith('.json') && !lowerPath.endsWith('manifest.json'));

  if (isPrivateResource) {
    securityService.jailIp(clientIp, `Unauthorized private asset probing: ${pathname}`);
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: 'FORBIDDEN',
      message: 'Access to private system resource or configuration is strictly prohibited.'
    }));
  }

  // 1. API Route Handler (High Performance Serverless Handler)
  const isApiRoute = pathname === '/api' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/fares') || 
    pathname.startsWith('/fare/') || 
    pathname.startsWith('/dispatch/') || 
    pathname.startsWith('/bookings') || 
    pathname.startsWith('/rides') || 
    pathname.startsWith('/driver/') || 
    pathname.startsWith('/passenger/') || 
    pathname.startsWith('/payment') || 
    pathname.startsWith('/payments') || 
    pathname.startsWith('/notifications') || 
    pathname === '/admin/login' || 
    pathname.startsWith('/admin/cancel-booking') ||
    pathname.startsWith('/admin/bookings') ||
    pathname.startsWith('/admin/assign-driver');

  if (isApiRoute) {
    return apiHandler(req, res);
  }

  // 2. Static File Serving with In-Memory Caching & Pre-Gzip Compression
  let filePath = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(path.join(WORKSPACE_DIR, filePath));

  // Download URL Aliases (Eliminates redundant 87MB file duplication on disk)
  if (pathname === '/downloads/onewaytaxi-passenger.apk' || pathname === '/downloads/OneWayTaxiBihar-Latest.apk') {
    safePath = path.join(WORKSPACE_DIR, 'downloads', 'passenger-latest.apk');
  } else if (pathname === '/downloads/onewaytaxi-driver.apk') {
    safePath = path.join(WORKSPACE_DIR, 'downloads', 'driver-latest.apk');
  } else if (pathname === '/downloads/onewaytaxi-admin.apk') {
    safePath = path.join(WORKSPACE_DIR, 'downloads', 'admin-latest.apk');
  }

  // Security: Prevent directory traversal
  if (!safePath.startsWith(WORKSPACE_DIR)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  // If directory, try index.html
  if (fs.existsSync(safePath) && fs.statSync(safePath).isDirectory()) {
    safePath = path.join(safePath, 'index.html');
  } else if (!fs.existsSync(safePath) && fs.existsSync(safePath + '.html')) {
    safePath = safePath + '.html';
  }

  if (fs.existsSync(safePath) && fs.statSync(safePath).isFile()) {
    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);

    // Static asset caching headers
    if (safePath.includes('admin')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (ext === '.css' || ext === '.js') {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else if (['.svg', '.png', '.jpg', '.webp', '.ico', '.woff2'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    }

    const cached = getCachedAsset(safePath, ext, contentType);
    if (cached) {
      res.setHeader('ETag', cached.etag);

      // Fast 304 Not Modified
      if (req.headers['if-none-match'] === cached.etag) {
        res.statusCode = 304;
        return res.end();
      }

      const acceptEncoding = req.headers['accept-encoding'] || '';
      const canGzip = cached.gzipBuffer && acceptEncoding.includes('gzip');

      if (canGzip) {
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        return res.end(cached.gzipBuffer);
      }

      return res.end(cached.buffer);
    }

    // Direct stream fallback
    const stream = fs.createReadStream(safePath);
    return stream.pipe(res);
  }

  // 3. 404 Fallback
  const custom404 = path.join(WORKSPACE_DIR, '404.html');
  if (fs.existsSync(custom404)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return fs.createReadStream(custom404).pipe(res);
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('404 Not Found');
});

// Enterprise Process Resilience & Disaster Recovery Handlers (Scenario 12)
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL UNCAUGHT EXCEPTION]:', err);
  try {
    const dbService = require('./services/db.js');
    const db = dbService.getDb();
    if (db) {
      if (!db.error_logs) db.error_logs = [];
      db.error_logs.unshift({
        id: `crit_${Date.now()}`,
        type: 'UNCAUGHT_EXCEPTION',
        message: err?.message || 'Uncaught process exception',
        stack: (err?.stack || '').split('\n').slice(0, 8).join('\n'),
        timestamp: new Date().toISOString()
      });
      const dbPath = path.join(__dirname, 'data', 'db.json');
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Failed to flush state during uncaught exception:', e.message);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.warn('[UNHANDLED PROMISE REJECTION]:', reason);
  try {
    const dbService = require('./services/db.js');
    const db = dbService.getDb();
    if (db) {
      if (!db.error_logs) db.error_logs = [];
      db.error_logs.unshift({
        id: `rej_${Date.now()}`,
        type: 'UNHANDLED_REJECTION',
        message: reason?.message || String(reason),
        timestamp: new Date().toISOString()
      });
    }
  } catch (e) {}
});

function gracefulShutdown(signal) {
  console.log(`[OneWayTaxiBihar] Received ${signal}. Gracefully stopping server...`);
  server.close(() => {
    console.log('[OneWayTaxiBihar] HTTP connections closed. Process terminating safely.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[OneWayTaxiBihar] Forced termination after timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Autonomous Background Sweeper Daemon (Hidden Enterprise Backend Feature)
// Continuously monitors trips, expands radii, re-broadcasts ghosted rides, and auto-settles
const autonomousDaemon = setInterval(() => {
  try {
    const dbService = require('./services/db.js');
    const autoEngine = require('./services/autonomousEngine.js');
    const db = dbService.getDb();
    if (db) {
      const sweep = autoEngine.runAutonomousSweep(db);
      if (sweep.mutations > 0) {
        dbService.saveDb(db);
        console.log(`[AutonomousEngine] Background sweep reconciled ${sweep.mutations} booking state(s).`);
      }
    }
  } catch (err) {
    // Non-fatal background daemon safeguard
  }
}, 30000);
if (autonomousDaemon && autonomousDaemon.unref) autonomousDaemon.unref();


// Anti-Slowloris & Connection Starvation Defense Timeouts
server.headersTimeout = 15000;   // 15 seconds max to receive complete headers
server.requestTimeout = 30000;   // 30 seconds max for entire request
server.keepAliveTimeout = 5000;  // 5 seconds idle keep-alive

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[OneWayTaxiBihar] 🚀 High-Performance HTTP server running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = server;
