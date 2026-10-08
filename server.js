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
const apiHandler = require('./api/index.js');

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
  '.xml': 'application/xml; charset=utf-8'
};

const COMPRESSIBLE_EXTS = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml']);

const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // 1. API Route Handler (High Performance Serverless Handler)
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return apiHandler(req, res);
  }

  // 2. Static File Serving with Gzip Compression
  let filePath = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(path.join(WORKSPACE_DIR, filePath));

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

    // Static asset caching
    if (ext === '.css' || ext === '.js') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (['.svg', '.png', '.jpg', '.webp', '.ico', '.woff2'].includes(ext)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    } else {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }

    const acceptEncoding = req.headers['accept-encoding'] || '';
    const shouldGzip = COMPRESSIBLE_EXTS.has(ext) && acceptEncoding.includes('gzip');

    if (shouldGzip) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      const rawStream = fs.createReadStream(safePath);
      const gzipStream = zlib.createGzip({ level: 6 });
      return rawStream.pipe(gzipStream).pipe(res);
    }

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

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[OneWayTaxiBihar] 🚀 High-Performance HTTP server running on http://0.0.0.0:${PORT}`);
  });
}

module.exports = server;
