const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'services', 'dispatch.js');
let content = fs.readFileSync(file, 'utf8');

const OLD = `    // 1. Status Check: Must be Online or Available (not suspended/banned)
    const status = String(driver.status || '').toLowerCase();
    const dutyStatus = String(driver.dutyStatus || '').toUpperCase();
    const isOnline = (dutyStatus === 'ONLINE' || status === 'available' || driver.isAvailable === true);
    if (!isOnline && status !== 'active') return false;
    if (status === 'suspended' || status === 'banned') return false;`;

const NEW = `    // 1. Status Check: Must be Online or Available (not suspended/banned)
    const status = String(driver.status || '').toLowerCase();
    const dutyStatus = String(driver.dutyStatus || '').toUpperCase();
    const isOnline = (dutyStatus === 'ONLINE' || dutyStatus === 'ON_DUTY' || status === 'available' || status === 'active' || status === 'approved' || driver.isAvailable === true);
    if (!isOnline && status !== 'active' && status !== 'approved') return false;
    if (status === 'suspended' || status === 'banned') return false;`;

if (content.includes(OLD)) {
  content = content.replace(OLD, NEW);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ services/dispatch.js online check enhanced for ON_DUTY & approved.');
} else {
  console.log('ℹ️  Already enhanced or anchor not found.');
}

