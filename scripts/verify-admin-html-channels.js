const fs = require('fs');
const path = require('path');

const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');

const checks = [
  { name: 'Channel Filter Select Dropdown', pattern: 'id="bookings-source-filter"' },
  { name: 'Mobile App Option in Filter', pattern: 'value="app">📲 Mobile App' },
  { name: 'Website Option in Filter', pattern: 'value="web">🌐 Website' },
  { name: 'Source Filter logic in renderBookingsTable', pattern: 'sourceFilter === \'app\'' },
  { name: 'Mobile App Badge rendered in table', pattern: 'badge-source-app' },
  { name: 'Website Badge rendered in table', pattern: 'badge-source-web' },
  { name: 'Dashboard table Channel Badge', pattern: '📲 App' },
  { name: 'Drawer Header Channel Badge', pattern: 'badge-source-app' },
  { name: 'Drawer Passenger Card Booking Channel', pattern: 'Booking Channel:' }
];

let allPassed = true;
console.log('=== Checking admin.html Unified Channel Features ===');
for (const c of checks) {
  if (adminHtml.includes(c.pattern)) {
    console.log(`✓ ${c.name}: OK`);
  } else {
    console.error(`❌ ${c.name}: MISSING (expected "${c.pattern}")`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
} else {
  console.log('🎉 All admin.html UI elements verified successfully!');
}
