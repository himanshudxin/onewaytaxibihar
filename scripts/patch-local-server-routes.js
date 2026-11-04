const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'local-server.js');
let content = fs.readFileSync(file, 'utf8');

const OLD = `  // 1. API Route Handler (High Performance Serverless Handler)
  if (pathname === '/api' || pathname.startsWith('/api/')) {
    return apiHandler(req, res);
  }`;

const NEW = `  // 1. API Route Handler (High Performance Serverless Handler)
  const isApiRoute = pathname === '/api' || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/dispatch/') || 
    pathname.startsWith('/bookings') || 
    pathname.startsWith('/rides') || 
    pathname.startsWith('/driver/') || 
    pathname.startsWith('/passenger/') || 
    pathname === '/admin/login' || 
    pathname.startsWith('/admin/cancel-booking') ||
    pathname.startsWith('/admin/bookings') ||
    pathname.startsWith('/admin/assign-driver');

  if (isApiRoute) {
    return apiHandler(req, res);
  }`;

if (content.includes(OLD)) {
  content = content.replace(OLD, NEW);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ local-server.js API routing enhanced.');
} else {
  console.log('ℹ️  Already enhanced or anchor not found.');
}

